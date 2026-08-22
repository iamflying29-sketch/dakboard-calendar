// True 3D CGI weather icons rendered with Three.js.
// Each icon is a real-time rendered WebGL scene captured to a PNG data URL,
// then displayed as a crisp <img>. One shared renderer keeps it efficient.

import * as THREE from './three.module.js';

const ICON_SIZE = 256;
const cache = new Map();

let renderer, camera, scene, keyLight, fillLight;

function initRenderer() {
  if (renderer) return;
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setSize(ICON_SIZE, ICON_SIZE);
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
  keyLight.shadow.mapSize.width = 128;
  keyLight.shadow.mapSize.height = 128;
  scene.add(keyLight);

  fillLight = new THREE.DirectionalLight(0xcfd8dc, 0.45);
  fillLight.position.set(-3, 1, 3);
  scene.add(fillLight);

  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);
}

function clearScene() {
  while (scene.children.length > 0) {
    const obj = scene.children[0];
    if (obj === keyLight || obj === fillLight) { scene.remove(obj); continue; }
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
      else obj.material.dispose();
    }
    scene.remove(obj);
  }
  scene.add(keyLight);
  scene.add(fillLight);
}

function renderToDataURL(builder) {
  initRenderer();
  clearScene();
  builder(scene);
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL('image/png');
}

function iconImg(key) {
  if (!cache.has(key)) {
    cache.set(key, renderToDataURL(BUILDERS[key] || BUILDERS['cloudy']));
  }
  return `<img src="${cache.get(key)}" class="weather-icon" alt="${key}">`;
}

// ---------------------------------------------------------------------------
// Shared materials & geometry helpers
// ---------------------------------------------------------------------------
const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({
  color, roughness: 0.6, metalness: 0.05, ...opts
});
const emissive = (color, intensity = 1) => mat(color, { emissive: color, emissiveIntensity: intensity });
const glass = (color) => mat(color, { transparent: true, opacity: 0.9, roughness: 0.15, metalness: 0.1 });
const cloud = (color = 0xffffff) => mat(color, { transparent: true, opacity: 0.98, roughness: 0.85, metalness: 0 });
const sphere = (r) => new THREE.SphereGeometry(r, 32, 32);
const cylinder = (rt, rb, h, seg = 16) => new THREE.CylinderGeometry(rt, rb, h, seg);

function addCloudPuffs(scene, positions, color, scale = 1, outlineColor = 0x475569) {
  // Strong outline behind the cloud so it reads at tiny sizes.
  const outlinePositions = positions.map(([x, y, z, r]) => [x, y, z - 0.08, r * 1.12]);
  const outlineGeo = sphere(1);
  const outlineMat = new THREE.MeshBasicMaterial({ color: outlineColor, transparent: true, opacity: 0.45 });
  outlinePositions.forEach(([x, y, z, r]) => {
    const mesh = new THREE.Mesh(outlineGeo, outlineMat);
    mesh.position.set(x, y, z);
    mesh.scale.set(r * scale, r * scale * 0.72, r * scale);
    scene.add(mesh);
  });

  const geo = sphere(1);
  const m = cloud(color);
  positions.forEach(([x, y, z, r]) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z);
    mesh.scale.set(r * scale, r * scale * 0.72, r * scale);
    mesh.castShadow = true;
    scene.add(mesh);
  });
}

// ---------------------------------------------------------------------------
// Scene builders
// ---------------------------------------------------------------------------
const BUILDERS = {
  'clear-day'(s) {
    // Bold, emoji-style 3D sun with thick outline and white highlight.
    const outline = new THREE.Mesh(sphere(1.18), mat(0xf59e0b));
    s.add(outline);
    const sun = new THREE.Mesh(sphere(1.05), new THREE.MeshBasicMaterial({ color: 0xffb300 }));
    s.add(sun);
    const highlight = new THREE.Mesh(sphere(0.45), new THREE.MeshBasicMaterial({ color: 0xffeeba, transparent: true, opacity: 0.5 }));
    highlight.position.set(-0.3, 0.3, 0.65);
    s.add(highlight);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const ray = new THREE.Mesh(cylinder(0.1, 0.1, 0.85), new THREE.MeshBasicMaterial({ color: 0xffb300 }));
      ray.position.set(Math.cos(a) * 1.7, Math.sin(a) * 1.7, -0.1);
      ray.rotation.z = a + Math.PI / 2;
      s.add(ray);
    }
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.4, 32), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.12 }));
    shadow.position.set(0.2, -0.2, -1.0);
    s.add(shadow);
  },
  'clear-night'(s) {
    const moon = new THREE.Mesh(sphere(1.0), new THREE.MeshBasicMaterial({ color: 0xe2e8f0 }));
    s.add(moon);
    const craters = [[0.25, 0.2, 0.5, 0.15], [-0.35, 0.35, 0.4, 0.12], [0.1, -0.4, 0.35, 0.1]];
    craters.forEach(([x, y, z, r]) => {
      const c = new THREE.Mesh(sphere(r), new THREE.MeshBasicMaterial({ color: 0x94a3b8 }));
      c.position.set(x, y, z);
      s.add(c);
    });
    for (let i = 0; i < 8; i++) {
      const star = new THREE.Mesh(sphere(0.05 + Math.random() * 0.04), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      const a = Math.random() * Math.PI * 2;
      const r = 1.8 + Math.random() * 0.8;
      star.position.set(Math.cos(a) * r, Math.sin(a) * r, -0.5);
      s.add(star);
    }
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.2, 32), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.15 }));
    shadow.position.set(0.25, -0.25, -1.0);
    s.add(shadow);
  },
  'partly-cloudy-day'(s) {
    BUILDERS['clear-day'](s);
    addCloudPuffs(s, [[0.55, -0.45, 0.5, 0.6], [0.95, -0.5, 0.4, 0.55], [0.25, -0.55, 0.3, 0.45]], 0xffffff);
  },
  'partly-cloudy-night'(s) {
    BUILDERS['clear-night'](s);
    addCloudPuffs(s, [[0.55, -0.45, 0.5, 0.6], [0.95, -0.5, 0.4, 0.55], [0.25, -0.55, 0.3, 0.45]], 0xe2e8f0);
  },
  'cloudy'(s) {
    // Classic cloud silhouette: 3 large puffs with dark outline so it reads at 13px.
    addCloudPuffs(s, [[-0.4, 0, 0, 0.8], [0.25, 0.05, 0.15, 0.85], [0.75, -0.05, 0, 0.75]], 0xffffff, 1, 0x475569);
  },
  'overcast'(s) {
    addCloudPuffs(s, [[-0.4, 0.05, 0, 0.8], [0.25, 0.1, 0.15, 0.85], [0.75, 0, 0, 0.75]], 0x94a3b8, 1, 0x334155);
  },
  'fog'(s) {
    const barGeo = new THREE.BoxGeometry(2.8, 0.22, 0.05);
    const barMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
    const outlineMat = new THREE.MeshBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.5 });
    for (let i = 0; i < 3; i++) {
      const outline = new THREE.Mesh(barGeo, outlineMat);
      outline.position.set(0.04, -0.15 + i * 0.28, -0.04);
      s.add(outline);
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(0, -0.15 + i * 0.28, 0);
      s.add(bar);
    }
  },
  'drizzle'(s) {
    BUILDERS['cloudy'](s);
    for (let i = 0; i < 5; i++) {
      const drop = new THREE.Mesh(cylinder(0.05, 0.05, 0.45), mat(0x2563eb, { transparent: true, opacity: 0.9 }));
      drop.position.set(-0.5 + i * 0.28, -0.85, 0.2);
      s.add(drop);
    }
  },
  'rain'(s) {
    BUILDERS['cloudy'](s);
    for (let i = 0; i < 5; i++) {
      const drop = new THREE.Mesh(cylinder(0.06, 0.06, 0.65), mat(0x1d4ed8, { transparent: true, opacity: 0.9 }));
      drop.position.set(-0.55 + i * 0.3, -0.9, 0.2);
      s.add(drop);
    }
  },
  'sleet'(s) {
    BUILDERS['cloudy'](s);
    for (let i = 0; i < 5; i++) {
      const drop = new THREE.Mesh(cylinder(0.06, 0.06, 0.45), mat(0x2563eb, { transparent: true, opacity: 0.9 }));
      drop.position.set(-0.55 + i * 0.3, -0.85, 0.2);
      s.add(drop);
      const flake = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 0), mat(0xffffff));
      flake.position.set(-0.45 + i * 0.3, -1.05, 0.3);
      s.add(flake);
    }
  },
  'snow'(s) {
    BUILDERS['cloudy'](s);
    const flakeGeo = new THREE.IcosahedronGeometry(0.12, 0);
    for (let i = 0; i < 6; i++) {
      const flake = new THREE.Mesh(flakeGeo, mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.2 }));
      flake.position.set(-0.5 + (i % 3) * 0.4, -0.85 - Math.floor(i / 3) * 0.3, 0.2);
      s.add(flake);
    }
  },
  'snowflake'(s) {
    const flake = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 1), mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.15 }));
    s.add(flake);
    for (let i = 0; i < 6; i++) {
      const arm = new THREE.Mesh(cylinder(0.04, 0.04, 1.2), mat(0xffffff));
      arm.rotation.z = i * Math.PI / 3;
      s.add(arm);
    }
  },
  'thunderstorms'(s) {
    BUILDERS['overcast'](s);
    const bolt = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.08), emissive(0xfacc15, 1.5));
    bolt.position.set(0.1, -0.55, 0.5);
    bolt.rotation.z = 0.15;
    s.add(bolt);
    const bolt2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.08), emissive(0xfacc15, 1.5));
    bolt2.position.set(0.05, -1.1, 0.5);
    bolt2.rotation.z = -0.2;
    s.add(bolt2);
    s.add(new THREE.PointLight(0xfacc15, 0.7, 5));
  },
  'hail'(s) {
    BUILDERS['cloudy'](s);
    const geo = new THREE.IcosahedronGeometry(0.07, 0);
    for (let i = 0; i < 8; i++) {
      const stone = new THREE.Mesh(geo, mat(0xe2e8f0, { roughness: 0.2, metalness: 0.3 }));
      stone.position.set(-0.6 + i * 0.18, -0.95, 0.2);
      s.add(stone);
    }
  },
  'wind'(s) {
    for (let i = 0; i < 3; i++) {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(0.9 - i * 0.18, 0.06, 8, 32, Math.PI), mat(0x64748b));
      arc.position.set(0, -0.1 + i * 0.2, 0);
      arc.rotation.z = Math.PI * 0.1;
      s.add(arc);
    }
  },
  'mist'(s) {
    BUILDERS['fog'](s);
  },
  'haze'(s) {
    for (let i = 0; i < 4; i++) {
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.5), new THREE.MeshBasicMaterial({ color: 0xd4b483, transparent: true, opacity: 0.4 }));
      plane.position.set(0, -0.2 + i * 0.22, 0);
      s.add(plane);
    }
  },
  // Extreme events
  'tornado'(s) {
    const geo = new THREE.ConeGeometry(0.7, 2.2, 32, 1, true);
    const matT = new THREE.MeshStandardMaterial({ color: 0x475569, transparent: true, opacity: 0.7, side: THREE.DoubleSide, roughness: 0.9 });
    const cone = new THREE.Mesh(geo, matT);
    cone.position.y = -0.2;
    s.add(cone);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.7, 32), new THREE.MeshBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.3, side: THREE.DoubleSide }));
    ring.position.y = -1.2;
    s.add(ring);
  },
  'hurricane'(s) {
    const spiral = new THREE.Group();
    for (let i = 0; i < 40; i++) {
      const t = i / 40;
      const a = t * Math.PI * 5;
      const r = 0.3 + t * 1.1;
      const seg = new THREE.Mesh(cylinder(0.05, 0.05, 0.18), mat(0x475569, { transparent: true, opacity: 0.7 }));
      seg.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
      seg.rotation.z = a + Math.PI / 2;
      spiral.add(seg);
    }
    s.add(spiral);
    const eye = new THREE.Mesh(sphere(0.35), mat(0xffffff));
    s.add(eye);
  },
  'tropical-storm'(s) {
    BUILDERS['rain'](s);
    s.add(new THREE.Mesh(sphere(0.2), mat(0x475569, { transparent: true, opacity: 0.6 })));
  },
  'derecho'(s) {
    BUILDERS['thunderstorms'](s);
  },
  'squall'(s) {
    BUILDERS['wind'](s);
  },
  'waterspout'(s) {
    BUILDERS['tornado'](s);
  },
  'blizzard'(s) {
    BUILDERS['snow'](s);
  },
  'ice-storm'(s) {
    BUILDERS['sleet'](s);
  },
  'sandstorm'(s) {
    for (let i = 0; i < 60; i++) {
      const p = new THREE.Mesh(sphere(0.05 + Math.random() * 0.05), mat(0xc2a078, { transparent: true, opacity: 0.6 }));
      p.position.set((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 1);
      s.add(p);
    }
  },
  'dust-storm'(s) {
    for (let i = 0; i < 60; i++) {
      const p = new THREE.Mesh(sphere(0.05 + Math.random() * 0.05), mat(0xa8a29e, { transparent: true, opacity: 0.5 }));
      p.position.set((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 1);
      s.add(p);
    }
  },
  'volcanic-ash'(s) {
    BUILDERS['sandstorm'](s);
  },
  'wildfire-smoke'(s) {
    BUILDERS['sandstorm'](s);
  },
  'forest-fire'(s) {
    for (let i = 0; i < 5; i++) {
      const flame = new THREE.Mesh(cylinder(0.12 - i * 0.015, 0.0, 0.8 - i * 0.1), emissive(0xef4444, 0.8));
      flame.position.set((i - 2) * 0.25, -0.2 + i * 0.05, 0);
      s.add(flame);
    }
    for (let i = 0; i < 20; i++) {
      const p = new THREE.Mesh(sphere(0.04), mat(0x78716c, { transparent: true, opacity: 0.5 }));
      p.position.set((Math.random() - 0.5) * 2.5, 0.5 + Math.random() * 0.8, 0);
      s.add(p);
    }
  },
  'smoke'(s) {
    BUILDERS['sandstorm'](s);
  },
  'ash'(s) {
    BUILDERS['sandstorm'](s);
  },
  'haze'(s) {
    BUILDERS['haze'](s);
  },
  'smog'(s) {
    BUILDERS['haze'](s);
  },
  'acid-rain'(s) {
    BUILDERS['cloudy'](s);
    for (let i = 0; i < 8; i++) {
      const drop = new THREE.Mesh(cylinder(0.04, 0.04, 0.55), mat(0x84cc16, { transparent: true, opacity: 0.85 }));
      drop.position.set(-0.7 + i * 0.2, -0.95, 0.2);
      s.add(drop);
    }
  },
  'aurora'(s) {
    for (let i = 0; i < 3; i++) {
      const colors = [0x4ade80, 0x22d3ee, 0xa78bfa];
      const band = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.4), new THREE.MeshBasicMaterial({ color: colors[i], transparent: true, opacity: 0.6 }));
      band.position.set(0, 0.3 - i * 0.25, 0);
      s.add(band);
    }
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.4 }));
    bg.position.z = -0.5;
    s.add(bg);
  },
  'eclipse'(s) {
    const sun = new THREE.Mesh(sphere(1.1), emissive(0xffb300, 0.6));
    s.add(sun);
    const moon = new THREE.Mesh(sphere(1.0), mat(0x0f172a));
    moon.position.set(0.35, 0.1, 0.3);
    s.add(moon);
    const corona = new THREE.Mesh(sphere(1.5), new THREE.MeshBasicMaterial({ color: 0xffd54f, transparent: true, opacity: 0.2 }));
    s.add(corona);
  },
  'rainbow'(s) {
    const colors = [0xef4444, 0xf97316, 0xeab308, 0x22c55e, 0x3b82f6, 0xa855f7];
    colors.forEach((c, i) => {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(1.0 + i * 0.12, 0.07, 8, 48, Math.PI), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.8 }));
      arc.rotation.z = Math.PI;
      s.add(arc);
    });
  },
  'meteor-shower'(s) {
    for (let i = 0; i < 5; i++) {
      const streak = new THREE.Mesh(cylinder(0.03, 0.03, 0.8), mat(0xfef3c7, { emissive: 0xfef3c7, emissiveIntensity: 0.8 }));
      streak.position.set(-0.8 + i * 0.4, 0.4 - i * 0.15, 0);
      streak.rotation.z = -0.5;
      s.add(streak);
    }
  },
  'meteor-impact'(s) {
    const flash = new THREE.Mesh(sphere(1.4), emissive(0xfef3c7, 0.8));
    s.add(flash);
    const core = new THREE.Mesh(sphere(0.6), emissive(0xf59e0b, 1.2));
    s.add(core);
    s.add(new THREE.PointLight(0xf59e0b, 1, 8));
  },
  'asteroid-impact'(s) {
    const flash = new THREE.Mesh(sphere(1.5), emissive(0xef4444, 0.9));
    s.add(flash);
    const core = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5), mat(0x450a0a, { emissive: 0xef4444, emissiveIntensity: 0.5 }));
    s.add(core);
  },
  'earthquake'(s) {
    for (let i = 0; i < 3; i++) {
      const wave = new THREE.Mesh(new THREE.TorusGeometry(0.6 + i * 0.25, 0.04, 8, 48, Math.PI), mat(0x475569));
      wave.position.y = -0.3 + i * 0.05;
      wave.rotation.x = Math.PI / 2;
      s.add(wave);
    }
  },
  'tsunami'(s) {
    const wave = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.15, 12, 48, Math.PI), new THREE.MeshStandardMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.8, roughness: 0.2, metalness: 0.1 }));
    wave.rotation.x = Math.PI / 2;
    wave.position.y = -0.3;
    s.add(wave);
    const wave2 = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.12, 12, 48, Math.PI), new THREE.MeshStandardMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.7, roughness: 0.2, metalness: 0.1 }));
    wave2.rotation.x = Math.PI / 2;
    wave2.position.y = -0.1;
    s.add(wave2);
  },
  'volcanic-eruption'(s) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.4, 32), mat(0x4a3b32));
    cone.position.y = -0.5;
    s.add(cone);
    for (let i = 0; i < 10; i++) {
      const bomb = new THREE.Mesh(sphere(0.08 + Math.random() * 0.05), emissive(0xef4444, 0.8));
      bomb.position.set((Math.random() - 0.5) * 0.5, 0.2 + Math.random() * 0.6, 0);
      s.add(bomb);
    }
  },
  'landslide'(s) {
    const slope = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.6, 4), mat(0x8b6f47));
    slope.position.set(0.3, -0.3, 0);
    slope.rotation.z = -0.3;
    s.add(slope);
    for (let i = 0; i < 15; i++) {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08 + Math.random() * 0.06), mat(0x6b5637));
      rock.position.set(-0.8 + Math.random() * 1.2, -0.6 - Math.random() * 0.4, 0.1);
      s.add(rock);
    }
  },
  'mudslide'(s) {
    BUILDERS['landslide'](s);
  },
  'avalanche'(s) {
    const slope = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.6, 4), mat(0xf1f5f9));
    slope.position.set(0.3, -0.3, 0);
    slope.rotation.z = -0.3;
    s.add(slope);
    for (let i = 0; i < 20; i++) {
      const flake = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06 + Math.random() * 0.04), mat(0xffffff));
      flake.position.set(-0.8 + Math.random() * 1.2, -0.6 - Math.random() * 0.4, 0.1);
      s.add(flake);
    }
  },
  'rockfall'(s) {
    for (let i = 0; i < 12; i++) {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12 + Math.random() * 0.1), mat(0x78716c));
      rock.position.set((Math.random() - 0.5) * 2, 0.8 - Math.random() * 1.6, 0.1);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      s.add(rock);
    }
  },
  'geological-event'(s) {
    BUILDERS['earthquake'](s);
  },
  'apocalypse'(s) {
    BUILDERS['asteroid-impact'](s);
  },
};

// Aliases for common keys
['rain-heavy', 'freezing-rain', 'rain-showers'].forEach(k => BUILDERS[k] = BUILDERS['rain']);
['snow-heavy', 'snow-grains', 'snow-showers'].forEach(k => BUILDERS[k] = BUILDERS['snow']);
['thunderstorm'].forEach(k => BUILDERS[k] = BUILDERS['thunderstorms']);
['thunderstorm-hail'].forEach(k => BUILDERS[k] = BUILDERS['hail']);

// ---------------------------------------------------------------------------
// Public API — same as weather-icons.js
// ---------------------------------------------------------------------------
const WI = {
  sun(color) { return iconImg('clear-day'); },
  moon(color) { return iconImg('clear-night'); },
  cloud(c1, c2) { return iconImg('cloudy'); },
  cloudSun(sunColor, cloudColor) { return iconImg('partly-cloudy-day'); },
  cloudMoon(moonColor, cloudColor) { return iconImg('partly-cloudy-night'); },
  rain(cloudColor, dropColor) { return iconImg('rain'); },
  snowIcon(cloudColor, flakeColor) { return iconImg('snow'); },
  fog(color) { return iconImg('fog'); },
  bolt(cloudColor, boltColor) { return iconImg('thunderstorms'); },
  drop(color) { return iconImg('rain'); },
  wind(color) { return iconImg('wind'); },
  sunrise(color) { return iconImg('clear-day'); },
  sunset(color) { return iconImg('clear-night'); },
  uv(color) { return iconImg('clear-day'); },
  eye(color) { return iconImg('mist'); },
  aqi(color) { return iconImg('wind'); },
  thermo(color) { return iconImg('clear-day'); },
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
  return iconImg(key);
}

window.WI = WI;
window.wmoInfo = wmoInfo;
window.iconSvgFor = iconSvgFor;
