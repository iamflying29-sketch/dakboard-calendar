/**
 * DAKboard Sunrise/Sunset Screen Switcher — Deno Deploy Cron
 *
 * Runs every minute on Deno Deploy's free tier. Checks if the current time
 * is between sunrise and sunset for Tiburon, CA, and switches the DAKboard
 * device between Day and Night screens accordingly.
 *
 * Deployment:
 *   1. Create a new Deno Deploy app named "dakboard-switcher".
 *   2. Deploy this file as the entrypoint.
 *   3. The cron runs automatically — no external trigger needed.
 *
 * Environment variables (set in Deno Deploy dashboard):
 *   DAKBOARD_API_KEY - Your DAKboard API key
 */

const DAKBOARD_API_KEY = Deno.env.get("DAKBOARD_API_KEY");
const DEVICE_ID = "dev_24e4f53b1b81";
const DAY_SCREEN_ID = "scr_8ef733798d74";
const NIGHT_SCREEN_ID = "scr_f7c6eb565c43";
const LATITUDE = 37.8991768;
const LONGITUDE = -122.4949685;
const SUN_API_URL = "https://api.sunrise-sunset.org/v2";
const DAKBOARD_API_BASE = "https://dakboard.com/api/2";
const TIME_ZONE = "America/Los_Angeles";

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
  return { localDate, sunrise, sunset };
}

async function getCurrentScreen() {
  const r = await fetchWithTimeout(`${DAKBOARD_API_BASE}/devices/${DEVICE_ID}?api_key=${DAKBOARD_API_KEY}`);
  if (!r.ok) throw new Error(`DAKboard device error: ${r.status}`);
  const data = await r.json();
  return data.screen_id;
}

async function setScreen(screenId) {
  const r = await fetchWithTimeout(`${DAKBOARD_API_BASE}/devices/${DEVICE_ID}?api_key=${DAKBOARD_API_KEY}`, {
    method: "PUT",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `screen_id=${screenId}`,
  });
  if (!r.ok) throw new Error(`DAKboard switch error: ${r.status}`);
  return await r.json();
}

async function switchIfNeeded() {
  if (!DAKBOARD_API_KEY) {
    console.error("DAKBOARD_API_KEY not set!");
    return;
  }

  let now = new Date();
  const { localDate, sunrise, sunset } = await getSunTimes(now);
  const nextBoundary = now < sunrise ? sunrise : now < sunset ? sunset : null;
  const delayMs = nextBoundary ? nextBoundary.getTime() - now.getTime() : 0;
  if (delayMs > 0 && delayMs <= 60000) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    now = new Date();
  }
  const isDay = now >= sunrise && now < sunset;
  const desired = isDay ? DAY_SCREEN_ID : NIGHT_SCREEN_ID;
  const label = isDay ? "DAY" : "NIGHT";

  console.log(`[${now.toISOString()}] Pacific date: ${localDate}, Sunrise: ${sunrise.toISOString()}, Sunset: ${sunset.toISOString()}, Desired: ${label}`);

  const current = await getCurrentScreen();
  if (current !== desired) {
    console.log(`Switching from ${current} to ${desired} (${label})`);
    await setScreen(desired);
    console.log("Switch complete.");
  } else {
    console.log(`Already on correct screen (${label}). No switch needed.`);
  }
}

// Deno.cron runs on Deno Deploy's free tier (included in free plan).
// Check every minute for precise sunrise/sunset switching.
Deno.cron("DAKboard Switcher", "* * * * *", async () => {
  try {
    await switchIfNeeded();
  } catch (e) {
    console.error("Switcher error:", e.message);
  }
});

// Also serve HTTP so the app stays alive and can be health-checked.
Deno.serve(() => {
  return new Response(JSON.stringify({
    status: DAKBOARD_API_KEY ? "ok" : "misconfigured",
    service: "dakboard-switcher",
    apiKeyConfigured: Boolean(DAKBOARD_API_KEY),
  }), {
    status: DAKBOARD_API_KEY ? 200 : 503,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
});
