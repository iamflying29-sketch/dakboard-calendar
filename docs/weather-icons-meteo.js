// Professional Meteocons-based weather icons.
// Replaces the homemade 3D SVGs with high-quality, professionally-designed,
// animated-ready SVG icons from the open-source Meteocons library.
// Files are loaded as images so they render crisply at any size.

const METEO_PATH = './meteo_';

const KEY_TO_ICON = {
  'clear-day':          'clear-day',
  'clear-night':        'clear-night',
  'mostly-clear-day':   'partly-cloudy-day',
  'mostly-clear-night': 'partly-cloudy-night',
  'partly-cloudy-day':  'partly-cloudy-day',
  'partly-cloudy-night':'partly-cloudy-night',
  'overcast':           'overcast',
  'fog':                'fog',
  'drizzle':            'drizzle',
  'rain':               'rain',
  'rain-heavy':         'rain',
  'freezing-rain':      'sleet',
  'snow':               'snow',
  'snow-heavy':         'snow',
  'snow-grains':        'snowflake',
  'rain-showers':       'rain',
  'snow-showers':       'snow',
  'thunderstorm':       'thunderstorms',
  'thunderstorm-hail':  'hail',
};

// High-quality custom SVG icons for rare/extreme/geological scenarios.
// These are not in the Meteocons set, so we draw them inline.
function extremeSvg(content) {
  return `<svg class="weather-icon" viewBox="0 0 100 100" style="filter:drop-shadow(0 3px 4px rgba(0,0,0,0.12))">${content}</svg>`;
}

const EXTREME_ICONS = {
  'tornado': extremeSvg(`
    <defs><linearGradient id="tg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#64748b"/><stop offset="100%" stop-color="#334155"/></linearGradient></defs>
    <path d="M75 20c-20 8-50 10-62 6 18 5 42 4 60-2-15 10-35 18-55 18 25 0 48-8 65-20-8 15-22 30-40 38 22-8 38-22 48-38-2 18-10 36-22 48 16-12 26-30 28-48-8 12-18 22-30 28 14-8 24-20 30-32z" fill="url(#tg)"/>
  `),
  'hurricane': extremeSvg(`
    <defs><linearGradient id="hg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#475569"/><stop offset="100%" stop-color="#1e293b"/></linearGradient></defs>
    <path d="M50 10c22 0 40 18 40 40S72 90 50 90 10 72 10 50s18-40 40-40zm0 18c-12 0-22 10-22 22s10 22 22 22 22-10 22-22-10-22-22-22z" fill="url(#hg)"/>
    <path d="M50 28c16 0 30 10 30 22S66 72 50 72 20 62 20 50s14-22 30-22z" fill="none" stroke="#94a3b8" stroke-width="4"/>
  `),
  'tropical-storm': extremeSvg(`
    <path d="M28 55c-8 0-14-6-14-14s6-14 14-14c3 0 6 1 8 3 4-10 14-17 25-17 14 0 26 10 28 24 6-1 12 4 12 11 0 7-5 12-12 12H28z" fill="#94a3b8"/>
    <path d="M45 70h10l-5 20z" fill="#60a5fa"/>
  `),
  'derecho': extremeSvg(`
    <path d="M20 35h60c5 0 10 5 10 10s-5 10-10 10H20c-5 0-10-5-10-10s5-10 10-10z" fill="#475569"/>
    <path d="M55 40L42 70h12l-6 20 24-34H55z" fill="#facc15"/>
  `),
  'squall': extremeSvg(`
    <path d="M15 42h70c4 0 8 4 8 8s-4 8-8 8H15c-4 0-8-4-8-8s4-8 8-8z" fill="#64748b"/>
    <path d="M75 30c0 0-15 5-25 15" stroke="#60a5fa" stroke-width="4" fill="none"/>
  `),
  'waterspout': extremeSvg(`
    <path d="M70 15c-15 5-35 8-50 5 15 5 35 4 50-2-12 10-28 18-45 20 20 0 38-8 52-20-6 15-18 30-32 40 18-10 30-25 36-40z" fill="#64748b"/>
    <path d="M10 80 Q50 70 90 80" stroke="#3b82f6" stroke-width="5" fill="none"/>
  `),
  'blizzard': extremeSvg(`
    <path d="M25 55c-8 0-14-6-14-14s6-14 14-14c3 0 6 1 8 3 4-10 14-17 25-17 14 0 26 10 28 24 6-1 12 4 12 11 0 7-5 12-12 12H25z" fill="#e2e8f0"/>
    <g fill="#ffffff"><circle cx="30" cy="75" r="4"/><circle cx="50" cy="82" r="5"/><circle cx="70" cy="76" r="4"/><circle cx="40" cy="90" r="3"/></g>
  `),
  'ice-storm': extremeSvg(`
    <path d="M25 50c-8 0-14-6-14-14s6-14 14-14c3 0 6 1 8 3 4-10 14-17 25-17 14 0 26 10 28 24 6-1 12 4 12 11 0 7-5 12-12 12H25z" fill="#cbd5e1"/>
    <g stroke="#60a5fa" stroke-width="3" stroke-linecap="round"><line x1="35" y1="70" x2="32" y2="85"/><line x1="52" y1="70" x2="49" y2="88"/><line x1="70" y1="70" x2="67" y2="85"/></g>
  `),
  'sandstorm': extremeSvg(`
    <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d4b483" stop-opacity="0.3"/><stop offset="100%" stop-color="#a67c52" stop-opacity="0.7"/></linearGradient></defs>
    <rect width="100" height="100" fill="url(#sg)"/>
    <g fill="#c2a078" opacity="0.8"><circle cx="20" cy="40" r="3"/><circle cx="50" cy="55" r="4"/><circle cx="80" cy="35" r="3"/><circle cx="35" cy="70" r="3"/><circle cx="70" cy="75" r="4"/></g>
  `),
  'dust-storm': extremeSvg(`
    <defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a8a29e" stop-opacity="0.3"/><stop offset="100%" stop-color="#78716c" stop-opacity="0.6"/></linearGradient></defs>
    <rect width="100" height="100" fill="url(#dg)"/>
    <g fill="#a8a29e" opacity="0.8"><circle cx="25" cy="45" r="3"/><circle cx="55" cy="60" r="4"/><circle cx="85" cy="40" r="3"/><circle cx="40" cy="75" r="3"/><circle cx="75" cy="80" r="4"/></g>
  `),
  'volcanic-ash': extremeSvg(`
    <path d="M20 75 Q50 40 80 75" fill="#4a3b32"/>
    <g fill="#3f3f46" opacity="0.8"><circle cx="40" cy="30" r="3"/><circle cx="55" cy="25" r="4"/><circle cx="70" cy="32" r="3"/><circle cx="50" cy="40" r="3"/></g>
    <rect width="100" height="100" fill="#6b4c3a" opacity="0.15"/>
  `),
  'wildfire-smoke': extremeSvg(`
    <g fill="#9ca3af" opacity="0.6"><circle cx="30" cy="40" r="18"/><circle cx="55" cy="35" r="22"/><circle cx="75" cy="45" r="16"/></g>
    <g fill="#f59e0b" opacity="0.8"><circle cx="45" cy="70" r="5"/><circle cx="55" cy="78" r="6"/><circle cx="65" cy="72" r="5"/></g>
  `),
  'forest-fire': extremeSvg(`
    <g fill="#9ca3af" opacity="0.5"><circle cx="30" cy="38" r="16"/><circle cx="55" cy="33" r="20"/><circle cx="75" cy="42" r="14"/></g>
    <g fill="#ef4444" opacity="0.85"><circle cx="40" cy="72" r="6"/><circle cx="55" cy="80" r="7"/><circle cx="70" cy="74" r="6"/><circle cx="50" cy="68" r="5"/></g>
  `),
  'smoke': extremeSvg(`
    <g fill="#9ca3af" opacity="0.5"><circle cx="25" cy="45" r="18"/><circle cx="50" cy="40" r="22"/><circle cx="75" cy="50" r="18"/></g>
  `),
  'ash': extremeSvg(`
    <g fill="#52525b" opacity="0.7"><circle cx="30" cy="30" r="3"/><circle cx="55" cy="25" r="4"/><circle cx="70" cy="40" r="3"/><circle cx="40" cy="55" r="3"/><circle cx="65" cy="60" r="4"/><circle cx="50" cy="75" r="3"/></g>
  `),
  'haze': extremeSvg(`
    <g stroke="#94a3b8" stroke-width="6" stroke-linecap="round" opacity="0.6"><line x1="10" y1="40" x2="90" y2="40"/><line x1="15" y1="55" x2="85" y2="55"/><line x1="20" y1="70" x2="80" y2="70"/></g>
  `),
  'smog': extremeSvg(`
    <g fill="#78716c" opacity="0.4"><circle cx="20" cy="45" r="16"/><circle cx="50" cy="40" r="20"/><circle cx="80" cy="50" r="16"/></g>
    <g stroke="#78716c" stroke-width="5" stroke-linecap="round" opacity="0.5"><line x1="10" y1="75" x2="90" y2="75"/></g>
  `),
  'acid-rain': extremeSvg(`
    <path d="M25 50c-8 0-14-6-14-14s6-14 14-14c3 0 6 1 8 3 4-10 14-17 25-17 14 0 26 10 28 24 6-1 12 4 12 11 0 7-5 12-12 12H25z" fill="#e2e8f0"/>
    <g fill="#a3e635"><ellipse cx="35" cy="70" rx="3" ry="6"/><ellipse cx="52" cy="78" rx="3" ry="6"/><ellipse cx="70" cy="70" rx="3" ry="6"/></g>
  `),
  'aurora': extremeSvg(`
    <rect width="100" height="100" fill="#0f172a"/>
    <g opacity="0.8"><path d="M0 30 Q50 60 100 30" stroke="#4ade80" stroke-width="8" fill="none"/><path d="M0 45 Q50 75 100 45" stroke="#22d3ee" stroke-width="6" fill="none"/><path d="M0 60 Q50 85 100 60" stroke="#a78bfa" stroke-width="5" fill="none"/></g>
    <g fill="#ffffff" opacity="0.5"><circle cx="20" cy="15" r="1"/><circle cx="70" cy="10" r="1"/><circle cx="85" cy="20" r="1"/></g>
  `),
  'eclipse': extremeSvg(`
    <defs><radialGradient id="eg" cx="50%" cy="50%" r="50%"><stop offset="60%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/></radialGradient></defs>
    <circle cx="55" cy="45" r="28" fill="url(#eg)"/>
    <circle cx="62" cy="38" r="24" fill="#0f172a"/>
  `),
  'rainbow': extremeSvg(`
    <g fill="none" stroke-width="6"><path d="M10 90 A40 40 0 0 1 90 90" stroke="#ef4444"/><path d="M18 90 A32 32 0 0 1 82 90" stroke="#f97316"/><path d="M26 90 A24 24 0 0 1 74 90" stroke="#eab308"/><path d="M34 90 A16 16 0 0 1 66 90" stroke="#22c55e"/><path d="M42 90 A8 8 0 0 1 58 90" stroke="#3b82f6"/></g>
  `),
  'meteor-shower': extremeSvg(`
    <rect width="100" height="100" fill="#0f172a" opacity="0"/>
    <g stroke="#fef3c7" stroke-width="3" stroke-linecap="round"><line x1="30" y1="20" x2="15" y2="45"/><line x1="65" y1="15" x2="45" y2="50"/><line x1="85" y1="30" x2="60" y2="60"/></g>
  `),
  'meteor-impact': extremeSvg(`
    <defs><radialGradient id="mg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fef3c7" stop-opacity="0.9"/><stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/></radialGradient></defs>
    <circle cx="50" cy="50" r="35" fill="url(#mg)"/>
    <path d="M70 25 L60 45 L80 50 L60 55 L70 75 L50 60 L30 75 L40 55 L20 50 L40 45 L30 25 L50 40 Z" fill="#facc15"/>
  `),
  'asteroid-impact': extremeSvg(`
    <defs><radialGradient id="ag" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fca5a5" stop-opacity="0.9"/><stop offset="100%" stop-color="#7f1d1d" stop-opacity="0"/></radialGradient></defs>
    <circle cx="50" cy="50" r="40" fill="url(#ag)"/>
    <circle cx="50" cy="50" r="20" fill="#450a0a"/>
  `),
  'earthquake': extremeSvg(`
    <path d="M10 55 Q30 45 50 55 T90 55" stroke="#475569" stroke-width="5" fill="none"/>
    <path d="M15 70 Q35 60 55 70 T95 70" stroke="#64748b" stroke-width="4" fill="none"/>
    <g fill="#78716c"><rect x="40" y="40" width="5" height="12" rx="2"/><rect x="55" y="35" width="4" height="10" rx="2"/></g>
  `),
  'tsunami': extremeSvg(`
    <path d="M5 60 Q25 45 45 60 T85 60 T100 55" stroke="#3b82f6" stroke-width="6" fill="none"/>
    <path d="M5 80 Q25 65 45 80 T85 80 T100 75" stroke="#1d4ed8" stroke-width="6" fill="none"/>
  `),
  'volcanic-eruption': extremeSvg(`
    <path d="M25 75 L40 35 L60 35 L75 75 Z" fill="#4a3b32"/>
    <g fill="#ef4444"><circle cx="50" cy="25" r="5"/><circle cx="42" cy="18" r="4"/><circle cx="58" cy="20" r="4"/></g>
    <g fill="#3f3f46" opacity="0.7"><circle cx="35" cy="15" r="2"/><circle cx="55" cy="10" r="3"/><circle cx="65" cy="16" r="2"/></g>
  `),
  'landslide': extremeSvg(`
    <path d="M10 30 L30 30 L90 80 L10 80 Z" fill="#8b6f47"/>
    <g fill="#a89078"><circle cx="40" cy="50" r="6"/><circle cx="60" cy="60" r="5"/><circle cx="30" cy="65" r="4"/></g>
  `),
  'mudslide': extremeSvg(`
    <path d="M10 35 L35 35 L90 80 L10 80 Z" fill="#6b5637"/>
    <g fill="#5c4a2e"><circle cx="45" cy="55" r="6"/><circle cx="65" cy="65" r="5"/><circle cx="35" cy="70" r="4"/></g>
  `),
  'avalanche': extremeSvg(`
    <path d="M10 25 L40 25 L90 75 L10 75 Z" fill="#f1f5f9"/>
    <g fill="#e2e8f0"><circle cx="45" cy="45" r="6"/><circle cx="65" cy="55" r="5"/><circle cx="35" cy="60" r="4"/></g>
  `),
  'rockfall': extremeSvg(`
    <g fill="#78716c"><circle cx="30" cy="30" r="6"/><circle cx="55" cy="25" r="7"/><circle cx="75" cy="35" r="5"/><circle cx="40" cy="50" r="5"/><circle cx="60" cy="55" r="6"/></g>
  `),
  'geological-event': extremeSvg(`
    <path d="M10 55 Q30 45 50 55 T90 55" stroke="#475569" stroke-width="5" fill="none"/>
    <path d="M15 70 Q35 60 55 70 T95 70" stroke="#64748b" stroke-width="4" fill="none"/>
  `),
  'apocalypse': extremeSvg(`
    <defs><radialGradient id="apg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ef4444"/><stop offset="100%" stop-color="#450a0a"/></radialGradient></defs>
    <circle cx="50" cy="50" r="38" fill="url(#apg)"/>
    <path d="M35 35 L45 50 L35 65 L55 55 L65 65 L55 50 L65 35 L55 45 Z" fill="#facc15"/>
  `),
};

function meteoIcon(name) {
  return `<img src="${METEO_PATH}${name}.svg" class="weather-icon" alt="${name}">`;
}

const WI = {
  sun(color) { return meteoIcon('clear-day'); },
  moon(color) { return meteoIcon('clear-night'); },
  cloud(c1, c2) { return meteoIcon('cloudy'); },
  cloudSun(sunColor, cloudColor) { return meteoIcon('partly-cloudy-day'); },
  cloudMoon(moonColor, cloudColor) { return meteoIcon('partly-cloudy-night'); },
  rain(cloudColor, dropColor) { return meteoIcon('rain'); },
  snowIcon(cloudColor, flakeColor) { return meteoIcon('snow'); },
  fog(color) { return meteoIcon('fog'); },
  bolt(cloudColor, boltColor) { return meteoIcon('thunderstorms'); },
  drop(color) { return meteoIcon('rain'); },
  wind(color) { return meteoIcon('wind'); },
  sunrise(color) { return meteoIcon('clear-day'); },
  sunset(color) { return meteoIcon('clear-night'); },
  uv(color) { return meteoIcon('clear-day'); },
  eye(color) { return meteoIcon('mist'); },
  aqi(color) { return meteoIcon('wind'); },
  thermo(color) { return meteoIcon('clear-day'); },
};

function wmoInfo(code, isDay) {
  const day = !!isDay;
  const table = {
    0:  { key: day ? "clear-day" : "clear-night", label: "Clear" },
    1:  { key: day ? "mostly-clear-day" : "mostly-clear-night", label: "Mostly Clear" },
    2:  { key: day ? "partly-cloudy-day" : "partly-cloudy-night", label: "Partly Cloudy" },
    3:  { key: "overcast", label: "Overcast" },
    45: { key: "fog", label: "Fog" },
    48: { key: "fog", label: "Freezing Fog" },
    51: { key: "drizzle", label: "Light Drizzle" },
    53: { key: "drizzle", label: "Drizzle" },
    55: { key: "drizzle", label: "Heavy Drizzle" },
    56: { key: "freezing-rain", label: "Freezing Drizzle" },
    57: { key: "freezing-rain", label: "Freezing Drizzle" },
    61: { key: "rain", label: "Light Rain" },
    63: { key: "rain", label: "Rain" },
    65: { key: "rain-heavy", label: "Heavy Rain" },
    66: { key: "freezing-rain", label: "Freezing Rain" },
    67: { key: "freezing-rain", label: "Freezing Rain" },
    71: { key: "snow", label: "Light Snow" },
    73: { key: "snow", label: "Snow" },
    75: { key: "snow-heavy", label: "Heavy Snow" },
    77: { key: "snow-grains", label: "Snow Grains" },
    80: { key: "rain-showers", label: "Rain Showers" },
    81: { key: "rain-showers", label: "Rain Showers" },
    82: { key: "rain-showers", label: "Violent Showers" },
    85: { key: "snow-showers", label: "Snow Showers" },
    86: { key: "snow-showers", label: "Snow Showers" },
    95: { key: "thunderstorm", label: "Thunderstorm" },
    96: { key: "thunderstorm-hail", label: "Thunderstorm w/ Hail" },
    99: { key: "thunderstorm-hail", label: "Severe Thunderstorm" },
  };
  return table[code] || { key: day ? "partly-cloudy-day" : "partly-cloudy-night", label: "Unknown" };
}

function iconSvgFor(key, vars) {
  if (EXTREME_ICONS[key]) return EXTREME_ICONS[key];
  const name = KEY_TO_ICON[key] || 'cloudy';
  return meteoIcon(name);
}

window.WI = WI;
window.wmoInfo = wmoInfo;
window.iconSvgFor = iconSvgFor;
