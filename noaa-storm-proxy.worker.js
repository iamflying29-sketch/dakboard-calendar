/**
 * OPTIONAL: Cloudflare Worker proxy for NOAA/NHC CurrentStorms.json.
 *
 * Problem: www.nhc.noaa.gov does not send CORS headers, so a static
 * GitHub Pages widget cannot fetch CurrentStorms.json directly from the
 * browser without a proxy.
 *
 * This Worker runs on Cloudflare's free tier (100,000 requests/day).
 * The browser calls it once per weather poll; the Worker fetches NHC
 * upstream and adds CORS headers. Cloudflare's edge cache respects NHC's
 * Cache-Control: max-age=300, so upstream NHC is only hit once every
 * 5 minutes worldwide, not once per browser.
 *
 * Deployment:
 *   1. Sign up at https://workers.cloudflare.com (free plan is $0).
 *   2. Install Wrangler: npm install -g wrangler
 *   3. Authenticate: wrangler login
 *   4. In this repo root, run: wrangler deploy docs/noaa-storm-proxy.worker.js
 *   5. Note the worker URL (e.g. https://noaa-storm-proxy.<subdomain>.workers.dev)
 *   6. In docs/weather.js, set NOAA_STORMS_URL to that URL and re-enable the
 *      fetchNoaaStorms / chooseAlertCondition logic you removed.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Optional simple allowlist: only permit requests from your GitHub Pages domain.
    // const origin = request.headers.get('Origin') || '';
    // if (!origin.includes('iamflying29-sketch.github.io')) {
    //   return new Response('Not allowed', { status: 403 });
    // }

    const upstream = 'https://www.nhc.noaa.gov/CurrentStorms.json';
    try {
      const res = await fetch(upstream, {
        cf: { cacheTtl: 300 }, // Respect NHC's 5-minute freshness.
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Cache-Control': 'public, max-age=300',
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ activeStorms: [], error: e.message }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
