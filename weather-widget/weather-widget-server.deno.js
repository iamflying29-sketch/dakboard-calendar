/**
 * DAKboard Weather Widget — Static File Server (Deno Deploy)
 *
 * WHY THIS EXISTS: the weather widget was previously served from GitHub
 * Pages (Fastly CDN, Cache-Control: max-age=600). After repeated device
 * "stuck on Loading…" incidents that were hard to fully rule out as caching
 * (GitHub's CDN and/or DAKboard's own iframe caching serving stale HTML/JS
 * for minutes after a fix was deployed), the widget was moved here so we
 * have full, direct control over cache headers -- every request always gets
 * the exact current file, with zero ambiguity about staleness.
 *
 * Serves the files that live in weather-widget/ (source files, plus
 * weather.bundle.js/weather-icons-meteo.js built by `npm run build:weather`
 * -- see scripts/build-weather.mjs) directly from this deployment's own
 * filesystem.
 *
 * CACHING: Deno Deploy's Free plan is metered on requests/month and egress
 * bandwidth/month, shared across the whole org (all 3 apps). Serving
 * everything with `no-store` would mean every single DAKboard iframe
 * reload re-fetches the ~250KB+ of HTML/CSS/JS/icons from scratch with zero
 * caching benefit anywhere -- fine if the device rarely reloads the iframe,
 * but an unnecessary gamble against the free quota if it reloads more
 * often than that (unknown). Instead:
 *   - HTML (the actual page, which is what a stale-cache incident directly
 *     freezes) gets a short `max-age=60` -- still self-heals within a
 *     minute of any fix being deployed (vastly better than GitHub Pages'
 *     old 10-minute CDN cache), while absorbing any rapid repeat loads.
 *   - JS/CSS get `max-age=300` (5 min) -- same reasoning, slightly more
 *     slack since they're referenced by the HTML via version-bumped query
 *     strings (?v=NN) anyway, so a genuine content change is already
 *     cache-busted at the URL level regardless of this header.
 *   - SVG icons get `max-age=604800` (1 week) -- these are genuinely
 *     static and essentially never change; caching them aggressively is
 *     the single biggest lever against burning request/egress quota, since
 *     a single page load references ~18 icon <img> tags.
 * All of these are far shorter than GitHub Pages' old 10-minute CDN cache
 * that caused the original staleness confusion, so this is strictly safer
 * on freshness while being dramatically safer on free-tier usage.
 *
 * Deployment: this file is deployed together with every other file in
 * weather-widget/ (flat, alongside main.ts) via
 * scripts/deploy-weather-widget.mjs, which runs automatically in
 * .github/workflows/build.yml on every push.
 */

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};

const CACHE_MAX_AGE = {
  ".html": 60,
  ".css": 300,
  ".js": 300,
  ".svg": 604800,
};

// Strict allowlist pattern (not a fixed filename list) so newly added
// weather icon SVGs etc. are automatically servable without having to
// remember to update this file too -- while still fully preventing path
// traversal. Allows internal dots (e.g. "weather.bundle.js") but rejects
// ".." sequences and leading dots (dotfiles), and only permits our known
// extensions.
const ALLOWED_PATTERN = /^(?!\.)(?!.*\.\.)[a-zA-Z0-9_.-]+\.(html|css|js|svg)$/;

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\//, "");

  if (path === "" || path === "health") {
    return new Response(JSON.stringify({ status: "ok", service: "dakboard-weather-widget" }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }

  if (!ALLOWED_PATTERN.test(path)) {
    return new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });
  }

  try {
    const bytes = await Deno.readFile(new URL("./" + path, import.meta.url));
    const dot = path.lastIndexOf(".");
    const ext = dot >= 0 ? path.slice(dot) : "";
    const maxAge = CACHE_MAX_AGE[ext] ?? 60;
    return new Response(bytes, {
      headers: {
        "content-type": MIME[ext] || "application/octet-stream",
        "cache-control": `public, max-age=${maxAge}`,
        "access-control-allow-origin": "*",
      },
    });
  } catch {
    return new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });
  }
});
