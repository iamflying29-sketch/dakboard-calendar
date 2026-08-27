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
  await fetch("https://api.deno.com/v2/apps", {
    method: "POST",
    headers,
    body: JSON.stringify({ slug: APP_SLUG }),
  }).catch(() => {});

  const res = await fetch(`https://api.deno.com/v2/apps/${APP_SLUG}/deploy`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      assets,
      config: { runtime: { type: "dynamic", entrypoint: "main.ts" } },
    }),
  });

  const body = await res.text();
  console.log(res.status, body);
  if (!res.ok && res.status !== 202) {
    process.exit(1);
  }
  console.log(`Deployed to https://${APP_SLUG}.iamflying29-sketch.deno.net`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
