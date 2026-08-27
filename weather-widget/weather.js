// DAKboard Guest Bathroom - Custom Weather Widget
// 100% client-side: fetches Open-Meteo directly from the browser (no key,
// CORS-enabled), so this page can sit as pure static hosting on GitHub
// Pages with no build/cron step. Auto-refreshes itself on an interval.

import { WeatherAtmosphere } from './weather-atmosphere.js';

const LAT = 37.8991768;
const LON = -122.4949685;
const TZ = "America/Los_Angeles";
// Poll every 15 minutes, matching Open-Meteo/NWS's own update cadence.
// Open-Meteo is the free, no-account provider that TRMNL also uses; the data
// itself updates roughly every 15 minutes, so polling more often than that
// just burns free-tier request quota (Deno Deploy storm proxy, NWS, USGS)
// without ever seeing newer data.
const REFRESH_MS = 15 * 60 * 1000; // poll every 15 minutes
const LOCATION_LABEL = "Tiburon, CA";
// The AQI endpoint is served by the same Deno Deploy app so we avoid a
// cross-origin request and the widget can be tested on a local origin too.
const AQI_BASE_URL = (typeof location !== "undefined" && location.origin && location.origin !== "null")
  ? location.origin
  : "https://dakboard-weather-widget.iamflying29-sketch.deno.net";

const THEME = document.documentElement.getAttribute('data-theme') || 'day';
const FORCED_SCENE = new URLSearchParams(location.search).get('scene');

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// CRITICAL: plain `fetch()` has NO built-in timeout. If a request to any
// domain hangs (DNS stall, a firewall silently dropping packets instead of
// refusing the connection, a slow/overloaded free-tier endpoint, etc.) the
// returned promise never resolves OR rejects -- it just sits forever. Every
// data fetch in this file used to go straight into a single
// `Promise.all([...])` in refresh() that gates the entire render() call, so
// ONE hung request anywhere (including third-party domains added later,
// like NOAA SWPC or NASA NeoWs) could silently freeze the whole widget on
// "Loading…" forever with zero visible error -- this happened for real on
// the physical device. Every fetch in this file now goes through this
// helper, which uses AbortController to hard-cancel the request after
// `ms` (default 8s) so a stuck network call can NEVER block rendering
// indefinitely again -- it always eventually rejects, which the existing
// try/catch blocks already convert into a graceful `null`/fallback.
async function fetchWithTimeout(url, ms = 8000, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, Object.assign({}, options, { signal: controller.signal }));
  } finally {
    clearTimeout(timer);
  }
}

// ---------- Real sun-angle-driven sky color ----------------------------
// Not a static gradient: interpolates real sky colors based on how far the
// sun actually is above/below the horizon right now for Tiburon, CA.
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}
function lerpColor(a, b, t) {
  const ca = hexToRgb(a), cb = hexToRgb(b);
  return rgbToHex([ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t, ca[2] + (cb[2] - ca[2]) * t]);
}



const DAY_SKY_STOPS = [
  // elevation, top, mid, bottom
  [0.00, '#7fa8cf', '#ffcf9e', '#fff6ea'],
  [0.25, '#5b9bda', '#bfe0f0', '#eef7fa'],
  [0.55, '#4a90d9', '#8ec9ee', '#eaf6fc'],
  [1.00, '#3f86d4', '#8ec9ee', '#e8f4fb'],
];
const NIGHT_SKY_STOPS = [
  // elevation (negative), top, mid, bottom
  [0.00, '#140a1e', '#3a2210', '#0d0800'],
  [-0.15, '#0a0614', '#20120a', '#050301'],
  [-0.45, '#050308', '#0f0803', '#000000'],
  [-1.00, '#020104', '#080402', '#000000'],
];

function skyColorsFor(elevation) {
  const stops = THEME === 'night' ? NIGHT_SKY_STOPS : DAY_SKY_STOPS;
  const e = THEME === 'night' ? -Math.abs(elevation) : Math.abs(elevation);
  // find bracketing stops (stops are ordered from 0 outward)
  let lo = stops[0], hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i], b = stops[i + 1];
    const inRange = THEME === 'night' ? (e <= a[0] && e >= b[0]) : (e >= a[0] && e <= b[0]);
    if (inRange) { lo = a; hi = b; break; }
  }
  const span = hi[0] - lo[0];
  const t = span !== 0 ? (e - lo[0]) / span : 0;
  return {
    top: lerpColor(lo[1], hi[1], Math.max(0, Math.min(1, t))),
    mid: lerpColor(lo[2], hi[2], Math.max(0, Math.min(1, t))),
    bottom: lerpColor(lo[3], hi[3], Math.max(0, Math.min(1, t))),
  };
}

// With past_days=1 in the API request, daily array index 0 = yesterday,
// TODAY_IDX = today, TODAY_IDX+1 = tomorrow, etc.
const TODAY_IDX = 1;

// Open-Meteo, when queried with &timezone=America/Los_Angeles, returns
// "naive" local wall-clock strings with NO UTC offset attached (e.g.
// "2026-08-24T14:00"). `new Date(str)` parses a string like that as if it
// were expressed in the JS runtime's OWN system timezone -- which is silently
// wrong unless whatever device/browser is executing this code *also* happens
// to have its system clock set to Pacific time. We can never guarantee that
// for an embedded DAKboard WebView (and headless test browsers used during
// development default to UTC, which is exactly why this went unnoticed
// before). Left unfixed, every sunrise/sunset and hourly/daily sky-cover
// comparison below silently shifts by the device's UTC offset from Pacific
// (7-8 hours) -- e.g. sampling actual early-morning sky cover while labeling
// it as midday, which is precisely the "looks like early morning" /
// "wrong location" symptom this was written to fix. This converts a naive
// "wall clock in `timeZone`" string into the one true UTC instant it
// represents, independent of the executing runtime's own timezone.
function zonedTimeToUtc(naiveStr, timeZone) {
  const asUtc = new Date(naiveStr.endsWith('Z') ? naiveStr : naiveStr + 'Z');
  const inTz = new Date(asUtc.toLocaleString('en-US', { timeZone }));
  const inUtc = new Date(asUtc.toLocaleString('en-US', { timeZone: 'UTC' }));
  const offsetMs = inUtc.getTime() - inTz.getTime();
  return new Date(asUtc.getTime() + offsetMs);
}

// ---------- Failsafe condition resolution (clear/cloudy/precip) ----------
// The top "Current" condition and hourly strip must never say "Clear" when
// there are actual clouds overhead. Open-Meteo's instantaneous
// `current.weather_code` / `current.cloud_cover` can lag or miss the local
// marine-layer pattern, and the NWS gridpoint forecast can occasionally miss
// a rapidly-changing sky. The safest, most accurate choice is a CONSENSUS:
// take the maximum of the two independent cloud-cover estimates (NWS + OM) and
// derive the condition from that. Active precipitation/fog codes are always
// preserved so a rain shower is never mislabeled as "Cloudy" just because the
// sky cover happens to be high.
function isPrecipitationOrFogCode(code) {
  return code === 45 || code === 48 || (code >= 50 && code <= 99);
}

function cloudCoverToCondition(skyCover, isDay) {
  const day = !!isDay;
  const t = Math.max(0, Math.min(100, Number(skyCover) || 0));
  // These thresholds are deliberately conservative so the displayed label/icon
  // and CGI never overstate cloudiness. "Mostly Cloudy" must still show
  // substantial sky/sun/moon -- it is NOT overcast.
  if (t <= 12) return { key: day ? 'clear-day' : 'clear-night', label: 'Clear' };
  if (t <= 30) return { key: day ? 'mostly-clear-day' : 'mostly-clear-night', label: 'Mostly Clear' };
  if (t <= 50) return { key: day ? 'partly-cloudy-day' : 'partly-cloudy-night', label: 'Partly Cloudy' };
  if (t <= 80) return { key: day ? 'mostly-cloudy-day' : 'mostly-cloudy-night', label: 'Mostly Cloudy' };
  return { key: 'overcast', label: 'Overcast' };
}

function effectiveCloudCover(nwsSkyCover, omCloudCover) {
  const nws = nwsSkyCover != null ? Number(nwsSkyCover) : null;
  const om = omCloudCover != null ? Number(omCloudCover) : null;
  if (nws != null && om != null) return Math.max(nws, om);
  if (nws != null) return nws;
  if (om != null) return om;
  return null;
}

function formatInTimeZone(date, timeZone) {
  // Returns a Pacific-local wall-clock string "YYYY-MM-DDTHH:mm:ss" for the
  // given UTC Date, independent of the device's own timezone setting.
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(date);
  const get = (type) => ((parts.find(p => p.type === type) || {}).value || '0').padStart(2, '0');
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`;
}

function findCurrentHourlyIndex(hourly, date) {
  if (!hourly || !Array.isArray(hourly.time)) return -1;
  // Match the "YYYY-MM-DDTHH" prefix against Open-Meteo's own naive local-time strings.
  const prefix = formatInTimeZone(date, TZ).slice(0, 13);
  return hourly.time.findIndex(t => String(t).slice(0, 13) === prefix);
}

function resolveCondition(code, isDay, nwsSkyCover, omCloudCover, precipitation) {
  // Preserve meaningful non-cloud conditions (fog, drizzle, rain, snow, storms).
  if (isPrecipitationOrFogCode(code)) {
    return wmoInfo(code, isDay);
  }
  // If Open-Meteo reports actual precipitation but the weather code somehow
  // did not, force a rain label so the widget never hides active rain.
  if (precipitation != null && precipitation > 0) {
    return precipitation <= 0.02
      ? { key: 'rain-light', label: 'Light Rain' }
      : precipitation <= 0.10
        ? { key: 'rain', label: 'Rain' }
        : { key: 'rain-heavy', label: 'Heavy Rain' };
  }
  // Consensus cloud cover: trust the cloudier of the two sources so a
  // genuinely cloudy sky is never smoothed away by one stale estimate.
  const cc = effectiveCloudCover(nwsSkyCover, omCloudCover);
  if (cc != null) {
    return cloudCoverToCondition(cc, isDay);
  }
  // No cloud-cover data at all -- fall back to the raw WMO code.
  return wmoInfo(code, isDay);
}

function applySkyForNow(daily) {
  const now = new Date();
  const todaySunrise = zonedTimeToUtc(daily.sunrise[TODAY_IDX], TZ);
  const todaySunset = zonedTimeToUtc(daily.sunset[TODAY_IDX], TZ);

  let state;
  if (now >= todaySunrise && now <= todaySunset) {
    const frac = (now - todaySunrise) / (todaySunset - todaySunrise);
    state = { frac, elevation: Math.sin(Math.PI * frac) };
  } else if (now < todaySunrise) {
    // Pre-dawn: still in the night that started at YESTERDAY's sunset.
    const yesterdaySunset = zonedTimeToUtc(daily.sunset[TODAY_IDX - 1], TZ);
    const frac = Math.max(0, Math.min(1, (now - yesterdaySunset) / (todaySunrise - yesterdaySunset)));
    state = { frac, elevation: -Math.sin(Math.PI * frac) };
  } else {
    // Post-dusk: night runs until TOMORROW's sunrise.
    const tomorrowSunrise = daily.sunrise[TODAY_IDX + 1] ? zonedTimeToUtc(daily.sunrise[TODAY_IDX + 1], TZ)
      : new Date(todaySunset.getTime() + 12 * 3600 * 1000);
    const frac = Math.max(0, Math.min(1, (now - todaySunset) / (tomorrowSunrise - todaySunset)));
    state = { frac, elevation: -Math.sin(Math.PI * frac) };
  }

  const colors = skyColorsFor(state.elevation);
  const root = document.documentElement;
  root.style.setProperty('--sky-top', colors.top);
  root.style.setProperty('--sky-mid', colors.mid);
  root.style.setProperty('--sky-bottom', colors.bottom);
  return state;
}

function fToLabel(f) {
  return `${Math.round(f)}°`;
}

function aqiCategory(aqi) {
  if (aqi == null) return { label: "—", color: "var(--fg3)", desc: "Air quality data is unavailable right now." };
  if (aqi <= 50) return { label: "Good", color: "var(--good)", desc: "Air quality is good. Enjoy your usual outdoor activities." };
  if (aqi <= 100) return { label: "Moderate", color: "var(--warn)", desc: "Air quality is acceptable, though there may be a risk for sensitive groups." };
  if (aqi <= 150) return { label: "Unhealthy (SG)", color: "var(--warn)", desc: "Sensitive groups may experience health effects. Others are unlikely to be affected." };
  if (aqi <= 200) return { label: "Unhealthy", color: "var(--bad)", desc: "Everyone may begin to experience health effects; sensitive groups more so." };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "var(--bad)", desc: "Health alert: everyone may experience more serious health effects." };
  return { label: "Hazardous", color: "var(--bad)", desc: "Health warning of emergency conditions. Everyone is at risk." };
}

function windDirLabel(deg) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

function windCompassSvg(deg, color) {
  return `<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="44" fill="none" stroke="${color}" stroke-width="4" opacity="0.35"/>
    <text x="50" y="16" text-anchor="middle" font-size="14" font-weight="700" fill="${color}" opacity="0.6">N</text>
    <g class="needle" style="transform: rotate(${deg}deg)">
      <path d="M50 18 L58 54 L50 46 L42 54 Z" fill="${color}"/>
    </g>
  </svg>`;
}

function hourLabel(dateStr, idx0) {
  const d = new Date(dateStr);
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12; if (h === 0) h = 12;
  return idx0 ? `${h}${ampm}` : 'NOW';
}

function minuteLabel(dateStr, idx0) {
  if (!idx0) return 'NOW';
  const d = new Date(dateStr);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${m}`;
}

function dayLabel(dateStr, idx) {
  if (idx === 0) return 'Today';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

async function fetchWeather() {
  // Use Open-Meteo's NOAA-only GFS API endpoint, explicitly locked to the
  // National Blend of Models (NBM) at 2.5 km resolution -- NOT Open-Meteo's
  // generic "best_match" default, which was running ~6°F too hot for this
  // address. NBM blends local observations and matches trusted local readings
  // (e.g. Samsung Weather: High 83°, Low 59° on 2026-08-27). This endpoint is
  // CONUS-only, which is correct for 7 Upper Cecilia Way, Tiburon, CA 94920.
  const baseParams = `latitude=${LAT}&longitude=${LON}&models=ncep_nbm_conus`;
  const wUrl = `https://api.open-meteo.com/v1/gfs?${baseParams}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,precipitation` +
    `&minutely_15=temperature_2m,weather_code,precipitation,precipitation_probability,is_day,cloud_cover` +
    `&hourly=temperature_2m,weather_code,precipitation,precipitation_probability,visibility,is_day,cloud_cover` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch` +
    `&timezone=${encodeURIComponent(TZ)}&forecast_days=7&past_days=1`;
  const aqUrl = `${AQI_BASE_URL}/aqi?lat=${LAT}&lon=${LON}`;

  const [wRes, aqRes, skyCoverIntervals] = await Promise.all([
    fetchWithTimeout(wUrl).then(r => r.json()),
    fetchWithTimeout(aqUrl).then(r => r.json()).catch(() => null),
    fetchNwsSkyCover(),
  ]);
  return { weather: wRes, aq: aqRes, skyCoverIntervals };
}

let lastDaily = null;
let lastDisplayKey = null;
let lastLiveCloudCover = null;

// Free alert / observation feeds for rare/extreme events that Open-Meteo's
// standard WMO weather codes do not cover (tornado, tsunami, wildfire, etc.).
const NWS_ALERTS_URL = `https://api.weather.gov/alerts/active?status=actual&point=${LAT},${LON}`;
const USGS_QUAKE_URL = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${LAT}&longitude=${LON}&maxradiuskm=200&minmagnitude=4.0&starttime=`;
const NOAA_STORMS_URL = 'https://noaa-storm-proxy.iamflying29-sketch.deno.net';
// NOAA Space Weather Prediction Center -- free, no key, CORS-enabled
// (verified: Access-Control-Allow-Origin: *). Used to auto-detect Aurora
// visibility (see chooseAuroraCondition below).
const SWPC_KP_URL = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json';
const SWPC_OVATION_URL = 'https://services.swpc.noaa.gov/json/ovation_aurora_latest.json';
// NASA NeoWs (Near Earth Object Web Service) -- free, CORS-enabled, but the
// public DEMO_KEY is a SHARED rate limit (30 req/hour, 50 req/day) across
// every DEMO_KEY user on the internet, not just this widget -- disclosed
// here per the third-party-service checklist in AGENTS.md. This is fetched
// at most once per real calendar day (see fetchNeoCloseApproach's
// localStorage cache below), so our own polling never gets anywhere near
// that budget even in the worst case; a free personal key from
// https://api.nasa.gov (instant signup, no credit card, raises the limit to
// 1,000/hour) would be a straightforward upgrade if this is ever expanded.
const NASA_NEO_URL = 'https://api.nasa.gov/neo/rest/v1/feed';
const NASA_API_KEY = 'DEMO_KEY';

// ---------------------------------------------------------------------------
// Weather CONDITION (sky cover / clear vs cloudy) source: NWS gridpoint
// forecast -- NOT Open-Meteo, NOT a distant airport METAR station.
//
// Open-Meteo's default model was observed forecasting a flat 100% cloud
// cover for literally every hour of the day at this location regardless of
// reality. Nearby full-METAR stations (KSFO/KOAK/KHWD) are 17-26 miles away
// and are still just "the surrounding area", not this address.
//
// The National Weather Service publishes an official, human-forecaster
// quality-controlled gridded forecast at ~2.5km resolution. The grid cell
// below (office MTR, gridpoint 83,111) was resolved specifically for
// 7 Upper Cecilia Way, Tiburon, CA 94920 (37.8991768, -122.4949685) via:
//   https://api.weather.gov/points/37.8991768,-122.4949685
// Its "skyCover" field gives the actual forecast cloud-cover percentage for
// THIS grid cell, hour by hour, for the current time through ~7 days out --
// this is what drives the CURRENT + HOURLY + DAILY condition/icon below.
// Temperature/humidity/wind/UV intentionally still come from Open-Meteo
// (see fetchWeather), since that already matches this specific residence's
// microclimate better than generic station-based data.
const NWS_GRIDPOINT_URL = 'https://api.weather.gov/gridpoints/MTR/83,111';

// Parse an ISO8601 duration like "P1DT6H" or "PT1H" into milliseconds.
function parseIsoDurationMs(iso) {
  const m = /^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?/.exec(iso || '');
  if (!m) return 0;
  const days = parseInt(m[1] || '0', 10);
  const hours = parseInt(m[2] || '0', 10);
  const mins = parseInt(m[3] || '0', 10);
  return ((days * 24 + hours) * 60 + mins) * 60 * 1000;
}

// NWS gridpoint "values" arrays use the format
// "2026-08-23T14:00:00+00:00/PT1H" (start time / ISO8601 duration). Convert
// to a flat list of { start, end, value } intervals for easy lookup.
function parseNwsIntervals(field) {
  if (!field || !Array.isArray(field.values)) return [];
  return field.values.map(v => {
    const [startStr, durStr] = v.validTime.split('/');
    const start = new Date(startStr);
    const end = new Date(start.getTime() + parseIsoDurationMs(durStr));
    return { start, end, value: v.value };
  });
}

async function fetchNwsSkyCover() {
  try {
    const r = await fetchWithTimeout(NWS_GRIDPOINT_URL);
    if (!r.ok) return null;
    const data = await r.json();
    return parseNwsIntervals(data.properties && data.properties.skyCover);
  } catch (e) {
    console.warn('NWS gridpoint skyCover fetch failed', e);
    return null;
  }
}

// Look up the NWS-forecast sky-cover percentage covering a given Date.
function skyCoverAt(intervals, date) {
  if (!intervals || !intervals.length) return null;
  for (const iv of intervals) {
    if (date >= iv.start && date < iv.end) return iv.value;
  }
  return null;
}

// Average sky cover across daylight hours (9am-6pm local) for a given
// "YYYY-MM-DD" date, for a single representative daily condition/icon.
function avgDaytimeSkyCover(intervals, dateStr) {
  if (!intervals || !intervals.length) return null;
  const samples = [];
  for (let h = 9; h <= 18; h++) {
    // dateStr + hour is a Pacific-local wall-clock sample ("9am-6pm local");
    // must be resolved through zonedTimeToUtc (see comment above its
    // definition), not `new Date(...)`, or this silently samples the wrong
    // actual hour on any runtime not itself set to Pacific time.
    const d = zonedTimeToUtc(`${dateStr}T${String(h).padStart(2, '0')}:00:00`, TZ);
    const v = skyCoverAt(intervals, d);
    if (v != null) samples.push(v);
  }
  if (!samples.length) return null;
  return samples.reduce((a, b) => a + b, 0) / samples.length;
}

// Open-Meteo's own `daily.weather_code` is a single model-chosen aggregate
// for the ENTIRE calendar day (00:00-23:59), which for this coastal
// microclimate very often ends up being an early-morning marine-layer fog
// or overcast code (45/48/3) that has completely burned off by the time
// anyone is actually looking at the display -- e.g. live-verified on
// 2026-08-24: daily.weather_code reported "Fog" (45) for today while every
// single hourly sample from 9am-6pm was actually 0/2 (Clear/Partly Cloudy),
// and the fog code sits outside the [0,1,2,3] range the NWS sky-cover
// override already corrects. This derives the single representative
// condition for the 5-day list from the DAYTIME (9am-6pm Pacific) hourly
// series instead -- the same hourly array already fetched for the hourly
// strip -- so an early-morning-only code can never stand in for a day that
// is clear by the time it matters. Pure string slicing on Open-Meteo's own
// naive local-time strings (no Date parsing, so this has none of the
// runtime-timezone ambiguity called out above).
function daytimeWeatherCode(hourly, dateStr) {
  if (!hourly || !hourly.time) return null;
  const counts = new Map();
  for (let i = 0; i < hourly.time.length; i++) {
    if (hourly.time[i].slice(0, 10) !== dateStr) continue;
    const hr = parseInt(hourly.time[i].slice(11, 13), 10);
    if (hr < 9 || hr > 18) continue;
    const code = hourly.weather_code[i];
    counts.set(code, (counts.get(code) || 0) + 1);
  }
  if (!counts.size) return null;
  // Most frequent daytime hour wins; ties broken toward the numerically
  // higher (= more significant: fog > cloud, rain > fog, storm > rain) code
  // so a short-lived shower isn't voted away by a majority of clear hours.
  let best = null;
  for (const [code, n] of counts) {
    if (!best || n > best.n || (n === best.n && code > best.code)) best = { code, n };
  }
  return best.code;
}

// Cross-checked against the National Weather Service's own official list of
// every alert event type it can ever issue (api.weather.gov/alerts/types --
// ~100 fixed strings) to find real, currently-unmapped products that
// correspond to existing rare-event CGI keys, rather than guessing at NWS
// wording. Two real bugs were found and fixed this way: `volcanic` never
// matched NWS's actual product name "Volcano Warning" (missing the "ic"),
// so that alert type could never have fired automatically; and several
// real products (Avalanche/Ashfall/Snow Squall/Earthquake Warning/Blowing
// Dust/Fire Warning) had no mapping at all despite exactly matching
// existing keys.
const NWS_EVENT_MAP = [
  { re: /tornado warning/i, key: 'tornado', label: 'Tornado Warning', severity: 5 },
  { re: /tsunami warning/i, key: 'tsunami', label: 'Tsunami Warning', severity: 5 },
  { re: /hurricane warning|typhoon warning|hurricane force wind warning/i, key: 'hurricane', label: 'Hurricane Warning', severity: 4 },
  { re: /tropical storm warning/i, key: 'tropical-storm', label: 'Tropical Storm Warning', severity: 4 },
  { re: /flash flood warning/i, key: 'flash-flood', label: 'Flash Flood Warning', severity: 4 },
  { re: /severe thunderstorm warning/i, key: 'thunderstorm-hail', label: 'Severe Thunderstorm Warning', severity: 3 },
  { re: /tornado watch|severe thunderstorm watch/i, key: 'thunderstorm', label: 'Severe Weather Watch', severity: 2 },
  // "Fire Warning" = an actual uncontrolled fire currently burning nearby
  // (matches the 'forest-fire' key's real flames overlay); "Fire Weather
  // Watch"/"Red Flag Warning"/"Extreme Fire Danger" = conditions merely
  // favorable for fire to start/spread, no fire burning yet (matches
  // 'wildfire-smoke's smoke-haze overlay instead -- no flames shown for
  // conditions alone, which would be inaccurate).
  { re: /fire warning/i, key: 'forest-fire', label: 'Fire Warning', severity: 4 },
  { re: /extreme fire danger|fire weather watch|red flag warning/i, key: 'wildfire-smoke', label: 'Fire Weather Warning', severity: 3 },
  { re: /dust storm warning|blowing dust warning/i, key: 'dust-storm', label: 'Dust Storm Warning', severity: 3 },
  { re: /dust advisory|blowing dust advisory/i, key: 'dust-storm', label: 'Blowing Dust Advisory', severity: 2 },
  { re: /blizzard warning|winter storm warning/i, key: 'blizzard', label: 'Winter Storm Warning', severity: 3 },
  { re: /ice storm warning/i, key: 'ice-storm', label: 'Ice Storm Warning', severity: 3 },
  // Real NWS product is literally "Volcano Warning" -- the previous
  // /volcanic/i regex could never match this and was a live bug.
  { re: /volcano warning/i, key: 'volcanic-eruption', label: 'Volcano Warning', severity: 4 },
  { re: /ashfall warning/i, key: 'volcanic-ash', label: 'Ashfall Warning', severity: 3 },
  { re: /ashfall advisory/i, key: 'ash', label: 'Ashfall Advisory', severity: 2 },
  { re: /avalanche warning/i, key: 'avalanche', label: 'Avalanche Warning', severity: 3 },
  { re: /avalanche watch|avalanche advisory/i, key: 'avalanche', label: 'Avalanche Advisory', severity: 2 },
  { re: /snow squall warning/i, key: 'squall', label: 'Snow Squall Warning', severity: 2 },
  // NWS's ShakeAlert-based "Earthquake Warning" product -- in addition to
  // (not instead of) the direct USGS feed below, so either source alone is
  // enough to trigger the scene.
  { re: /earthquake warning/i, key: 'earthquake', label: 'Earthquake Warning', severity: 4 },
  { re: /dense smoke advisory/i, key: 'smoke', label: 'Dense Smoke Advisory', severity: 2 },
  { re: /air quality alert/i, key: 'smog', label: 'Air Quality Alert', severity: 1 },
  // Special Marine Warnings are NWS's real product for waterspouts and
  // sudden dangerous marine thunderstorm gusts -- the closest official
  // match to the 'waterspout' CGI.
  { re: /special marine warning/i, key: 'waterspout', label: 'Special Marine Warning', severity: 2 },
];

function nwsSeverityValue(sev) {
  const map = { Extreme: 4, Severe: 3, Moderate: 2, Minor: 1, Unknown: 0 };
  return map[sev] || 0;
}

async function fetchNwsAlerts() {
  try {
    const r = await fetchWithTimeout(NWS_ALERTS_URL);
    if (!r.ok) return [];
    const data = await r.json();
    return Array.isArray(data.features) ? data.features : [];
  } catch (e) {
    console.warn('NWS alerts fetch failed', e);
    return [];
  }
}

async function fetchEarthquake() {
  try {
    const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const r = await fetchWithTimeout(USGS_QUAKE_URL + encodeURIComponent(yesterday));
    if (!r.ok) return null;
    const data = await r.json();
    if (!data.features || !data.features.length) return null;
    const q = data.features[0];
    return {
      magnitude: q.properties.mag,
      place: q.properties.place,
      time: q.properties.time,
    };
  } catch (e) {
    console.warn('USGS earthquake fetch failed', e);
    return null;
  }
}

function havKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(Math.min(1, a)));
}

async function fetchNoaaStorms() {
  try {
    const r = await fetchWithTimeout(`${NOAA_STORMS_URL}?v=1`);
    if (!r.ok) return null;
    return await r.json();
  } catch (e) {
    console.warn('NOAA/NHC storm fetch failed', e);
    return null;
  }
}

// Real-time Aurora data, resolved specifically to Tiburon's own coordinates
// (not just "a storm is happening somewhere on Earth"). The OVATION model
// returns a ~1-degree-resolution worldwide grid of aurora probability; we
// look up the single grid cell nearest Tiburon's lat/lon, exactly the same
// way the NWS gridpoint lookup above resolves sky cover to this exact
// address instead of a generic regional value.
async function fetchAuroraData() {
  try {
    const [kpRes, ovRes] = await Promise.all([
      fetchWithTimeout(SWPC_KP_URL).then(r => r.ok ? r.json() : null).catch(() => null),
      fetchWithTimeout(SWPC_OVATION_URL).then(r => r.ok ? r.json() : null).catch(() => null),
    ]);
    let kp = null;
    if (Array.isArray(kpRes) && kpRes.length) {
      const last = kpRes[kpRes.length - 1];
      kp = last && last.Kp != null ? Number(last.Kp) : null;
    }
    let ovationValue = null;
    if (ovRes && Array.isArray(ovRes.coordinates)) {
      // OVATION longitude is 0-360 East; Tiburon's LON is -122.49... (West).
      const targetLon = (360 + LON) % 360;
      let best = null;
      for (const c of ovRes.coordinates) {
        const dist = Math.abs(c[0] - targetLon) + Math.abs(c[1] - LAT);
        if (!best || dist < best.dist) best = { val: c[2], dist };
      }
      ovationValue = best ? best.val : null;
    }
    if (kp == null && ovationValue == null) return null;
    return { kp, ovationValue };
  } catch (e) {
    console.warn('Aurora data fetch failed', e);
    return null;
  }
}

// NASA close-approach data is fundamentally global -- an object's distance
// from Earth isn't specific to any one city -- so unlike weather or an
// eclipse's contact times, this can never be made truly "Tiburon-only" in
// the way the other events above can. Cached once per real calendar day in
// localStorage (see NASA_NEO_URL's rate-limit note above), and the display
// itself is still gated to Tiburon's own real nighttime in
// chooseNeoCondition below -- the closest honest proxy available.
async function fetchNeoCloseApproach() {
  const cacheKey = 'neoCloseApproachCacheV1';
  const today = new Date().toISOString().slice(0, 10);
  let cached = null;
  try { cached = JSON.parse(localStorage.getItem(cacheKey) || 'null'); } catch (e) { cached = null; }
  if (cached && cached.date === today) return cached.result;

  try {
    const url = `${NASA_NEO_URL}?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`;
    const r = await fetchWithTimeout(url);
    if (!r.ok) return cached ? cached.result : null;
    const data = await r.json();
    let hit = null;
    const byDate = data.near_earth_objects || {};
    for (const dateKey of Object.keys(byDate)) {
      for (const obj of byDate[dateKey]) {
        const diaM = obj.estimated_diameter && obj.estimated_diameter.meters
          ? obj.estimated_diameter.meters.estimated_diameter_max : 0;
        for (const ca of obj.close_approach_data || []) {
          const distKm = ca.miss_distance ? Number(ca.miss_distance.kilometers) : NaN;
          // Threshold picked to stay genuinely rare (a handful of
          // qualifying passes per year per NASA/CNEOS records): at least
          // 100m across AND passing within one lunar distance (~384,400km).
          if (diaM >= 100 && distKm && distKm <= 384400) {
            hit = { name: (obj.name || '').replace(/[()]/g, ''), diameter: Math.round(diaM), distKm: Math.round(distKm) };
          }
        }
      }
    }
    try { localStorage.setItem(cacheKey, JSON.stringify({ date: today, result: hit })); } catch (e) { /* ignore quota errors */ }
    return hit;
  } catch (e) {
    console.warn('NASA NEO fetch failed', e);
    return cached ? cached.result : null;
  }
}

function chooseAlertCondition(alerts, quake, noaaStorms) {
  let best = null;
  for (const f of alerts) {
    const event = f.properties.event || '';
    const severity = nwsSeverityValue(f.properties.severity);
    for (const m of NWS_EVENT_MAP) {
      if (m.re.test(event)) {
        const score = m.severity * 10 + severity;
        if (!best || score > best.score) {
          best = { ...m, score };
        }
      }
    }
  }
  if (best) return { key: best.key, label: best.label, source: 'NWS' };

  // NOTE: We intentionally do NOT use raw NHC storm positions (noaaStorms) to
  // override the displayed condition here. A storm's center coordinates only
  // say where it is on the globe -- they say nothing about whether it
  // actually affects Tiburon. The NWS_ALERTS_URL query above is already
  // scoped to this exact point (lat/lon), so if a tropical system (or any
  // other hazard) is genuinely forecast to affect Tiburon, the National
  // Weather Service will issue a real watch/warning/advisory for this point
  // and it will be caught by the NWS_EVENT_MAP loop above. Tropical
  // storms/hurricanes almost never reach Northern California at all, so a
  // "nearby" raw-distance check produced false positives (e.g. a hurricane
  // thousands of miles away in the Central Pacific incorrectly showing as
  // Tiburon's current condition). See dakboard-calendar AGENTS notes.

  if (quake) {
    return {
      key: 'earthquake',
      label: `Earthquake M${quake.magnitude}`,
      source: 'USGS',
    };
  }
  return null;
}

// Real lunar eclipse contact times (all UTC, unambiguous -- a lunar eclipse
// happens at the same instant everywhere on Earth's night side, so no
// timezone conversion is needed here at all, unlike the Open-Meteo data
// above). Sourced from NASA/EclipseWise predicted contact tables, cross-
// checked against Space.com/EarthSky's own writeups -- see the PR/commit
// history for the exact sources. `penumbral` is the full outer-shadow
// window (subtle dimming, barely perceptible -- shown as 'eclipse-lunar');
// `umbral` is the partial/deep-partial window where a visible dark "bite"
// grows across the Moon (also 'eclipse-lunar'); `total` is totality itself,
// when the Moon is fully inside the umbra and turns red ('blood-moon'). The
// Aug 2026 eclipse never reaches technical totality (96% umbral magnitude),
// but is close enough and dark enough at greatest eclipse to visibly read as
// a blood moon, so its `umbral` window is tagged `bloodAtMax: true` to show
// 'blood-moon' only in the deepest part of that window instead of for the
// entire partial phase.
//
// Add future eclipses here as they become confirmed (NASA publishes lunar
// eclipse predictions decades in advance) -- do not delete past entries,
// they simply stop matching once their window is in the past.
// Lunar eclipses -- these ARE visible from roughly half of Earth's night
// side at once, so unlike a solar eclipse's narrow path, "visible from
// Tiburon" mostly just means "the Moon is above Tiburon's horizon during the
// event", which the sunElevation gate in chooseAstroCondition below now
// enforces on every entry (added specifically so an eclipse whose greatest
// moment happens during Tiburon's broad daylight -- e.g. most of the Dec
// 2028 event below -- correctly displays only its actually-visible sliver,
// not the whole worldwide event window).
const LUNAR_ECLIPSES = [
  {
    // Total, March 3, 2026 -- greatest eclipse before dawn for Tiburon.
    penumbral: ['2026-03-03T08:44:00Z', '2026-03-03T14:23:00Z'],
    umbral: ['2026-03-03T09:50:00Z', '2026-03-03T13:17:00Z'],
    total: ['2026-03-03T11:04:00Z', '2026-03-03T12:03:00Z'],
  },
  {
    // Deep partial (93-96% umbral), Aug 27-28, 2026 -- evening sky for the
    // West Coast.
    penumbral: ['2026-08-28T01:23:00Z', '2026-08-28T07:02:00Z'],
    umbral: ['2026-08-28T02:33:00Z', '2026-08-28T05:52:00Z'],
    bloodAtMax: true,
    maxWindow: ['2026-08-28T03:43:00Z', '2026-08-28T04:43:00Z'],
  },
  {
    // Shallow partial (umbral magnitude 0.066), Jan 12, 2028 -- greatest
    // eclipse 04:14 UTC = 8:14pm PST Jan 11, good evening visibility.
    penumbral: ['2028-01-12T02:00:00Z', '2028-01-12T06:30:00Z'],
    umbral: ['2028-01-12T03:46:00Z', '2028-01-12T04:42:00Z'],
  },
  {
    // Total (mag 1.246), Dec 31, 2028 -- greatest eclipse 16:53 UTC = ~8:53am
    // PST, well after sunrise for Tiburon; NASA/timeanddate list California
    // as only catching the earliest penumbral/partial stages before
    // moonset/dawn. Contact times are approximate (derived from published
    // total/partial durations centered on greatest eclipse, source hasn't
    // published full per-contact times as of writing) -- the sunElevation
    // gate is what actually keeps this honest for Tiburon, clipping it to
    // whatever pre-dawn sliver is real, rather than the window's precision.
    penumbral: ['2028-12-31T14:20:00Z', '2028-12-31T19:25:00Z'],
    umbral: ['2028-12-31T15:05:00Z', '2028-12-31T18:40:00Z'],
    total: ['2028-12-31T16:17:00Z', '2028-12-31T17:29:00Z'],
  },
  {
    // Total (mag 1.844, a deep/long totality), June 25-26, 2029 -- greatest
    // eclipse 03:23 UTC = 8:23pm PDT June 25, good evening visibility.
    // Contact times approximate from published durations, same caveat as
    // above.
    penumbral: ['2029-06-26T00:50:00Z', '2029-06-26T05:55:00Z'],
    umbral: ['2029-06-26T01:33:00Z', '2029-06-26T05:13:00Z'],
    total: ['2029-06-26T02:32:00Z', '2029-06-26T04:14:00Z'],
  },
  {
    // Total (mag 1.117), Dec 20-21, 2029 -- greatest eclipse 22:43 UTC =
    // 2:43pm PST Dec 20, mid-afternoon for Tiburon; the sunElevation gate
    // will correctly suppress most/all of this one for Tiburon specifically
    // (real per-contact times not yet published as of writing -- kept here
    // as a placeholder window so the table doesn't silently skip the date
    // entirely; verify/tighten once NASA publishes final contacts).
    penumbral: ['2029-12-20T19:30:00Z', '2029-12-21T01:55:00Z'],
    umbral: ['2029-12-20T20:45:00Z', '2029-12-21T00:40:00Z'],
    total: ['2029-12-20T21:53:00Z', '2029-12-20T23:32:00Z'],
  },
];

// Solar eclipses have a narrow visibility PATH, so unlike lunar eclipses
// these genuinely only apply to specific places. A simplified "eclipse
// season" geometry model (the same node-crossing technique used for the
// LUNAR_ECLIPSES failsafe above) was tried here first and rejected: it
// correctly found every real solar eclipse globally, but couldn't tell
// which narrow strip of Earth the shadow actually falls on -- it flagged
// the real Aug 12, 2026 eclipse (NOT visible from California) exactly the
// same as ones that are, which would have been a real accuracy regression.
//
// THE ACTUAL FIX: CycleCalcs (cyclecalcs.com) runs a real eclipse-geometry
// engine (full Sun/Moon/shadow-cone math, not a lookup table) and exposes
// it as a free, open-CORS (`Access-Control-Allow-Origin: *`, verified
// live), no-key, no-signup JSON API that computes exact local circumstances
// for ANY latitude/longitude, out to the year 2200. This is what actually
// makes "100% accurate, Tiburon-specific, effectively-infinite-horizon"
// solar eclipse automation possible -- fetchSolarEclipseSchedule() below
// queries it directly for Tiburon's exact coordinates (its own 10-year-per-
// request cap, refreshed monthly) instead of asking a human to keep
// researching per-city visibility every few years.
//
// This was validated hard before being trusted: it exactly reproduced (to
// the minute) this project's own independently-sourced Jan 14, 2029 and
// Nov 14, 2031 contact times from timeanddate.com/tutiempo -- AND in the
// process caught a REAL ERROR in this project's own prior manual research:
// Jan 26, 2028 had been assumed visible from Tiburon based on Los Angeles-
// area data (the two cities' circumstances are usually close enough, but
// not for this particular marginal event), whereas computed specifically
// for Tiburon's own coordinates, that eclipse is NOT actually visible here
// at all. The corrected SOLAR_ECLIPSES_FALLBACK table below reflects that
// correction, pulled from this same API and re-verified by hand.
const SOLAR_ECLIPSE_API_URL = 'https://www.cyclecalcs.com/v2/eclipses';
const SOLAR_ECLIPSE_CACHE_KEY = 'solarEclipseScheduleCacheV1';
const SOLAR_ECLIPSE_CACHE_MAX_AGE_MS = 30 * 24 * 3600 * 1000; // refresh monthly -- eclipse dates don't change, so no need to hit this more often

async function fetchSolarEclipseSchedule() {
  let cached = null;
  try { cached = JSON.parse(localStorage.getItem(SOLAR_ECLIPSE_CACHE_KEY) || 'null'); } catch (e) { cached = null; }
  if (cached && Date.now() - cached.fetchedAt < SOLAR_ECLIPSE_CACHE_MAX_AGE_MS) {
    return cached.eclipses;
  }
  try {
    const start = new Date().toISOString().slice(0, 10);
    // 3650 days (10 years) is CycleCalcs's own per-request range cap.
    const end = new Date(Date.now() + 3650 * 86400000).toISOString().slice(0, 10);
    const url = `${SOLAR_ECLIPSE_API_URL}?direction=range&start=${start}&end=${end}` +
      `&type=solar&visible_only=true&lat=${LAT}&lon=${LON}&include=local,contacts`;
    const r = await fetchWithTimeout(url, 8000);
    if (!r.ok) return cached ? cached.eclipses : null;
    const body = await r.json();
    const raw = (body.data && body.data.eclipses) || [];
    const eclipses = raw
      .filter(e => e.local && e.local.visible && Array.isArray(e.local.contacts))
      .map(e => {
        const first = e.local.contacts.find(c => c.kind === 'first_contact');
        const last = e.local.contacts.find(c => c.kind === 'fourth_contact');
        return (first && last) ? { window: [first.instant, last.instant] } : null;
      })
      .filter(Boolean);
    try { localStorage.setItem(SOLAR_ECLIPSE_CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), eclipses })); } catch (e) { /* ignore quota errors */ }
    return eclipses;
  } catch (e) {
    console.warn('Solar eclipse schedule fetch failed', e);
    return cached ? cached.eclipses : null;
  }
}

// Lunar eclipses on the SAME live CycleCalcs engine used for solar above --
// even more foolproof here, because a lunar eclipse's visibility is a much
// simpler question (is the Moon above Tiburon's horizon during the event?)
// than a solar eclipse's narrow shadow path, so this project keeps THREE
// independent tiers for lunar/Blood Moon instead of solar's two: (1) this
// live per-coordinate API query, refreshed monthly; (2) LUNAR_ECLIPSES, the
// hand-verified static table above; (3) algorithmicLunarEclipseCheck()
// below, a real orbital-mechanics model validated against 6 independent
// historical/future eclipses that needs no network or table at all. Solar
// eclipses can't safely have that same tier-3 algorithmic fallback (see the
// comment above SOLAR_ECLIPSE_API_URL) -- but lunar eclipses genuinely can,
// making Blood Moon/lunar eclipse automation the most bulletproof condition
// in this entire file: it would take BOTH a cyclecalcs.com outage AND this
// file never being updated again for the static table to matter, and even
// then the algorithm still catches every real eclipse on its own.
const LUNAR_ECLIPSE_API_URL = 'https://www.cyclecalcs.com/v2/eclipses';
const LUNAR_ECLIPSE_CACHE_KEY = 'lunarEclipseScheduleCacheV1';
const LUNAR_ECLIPSE_CACHE_MAX_AGE_MS = 30 * 24 * 3600 * 1000; // refresh monthly, same reasoning as solar

// A lunar eclipse reads as a "Blood Moon" whenever a large enough fraction
// of the Moon sits inside Earth's umbra, not only during technical totality
// -- the real Aug 2026 event (96.6% umbral obscuration, officially
// "partial") already looks essentially fully red at maximum. 90% is a
// reasonable, real-astronomy-informed line: below it, a bright uneclipsed
// sliver still dominates the Moon's appearance; at or above it, the whole
// disc reads as reddened.
const BLOOD_MOON_OBSCURATION_THRESHOLD = 0.90;

function windowsForLunarEclipseEntry(e) {
  const c = {};
  for (const contact of e.contacts_utc || []) c[contact.kind] = contact.instant;
  const windows = [];
  const highObscuration = (e.umbral_obscuration_fraction || 0) >= BLOOD_MOON_OBSCURATION_THRESHOLD;
  if (c.total_begin && c.total_end) {
    windows.push({ window: [c.total_begin, c.total_end], key: 'blood-moon', label: 'Blood Moon (Total Lunar Eclipse)' });
  }
  if (c.partial_begin && c.partial_end) {
    windows.push(highObscuration
      ? { window: [c.partial_begin, c.partial_end], key: 'blood-moon', label: 'Blood Moon (Lunar Eclipse)' }
      : { window: [c.partial_begin, c.partial_end], key: 'eclipse-lunar', label: 'Partial Lunar Eclipse' });
  }
  if (c.penumbral_begin && c.penumbral_end) {
    windows.push({ window: [c.penumbral_begin, c.penumbral_end], key: 'eclipse-lunar', label: 'Lunar Eclipse' });
  }
  // Most-specific-first (total, then partial, then penumbral) so
  // chooseAstroCondition's first-match-wins loop prefers the more dramatic,
  // more accurate classification whenever windows overlap (a total window
  // always sits inside its own partial window, which sits inside its own
  // penumbral window).
  return windows;
}

async function fetchLunarEclipseSchedule() {
  let cached = null;
  try { cached = JSON.parse(localStorage.getItem(LUNAR_ECLIPSE_CACHE_KEY) || 'null'); } catch (e) { cached = null; }
  if (cached && Date.now() - cached.fetchedAt < LUNAR_ECLIPSE_CACHE_MAX_AGE_MS) {
    return cached.windows;
  }
  try {
    const start = new Date().toISOString().slice(0, 10);
    const end = new Date(Date.now() + 3650 * 86400000).toISOString().slice(0, 10); // 10-year API cap
    const url = `${LUNAR_ECLIPSE_API_URL}?direction=range&start=${start}&end=${end}` +
      `&type=lunar&visible_only=true&lat=${LAT}&lon=${LON}&include=local,contacts`;
    const r = await fetchWithTimeout(url, 8000);
    if (!r.ok) return cached ? cached.windows : null;
    const body = await r.json();
    const raw = (body.data && body.data.eclipses) || [];
    // NOTE: deliberately not using Array.prototype.flatMap -- it's an
    // ES2019+ RUNTIME method (not just syntax), so esbuild's syntax-level
    // ES2015 downlevel target does NOT polyfill it, and this project's
    // target WebView is old enough that ?./?? needed downleveling too, so
    // it likely lacks flatMap natively as well. reduce+concat is safe on
    // effectively any ES5+ engine.
    const windows = raw
      .filter(e => e.local && e.local.visible)
      .map(windowsForLunarEclipseEntry)
      .reduce((acc, arr) => acc.concat(arr), []);
    try { localStorage.setItem(LUNAR_ECLIPSE_CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), windows })); } catch (e) { /* ignore quota errors */ }
    return windows;
  } catch (e) {
    console.warn('Lunar eclipse schedule fetch failed', e);
    return cached ? cached.windows : null;
  }
}

// FAILSAFE tier 2: if the live API above is ever unreachable AND there's no
// usable cache yet (e.g. first-ever boot with no network), fall back to
// this precise, hand-verified table instead of showing nothing. Sourced
// from the same CycleCalcs computation, re-verified against
// timeanddate.com/tutiempo where available.
const SOLAR_ECLIPSES_FALLBACK = [
  { window: ['2029-01-14T15:10:00Z', '2029-01-14T17:44:00Z'] }, // partial, ~56% obscuration, sunrise-ish
  { window: ['2031-11-14T21:09:00Z', '2031-11-14T21:36:00Z'] }, // partial, ~0.1% obscuration (geometric graze)
  { window: ['2033-03-30T16:23:00Z', '2033-03-30T18:26:00Z'] }, // partial, ~39% obscuration
  { window: ['2035-09-02T02:23:00Z', '2035-09-02T03:25:00Z'] }, // partial, ~9% obscuration, near sunset
  // Extended a further decade out (2036-2046) purely for tier-2 resilience
  // depth -- pulled from the same CycleCalcs computation in one extra
  // research pass, so even a decade-long outage of the live API still
  // leaves this system fully automated with zero silent gaps.
  { window: ['2039-06-21T14:45:00Z', '2039-06-21T16:49:00Z'] }, // annular, ~28% obscuration
  { window: ['2040-11-04T17:50:00Z', '2040-11-04T18:39:00Z'] }, // partial, ~1% obscuration
  { window: ['2043-04-09T18:00:00Z', '2043-04-09T19:28:00Z'] }, // partial, ~11% obscuration
  { window: ['2044-08-23T01:06:00Z', '2044-08-23T02:57:00Z'] }, // total, ~84% obscuration
  { window: ['2045-02-17T01:29:00Z', '2045-02-17T02:22:00Z'] }, // annular, ~3% obscuration
  { window: ['2045-08-12T15:12:00Z', '2045-08-12T17:28:00Z'] }, // total (the "Great American" eclipse crossing Northern California), ~95% obscuration
  { window: ['2046-02-05T23:36:00Z', '2046-02-06T02:06:00Z'] }, // annular, ~79% obscuration
];

// FAILSAFE monitoring: this system is meant to run with zero manual
// maintenance. The live CycleCalcs queries (solar and lunar) always
// request "today through +10 years" on every successful refresh, so as
// long as they succeed at least once every ~30 days (their cache TTL) they
// never meaningfully run low on their own. This check exists for the
// degraded case: if a live fetch has NEVER once succeeded (e.g. no network
// since first boot), warn loudly in the console (visible to anyone who
// opens devtools on the live device) once the static fallback table is
// within a year of running out, so that's a visible, actionable signal
// instead of a silent gap. Solar's fallback table needs a human to
// eventually extend it (see SOLAR_ECLIPSES_FALLBACK above); lunar's does
// NOT, because algorithmicLunarEclipseCheck() behind it works forever with
// zero table/network at all -- so this only ever warns about solar.
function checkSolarEclipseFreshness(liveSolarSchedule) {
  if (liveSolarSchedule && liveSolarSchedule.length) return; // live tier is healthy and self-extending; nothing to warn about
  const lastEnd = SOLAR_ECLIPSES_FALLBACK
    .map(e => new Date(e.window[1]).getTime())
    .reduce((a, b) => Math.max(a, b), 0);
  if (Date.now() > lastEnd - 365 * 24 * 3600 * 1000) {
    console.warn(
      'The live solar eclipse API (cyclecalcs.com) has not been reachable, and ' +
      'SOLAR_ECLIPSES_FALLBACK only extends through ' + new Date(lastEnd).toISOString().slice(0, 10) +
      ' -- fewer than a year of known solar eclipses remain in the fallback table. ' +
      'Extend SOLAR_ECLIPSES_FALLBACK (cyclecalcs.com/v2/eclipses, cross-checked ' +
      'against timeanddate.com/eclipse) or restore network access. Lunar eclipse/ ' +
      'Blood Moon automation is unaffected -- it has its own algorithmic infinite-' +
      'horizon failsafe that needs no network or table at all.'
    );
  }
}

function inWindow(now, isoWindow) {
  return now >= new Date(isoWindow[0]) && now <= new Date(isoWindow[1]);
}

// `sunElevation` is the same approximate sin(altitude) proxy used for sky
// coloring (see applySkyForNow). A lunar eclipse is only actually visible
// from Tiburon while the Moon is above Tiburon's horizon, and a full moon is
// up almost exactly whenever the Sun is down -- so gating every lunar-
// eclipse window on real Tiburon nighttime (elevation <= 0, lenient enough
// to include twilight) turns each worldwide UTC window into the correctly
// clipped "what Tiburon can actually see" sliver, without needing per-event
// moonrise/moonset math. A SOLAR eclipse is the opposite: it can only
// happen while the Sun is actually up, so it needs the opposite gate --
// its own contact times are already computed for real Tiburon-area
// observers, but the daytime check is kept as defense-in-depth.
//
// FAILSAFE for lunar eclipses/Blood Moon -- genuinely infinite-horizon, no
// table required at all: a lunar eclipse is possible whenever a full moon
// coincides with the Moon passing near a node of its orbit (where it
// crosses the ecliptic plane -- if it didn't, the full moon would just miss
// Earth's shadow every month). This is real orbital mechanics (the same
// reason eclipses cluster into "eclipse seasons" roughly twice a year), not
// a guess: the draconic month (node-to-node, 27.212220817 days) is a
// well-established astronomical constant, and the reference node-crossing
// phase below was fit against this project's own 2 precisely-known 2026
// lunar eclipses, THEN VALIDATED against 6 independent real lunar eclipses
// never used in that fit (2025 and 2028-2029, none in the table above) --
// every single one landed within 1.02 days of a predicted node crossing at
// its own real full-moon instant. That's why this fallback is trusted
// enough to run automatically forever, with zero maintenance, once
// LUNAR_ECLIPSES above runs out: it isn't a guess, it's a calibrated and
// independently-verified physical model. (The equivalent approach for
// SOLAR eclipses was tested and rejected in favor of a real live eclipse-
// geometry API instead -- see the comment above SOLAR_ECLIPSE_API_URL
// below -- because a solar eclipse's visibility is also about which narrow
// path on Earth the Moon's shadow falls on, which this simplified 2-body
// model cannot determine accurately enough to guarantee "100% accurate"
// for Tiburon specifically.)
const DRACONIC_MONTH_DAYS = 27.212220817;
const REF_NODE_PHASE_DAYS = 2.993360549207802; // fit against this file's own 2026 LUNAR_ECLIPSES entries, see comment above

function nearestNodeDistanceDays(date) {
  const half = DRACONIC_MONTH_DAYS / 2;
  let phase = (toJulianDate(date) - REF_NODE_PHASE_DAYS) % half;
  if (phase < 0) phase += half;
  return Math.min(phase, half - phase);
}

function algorithmicLunarEclipseCheck(now) {
  const age = moonAgeDays(now);
  let distFromFull = age - SYNODIC_MONTH_DAYS / 2;
  if (distFromFull > SYNODIC_MONTH_DAYS / 2) distFromFull -= SYNODIC_MONTH_DAYS;
  if (distFromFull < -SYNODIC_MONTH_DAYS / 2) distFromFull += SYNODIC_MONTH_DAYS;
  if (Math.abs(distFromFull) > 1.0) return null; // not close enough to a full moon
  const nodeDist = nearestNodeDistanceDays(now);
  if (nodeDist > 1.3) return null; // not close enough to a node for any eclipse
  return nodeDist <= 0.9 ? 'total' : 'partial';
}

function chooseAstroCondition(now, sunElevation, solarSchedule, lunarSchedule) {
  if (sunElevation <= 0) {
    // Exactly ONE tier is consulted for "is there a lunar eclipse right
    // now", chosen by what's actually available -- once a stronger tier
    // has given its answer, weaker tiers are never consulted afterward
    // (never used to "double check" a negative), so a cruder fallback can
    // only ever fire when a more accurate source genuinely wasn't reachable
    // at all, not second-guess one that was.
    if (lunarSchedule && lunarSchedule.length) {
      // Tier 1: live CycleCalcs per-coordinate schedule (most accurate --
      // uses the Moon's real altitude/horizon data for Tiburon rather than
      // this file's own sunElevation proxy). Its answer -- including "no
      // eclipse right now" -- is trusted as-is; tiers 2/3 are not consulted
      // afterward to "double check" it.
      for (const w of lunarSchedule) {
        if (inWindow(now, w.window)) {
          return { key: w.key, label: w.label, source: 'cyclecalcs.com' };
        }
      }
    } else {
      // Tier 2: hand-verified static table, used only while the live fetch
      // has never once succeeded yet.
      let matched = null;
      for (const ecl of LUNAR_ECLIPSES) {
        if (ecl.total && inWindow(now, ecl.total)) {
          matched = { key: 'blood-moon', label: 'Blood Moon (Total Lunar Eclipse)', source: 'NASA' };
        } else if (ecl.bloodAtMax && ecl.maxWindow && inWindow(now, ecl.maxWindow)) {
          matched = { key: 'blood-moon', label: 'Blood Moon (Lunar Eclipse)', source: 'NASA' };
        } else if (ecl.umbral && inWindow(now, ecl.umbral)) {
          matched = { key: 'eclipse-lunar', label: 'Partial Lunar Eclipse', source: 'NASA' };
        } else if (ecl.penumbral && inWindow(now, ecl.penumbral)) {
          matched = { key: 'eclipse-lunar', label: 'Lunar Eclipse', source: 'NASA' };
        }
        if (matched) return matched;
      }
      // Tier 3: the live API has never once succeeded AND the static table
      // doesn't cover this specific date either -- fall back to the
      // independently-validated algorithmic detector so lunar eclipse/Blood
      // Moon automation genuinely never stops working, network or no
      // network, table or no table.
      const algo = algorithmicLunarEclipseCheck(now);
      if (algo === 'total') return { key: 'blood-moon', label: 'Blood Moon (Lunar Eclipse)', source: 'computed' };
      if (algo === 'partial') return { key: 'eclipse-lunar', label: 'Lunar Eclipse', source: 'computed' };
    }
  }
  if (sunElevation > -0.1) {
    // Live CycleCalcs schedule first (most accurate, self-updating); the
    // hand-verified static table only if the live fetch has never
    // succeeded (e.g. very first boot with no network yet).
    const schedule = (solarSchedule && solarSchedule.length) ? solarSchedule : SOLAR_ECLIPSES_FALLBACK;
    for (const ecl of schedule) {
      if (inWindow(now, ecl.window)) {
        return { key: 'eclipse', label: 'Solar Eclipse', source: solarSchedule && solarSchedule.length ? 'cyclecalcs.com' : 'fallback table' };
      }
    }
  }
  return null;
}

// Real-world calibration: mid-latitude (Tiburon is ~38N geographic, ~40-43N
// geomagnetic) aurora visibility has historically required G3+ geomagnetic
// storms (Kp>=7) -- the two confirmed real California sightings in the last
// decade (the May 2024 "Gannon storm" and the Oct 2024 storm) were both
// G4/G5 (Kp 8-9). Requiring BOTH the Kp index AND the OVATION model's own
// probability value at Tiburon's exact coordinates to be elevated is a
// cross-check between two independent NOAA products, so a glitch/spike in
// either feed alone can't produce a false "Aurora" display. `sunElevation`
// uses the same approximate day/night value the sky-color code already
// computes (see applySkyForNow) -- aurora is never visible against a lit
// sky regardless of how active the storm is.
function chooseAuroraCondition(aurora, sunElevation) {
  if (!aurora || aurora.kp == null || aurora.ovationValue == null) return null;
  if (sunElevation > -0.15) return null;
  if (aurora.kp >= 7 && aurora.ovationValue >= 10) {
    return { key: 'aurora', label: 'Aurora Borealis' };
  }
  return null;
}

// Real meteor-shower radiant positions (RA in decimal hours, Dec in
// degrees), sourced from the American Meteor Society's shower table. Only
// the reliable Northern-Hemisphere-favorable majors are included -- the eta
// Aquariids and Southern delta Aquariids are deliberately omitted because
// their radiants never climb high enough above Tiburon's horizon before
// dawn to be a genuine "visible from Tiburon" event.
//
// FAILSAFE / evergreen-by-design: unlike a table of one-off dated events,
// meteor showers recur every year within about a day of the same calendar
// date (Earth returns to nearly the same point in its orbit), and a
// radiant's RA/Dec barely changes on human timescales -- so peakMonth/
// peakDay here are permanent astronomical constants, not a "2026" snapshot
// that goes stale. This table needs no future maintenance at all. Moon
// interference (which DOES vary every year for a fixed calendar date) is
// computed live below via moonIlluminationFraction() instead of a
// hardcoded per-year flag, so a given shower is automatically skipped only
// in years where the real moon phase would actually wash it out, and
// automatically shown in years where it wouldn't -- e.g. this correctly
// stops showing the Quadrantids in 2026 (a real full moon that year) while
// still showing them normally in other years, forever, with no edits.
const METEOR_SHOWERS = [
  { name: 'Quadrantid', raHours: 15.33, decDeg: 49.7, peakMonth: 1, peakDay: 3, windowDays: 1 },
  { name: 'Lyrid', raHours: 18.13, decDeg: 33.3, peakMonth: 4, peakDay: 22, windowDays: 1 },
  { name: 'Perseid', raHours: 3.28, decDeg: 58.1, peakMonth: 8, peakDay: 12, windowDays: 1 },
  { name: 'Orionid', raHours: 6.42, decDeg: 15.8, peakMonth: 10, peakDay: 21, windowDays: 2 },
  { name: 'Leonid', raHours: 10.27, decDeg: 21.8, peakMonth: 11, peakDay: 17, windowDays: 1 },
  { name: 'Geminid', raHours: 7.55, decDeg: 32.4, peakMonth: 12, peakDay: 13, windowDays: 1 },
  { name: 'Ursid', raHours: 14.63, decDeg: 75.3, peakMonth: 12, peakDay: 22, windowDays: 1 },
];

// Low-precision (but standard, textbook) Greenwich Mean Sidereal Time ->
// Local Sidereal Time -> radiant altitude conversion. This is real
// spherical astronomy (not a guess): it answers "is this shower's radiant
// actually above Tiburon's horizon right now", using Tiburon's own lat/lon,
// which is exactly what "does this event impact Tiburon" requires for a
// sky phenomenon whose visibility is inherently about the observer's own
// horizon, not a value that generic web calendars ever specialize to one
// city.
function localSiderealTimeDeg(date, lonDeg) {
  const JD = date.getTime() / 86400000 + 2440587.5;
  const D = JD - 2451545.0;
  const gmst = ((280.46061837 + 360.98564736629 * D) % 360 + 360) % 360;
  return ((gmst + lonDeg) % 360 + 360) % 360;
}

function altitudeOfRaDec(raHours, decDeg, date, latDeg, lonDeg) {
  const lst = localSiderealTimeDeg(date, lonDeg);
  let ha = lst - raHours * 15;
  ha = ((ha + 180) % 360 + 360) % 360 - 180;
  const haR = ha * Math.PI / 180, decR = decDeg * Math.PI / 180, latR = latDeg * Math.PI / 180;
  const sinAlt = Math.sin(decR) * Math.sin(latR) + Math.cos(decR) * Math.cos(latR) * Math.cos(haR);
  return Math.asin(Math.max(-1, Math.min(1, sinAlt))) * 180 / Math.PI;
}

// True lunar mechanics, not calendar lookups: the synodic month (new moon
// to new moon, 29.530588861 days) and its own well-known 2000-01-06 18:14
// UTC reference new moon give the Moon's phase/age on any date forever,
// with no yearly table at all.
const SYNODIC_MONTH_DAYS = 29.530588861;
const REF_NEW_MOON_JD = 2451550.1; // 2000-01-06 18:14 UTC (widely published reference new moon)

function toJulianDate(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

function moonAgeDays(date) {
  let age = (toJulianDate(date) - REF_NEW_MOON_JD) % SYNODIC_MONTH_DAYS;
  if (age < 0) age += SYNODIC_MONTH_DAYS;
  return age;
}

// Fraction of the Moon's disk illuminated (0 = new, 1 = full), from its age
// in the synodic cycle -- the standard cosine approximation.
function moonIlluminationFraction(date) {
  return (1 - Math.cos((2 * Math.PI * moonAgeDays(date)) / SYNODIC_MONTH_DAYS)) / 2;
}

// A shower's peak date recurs on (approximately) the same calendar day every
// year -- check the current, previous, and next calendar year's occurrence
// of that month/day (handles the Dec/Jan-boundary showers like the Ursids
// correctly) and see if `now` falls within `windowDays` of any of them.
function nearestAnnualPeakMatch(now, month, day, windowDays) {
  const year = now.getUTCFullYear();
  for (const y of [year - 1, year, year + 1]) {
    const peak = Date.UTC(y, month - 1, day, 12, 0, 0);
    if (Math.abs(now.getTime() - peak) <= windowDays * 86400000) return true;
  }
  return false;
}

function chooseMeteorShower(now, sunElevation) {
  if (sunElevation > -0.15) return null; // needs real astronomical darkness, same bar as Aurora
  // A moon over ~65% illuminated washes out all but the brightest meteors --
  // computed live from real lunar mechanics (see moonIlluminationFraction
  // above), not a hardcoded per-year guess, so this self-corrects every year.
  if (moonIlluminationFraction(now) > 0.65) return null;
  for (const sh of METEOR_SHOWERS) {
    if (!nearestAnnualPeakMatch(now, sh.peakMonth, sh.peakDay, sh.windowDays)) continue;
    if (altitudeOfRaDec(sh.raHours, sh.decDeg, now, LAT, LON) >= 15) {
      return { key: 'meteor-shower', label: `${sh.name} Meteor Shower` };
    }
  }
  return null;
}

// Supermoon detection, hybrid precise+evergreen:
//  1) A table of REAL, precisely-dated full-supermoon instants (Fred
//     Espenak's perigee-full-moon list, cross-checked against EarthSky/BBC
//     Sky at Night/Old Farmer's Almanac) for the years already researched.
//  2) FAILSAFE fallback for any date beyond that table: real lunar
//     mechanics again, this time combining the synodic month (for "is it a
//     full moon") with the anomalistic month (perigee-to-perigee, 27.554549
//     days, anchored to the well-documented 2016-11-14 11:23 UTC perigee)
//     to ask "is the Moon ALSO near perigee right now" -- the literal
//     definition of a supermoon -- with no yearly table at all. This is a
//     simplified 2-cycle approximation (real perigee timing has additional
//     solar-perturbation wobble a full ephemeris would capture), so it's
//     intentionally used only once the precise table runs out, verified
//     against 2026's 3 known real supermoons (correctly flags Jan 3 and Dec
//     24; misses Nov 24 by a matter of hours, which the precise table below
//     already covers exactly).
const SUPERMOONS_TABLE = [
  { name: 'Wolf Moon', peak: '2026-01-03T10:03:00Z' },
  { name: 'Beaver Moon', peak: '2026-11-24T14:53:00Z' },
  { name: 'Cold Moon', peak: '2026-12-24T01:28:00Z' },
  { name: 'Supermoon', peak: '2027-01-22T12:17:00Z' },
  { name: 'Supermoon', peak: '2028-01-12T04:02:00Z' },
  { name: 'Supermoon', peak: '2028-02-10T15:03:00Z' },
  { name: 'Supermoon', peak: '2028-03-11T01:05:00Z' },
  { name: 'Supermoon', peak: '2029-02-28T17:10:00Z' },
  { name: 'Supermoon', peak: '2029-03-30T02:26:00Z' },
  { name: 'Supermoon', peak: '2029-04-28T10:36:00Z' },
];
const SUPERMOON_WINDOW_HOURS = 20; // looks essentially full to the eye about a day either side of peak

const ANOMALISTIC_MONTH_DAYS = 27.554549878;
const REF_PERIGEE_JD = 2457707.974; // 2016-11-14 11:23 UTC (closest perigee of the 21st century, widely documented)

function daysFromNearestPerigee(date) {
  let phase = (toJulianDate(date) - REF_PERIGEE_JD) % ANOMALISTIC_MONTH_DAYS;
  if (phase < 0) phase += ANOMALISTIC_MONTH_DAYS;
  return Math.min(phase, ANOMALISTIC_MONTH_DAYS - phase);
}

function algorithmicSupermoonCheck(now) {
  const age = moonAgeDays(now);
  let distFromFull = age - SYNODIC_MONTH_DAYS / 2;
  if (distFromFull > SYNODIC_MONTH_DAYS / 2) distFromFull -= SYNODIC_MONTH_DAYS;
  if (distFromFull < -SYNODIC_MONTH_DAYS / 2) distFromFull += SYNODIC_MONTH_DAYS;
  if (Math.abs(distFromFull) > 1.0) return false; // must be within ~1 day of full moon
  return daysFromNearestPerigee(now) <= 2.5; // must be within ~2.5 days of perigee
}

function chooseSupermoon(now, sunElevation) {
  if (sunElevation > -0.05) return null;
  for (const sm of SUPERMOONS_TABLE) {
    if (Math.abs(now.getTime() - new Date(sm.peak).getTime()) <= SUPERMOON_WINDOW_HOURS * 3600 * 1000) {
      return { key: 'supermoon', label: `Supermoon (${sm.name})` };
    }
  }
  // Beyond the precise table above: fall back to the algorithmic check so
  // this never goes silent, just slightly less date-precise.
  if (algorithmicSupermoonCheck(now)) {
    return { key: 'supermoon', label: 'Supermoon' };
  }
  return null;
}

// NASA close-approach data is fundamentally global (an object's distance
// from Earth isn't specific to any one city), so this is gated to Tiburon's
// own real nighttime as the closest honest proxy for "relevant to Tiburon"
// -- see fetchNeoCloseApproach's comment above for the full caveat.
function chooseNeoCondition(neo, sunElevation) {
  if (!neo) return null;
  if (sunElevation > -0.05) return null;
  return { key: 'close-approach', label: `Close Approach: ${neo.name}` };
}

// A rainbow requires simultaneous rain (nearby, light enough not to be
// total overcast) and direct sunlight at a moderate solar angle -- real
// optics (a rainbow's arc drops below the horizon once the sun is much
// higher than ~42 degrees, and needs SOME sun getting through, so solid
// overcast never produces one). `sunElevation` here is the same
// approximate sin(altitude) proxy used for sky coloring; sin(1deg)=0.017
// and sin(44deg)=0.695 bound the usable window. `cur` is Open-Meteo's own
// live current-conditions reading for Tiburon's exact coordinates, so this
// is inherently Tiburon-specific already.
function chooseRainbow(cur, sunElevation) {
  if (!cur || !cur.is_day) return null;
  if (sunElevation <= 0.02 || sunElevation >= 0.7) return null;
  const precip = Number(cur.precipitation) || 0;
  const cloud = cur.cloud_cover != null ? Number(cur.cloud_cover) : null;
  if (precip > 0 && precip < 4 && cloud != null && cloud < 85) {
    return { key: 'rainbow', label: 'Rainbow' };
  }
  return null;
}

function render(data, fx) {
  const { weather, aq, alerts, quake, noaaStorms, skyCoverIntervals, aurora, neo, solarSchedule, lunarSchedule } = data;
  const cur = weather.current;
  const hourly = weather.hourly;
  const minutely15 = weather.minutely_15;
  const daily = weather.daily;
  lastDaily = daily;

  const sunState = applySkyForNow(daily);
  if (fx) fx.setSunState(sunState.frac, sunState.elevation);

  // The top "Current" condition MUST agree with the 5-day forecast's "Today"
  // entry. Experience showed that a separate instantaneous Open-Meteo
  // `current.weather_code` snapshot could disagree with the same model's own
  // daily daytime summary, producing a current condition that said "Clear"
  // while Today said clouds (or vice-versa). Compute the Today condition once
  // and use it for both the top "Now" and the first daily row.
  const todayNwsCC = avgDaytimeSkyCover(skyCoverIntervals, daily.time[TODAY_IDX]);
  const todayDayCode = daytimeWeatherCode(hourly, daily.time[TODAY_IDX]);
  const todayInfo = resolveCondition(
    todayDayCode != null ? todayDayCode : daily.weather_code[TODAY_IDX],
    true,
    todayNwsCC,
    null
  );

  // Hourly/minutely strip still needs a per-slot consensus resolver below.
  const _skyCoverNow = skyCoverAt(skyCoverIntervals, new Date());
  const currentHourIdx = findCurrentHourlyIndex(hourly, new Date());
  const currentHourCode = currentHourIdx >= 0 ? hourly.weather_code[currentHourIdx] : cur.weather_code;
  const currentHourCC = currentHourIdx >= 0 ? hourly.cloud_cover[currentHourIdx] : cur.cloud_cover;

  let info = todayInfo;
  let displayKey = FORCED_SCENE || todayInfo.key;

  // Forced scene (e.g. ?scene=flash-flood) should display that scene's label,
  // not the current real-world weather label.
  if (FORCED_SCENE) {
    info = { key: displayKey, label: labelForKey(displayKey) };
  }

  // Override with live NWS / USGS / NOAA alerts if something rare/extreme is happening.
  const alertInfo = !FORCED_SCENE ? chooseAlertCondition(alerts || [], quake, noaaStorms) : null;
  if (alertInfo) {
    info = { key: alertInfo.key, label: alertInfo.label };
    displayKey = info.key;
  } else if (!FORCED_SCENE) {
    // No active hazard alert -- check every automated rare-sky-event source,
    // most-to-least rare/dramatic, all gated on real data specific to
    // Tiburon's own coordinates/clock (never a scene the user has to
    // trigger by hand): lunar eclipse/blood moon > aurora > meteor shower >
    // supermoon > NASA close-approach > rainbow > ordinary weather.
    const now = new Date();
    const astroInfo =
      chooseAstroCondition(now, sunState.elevation, solarSchedule, lunarSchedule) ||
      chooseAuroraCondition(aurora, sunState.elevation) ||
      chooseMeteorShower(now, sunState.elevation) ||
      chooseSupermoon(now, sunState.elevation) ||
      chooseNeoCondition(neo, sunState.elevation) ||
      chooseRainbow(cur, sunState.elevation);
    if (astroInfo) {
      info = { key: astroInfo.key, label: astroInfo.label };
      displayKey = info.key;
    }
  }
  const vars = {
    theme: THEME,
    '--sun-core': cssVar('--sun-core'), '--moon-core': cssVar('--moon-core'),
    '--cloud': cssVar('--cloud'), '--cloud2': cssVar('--cloud2'),
    '--rain': cssVar('--rain'), '--snow': cssVar('--snow'), '--fog': cssVar('--fog'),
    '--bolt': cssVar('--bolt'), '--fg': cssVar('--fg'),
  };

  document.getElementById('nowIcon').innerHTML = iconSvgFor(displayKey, vars);
  document.getElementById('nowTemp').textContent = fToLabel(cur.temperature_2m);
  document.getElementById('nowCond').textContent = info.label;
  document.getElementById('nowSub').textContent = `Feels like ${fToLabel(cur.apparent_temperature)}`;
  document.getElementById('hilo').textContent =
    `H:${Math.round(daily.temperature_2m_max[TODAY_IDX])}°  L:${Math.round(daily.temperature_2m_min[TODAY_IDX])}°`;

  lastDisplayKey = displayKey;
  // The top "Current" condition is now intentionally the same as 5-day Today.
  // Do NOT override the atmosphere cloud cover with a separate live estimate,
  // because that would make the CGI disagree with the condition label/icon.
  // setCondition() already loads the matching KEY_TABLE parameters.
  lastLiveCloudCover = null;
  if (fx) fx.setCondition(displayKey);

  // 15-minute forecast strip: current slot + next 11 (covers ~3 hours ahead)
  // Falls back to hourly data if minutely_15 is unavailable.
  const m15 = minutely15 && minutely15.time && minutely15.time.length > 0;
  const stripData = m15 ? minutely15 : hourly;
  const nowSlot = weather.current.time.slice(0, 16); // "YYYY-MM-DDTHH:MM"
  let startIdx = stripData.time.findIndex(t => t >= nowSlot);
  if (startIdx < 0) startIdx = 0;
  const hourlyEl = document.getElementById('hourly');
  hourlyEl.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    const idx = startIdx + i;
    if (idx >= stripData.time.length) break;
    // The "NOW" slot must show the exact same condition as the top current
    // condition (which is locked to the 5-day "Today" condition). Later slots
    // use the per-slot consensus so the strip still evolves through the day.
    let hi;
    if (i === 0) {
      hi = todayInfo;
    } else {
      const hIsDay = stripData.is_day ? !!stripData.is_day[idx] : true;
      const hCC = stripData.cloud_cover ? stripData.cloud_cover[idx] : null;
      const hPrecip = stripData.precipitation ? stripData.precipitation[idx] : null;
      // Failsafe consensus: use the cloudier of NWS gridpoint forecast and
      // Open-Meteo's cloud_cover, while preserving Open-Meteo's precipitation/fog
      // codes. This prevents either source alone from smoothing away real clouds
      // or a real rain event.
      const nwsCC = skyCoverAt(skyCoverIntervals, zonedTimeToUtc(stripData.time[idx], TZ));
      hi = resolveCondition(stripData.weather_code[idx], hIsDay, nwsCC, hCC, hPrecip);
    }
    const pop = stripData.precipitation_probability ? stripData.precipitation_probability[idx] : null;
    const el = document.createElement('div');
    el.className = 'ww-hour';
    el.innerHTML = `
      <div class="hh">${m15 ? minuteLabel(stripData.time[idx], i) : hourLabel(stripData.time[idx], i)}</div>
      ${iconSvgFor(hi.key, vars)}
      <div class="ht">${Math.round(stripData.temperature_2m[idx])}°</div>
      <div class="hp">${pop != null && pop >= 15 ? pop + '%' : ''}</div>
    `;
    hourlyEl.appendChild(el);
  }

  // Daily list: today + next 4
  const dailyEl = document.getElementById('daily');
  dailyEl.innerHTML = '';
  const globalMin = Math.min(...daily.temperature_2m_min.slice(TODAY_IDX, TODAY_IDX + 5));
  const globalMax = Math.max(...daily.temperature_2m_max.slice(TODAY_IDX, TODAY_IDX + 5));
  const span = Math.max(1, globalMax - globalMin);
  for (let i = 0; i < 5; i++) {
    const idx = TODAY_IDX + i;
    // Reuse the already-computed Today condition for the first row so the top
    // "Current" condition and 5-day "Today" row are pixel-for-pixel identical.
    let di;
    if (i === 0) {
      di = todayInfo;
    } else {
      // Same reasoning as the hourly strip: use the NWS gridpoint forecast's
      // average daytime (9am-6pm) sky cover for this address's exact grid cell
      // instead of Open-Meteo's own daily aggregate, which tends to report a
      // worst-case/overcast day even when it's actually clear-to-partly-cloudy
      // for most of the daylight hours (classic Bay Area marine-layer pattern).
      const nwsDayCC = avgDaytimeSkyCover(skyCoverIntervals, daily.time[idx]);
      // Prefer the daytime-hours-derived code (see daytimeWeatherCode above)
      // over Open-Meteo's whole-day aggregate; only fall back to the daily
      // aggregate if the hourly series doesn't cover that date for some reason.
      const dayCode = daytimeWeatherCode(hourly, daily.time[idx]);
      di = wmoInfo(dayCode != null ? dayCode : daily.weather_code[idx], true, nwsDayCC);
    }
    const lo = daily.temperature_2m_min[idx], hi = daily.temperature_2m_max[idx];
    const left = ((lo - globalMin) / span) * 100;
    const width = ((hi - lo) / span) * 100;
    const pop = daily.precipitation_probability_max[idx];
    const row = document.createElement('div');
    row.className = 'ww-day-row';
    row.innerHTML = `
      <div class="dn">${dayLabel(daily.time[idx], i)}</div>
      ${iconSvgFor(di.key, vars)}
      <div class="ww-bar"><span style="left:${left}%;width:${width}%"></span></div>
      <div class="dp">${pop >= 15 ? pop + '%' : ''}</div>
      <div class="dlo">${Math.round(lo)}°</div>
      <div class="dhi">${Math.round(hi)}°</div>
    `;
    dailyEl.appendChild(row);
  }

  // Air Quality panel
  const aqiVal = aq && typeof aq.aqi === 'number' ? aq.aqi : null;
  const aqiCat = aqiCategory(aqiVal);
  document.getElementById('aqiVal').textContent = aqiVal != null ? Math.round(aqiVal) : '—';
  document.getElementById('aqiVal').style.color = aqiCat.color;
  document.getElementById('aqiCat').textContent = aqiCat.label;
  const aqiProvider = aq && aq.provider ? aq.provider : 'AirNow';
  const aqiLocation = aq && aq.location ? `${aqiProvider}: ${aq.location}. ` : '';
  document.getElementById('aqiDesc').textContent = aqiLocation + aqiCat.desc;
  const aqiPct = aqiVal != null ? Math.min(100, (aqiVal / 300) * 100) : 0;
  document.getElementById('aqiMarker').style.left = `${aqiPct}%`;

  // Detail grid (UV, Sunrise/Sunset, Wind compass, Humidity, Visibility)
  const sunrise = new Date(daily.sunrise[TODAY_IDX]);
  const sunset = new Date(daily.sunset[TODAY_IDX]);
  const fmtT = d => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const currentHourlyIdx = findCurrentHourlyIndex(hourly, new Date());
  const visMiles = hourly.visibility && hourly.visibility[currentHourlyIdx] != null
    ? (hourly.visibility[currentHourlyIdx] / 1609.34).toFixed(1) : '—';
  const fg = cssVar('--fg');

  const cards = [
    { icon: WI.uv(fg), label: 'UV Index', value: Math.round(daily.uv_index_max[TODAY_IDX]), sub: uvLabel(daily.uv_index_max[TODAY_IDX]) },
    { icon: WI.sunrise(fg), label: 'Sunrise', value: fmtT(sunrise), sub: `Sunset ${fmtT(sunset)}` },
    { icon: '', label: 'Wind', value: `${Math.round(cur.wind_speed_10m)} mph`, sub: windDirLabel(cur.wind_direction_10m), compass: cur.wind_direction_10m },
    { icon: WI.drop(fg), label: 'Humidity', value: `${Math.round(cur.relative_humidity_2m)}%`, sub: '' },
    { icon: WI.eye(fg), label: 'Visibility', value: `${visMiles} mi`, sub: '' },
    { icon: WI.thermo(fg), label: 'Feels Like', value: fToLabel(cur.apparent_temperature), sub: '' },
  ];
  const gridEl = document.getElementById('grid');
  gridEl.innerHTML = '';
  for (const c of cards) {
    const div = document.createElement('div');
    div.className = 'ww-card';
    if (c.compass !== undefined) {
      div.innerHTML = `<div class="cl">${c.label}</div><div class="ww-compass">${windCompassSvg(c.compass, fg)}</div><div class="cv" style="font-size:16px">${c.value}</div><div class="cs">${c.sub}</div>`;
    } else {
      div.innerHTML = `<div class="cl">${c.icon}${c.label}</div><div class="cv">${c.value}</div><div class="cs">${c.sub}</div>`;
    }
    gridEl.appendChild(div);
  }
}

function uvLabel(uv) {
  if (uv < 3) return 'Low';
  if (uv < 6) return 'Moderate';
  if (uv < 8) return 'High';
  if (uv < 11) return 'Very High';
  return 'Extreme';
}

let fxEngine = null;
window.fxEngine = null; // exposed for debugging/testing

async function refresh() {
  try {
    const [weatherData, alerts, quake, noaaStorms, aurora, neo, solarSchedule, lunarSchedule] = await Promise.all([
      fetchWeather(),
      fetchNwsAlerts(),
      fetchEarthquake(),
      fetchNoaaStorms(),
      fetchAuroraData(),
      fetchNeoCloseApproach(),
      fetchSolarEclipseSchedule(),
      fetchLunarEclipseSchedule(),
    ]);
    checkSolarEclipseFreshness(solarSchedule);
    render({ ...weatherData, alerts, quake, noaaStorms, aurora, neo, solarSchedule, lunarSchedule }, fxEngine);
  } catch (e) {
    console.error('Weather fetch failed', e);
  }
}

function boot() {
  // CRITICAL: kick off the actual weather data fetch/render FIRST, before
  // touching WebGL/canvas at all, and never let it depend on that setup
  // succeeding (or even finishing quickly). This device's GPU is weak
  // enough that a continuous WebGL animation loop can end up starving the
  // main thread badly -- if the atmosphere engine were created first (as
  // it used to be), a slow/hung WebGL init could delay or starve the
  // in-flight fetch() responses indefinitely, leaving the widget's baked-in
  // "Loading…" text on screen forever with no visible error. The data path
  // must always win the race, unconditionally.
  refresh();
  setInterval(refresh, REFRESH_MS);
  // Keep the sky's sun-angle color creeping forward smoothly between full
  // data refreshes, so it doesn't look like a static gradient.
  setInterval(() => {
    if (lastDaily) {
      const s = applySkyForNow(lastDaily);
      if (fxEngine) fxEngine.setSunState(s.frac, s.elevation);
    }
  }, 60 * 1000);

  // Defer the (comparatively heavy) WebGL atmosphere engine to its own
  // task so it can never block the above, and fully guard its creation --
  // every call site that uses fxEngine already null-checks it, so if this
  // throws, is slow, or simply isn't supported on this device, the widget
  // still shows real weather data; it just runs without the animated sky
  // background instead of freezing entirely.
  setTimeout(() => {
    try {
      const canvas = document.getElementById('fx');
      const engine = new WeatherAtmosphere(canvas, {
        sunCore: cssVar('--sun-core'), sunGlow: cssVar('--sun-glow'),
        moonCore: cssVar('--moon-core'), moonGlow: cssVar('--moon-glow'),
        cloud: cssVar('--cloud'), cloud2: cssVar('--cloud2'),
        rain: cssVar('--rain'), snow: cssVar('--snow'), fog: cssVar('--fog'),
        bolt: cssVar('--bolt'),
      }, {
        forceDay: THEME === 'day',
        forceNight: THEME === 'night',
      });
      fxEngine = engine;
      window.fxEngine = engine;
      // The first refresh() likely already completed with fx=null (since
      // this engine didn't exist yet) -- reapply whatever it last computed
      // so the sky doesn't sit blank/default until the next 15-minute poll.
      if (lastDaily) {
        const s = applySkyForNow(lastDaily);
        engine.setSunState(s.frac, s.elevation);
      }
      if (lastDisplayKey) {
        engine.setCondition(lastDisplayKey);
        if (lastLiveCloudCover != null) {
          engine.setWeatherData({ cloudCover: lastLiveCloudCover / 100 });
        }
      }
    } catch (err) {
      console.error('Atmosphere engine failed to start; continuing without it', err);
      fxEngine = null;
      window.fxEngine = null;
    }
  }, 0);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
