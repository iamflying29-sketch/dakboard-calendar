// Minimal flat SVG icon set for weather conditions (Apple-Weather-inspired silhouettes).
// Each function returns an <svg> string sized via viewBox 0 0 100 100.

const WI = {
  sun(color) {
    return `<svg viewBox="0 0 100 100"><g fill="${color}">
      <circle cx="50" cy="50" r="24"/>
      <g stroke="${color}" stroke-width="6" stroke-linecap="round">
        <line x1="50" y1="4" x2="50" y2="16"/>
        <line x1="50" y1="84" x2="50" y2="96"/>
        <line x1="4" y1="50" x2="16" y2="50"/>
        <line x1="84" y1="50" x2="96" y2="50"/>
        <line x1="17" y1="17" x2="26" y2="26"/>
        <line x1="74" y1="74" x2="83" y2="83"/>
        <line x1="17" y1="83" x2="26" y2="74"/>
        <line x1="74" y1="26" x2="83" y2="17"/>
      </g></g></svg>`;
  },
  moon(color) {
    return `<svg viewBox="0 0 100 100"><path fill="${color}" d="M63 10a40 40 0 1 0 27 66 34 34 0 0 1-27-66z"/></svg>`;
  },
  cloud(c1, c2) {
    return `<svg viewBox="0 0 100 100">
      <path fill="${c2||c1}" d="M30 72a20 20 0 0 1-4-39.6A24 24 0 0 1 72 26a18 18 0 0 1 6 35H30z" opacity="0.6"/>
      <path fill="${c1}" d="M24 78a18 18 0 0 1-3-35.7A21.5 21.5 0 0 1 63 34a16 16 0 0 1 5 31.4H24z"/>
    </svg>`;
  },
  cloudSun(sunColor, cloudColor) {
    return `<svg viewBox="0 0 100 100">
      <g fill="${sunColor}">
        <circle cx="34" cy="34" r="16"/>
        <g stroke="${sunColor}" stroke-width="5" stroke-linecap="round">
          <line x1="34" y1="6" x2="34" y2="14"/>
          <line x1="10" y1="34" x2="18" y2="34"/>
          <line x1="13" y1="13" x2="19" y2="19"/>
          <line x1="55" y1="13" x2="49" y2="19"/>
        </g>
      </g>
      <path fill="${cloudColor}" d="M28 82a18 18 0 0 1-3-35.6A21.5 21.5 0 0 1 67 38a16 16 0 0 1 5 31H28z"/>
    </svg>`;
  },
  cloudMoon(moonColor, cloudColor) {
    return `<svg viewBox="0 0 100 100">
      <path fill="${moonColor}" d="M52 12a26 26 0 1 0 17 43 22 22 0 0 1-17-43z"/>
      <path fill="${cloudColor}" d="M28 82a18 18 0 0 1-3-35.6A21.5 21.5 0 0 1 67 38a16 16 0 0 1 5 31H28z"/>
    </svg>`;
  },
  rain(cloudColor, dropColor) {
    return `<svg viewBox="0 0 100 100">
      <path fill="${cloudColor}" d="M26 62a18 18 0 0 1-3-35.6A21.5 21.5 0 0 1 65 18a16 16 0 0 1 5 31H26z"/>
      <g stroke="${dropColor}" stroke-width="6" stroke-linecap="round">
        <line x1="34" y1="72" x2="30" y2="88"/>
        <line x1="52" y1="72" x2="48" y2="88"/>
        <line x1="70" y1="72" x2="66" y2="88"/>
      </g>
    </svg>`;
  },
  snowIcon(cloudColor, flakeColor) {
    return `<svg viewBox="0 0 100 100">
      <path fill="${cloudColor}" d="M26 60a18 18 0 0 1-3-35.6A21.5 21.5 0 0 1 65 16a16 16 0 0 1 5 31H26z"/>
      <g fill="${flakeColor}">
        <circle cx="32" cy="80" r="4"/>
        <circle cx="50" cy="88" r="4"/>
        <circle cx="68" cy="80" r="4"/>
      </g>
    </svg>`;
  },
  fog(color) {
    return `<svg viewBox="0 0 100 100"><g stroke="${color}" stroke-width="7" stroke-linecap="round">
      <line x1="14" y1="38" x2="86" y2="38"/>
      <line x1="8" y1="54" x2="92" y2="54"/>
      <line x1="20" y1="70" x2="80" y2="70"/>
    </g></svg>`;
  },
  bolt(cloudColor, boltColor) {
    return `<svg viewBox="0 0 100 100">
      <path fill="${cloudColor}" d="M26 56a18 18 0 0 1-3-35.6A21.5 21.5 0 0 1 65 12a16 16 0 0 1 5 31H26z"/>
      <path fill="${boltColor}" d="M56 58 40 82h12l-6 18 24-30H58z"/>
    </svg>`;
  },
  drop(color) { // for humidity / precip cards
    return `<svg viewBox="0 0 100 100"><path fill="${color}" d="M50 8c16 24 28 40 28 56a28 28 0 0 1-56 0c0-16 12-32 28-56z"/></svg>`;
  },
  wind(color) {
    return `<svg viewBox="0 0 100 100"><g stroke="${color}" stroke-width="7" stroke-linecap="round" fill="none">
      <path d="M10 35h55a12 12 0 1 0-10-19"/>
      <path d="M10 55h70a12 12 0 1 1-10 19"/>
      <path d="M10 75h45a10 10 0 1 0-8-15"/>
    </g></svg>`;
  },
  sunrise(color) {
    return `<svg viewBox="0 0 100 100"><g stroke="${color}" stroke-width="6" stroke-linecap="round" fill="none">
      <path d="M20 70a30 30 0 0 1 60 0" fill="none"/>
      <line x1="10" y1="70" x2="90" y2="70"/>
      <line x1="50" y1="10" x2="50" y2="22"/>
      <line x1="20" y1="30" x2="28" y2="38"/>
      <line x1="80" y1="30" x2="72" y2="38"/>
    </g></svg>`;
  },
  sunset(color) {
    return `<svg viewBox="0 0 100 100"><g stroke="${color}" stroke-width="6" stroke-linecap="round" fill="none">
      <path d="M20 70a30 30 0 0 1 60 0" fill="none"/>
      <line x1="10" y1="70" x2="90" y2="70"/>
      <line x1="50" y1="18" x2="50" y2="30"/>
      <line x1="20" y1="38" x2="28" y2="46"/>
      <line x1="80" y1="38" x2="72" y2="46"/>
    </g></svg>`;
  },
  uv(color) {
    return `<svg viewBox="0 0 100 100"><g fill="${color}"><circle cx="50" cy="50" r="20"/>
      <g stroke="${color}" stroke-width="6" stroke-linecap="round">
        <line x1="50" y1="6" x2="50" y2="16"/><line x1="50" y1="84" x2="50" y2="94"/>
        <line x1="6" y1="50" x2="16" y2="50"/><line x1="84" y1="50" x2="94" y2="50"/>
        <line x1="18" y1="18" x2="25" y2="25"/><line x1="75" y1="75" x2="82" y2="82"/>
        <line x1="18" y1="82" x2="25" y2="75"/><line x1="75" y1="25" x2="82" y2="18"/>
      </g></g></svg>`;
  },
  eye(color) {
    return `<svg viewBox="0 0 100 100"><g fill="none" stroke="${color}" stroke-width="6">
      <path d="M6 50c10-20 30-30 44-30s34 10 44 30c-10 20-30 30-44 30S16 70 6 50z"/>
      <circle cx="50" cy="50" r="14" fill="${color}" stroke="none"/>
    </g></svg>`;
  },
  aqi(color) {
    return `<svg viewBox="0 0 100 100"><g fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round">
      <path d="M14 60c0-20 16-36 36-36s36 16 36 36"/>
      <line x1="50" y1="60" x2="66" y2="42"/>
      <circle cx="50" cy="60" r="6" fill="${color}" stroke="none"/>
    </g></svg>`;
  },
  thermo(color) {
    return `<svg viewBox="0 0 100 100"><g fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round">
      <line x1="50" y1="14" x2="50" y2="62"/>
      <circle cx="50" cy="74" r="14" fill="${color}" stroke="none"/>
    </g></svg>`;
  }
};

// WMO weather code -> { key, label }
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
  const sun = vars['--sun-core'], moon = vars['--moon-core'];
  const cloud = vars['--cloud'], cloud2 = vars['--cloud2'];
  const rainC = vars['--rain'], snowC = vars['--snow'], fogC = vars['--fog'];
  const boltC = vars['--bolt'], fg = vars['--fg'];
  switch (key) {
    case 'clear-day': return WI.sun(sun);
    case 'clear-night': return WI.moon(moon);
    case 'mostly-clear-day': return WI.cloudSun(sun, cloud);
    case 'mostly-clear-night': return WI.cloudMoon(moon, cloud);
    case 'partly-cloudy-day': return WI.cloudSun(sun, cloud);
    case 'partly-cloudy-night': return WI.cloudMoon(moon, cloud);
    case 'overcast': return WI.cloud(cloud, cloud2);
    case 'fog': return WI.fog(fg);
    case 'drizzle': return WI.rain(cloud, rainC);
    case 'rain': return WI.rain(cloud, rainC);
    case 'rain-heavy': return WI.rain(cloud2, rainC);
    case 'freezing-rain': return WI.rain(cloud, rainC);
    case 'snow': return WI.snowIcon(cloud, snowC);
    case 'snow-heavy': return WI.snowIcon(cloud2, snowC);
    case 'snow-grains': return WI.snowIcon(cloud, snowC);
    case 'rain-showers': return WI.rain(cloud, rainC);
    case 'snow-showers': return WI.snowIcon(cloud, snowC);
    case 'thunderstorm': return WI.bolt(cloud, boltC);
    case 'thunderstorm-hail': return WI.bolt(cloud2, boltC);
    default: return WI.cloud(cloud, cloud2);
  }
}
