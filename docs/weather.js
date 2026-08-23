// DAKboard Guest Bathroom - Custom Weather Widget
// 100% client-side: fetches Open-Meteo directly from the browser (no key,
// CORS-enabled), so this page can sit as pure static hosting on GitHub
// Pages with no build/cron step. Auto-refreshes itself on an interval.

import { WeatherAtmosphere } from './weather-atmosphere.js';

const LAT = 37.8991768;
const LON = -122.4949685;
const TZ = "America/Los_Angeles";
// Poll every 60 seconds for the latest Open-Meteo 15-minute current conditions.
// Open-Meteo is the free, no-account provider that TRMNL also uses; the data
// itself updates roughly every 15 minutes, so the display always shows the
// freshest available value without needing an API key.
const REFRESH_MS = 60 * 1000; // 15 minutes
const LOCATION_LABEL = "Tiburon, CA";

const THEME = document.documentElement.getAttribute('data-theme') || 'day';
const FORCED_SCENE = new URLSearchParams(location.search).get('scene');

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
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

function applySkyForNow(daily) {
  const now = new Date();
  const todaySunrise = new Date(daily.sunrise[TODAY_IDX]);
  const todaySunset = new Date(daily.sunset[TODAY_IDX]);

  let state;
  if (now >= todaySunrise && now <= todaySunset) {
    const frac = (now - todaySunrise) / (todaySunset - todaySunrise);
    state = { frac, elevation: Math.sin(Math.PI * frac) };
  } else if (now < todaySunrise) {
    // Pre-dawn: still in the night that started at YESTERDAY's sunset.
    const yesterdaySunset = new Date(daily.sunset[TODAY_IDX - 1]);
    const frac = Math.max(0, Math.min(1, (now - yesterdaySunset) / (todaySunrise - yesterdaySunset)));
    state = { frac, elevation: -Math.sin(Math.PI * frac) };
  } else {
    // Post-dusk: night runs until TOMORROW's sunrise.
    const tomorrowSunrise = daily.sunrise[TODAY_IDX + 1] ? new Date(daily.sunrise[TODAY_IDX + 1])
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

// Open-Meteo's default "best_match" model (GFS/HRRR-based for CONUS) has been
// observed forecasting a flat 100% cloud_cover / "Overcast" for every single
// hour of the day for this exact coastal Tiburon point, even overriding real
// ground-truth clear skies (see METAR check above). That systematic bias
// makes the hourly/daily CONDITION (icon + label) wrong far more often than
// it should be. NOAA's National Blend of Models (NBM) is the official,
// bias-corrected, observation-calibrated consensus forecast for the US and
// does not show this flat-100% artifact for this location.
//
// IMPORTANT: we only use NBM for the weather_code / cloud_cover (i.e. the
// CONDITION), never for temperature/humidity/wind/UV -- those already track
// the specific microclimate well and must not change.
const CONDITION_MODEL = 'ncep_nbm_conus';

async function fetchWeather() {
  // cell_selection=land prefers the nearest land model cell for coastal places
  // like Tiburon, avoiding spurious over-water forecast values.
  const baseParams = `latitude=${LAT}&longitude=${LON}&cell_selection=land&elevation=4`;
  const wUrl = `https://api.open-meteo.com/v1/forecast?${baseParams}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m` +
    `&minutely_15=temperature_2m,weather_code,precipitation_probability,is_day,cloud_cover` +
    `&hourly=temperature_2m,weather_code,precipitation_probability,visibility,is_day,cloud_cover` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max` +
    `&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch` +
    `&timezone=${encodeURIComponent(TZ)}&forecast_days=7&past_days=1`;
  const condUrl = `https://api.open-meteo.com/v1/forecast?${baseParams}` +
    `&models=${CONDITION_MODEL}` +
    `&hourly=weather_code,cloud_cover` +
    `&daily=weather_code` +
    `&timezone=${encodeURIComponent(TZ)}&forecast_days=7&past_days=1`;
  const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LON}` +
    `&current=us_aqi&timezone=${encodeURIComponent(TZ)}`;

  const [wRes, aqRes, condRes] = await Promise.all([
    fetch(wUrl).then(r => r.json()),
    fetch(aqUrl).then(r => r.json()).catch(() => null),
    fetch(condUrl).then(r => r.json()).catch(() => null),
  ]);
  return { weather: wRes, aq: aqRes, cond: condRes };
}

// Build a lookup from ISO timestamp -> { weather_code, cloud_cover } for the
// condition-only model response, so hourly/daily rendering can look up the
// more reliable condition for a given time without needing matching array
// indices (NBM occasionally has minor gaps vs. the main model's timeline).
function buildConditionLookup(cond) {
  const hourly = new Map();
  const daily = new Map();
  if (cond && cond.hourly && cond.hourly.time) {
    for (let i = 0; i < cond.hourly.time.length; i++) {
      hourly.set(cond.hourly.time[i], {
        weather_code: cond.hourly.weather_code[i],
        cloud_cover: cond.hourly.cloud_cover[i],
      });
    }
  }
  if (cond && cond.daily && cond.daily.time) {
    for (let i = 0; i < cond.daily.time.length; i++) {
      daily.set(cond.daily.time[i], cond.daily.weather_code[i]);
    }
  }
  return { hourly, daily };
}

// Look up the more reliable condition-model (NBM) weather_code/cloud_cover
// for a given hourly/15-min timestamp, floored to the hour (NBM is
// hourly-resolution only). Falls back to the main model's own values if NBM
// has no data for that hour.
function conditionForHour(condLookup, timeStr, fallbackCode, fallbackCC) {
  const hourKey = timeStr.slice(0, 13) + ':00';
  const c = condLookup.hourly.get(hourKey);
  if (c) return { code: c.weather_code, cc: c.cloud_cover };
  return { code: fallbackCode, cc: fallbackCC };
}

let lastDaily = null;

// Free alert / observation feeds for rare/extreme events that Open-Meteo's
// standard WMO weather codes do not cover (tornado, tsunami, wildfire, etc.).
const NWS_ALERTS_URL = `https://api.weather.gov/alerts/active?status=actual&point=${LAT},${LON}`;
const USGS_QUAKE_URL = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${LAT}&longitude=${LON}&maxradiuskm=200&minmagnitude=4.0&starttime=`;
const NOAA_STORMS_URL = 'https://noaa-storm-proxy.iamflying29-sketch.deno.net';

// Open-Meteo's "current" weather_code/cloud_cover come from a model
// nowcast, which can lag or disagree with what the sky is actually doing
// right now (e.g. reporting 100% overcast on a clear night). Real METAR
// station observations are ground-truth for "is it clear or cloudy right
// now", so we prefer them for the CURRENT condition only, in this priority
// order of nearby full-METAR-reporting stations. Forecasts (hourly/daily)
// still use Open-Meteo's model data as before -- there's no equivalent
// "real observation" for the future.
const METAR_STATIONS = ['KSFO', 'KOAK', 'KHWD'];
const METAR_MAX_AGE_MS = 90 * 60 * 1000; // ignore stale observations (>90 min old)
// NWS METAR cloud amount codes -> approximate cloud-cover percentage.
const METAR_CLOUD_PCT = { SKC: 0, CLR: 0, NSC: 0, NCD: 0, FEW: 15, SCT: 40, BKN: 75, OVC: 100, VV: 100 };

async function fetchMetarCloudCover() {
  for (const station of METAR_STATIONS) {
    try {
      const r = await fetch(`https://api.weather.gov/stations/${station}/observations/latest`);
      if (!r.ok) continue;
      const data = await r.json();
      const props = data.properties;
      if (!props || !props.timestamp) continue;
      const age = Date.now() - new Date(props.timestamp).getTime();
      if (age > METAR_MAX_AGE_MS) continue;
      const layers = Array.isArray(props.cloudLayers) ? props.cloudLayers : [];
      let pct = 0;
      for (const layer of layers) {
        const amt = METAR_CLOUD_PCT[layer.amount];
        if (amt != null && amt > pct) pct = amt;
      }
      return { cloudCoverPct: pct, station, textDescription: props.textDescription || '' };
    } catch (e) {
      console.warn(`METAR fetch failed for ${station}`, e);
    }
  }
  return null;
}

const NWS_EVENT_MAP = [
  { re: /tornado/i, key: 'tornado', label: 'Tornado Warning', severity: 5 },
  { re: /tsunami/i, key: 'tsunami', label: 'Tsunami Warning', severity: 5 },
  { re: /hurricane/i, key: 'hurricane', label: 'Hurricane Warning', severity: 4 },
  { re: /tropical storm/i, key: 'tropical-storm', label: 'Tropical Storm Warning', severity: 4 },
  { re: /flash flood/i, key: 'flash-flood', label: 'Flash Flood Warning', severity: 4 },
  { re: /severe thunderstorm/i, key: 'thunderstorm-hail', label: 'Severe Thunderstorm Warning', severity: 3 },
  { re: /tornado watch|severe thunderstorm watch/i, key: 'thunderstorm', label: 'Severe Weather Watch', severity: 2 },
  { re: /fire weather|red flag/i, key: 'wildfire-smoke', label: 'Fire Weather Warning', severity: 3 },
  { re: /dust storm/i, key: 'dust-storm', label: 'Dust Storm Warning', severity: 3 },
  { re: /blizzard|winter storm/i, key: 'blizzard', label: 'Winter Storm Warning', severity: 3 },
  { re: /ice storm/i, key: 'ice-storm', label: 'Ice Storm Warning', severity: 3 },
  { re: /volcanic/i, key: 'volcanic-eruption', label: 'Volcanic Warning', severity: 4 },
];

function nwsSeverityValue(sev) {
  const map = { Extreme: 4, Severe: 3, Moderate: 2, Minor: 1, Unknown: 0 };
  return map[sev] || 0;
}

async function fetchNwsAlerts() {
  try {
    const r = await fetch(NWS_ALERTS_URL);
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
    const r = await fetch(USGS_QUAKE_URL + encodeURIComponent(yesterday));
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
    const r = await fetch(`${NOAA_STORMS_URL}?v=1`);
    if (!r.ok) return null;
    return await r.json();
  } catch (e) {
    console.warn('NOAA/NHC storm fetch failed', e);
    return null;
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

function render(data, fx) {
  const { weather, aq, alerts, quake, noaaStorms, metar, cond } = data;
  const cur = weather.current;
  const hourly = weather.hourly;
  const minutely15 = weather.minutely_15;
  const daily = weather.daily;
  lastDaily = daily;
  const condLookup = buildConditionLookup(cond);

  const sunState = applySkyForNow(daily);
  if (fx) fx.setSunState(sunState.frac, sunState.elevation);

  const isDay = !!cur.is_day;
  // Prefer a real, ground-truth METAR station observation over Open-Meteo's
  // model-nowcast cloud_cover for the CURRENT condition -- the model can lag
  // or simply disagree with what the sky is actually doing right now (e.g.
  // reporting 100% overcast on an actually-clear night). wmoInfo() only uses
  // this value for clear/cloud WMO codes (0-3), so it has no effect when
  // Open-Meteo itself is already reporting active precipitation.
  const liveCloudCover = metar ? metar.cloudCoverPct : cur.cloud_cover;
  let info = wmoInfo(cur.weather_code, isDay, liveCloudCover);
  let displayKey = FORCED_SCENE || info.key;

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

  if (fx) fx.setCondition(displayKey);
  // Drive the atmospheric cloud density from the measured cloud-cover percent
  // so the CGI matches the actual live condition, not just the WMO category.
  if (fx && liveCloudCover != null) {
    fx.setWeatherData({ cloudCover: liveCloudCover / 100 });
  }

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
    const hIsDay = stripData.is_day ? !!stripData.is_day[idx] : true;
    const hCC = stripData.cloud_cover ? stripData.cloud_cover[idx] : null;
    // Use the NBM condition model (bias-corrected against real observations)
    // for the displayed icon/label instead of the main model's weather_code,
    // which has been observed forecasting a flat 100% overcast for this
    // location regardless of actual conditions.
    const hCond = conditionForHour(condLookup, stripData.time[idx], stripData.weather_code[idx], hCC);
    const hi = wmoInfo(hCond.code, hIsDay, hCond.cc);
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
    // Same reasoning as the hourly strip: prefer the NBM condition model's
    // daily weather_code over the main model's, which tends to report a
    // worst-case/overcast aggregate for days that are actually
    // clear-to-partly-cloudy for most of the daylight hours.
    const nbmDailyCode = condLookup.daily.get(daily.time[idx]);
    const di = wmoInfo(nbmDailyCode != null ? nbmDailyCode : daily.weather_code[idx], true);
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
  const aqiVal = aq && aq.current ? aq.current.us_aqi : null;
  const aqiCat = aqiCategory(aqiVal);
  document.getElementById('aqiVal').textContent = aqiVal != null ? Math.round(aqiVal) : '—';
  document.getElementById('aqiVal').style.color = aqiCat.color;
  document.getElementById('aqiCat').textContent = aqiCat.label;
  document.getElementById('aqiDesc').textContent = aqiCat.desc;
  const aqiPct = aqiVal != null ? Math.min(100, (aqiVal / 300) * 100) : 0;
  document.getElementById('aqiMarker').style.left = `${aqiPct}%`;

  // Detail grid (UV, Sunrise/Sunset, Wind compass, Humidity, Visibility)
  const sunrise = new Date(daily.sunrise[TODAY_IDX]);
  const sunset = new Date(daily.sunset[TODAY_IDX]);
  const fmtT = d => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const visMiles = hourly.visibility && hourly.visibility[startIdx] != null
    ? (hourly.visibility[startIdx] / 1609.34).toFixed(1) : '—';
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
    const [weatherData, alerts, quake, noaaStorms, metar] = await Promise.all([
      fetchWeather(),
      fetchNwsAlerts(),
      fetchEarthquake(),
      fetchNoaaStorms(),
      fetchMetarCloudCover(),
    ]);
    render({ ...weatherData, alerts, quake, noaaStorms, metar }, fxEngine);
  } catch (e) {
    console.error('Weather fetch failed', e);
  }
}

function boot() {
  const canvas = document.getElementById('fx');
  fxEngine = new WeatherAtmosphere(canvas, {
    sunCore: cssVar('--sun-core'), sunGlow: cssVar('--sun-glow'),
    moonCore: cssVar('--moon-core'), moonGlow: cssVar('--moon-glow'),
    cloud: cssVar('--cloud'), cloud2: cssVar('--cloud2'),
    rain: cssVar('--rain'), snow: cssVar('--snow'), fog: cssVar('--fog'),
    bolt: cssVar('--bolt'),
  }, {
    forceDay: THEME === 'day',
    forceNight: THEME === 'night',
  });
  window.fxEngine = fxEngine;
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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
