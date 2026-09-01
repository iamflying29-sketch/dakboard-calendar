// Deploys deno/dakboard-switcher.deno.js to Deno Deploy as the
// "dakboard-switcher" app. Run via `npm run deploy:switcher` (requires
// DENO_DEPLOY_TOKEN env var). Wired into .github/workflows/calendar.yml so it
// deploys automatically on every push.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "..", "deno", "dakboard-switcher.deno.js");

const APP_SLUG = "dakboard-switcher";
const TOKEN = process.env.DENO_DEPLOY_TOKEN;
if (!TOKEN) {
  console.error("DENO_DEPLOY_TOKEN env var is required.");
  process.exit(1);
}

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
  const code = await readFile(SRC, "utf-8");
  const assets = {
    "main.ts": {
      kind: "file",
      content: code,
      encoding: "utf-8",
    },
  };

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
