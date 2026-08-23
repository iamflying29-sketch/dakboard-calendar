/**
 * Deno Deploy edge function proxy for NOAA/NHC CurrentStorms.json.
 *
 * Problem: www.nhc.noaa.gov does not send CORS headers, so a static
 * GitHub Pages widget cannot fetch CurrentStorms.json directly from the browser.
 *
 * This function runs on Deno Deploy's free tier (100,000 requests/day).
 * The browser calls it once per weather poll; it fetches NHC upstream and
 * adds CORS headers. Deno Deploy's edge cache respects Cache-Control, so
 * upstream NHC is only hit once every 5 minutes, not once per display.
 *
 * Deployment:
 *   1. Sign up at https://deno.com/deploy (free plan is $0).
 *   2. Create a new project named e.g. "noaa-storm-proxy".
 *   3. Link this GitHub repo OR paste the contents of this file as the entrypoint.
 *   4. Note the deployment URL (e.g. https://noaa-storm-proxy-<hash>.deno.dev).
 *   5. In docs/weather.js, set NOAA_STORMS_URL to that URL.
 */

export default {
  async fetch(request) {
    const upstream = 'https://www.nhc.noaa.gov/CurrentStorms.json';
    try {
      const res = await fetch(upstream, {
        headers: { 'Accept': 'application/json' },
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
