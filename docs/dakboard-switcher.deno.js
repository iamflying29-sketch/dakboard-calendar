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

async function getSunTimes() {
  const now = new Date();
  const today = now.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
  const params = new URLSearchParams({
    lat: String(LATITUDE),
    lng: String(LONGITUDE),
    date: today,
    tz: "America/Los_Angeles",
    time_format: "iso8601",
  });
  const r = await fetch(`${SUN_API_URL}?${params}`);
  if (!r.ok) throw new Error(`Sun API error: ${r.status}`);
  const data = await r.json();
  const sunrise = new Date(data.sunrise);
  const sunset = new Date(data.sunset);
  return { sunrise, sunset };
}

async function getCurrentScreen() {
  const r = await fetch(`${DAKBOARD_API_BASE}/devices/${DEVICE_ID}?api_key=${DAKBOARD_API_KEY}`);
  if (!r.ok) throw new Error(`DAKboard device error: ${r.status}`);
  const data = await r.json();
  return data.screen_id;
}

async function setScreen(screenId) {
  const r = await fetch(`${DAKBOARD_API_BASE}/devices/${DEVICE_ID}?api_key=${DAKBOARD_API_KEY}`, {
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

  const { sunrise, sunset } = await getSunTimes();
  const now = new Date();
  const isDay = now >= sunrise && now < sunset;
  const desired = isDay ? DAY_SCREEN_ID : NIGHT_SCREEN_ID;
  const label = isDay ? "DAY" : "NIGHT";

  console.log(`[${now.toISOString()}] Sunrise: ${sunrise.toISOString()}, Sunset: ${sunset.toISOString()}, Desired: ${label}`);

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
Deno.serve((req) => {
  return new Response(JSON.stringify({ status: "ok", service: "dakboard-switcher" }), {
    headers: { "Content-Type": "application/json" },
  });
});
