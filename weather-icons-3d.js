// 3D realistic weather icons — replaces flat SVG drawings with shaded,
// gradient-rich, drop-shadowed SVG icons. Keeps the same API as weather-icons.js
// so weather.js can swap without changes.

const GRADIENTS = `
<defs>
  <radialGradient id="sun3d" cx="35%" cy="35%" r="65%">
    <stop offset="0%" stop-color="#fff9c4"/>
    <stop offset="40%" stop-color="#ffeb3b"/>
    <stop offset="100%" stop-color="#f59e0b"/>
  </radialGradient>
  <radialGradient id="moon3d" cx="30%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#f8fafc"/>
    <stop offset="50%" stop-color="#cbd5e1"/>
    <stop offset="100%" stop-color="#64748b"/>
  </radialGradient>
  <radialGradient id="cloud3d" cx="30%" cy="25%" r="75%">
    <stop offset="0%" stop-color="#ffffff"/>
    <stop offset="60%" stop-color="#f1f5f9"/>
    <stop offset="100%" stop-color="#94a3b8"/>
  </radialGradient>
  <radialGradient id="cloudDark3d" cx="30%" cy="25%" r="75%">
    <stop offset="0%" stop-color="#e2e8f0"/>
    <stop offset="60%" stop-color="#94a3b8"/>
    <stop offset="100%" stop-color="#475569"/>
  </radialGradient>
  <radialGradient id="rainDrop3d" cx="30%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#bfdbfe"/>
    <stop offset="100%" stop-color="#3b82f6"/>
  </radialGradient>
  <radialGradient id="snowFlake3d" cx="30%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#ffffff"/>
    <stop offset="100%" stop-color="#e2e8f0"/>
  </radialGradient>
  <radialGradient id="bolt3d" cx="40%" cy="20%" r="80%">
    <stop offset="0%" stop-color="#fef08a"/>
    <stop offset="50%" stop-color="#facc15"/>
    <stop offset="100%" stop-color="#f59e0b"/>
  </radialGradient>
  <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur"/>
    <feOffset in="blur" dx="0" dy="2" result="offsetBlur"/>
    <feComponentTransfer in="offsetBlur" result="shadowAlpha">
      <feFuncA type="linear" slope="0.25"/>
    </feComponentTransfer>
    <feMerge>
      <feMergeNode in="shadowAlpha"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="2.5" result="blur"/>
    <feMerge>
      <feMergeNode in="blur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
</defs>`;

function svgWrap(content) {
  return `<svg viewBox="0 0 100 100" style="filter:drop-shadow(0 3px 5px rgba(0,0,0,0.12))">${GRADIENTS}${content}</svg>`;
}

function sun3d(color) {
  return svgWrap(`
    <g filter="url(#glow)">
      <circle cx="50" cy="50" r="22" fill="url(#sun3d)"/>
      <g stroke="#fbbf24" stroke-width="5" stroke-linecap="round" opacity="0.9">
        <line x1="50" y1="6" x2="50" y2="18"/>
        <line x1="50" y1="82" x2="50" y2="94"/>
        <line x1="6" y1="50" x2="18" y2="50"/>
        <line x1="82" y1="50" x2="94" y2="50"/>
        <line x1="17" y1="17" x2="26" y2="26"/>
        <line x1="74" y1="74" x2="83" y2="83"/>
        <line x1="17" y1="83" x2="26" y2="74"/>
        <line x1="74" y1="26" x2="83" y2="17"/>
      </g>
    </g>
  `);
}

function moon3d(color) {
  return svgWrap(`
    <g filter="url(#softShadow)">
      <circle cx="52" cy="48" r="22" fill="url(#moon3d)"/>
      <circle cx="62" cy="38" r="22" fill="currentColor" opacity="0.92"/>
      <!-- subtle craters -->
      <circle cx="46" cy="42" r="4" fill="#94a3b8" opacity="0.25"/>
      <circle cx="56" cy="56" r="3" fill="#94a3b8" opacity="0.2"/>
    </g>
  `);
}

function cloudPuff3d(cx, cy, r, dark = false) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${dark ? 'cloudDark3d' : 'cloud3d'})" filter="url(#softShadow)"/>`;
}

function cloud3d(c1, c2) {
  return svgWrap(`
    ${cloudPuff3d(24, 72, 18)}
    ${cloudPuff3d(46, 66, 22)}
    ${cloudPuff3d(70, 72, 18)}
    ${cloudPuff3d(38, 54, 16)}
    ${cloudPuff3d(58, 56, 14)}
  `);
}

function cloudSun3d(sunColor, cloudColor) {
  return svgWrap(`
    <g filter="url(#glow)">
      <circle cx="34" cy="34" r="16" fill="url(#sun3d)"/>
      <g stroke="#fbbf24" stroke-width="4" stroke-linecap="round">
        <line x1="34" y1="6" x2="34" y2="14"/>
        <line x1="10" y1="34" x2="18" y2="34"/>
        <line x1="13" y1="13" x2="19" y2="19"/>
        <line x1="55" y1="13" x2="49" y2="19"/>
      </g>
    </g>
    ${cloudPuff3d(50, 76, 18)}
    ${cloudPuff3d(72, 80, 15)}
    ${cloudPuff3d(62, 66, 16)}
    ${cloudPuff3d(36, 82, 13)}
  `);
}

function cloudMoon3d(moonColor, cloudColor) {
  return svgWrap(`
    <g filter="url(#softShadow)">
      <circle cx="36" cy="30" r="14" fill="url(#moon3d)"/>
      <circle cx="44" cy="22" r="14" fill="currentColor" opacity="0.9"/>
    </g>
    ${cloudPuff3d(50, 76, 18)}
    ${cloudPuff3d(72, 80, 15)}
    ${cloudPuff3d(62, 66, 16)}
    ${cloudPuff3d(36, 82, 13)}
  `);
}

function rain3d(cloudColor, dropColor) {
  return svgWrap(`
    ${cloudPuff3d(28, 58, 18)}
    ${cloudPuff3d(50, 52, 22)}
    ${cloudPuff3d(74, 58, 18)}
    ${cloudPuff3d(42, 40, 15)}
    ${cloudPuff3d(62, 42, 13)}
    <g>
      <ellipse cx="34" cy="78" rx="4" ry="7" fill="url(#rainDrop3d)" opacity="0.9"/>
      <ellipse cx="52" cy="86" rx="4" ry="7" fill="url(#rainDrop3d)" opacity="0.9"/>
      <ellipse cx="70" cy="78" rx="4" ry="7" fill="url(#rainDrop3d)" opacity="0.9"/>
    </g>
  `);
}

function snow3d(cloudColor, flakeColor) {
  return svgWrap(`
    ${cloudPuff3d(28, 58, 18)}
    ${cloudPuff3d(50, 52, 22)}
    ${cloudPuff3d(74, 58, 18)}
    ${cloudPuff3d(42, 40, 15)}
    ${cloudPuff3d(62, 42, 13)}
    <g fill="url(#snowFlake3d)" filter="url(#softShadow)">
      <circle cx="32" cy="82" r="5"/>
      <circle cx="52" cy="90" r="5"/>
      <circle cx="72" cy="82" r="5"/>
    </g>
  `);
}

function fog3d(color) {
  return svgWrap(`
    <g stroke="${color}" stroke-width="8" stroke-linecap="round" opacity="0.7" filter="url(#softShadow)">
      <line x1="14" y1="38" x2="86" y2="38"/>
      <line x1="8" y1="54" x2="92" y2="54"/>
      <line x1="20" y1="70" x2="80" y2="70"/>
    </g>
  `);
}

function bolt3d(cloudColor, boltColor) {
  return svgWrap(`
    ${cloudPuff3d(28, 56, 18, true)}
    ${cloudPuff3d(50, 50, 22, true)}
    ${cloudPuff3d(74, 56, 18, true)}
    ${cloudPuff3d(42, 38, 15, true)}
    ${cloudPuff3d(62, 40, 13, true)}
    <g filter="url(#glow)">
      <path d="M58 58 42 82h12l-6 18 24-30H58z" fill="url(#bolt3d)"/>
    </g>
  `);
}

function drop3d(color) {
  return svgWrap(`
    <path d="M50 12c16 24 28 40 28 56a28 28 0 0 1-56 0c0-16 12-32 28-56z" fill="url(#rainDrop3d)" filter="url(#softShadow)"/>
  `);
}

function wind3d(color) {
  return svgWrap(`
    <g stroke="${color}" stroke-width="7" stroke-linecap="round" fill="none" filter="url(#softShadow)">
      <path d="M10 35h55a12 12 0 1 0-10-19"/>
      <path d="M10 55h70a12 12 0 1 1-10 19"/>
      <path d="M10 75h45a10 10 0 1 0-8-15"/>
    </g>
  `);
}

function sunrise3d(color) {
  return svgWrap(`
    <g stroke="${color}" stroke-width="6" stroke-linecap="round" fill="none" filter="url(#softShadow)">
      <path d="M20 70a30 30 0 0 1 60 0"/>
      <line x1="10" y1="70" x2="90" y2="70"/>
      <line x1="50" y1="10" x2="50" y2="22"/>
      <line x1="20" y1="30" x2="28" y2="38"/>
      <line x1="80" y1="30" x2="72" y2="38"/>
    </g>
  `);
}

function sunset3d(color) {
  return svgWrap(`
    <g stroke="${color}" stroke-width="6" stroke-linecap="round" fill="none" filter="url(#softShadow)">
      <path d="M20 70a30 30 0 0 1 60 0"/>
      <line x1="10" y1="70" x2="90" y2="70"/>
      <line x1="50" y1="18" x2="50" y2="30"/>
      <line x1="20" y1="38" x2="28" y2="46"/>
      <line x1="80" y1="38" x2="72" y2="46"/>
    </g>
  `);
}

function uv3d(color) {
  return svgWrap(`
    <g fill="url(#sun3d)" filter="url(#glow)">
      <circle cx="50" cy="50" r="18"/>
      <g stroke="${color}" stroke-width="5" stroke-linecap="round">
        <line x1="50" y1="8" x2="50" y2="18"/>
        <line x1="50" y1="82" x2="50" y2="92"/>
        <line x1="8" y1="50" x2="18" y2="50"/>
        <line x1="82" y1="50" x2="92" y2="50"/>
        <line x1="20" y1="20" x2="27" y2="27"/>
        <line x1="73" y1="73" x2="80" y2="80"/>
        <line x1="20" y1="80" x2="27" y2="73"/>
        <line x1="73" y1="27" x2="80" y2="20"/>
      </g>
    </g>
  `);
}

function eye3d(color) {
  return svgWrap(`
    <g fill="none" stroke="${color}" stroke-width="6" filter="url(#softShadow)">
      <path d="M6 50c10-20 30-30 44-30s34 10 44 30c-10 20-30 30-44 30S16 70 6 50z"/>
      <circle cx="50" cy="50" r="14" fill="${color}" stroke="none"/>
    </g>
  `);
}

function aqi3d(color) {
  return svgWrap(`
    <g fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" filter="url(#softShadow)">
      <path d="M14 60c0-20 16-36 36-36s36 16 36 36"/>
      <line x1="50" y1="60" x2="66" y2="42"/>
      <circle cx="50" cy="60" r="6" fill="${color}" stroke="none"/>
    </g>
  `);
}

function thermo3d(color) {
  return svgWrap(`
    <g fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" filter="url(#softShadow)">
      <line x1="50" y1="14" x2="50" y2="62"/>
      <circle cx="50" cy="74" r="14" fill="url(#rainDrop3d)" stroke="none"/>
    </g>
  `);
}

const WI = {
  sun: sun3d,
  moon: moon3d,
  cloud: cloud3d,
  cloudSun: cloudSun3d,
  cloudMoon: cloudMoon3d,
  rain: rain3d,
  snowIcon: snow3d,
  fog: fog3d,
  bolt: bolt3d,
  drop: drop3d,
  wind: wind3d,
  sunrise: sunrise3d,
  sunset: sunset3d,
  uv: uv3d,
  eye: eye3d,
  aqi: aqi3d,
  thermo: thermo3d,
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

window.WI = WI;
window.wmoInfo = wmoInfo;
window.iconSvgFor = iconSvgFor;
