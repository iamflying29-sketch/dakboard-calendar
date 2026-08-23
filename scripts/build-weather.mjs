// Builds the browser-facing weather widget scripts for the DAKboard Guest
// Bathroom device.
//
// WHY THIS EXISTS: the DAKboard device embeds these pages in an older/limited
// WebView that does NOT support modern JS syntax (optional chaining `?.`,
// nullish coalescing `??`, etc.) and may not reliably support native ES
// modules (`<script type="module">`) either. A parse error in a module
// script silently kills the ENTIRE module with no visible error, and the
// widget's static "Loading…" placeholder text is left on screen forever
// (this exact failure mode is what caused the device to get stuck).
//
// This script:
//   1. Downlevels docs/weather-icons-meteo.js in place to ES5 (it's already
//      a plain classic <script>, so it stays a plain classic <script> --
//      just syntax-safe now).
//   2. Bundles docs/atmosphere.js + docs/weather-atmosphere.js +
//      docs/weather.js (which import each other via ES module syntax) into
//      a single non-module, ES5, IIFE file: docs/weather.bundle.js. This
//      removes the runtime dependency on native ES module support entirely.
//
// Run via `npm run build:weather` after editing any of the source files.
// This also runs automatically in CI (.github/workflows/build.yml) before
// every deploy, so it can never go stale from a forgotten manual step.

import * as esbuild from "esbuild";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.join(__dirname, "..", "docs");

// esbuild refuses to downlevel `let`/`const` block-scoping all the way to
// ES5 (it won't silently risk changing semantics), so ES2015 is the
// practical floor. ES2015 basics (let/const, arrow functions, classes,
// template literals, destructuring) are safe on essentially anything from
// 2016 onward. The actual risk here is newer ES2020 syntax like optional
// chaining (`?.`) and nullish coalescing (`??`), which this target reliably
// downlevels to plain, maximally-compatible conditional expressions.
const TARGET = "es2015";

async function main() {
  // 1) Plain classic script -- transform only, no bundling, so top-level
  //    `function wmoInfo() {}` etc. remain true globals on `window` exactly
  //    as they are today.
  await esbuild.build({
    entryPoints: [path.join(DOCS, "weather-icons-meteo.js")],
    outfile: path.join(DOCS, "weather-icons-meteo.js"),
    allowOverwrite: true,
    bundle: false,
    minify: false,
    target: TARGET,
    logLevel: "info",
  });

  // 2) ES module chain -- bundle into a single non-module IIFE so the
  //    browser never needs to understand `type="module"`/`import`/`export`
  //    at all. Bare references to globals defined by weather-icons-meteo.js
  //    (wmoInfo, EXTREME_ICONS, MOSTLY_CLEAR_ICONS, ...) are intentionally
  //    left unresolved by esbuild (they aren't imported) and continue to
  //    resolve at runtime against the real `window` globals, same as today.
  await esbuild.build({
    entryPoints: [path.join(DOCS, "weather.js")],
    outfile: path.join(DOCS, "weather.bundle.js"),
    bundle: true,
    format: "iife",
    minify: false,
    target: TARGET,
    logLevel: "info",
  });

  console.log("Weather widget build complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
