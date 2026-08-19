// Hybrid icon system: true 3D CGI for the main current icon, crisp professional
// Meteocons SVG for the small forecast/detail-card icons.
// This gives the main symbol real 3D depth while keeping the hourly/daily/
// card grid readable at 16-36px.

import * as THREE from './three.module.js';

// ---------------------------------------------------------------------------
// 3D main-icon renderer (true CGI, one shared WebGL renderer)
// ---------------------------------------------------------------------------
const MAIN_SIZE = 256;
const mainCache = new Map();
let renderer, camera, scene, keyLight, fillLight;

function initMainRenderer() {
  if (renderer) return;
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setSize(MAIN_SIZE, MAIN_SIZE);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
  camera.position.set(0, 0.3, 5.5);
  camera.lookAt(0, 0, 0);

  scene = new THREE.Scene();
  keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
  keyLight.position.set(3, 4, 5);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 256;
  keyLight.shadow.mapSize.height = 256;
  scene.add(keyLight);
  fillLight = new THREE.DirectionalLight(0xcfd8dc, 0.45);
  fillLight.position.set(-3, 1, 3);
  scene.add(fillLight);
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
}

function clearMainScene() {
  while (scene.children.length > 0) {
    const obj = scene.children[0];
    if (obj === keyLight || obj === fillLight) { scene.remove(obj); continue; }
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) { Array.isArray(obj.material) ? obj.material.forEach(m => m.dispose()) : obj.material.dispose(); }
    scene.remove(obj);
  }
  scene.add(keyLight);
  scene.add(fillLight);
}

const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.05, ...opts });
const basic = (color, opts = {}) => new THREE.MeshBasicMaterial({ color, ...opts });
const sphere = (r) => new THREE.SphereGeometry(r, 32, 32);
const cylinder = (rt, rb, h) => new THREE.CylinderGeometry(rt, rb, h, 16);

function addCloudPuffs(scene, positions, color, outlineColor) {
  const outlineGeo = sphere(1);
  const outlineMat = basic(outlineColor, { transparent: true, opacity: 0.4 });
  positions.forEach(([x, y, z, r]) => {
    const o = new THREE.Mesh(outlineGeo, outlineMat);
    o.position.set(x, y, z - 0.08);
    o.scale.set(r * 1.12, r * 0.8, r * 1.12);
    scene.add(o);
  });
  const geo = sphere(1);
  const m = mat(color, { transparent: true, opacity: 0.98, roughness: 0.85 });
  positions.forEach(([x, y, z, r]) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    mesh.scale.set(r, r * 0.72, r);
    mesh.castShadow = true;
    scene.add(mesh);
  });
}

const MAIN_BUILDERS = {
  'clear-day'(s) {
    const sun = new THREE.Mesh(sphere(1.05), basic(0xffb300));
    s.add(sun);
    const halo = new THREE.Mesh(sphere(1.5), basic(0xffd54f, { transparent: true, opacity: 0.22 }));
    s.add(halo);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const ray = new THREE.Mesh(cylinder(0.1, 0.1, 0.85), basic(0xffb300));
      ray.position.set(Math.cos(a) * 1.7, Math.sin(a) * 1.7, -0.1);
      ray.rotation.z = a + Math.PI / 2;
      s.add(ray);
    }
    const highlight = new THREE.Mesh(sphere(0.45), basic(0xffeeba, { transparent: true, opacity: 0.55 }));
    highlight.position.set(-0.3, 0.3, 0.65);
    s.add(highlight);
  },
  'clear-night'(s) {
    const moon = new THREE.Mesh(sphere(1.0), basic(0xe2e8f0));
    s.add(moon);
    [[0.25, 0.2, 0.5, 0.15], [-0.35, 0.35, 0.4, 0.12], [0.1, -0.4, 0.35, 0.1]].forEach(([x, y, z, r]) => {
      const c = new THREE.Mesh(sphere(r), basic(0x94a3b8));
      c.position.set(x, y, z); s.add(c);
    });
    for (let i = 0; i < 8; i++) {
      const star = new THREE.Mesh(sphere(0.05 + Math.random() * 0.04), basic(0xffffff));
      const a = Math.random() * Math.PI * 2, r = 1.8 + Math.random() * 0.8;
      star.position.set(Math.cos(a) * r, Math.sin(a) * r, -0.5); s.add(star);
    }
  },
  'partly-cloudy-day'(s) {
    MAIN_BUILDERS['clear-day'](s);
    addCloudPuffs(s, [[0.55, -0.45, 0.5, 0.6], [0.95, -0.5, 0.4, 0.55], [0.25, -0.55, 0.3, 0.45]], 0xffffff, 0x475569);
  },
  'partly-cloudy-night'(s) {
    MAIN_BUILDERS['clear-night'](s);
    addCloudPuffs(s, [[0.55, -0.45, 0.5, 0.6], [0.95, -0.5, 0.4, 0.55], [0.25, -0.55, 0.3, 0.45]], 0xe2e8f0, 0x334155);
  },
  'cloudy'(s) { addCloudPuffs(s, [[-0.4, 0, 0, 0.8], [0.25, 0.05, 0.15, 0.85], [0.75, -0.05, 0, 0.75]], 0xffffff, 0x475569); },
  'overcast'(s) { addCloudPuffs(s, [[-0.4, 0.05, 0, 0.8], [0.25, 0.1, 0.15, 0.85], [0.75, 0, 0, 0.75]], 0x94a3b8, 0x334155); },
  'fog'(s) {
    // Soft cloud with layered mist bars.
    addCloudPuffs(s, [[-0.35, 0.35, 0.1, 0.55], [0.15, 0.4, 0.2, 0.6], [0.55, 0.35, 0.1, 0.5]], 0xffffff, 0x475569);
    for (let i = 0; i < 3; i++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 0.05), basic(0x94a3b8, { transparent: true, opacity: 0.85 }));
      bar.position.set(0, -0.25 + i * 0.24, 0); s.add(bar);
    }
  },
  'drizzle'(s) {
    MAIN_BUILDERS['cloudy'](s);
    for (let i = 0; i < 5; i++) { const d = new THREE.Mesh(cylinder(0.05, 0.05, 0.45), basic(0x2563eb, { transparent: true, opacity: 0.9 })); d.position.set(-0.5 + i * 0.28, -0.85, 0.2); s.add(d); }
  },
  'rain'(s) {
    MAIN_BUILDERS['cloudy'](s);
    for (let i = 0; i < 5; i++) { const d = new THREE.Mesh(cylinder(0.06, 0.06, 0.65), basic(0x1d4ed8, { transparent: true, opacity: 0.9 })); d.position.set(-0.55 + i * 0.3, -0.9, 0.2); s.add(d); }
  },
  'freezing-rain'(s) { MAIN_BUILDERS['rain'](s); },
  'rain-heavy'(s) { MAIN_BUILDERS['rain'](s); },
  'rain-showers'(s) { MAIN_BUILDERS['rain'](s); },
  'snow'(s) {
    MAIN_BUILDERS['cloudy'](s);
    const g = new THREE.IcosahedronGeometry(0.12, 0);
    for (let i = 0; i < 6; i++) { const f = new THREE.Mesh(g, basic(0xffffff)); f.position.set(-0.5 + (i % 3) * 0.4, -0.85 - Math.floor(i / 3) * 0.3, 0.2); s.add(f); }
  },
  'snow-heavy'(s) { MAIN_BUILDERS['snow'](s); },
  'snow-grains'(s) { MAIN_BUILDERS['snow'](s); },
  'snow-showers'(s) { MAIN_BUILDERS['snow'](s); },
  'thunderstorm'(s) {
    MAIN_BUILDERS['overcast'](s);
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.08), basic(0xfacc15));
    b1.position.set(0.1, -0.55, 0.5); b1.rotation.z = 0.15; s.add(b1);
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.08), basic(0xfacc15));
    b2.position.set(0.05, -1.1, 0.5); b2.rotation.z = -0.2; s.add(b2);
  },
  'thunderstorm-hail'(s) { MAIN_BUILDERS['thunderstorm'](s); },
};

function mainIconUrl(key) {
  if (!mainCache.has(key)) {
    initMainRenderer();
    clearMainScene();
    (MAIN_BUILDERS[key] || MAIN_BUILDERS['cloudy'])(scene);
    renderer.render(scene, camera);
    mainCache.set(key, renderer.domElement.toDataURL('image/png'));
  }
  return mainCache.get(key);
}

function mainIcon(key) {
  return `<img src="${mainIconUrl(key)}" class="weather-icon weather-icon-main" alt="${key}">`;
}

// ---------------------------------------------------------------------------
// Small icon renderer: Meteocons SVG (crisp at any size, professional quality)
// ---------------------------------------------------------------------------
const METEO_PATH = './meteo_';
const KEY_TO_ICON = {
  'clear-day': 'clear-day', 'clear-night': 'clear-night',
  'mostly-clear-day': 'partly-cloudy-day', 'mostly-clear-night': 'partly-cloudy-night',
  'partly-cloudy-day': 'partly-cloudy-day', 'partly-cloudy-night': 'partly-cloudy-night',
  'overcast': 'overcast', 'fog': 'fog', 'drizzle': 'drizzle', 'rain': 'rain',
  'rain-heavy': 'rain', 'freezing-rain': 'sleet', 'snow': 'snow', 'snow-heavy': 'snow',
  'snow-grains': 'snowflake', 'rain-showers': 'rain', 'snow-showers': 'snow',
  'thunderstorm': 'thunderstorms', 'thunderstorm-hail': 'hail',
  'tornado': 'wind', 'hurricane': 'wind', 'tropical-storm': 'rain', 'derecho': 'thunderstorms',
  'squall': 'wind', 'waterspout': 'wind', 'blizzard': 'snow', 'ice-storm': 'sleet',
  'sandstorm': 'fog', 'dust-storm': 'fog', 'volcanic-ash': 'fog', 'wildfire-smoke': 'fog',
  'forest-fire': 'fog', 'smoke': 'fog', 'ash': 'fog', 'haze': 'haze', 'smog': 'fog',
  'acid-rain': 'rain', 'aurora': 'clear-night', 'eclipse': 'clear-night', 'rainbow': 'clear-day',
  'meteor-shower': 'clear-night', 'meteor-impact': 'thunderstorms', 'asteroid-impact': 'thunderstorms',
  'earthquake': 'wind', 'tsunami': 'rain', 'volcanic-eruption': 'fog', 'landslide': 'fog',
  'mudslide': 'fog', 'avalanche': 'snow', 'rockfall': 'fog', 'geological-event': 'wind',
  'apocalypse': 'thunderstorms',
};

function smallIcon(name) {
  return `<img src="${METEO_PATH}${name}.svg" class="weather-icon" alt="${name}">`;
}

function smallIconFor(key) {
  return smallIcon(KEY_TO_ICON[key] || 'cloudy');
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
const WI = {
  sun(color) { return smallIcon('clear-day'); },
  moon(color) { return smallIcon('clear-night'); },
  cloud(c1, c2) { return smallIcon('cloudy'); },
  cloudSun(sunColor, cloudColor) { return smallIcon('partly-cloudy-day'); },
  cloudMoon(moonColor, cloudColor) { return smallIcon('partly-cloudy-night'); },
  rain(cloudColor, dropColor) { return smallIcon('rain'); },
  snowIcon(cloudColor, flakeColor) { return smallIcon('snow'); },
  fog(color) { return smallIcon('fog'); },
  bolt(cloudColor, boltColor) { return smallIcon('thunderstorms'); },
  drop(color) { return smallIcon('rain'); },
  wind(color) { return smallIcon('wind'); },
  sunrise(color) { return smallIcon('clear-day'); },
  sunset(color) { return smallIcon('clear-night'); },
  uv(color) { return smallIcon('clear-day'); },
  eye(color) { return smallIcon('mist'); },
  aqi(color) { return smallIcon('wind'); },
  thermo(color) { return smallIcon('clear-day'); },
};

function wmoInfo(code, isDay) {
  const day = !!isDay;
  const table = {
    0: { key: day ? 'clear-day' : 'clear-night', label: 'Clear' },
    1: { key: day ? 'mostly-clear-day' : 'mostly-clear-night', label: 'Mostly Clear' },
    2: { key: day ? 'partly-cloudy-day' : 'partly-cloudy-night', label: 'Partly Cloudy' },
    3: { key: 'overcast', label: 'Overcast' },
    45: { key: 'fog', label: 'Fog' }, 48: { key: 'fog', label: 'Freezing Fog' },
    51: { key: 'drizzle', label: 'Light Drizzle' }, 53: { key: 'drizzle', label: 'Drizzle' }, 55: { key: 'drizzle', label: 'Heavy Drizzle' },
    56: { key: 'freezing-rain', label: 'Freezing Drizzle' }, 57: { key: 'freezing-rain', label: 'Freezing Drizzle' },
    61: { key: 'rain', label: 'Light Rain' }, 63: { key: 'rain', label: 'Rain' }, 65: { key: 'rain-heavy', label: 'Heavy Rain' },
    66: { key: 'freezing-rain', label: 'Freezing Rain' }, 67: { key: 'freezing-rain', label: 'Freezing Rain' },
    71: { key: 'snow', label: 'Light Snow' }, 73: { key: 'snow', label: 'Snow' }, 75: { key: 'snow-heavy', label: 'Heavy Snow' },
    77: { key: 'snow-grains', label: 'Snow Grains' },
    80: { key: 'rain-showers', label: 'Rain Showers' }, 81: { key: 'rain-showers', label: 'Rain Showers' }, 82: { key: 'rain-showers', label: 'Violent Showers' },
    85: { key: 'snow-showers', label: 'Snow Showers' }, 86: { key: 'snow-showers', label: 'Snow Showers' },
    95: { key: 'thunderstorm', label: 'Thunderstorm' }, 96: { key: 'thunderstorm-hail', label: 'Thunderstorm w/ Hail' }, 99: { key: 'thunderstorm-hail', label: 'Severe Thunderstorm' },
  };
  return table[code] || { key: day ? 'partly-cloudy-day' : 'partly-cloudy-night', label: 'Unknown' };
}

function iconSvgForMain(key, vars) {
  return mainIcon(key);
}

function iconSvgForSmall(key, vars) {
  return smallIconFor(key);
}

function iconSvgFor(key, vars) {
  return smallIconFor(key);
}

window.WI = WI;
window.wmoInfo = wmoInfo;
window.iconSvgFor = iconSvgFor;
window.iconSvgForMain = iconSvgForMain;
window.iconSvgForSmall = iconSvgForSmall;
