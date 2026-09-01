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
 * .github/workflows/weather-widget.yml on Weather-related pushes.
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

// ---- AirNow AQI proxy ------------------------------------------------------
// The widget used to pull AQI from Open-Meteo/CAMS, which is a coarse global
// model and not authoritative for a US address. EPA AirNow's monitoring data
// is authoritative, but its bulk CSV files are large. This endpoint fetches
// the latest AirNow PM2.5 NowCast CSVs from the USFS AirFire public archive,
// finds the nearest official monitor to the requested lat/lon, computes the
// US AQI, and returns a small JSON payload the widget can poll cheaply.
// No API key or account is required; the data is freely published by AirNow/USFS.
const AIRNOW_META_URL =
  "https://airfire-data-exports.s3.us-west-2.amazonaws.com/monitoring/v2/latest/data/airnow_PM2.5_nowcast_latest_meta.csv";
const AIRNOW_DATA_URL =
  "https://airfire-data-exports.s3.us-west-2.amazonaws.com/monitoring/v2/latest/data/airnow_PM2.5_nowcast_latest_data.csv";
// Cache AQI for 15 minutes to match the widget's polling cadence and stay
// comfortably inside Google Air Quality API's free 10,000 requests/month tier.
const AQ_CACHE_TTL_MS = 15 * 60 * 1000;

let aqCache = { time: 0, result: null, promise: null };

async function fetchTextWithTimeout(url, ms = 15000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try {
    const res = await fetch(url, { signal: ac.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function parseCsv(text) {
  const lines = text.trim().split("\n");
  if (lines.length === 0) return [];
  const header = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const obj = {};
    header.forEach((h, i) => (obj[h] = cols[i]));
    return obj;
  });
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function pm25ToAqi(conc) {
  const breakpoints = [
    [0.0, 12.0, 0, 50],
    [12.1, 35.4, 51, 100],
    [35.5, 55.4, 101, 150],
    [55.5, 150.4, 151, 200],
    [150.5, 250.4, 201, 300],
    [250.5, 350.4, 301, 400],
    [350.5, 500.4, 401, 500],
  ];
  for (const [lo, hi, aLo, aHi] of breakpoints) {
    if (conc >= lo && conc <= hi) {
      return Math.round(((aHi - aLo) / (hi - lo)) * (conc - lo) + aLo);
    }
  }
  return conc > 500.4 ? 500 : 0;
}

function aqiLabel(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

async function computeNearestAqi(lat, lon) {
  const [metaText, dataText] = await Promise.all([
    fetchTextWithTimeout(AIRNOW_META_URL),
    fetchTextWithTimeout(AIRNOW_DATA_URL),
  ]);

  const metaRows = parseCsv(metaText);
  let bestId = null;
  let bestName = null;
  let bestDist = Infinity;
  for (const row of metaRows) {
    const rLat = parseFloat(row.latitude);
    const rLon = parseFloat(row.longitude);
    if (!isFinite(rLat) || !isFinite(rLon)) continue;
    const d = haversineKm(lat, lon, rLat, rLon);
    if (d < bestDist) {
      bestDist = d;
      bestId = row.deviceDeploymentID;
      bestName = row.locationName || "Unknown";
    }
  }
  if (!bestId) throw new Error("No AirNow monitor found in metadata");

  const dataLines = dataText.trim().split("\n");
  const header = dataLines[0].split(",");
  const idx = header.indexOf(bestId);
  if (idx < 0) throw new Error("Nearest monitor not present in data file");

  let pm25 = null;
  let updated = null;
  for (let i = dataLines.length - 1; i > 0; i--) {
    const cols = dataLines[i].split(",");
    const v = cols[idx];
    if (v !== "" && v !== "NA") {
      pm25 = parseFloat(v);
      updated = cols[0];
      break;
    }
  }
  if (pm25 == null || !isFinite(pm25)) throw new Error("No PM2.5 reading available for nearest monitor");

  const aqi = pm25ToAqi(pm25);
  return {
    aqi,
    category: aqiLabel(aqi),
    pm25: Math.round(pm25 * 10) / 10,
    location: bestName,
    distanceKm: Math.round(bestDist * 10) / 10,
    updated,
  };
}

async function getAirNowAqi(lat, lon) {
  const now = Date.now();
  if (now - aqCache.time < AQ_CACHE_TTL_MS && aqCache.result) {
    return aqCache.result;
  }
  if (aqCache.promise) return aqCache.promise;
  aqCache.promise = computeNearestAqi(lat, lon)
    .then((r) => {
      aqCache = { time: now, result: r, promise: null };
      return r;
    })
    .catch((e) => {
      aqCache.promise = null;
      throw e;
    });
  return aqCache.promise;
}

// ---- Google Maps Platform Air Quality API (BreezoMeter) --------------------
// Google Maps and Apple Weather both use BreezoMeter technology for their AQI
// layers. Google acquired BreezoMeter in 2022 and now exposes the same model as
// the Google Maps Platform Air Quality API. It returns hyperlocal AQI at up to
// 500m resolution for any lat/lon, which is what powers the AQI you see for
// Tiburon in Google Maps and Apple Weather.
// Requires a Google Cloud project, API key, and billing (free 10k calls/month
// then ~$5/1k calls). The key is read from the GOOGLE_AIR_QUALITY_API_KEY env
// var so it never lives in the repo.
const GOOGLE_AQ_API_KEY = typeof Deno !== "undefined" ? Deno.env.get("GOOGLE_AIR_QUALITY_API_KEY") : null;

async function fetchGoogleAqi(lat, lon, apiKey) {
  const url = `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${apiKey}`;
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 10000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: ac.signal,
      body: JSON.stringify({
        location: { latitude: lat, longitude: lon },
        universalAqi: true,
        extraComputations: ["LOCAL_AQI"],
        customLocalAqis: [{ regionCode: "US", aqi: "usa_epa" }],
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} from Google Air Quality API`);
    const json = await res.json();
    const index = (json.indexes || []).find((i) => i.code === "usa_epa") || (json.indexes || [])[0];
    if (!index || typeof index.aqi !== "number") throw new Error("No AQI in Google response");
    return {
      aqi: index.aqi,
      category: index.category ? index.category.replace(/\s+air quality$/i, "") : aqiLabel(index.aqi),
      provider: "Google/BreezoMeter",
      location: "Tiburon, CA",
      updated: json.dateTime || null,
    };
  } finally {
    clearTimeout(t);
  }
}

async function getGoogleAqi(lat, lon) {
  if (!GOOGLE_AQ_API_KEY) throw new Error("GOOGLE_AIR_QUALITY_API_KEY not configured");
  const now = Date.now();
  if (now - aqCache.time < AQ_CACHE_TTL_MS && aqCache.result) {
    return aqCache.result;
  }
  if (aqCache.promise) return aqCache.promise;
  aqCache.promise = fetchGoogleAqi(lat, lon, GOOGLE_AQ_API_KEY)
    .then((r) => {
      aqCache = { time: now, result: r, promise: null };
      return r;
    })
    .catch((e) => {
      aqCache.promise = null;
      throw e;
    });
  return aqCache.promise;
}

function jsonError(message, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    },
  });
}

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

  if (path === "aqi") {
    const lat = parseFloat(url.searchParams.get("lat"));
    const lon = parseFloat(url.searchParams.get("lon"));
    if (!isFinite(lat) || !isFinite(lon)) {
      return jsonError("lat and lon query parameters are required", 400);
    }
    try {
      // If a Google Maps Platform Air Quality API key is configured, use the
      // hyperlocal BreezoMeter/Google model that powers Google Maps and Apple
      // Weather. Otherwise fall back to the official EPA AirNow monitor reading.
      const data = GOOGLE_AQ_API_KEY
        ? await getGoogleAqi(lat, lon)
        : await getAirNowAqi(lat, lon);
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "public, max-age=300",
          "access-control-allow-origin": "*",
        },
      });
    } catch (e) {
      return jsonError(e.message || "AQI lookup failed", 502);
    }
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
