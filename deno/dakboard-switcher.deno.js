/**
 * DAKboard Sunrise/Sunset Screen Switcher — Deno Deploy Cron
 *
 * Polls only during two wide UTC windows that cover all possible Tiburon
 * sunrise/sunset times year-round:
 *   - 12:00-16:00 UTC  =>  5:00am-9:00am Pacific (depending on DST)
 *   - 00:00-05:00 UTC  =>  5:00pm-10:00pm Pacific (depending on DST)
 *
 * The cron itself fires every 15 minutes 24/7 so Deno Deploy's parser can not
 * silently drop a complex multi-window expression. The handler checks the hour
 * and returns early outside the windows, so no DAKboard/sun-API calls are wasted.
 *
 * Deployment:
 *   1. Create a new Deno Deploy app named "dakboard-switcher".
 *   2. Deploy this file as the entrypoint.
 *   3. The cron runs automatically — no external trigger needed.
 *
 * Environment variables (set in Deno Deploy dashboard):
 *   DAKBOARD_API_KEY - Your DAKboard API key
 */

const DAKBOARD_API_KEY = (Deno.env.get("DAKBOARD_API_KEY") || "").trim();
const DEVICE_ID = "dev_24e4f53b1b81";
const DAY_SCREEN_ID = "scr_8ef733798d74";
const NIGHT_SCREEN_ID = "scr_f7c6eb565c43";
const LATITUDE = 37.8991768;
const LONGITUDE = -122.4949685;
const SUN_API_URL = "https://api.sunrise-sunset.org/v2";
const DAKBOARD_API_BASE = "https://dakboard.com/api/2";
const TIME_ZONE = "America/Los_Angeles";

// Morning window covers Pacific sunrise (5-9am); evening window covers Pacific sunset (5-10pm).
const SWITCH_HOURS = new Set([0, 1, 2, 3, 4, 5, 12, 13, 14, 15, 16]);

let sunCache = null;
let lastCron = null;
let lastRun = null;

async function fetchWithTimeout(url, ms = 15000, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function dateInTimeZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type) => parts.find((part) => part.type === type).value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

async function getSunTimes(now = new Date()) {
  const localDate = dateInTimeZone(now, TIME_ZONE);
  if (sunCache && sunCache.localDate === localDate) return sunCache;
  const params = new URLSearchParams({
    lat: String(LATITUDE),
    lng: String(LONGITUDE),
    date: localDate,
    tz: TIME_ZONE,
    time_format: "iso8601",
  });
  const r = await fetchWithTimeout(`${SUN_API_URL}?${params}`);
  if (!r.ok) throw new Error(`Sun API error: ${r.status}`);
  const data = await r.json();
  if (!data.sunrise || !data.sunset || data.date !== localDate || data.tzid !== TIME_ZONE) {
    throw new Error(`Unexpected sun API response: ${JSON.stringify(data).slice(0, 300)}`);
  }
  const sunrise = new Date(data.sunrise);
  const sunset = new Date(data.sunset);
  if (!isFinite(sunrise.getTime()) || !isFinite(sunset.getTime())) {
    throw new Error(`Could not parse sunrise/sunset: ${data.sunrise} / ${data.sunset}`);
  }
  sunCache = { localDate, sunrise, sunset };
  return sunCache;
}

async function setScreen(screenId) {
  const r = await fetchWithTimeout(`${DAKBOARD_API_BASE}/devices/${DEVICE_ID}?api_key=${DAKBOARD_API_KEY}`, 30000, {
    method: "PUT",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ screen_id: screenId }),
  });
  if (!r.ok) throw new Error(`DAKboard switch error: ${r.status}`);
  return await r.json();
}

function shouldSwitch(now = new Date()) {
  return SWITCH_HOURS.has(now.getUTCHours());
}

async function switchIfNeeded() {
  if (!DAKBOARD_API_KEY) {
    throw new Error("DAKBOARD_API_KEY not set");
  }

  const now = new Date();
  const { localDate, sunrise, sunset } = await getSunTimes(now);
  const isDay = now >= sunrise && now < sunset;
  const desired = isDay ? DAY_SCREEN_ID : NIGHT_SCREEN_ID;
  const label = isDay ? "DAY" : "NIGHT";

  console.log(`[${now.toISOString()}] Pacific date: ${localDate}, Sunrise: ${sunrise.toISOString()}, Sunset: ${sunset.toISOString()}, Desired: ${label}`);

  console.log(`Assigning ${desired} (${label})`);
  await setScreen(desired);
  console.log("Screen assignment complete.");

  return {
    success: true,
    pacificDate: localDate,
    sunrise: sunrise.toISOString(),
    sunset: sunset.toISOString(),
    now: now.toISOString(),
    desired,
  };
}

// Deno.cron runs on Deno Deploy's free tier.
// Fire every 15 minutes 24/7, but only act during the sunrise/sunset windows.
// This avoids relying on complex hour-range cron syntax that some parsers may mishandle.
Deno.cron("DAKboard Switcher", "*/15 * * * *", {
  backoffSchedule: [5000, 15000, 30000],
}, async () => {
  const now = new Date();
  try {
    if (!shouldSwitch(now)) {
      lastCron = { ok: true, skipped: true, at: now.toISOString() };
      return;
    }
    const result = await switchIfNeeded();
    lastRun = { ok: true, result, at: now.toISOString() };
    lastCron = { ok: true, skipped: false, at: now.toISOString() };
  } catch (e) {
    lastRun = { ok: false, error: e.message, at: now.toISOString() };
    lastCron = { ok: false, error: e.message, at: now.toISOString() };
    console.error("Switcher error:", e.message);
  }
});

// Also serve HTTP so the app stays alive and can be health-checked or manually triggered.
Deno.serve(async (req) => {
  const url = new URL(req.url);

  if (url.pathname === "/trigger") {
    try {
      const result = await switchIfNeeded();
      lastRun = { ok: true, result, at: new Date().toISOString() };
      return jsonResponse({ status: "ok", ...result }, 200);
    } catch (e) {
      lastRun = { ok: false, error: e.message, at: new Date().toISOString() };
      return jsonResponse({ status: "error", error: e.message }, 500);
    }
  }

  return jsonResponse({
    status: DAKBOARD_API_KEY ? "ok" : "misconfigured",
    service: "dakboard-switcher",
    apiKeyConfigured: Boolean(DAKBOARD_API_KEY),
    lastCron,
    lastRun,
  }, DAKBOARD_API_KEY ? 200 : 503);
});

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
