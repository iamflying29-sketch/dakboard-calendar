// Deploys everything in weather-widget/ (weather-day.html, weather-night.html,
// weather.css, weather.bundle.js, weather-icons-meteo.js, meteo_*.svg icons)
// plus its static file server (weather-widget/weather-widget-server.deno.js)
// to Deno Deploy as the "dakboard-weather-widget" app.
//
// Run via `npm run deploy:weather-widget` (requires DENO_DEPLOY_TOKEN env
// var). Runs automatically in .github/workflows/build.yml on every push, so
// the live widget can never drift from what's committed.

import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "..", "weather-widget");

const APP_SLUG = "dakboard-weather-widget";
const TOKEN = process.env.DENO_DEPLOY_TOKEN;
if (!TOKEN) {
  console.error("DENO_DEPLOY_TOKEN env var is required.");
  process.exit(1);
}

// Matches the server's ALLOWED_PATTERN in weather-widget-server.deno.js.
// Discovered dynamically (not a hand-maintained list) so adding a new icon
// SVG etc. can never again silently fail to get deployed the way
// weather.bundle.js/meteo_*.svg did the first time this script was written
// with a fixed file list that wasn't kept in sync.
const ALLOWED_PATTERN = /^(?!\.)(?!.*\.\.)[a-zA-Z0-9_.-]+\.(html|css|js|svg)$/;
// Source-only files that must NOT be served directly: the ES module
// originals (only their built weather.bundle.js output should ship), and
// the server's own source (deployed separately as "main.ts" below).
const EXCLUDE = new Set([
  "weather.js",
  "weather-atmosphere.js",
  "atmosphere.js",
  "weather-widget-server.deno.js",
]);

async function requestWithRetry(url, options, attempts = 5) {
  let response;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      response = await fetch(url, { ...options, signal: AbortSignal.timeout(30000) });
      if (response.status !== 429 && response.status < 500) return response;
      if (attempt === attempts) return response;
      const retryAfter = Number(response.headers.get("retry-after"));
      const delayMs = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : 1000 * 2 ** (attempt - 1);
      console.warn(`Deno API returned ${response.status}; retrying in ${delayMs}ms (${attempt}/${attempts})`);
      await response.text();
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    } catch (error) {
      if (attempt === attempts) throw error;
      const delayMs = 1000 * 2 ** (attempt - 1);
      console.warn(`Deno API request failed; retrying in ${delayMs}ms (${attempt}/${attempts}): ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return response;
}

async function main() {
  const entries = await readdir(SRC);
  const files = entries.filter((f) => ALLOWED_PATTERN.test(f) && !EXCLUDE.has(f));

  const assets = {
    "main.ts": {
      kind: "file",
      content: await readFile(path.join(SRC, "weather-widget-server.deno.js"), "utf-8"),
      encoding: "utf-8",
    },
  };
  for (const f of files) {
    assets[f] = {
      kind: "file",
      content: await readFile(path.join(SRC, f), "utf-8"),
      encoding: "utf-8",
    };
  }
  console.log(`Deploying ${files.length} asset files:`, files.join(", "));

  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  };

  // Create the app if it doesn't exist yet (no-op if it already does).
  const createRes = await requestWithRetry("https://api.deno.com/v2/apps", {
    method: "POST",
    headers,
    body: JSON.stringify({ slug: APP_SLUG }),
  });
  if (!createRes.ok && createRes.status !== 409) {
    throw new Error(`App creation check failed: ${createRes.status} ${await createRes.text()}`);
  }

  const res = await requestWithRetry(`https://api.deno.com/v2/apps/${APP_SLUG}/deploy`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      assets,
      config: { runtime: { type: "dynamic", entrypoint: "main.ts" } },
    }),
  });

  const body = await res.text();
  console.log(res.status, body);
  if (!res.ok) process.exit(1);

  const revision = JSON.parse(body);
  for (let attempt = 0; attempt < 60; attempt++) {
    const statusRes = await requestWithRetry(`https://api.deno.com/v2/revisions/${revision.id}`, { headers });
    if (!statusRes.ok) throw new Error(`Revision status failed: ${statusRes.status} ${await statusRes.text()}`);
    const status = await statusRes.json();
    if (status.status === "succeeded") {
      console.log(`Deployed to https://${APP_SLUG}.iamflying29-sketch.deno.net`);
      return;
    }
    if (status.status === "failed" || status.status === "cancelled") {
      throw new Error(`Deno revision ${status.status}: ${status.failure_reason || status.failure_detail || "unknown error"}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error("Timed out waiting for Deno revision to finish");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
