// Deploys deno/dakboard-switcher.deno.js to Deno Deploy as the
// "dakboard-switcher" app. Run via `npm run deploy:switcher` (requires
// DENO_DEPLOY_TOKEN env var). Wired into .github/workflows/build.yml so it
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
