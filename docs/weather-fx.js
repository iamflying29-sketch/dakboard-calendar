// Canvas-based weather animation engine.
// Every condition key gets its own distinct look: clouds, rain, snow, fog,
// stars, sun rays, lightning, hail, etc. No generic fallback animation.

function _hx(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lerpHex(a, b, t) {
  const ca = _hx(a), cb = _hx(b);
  const r = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
  return '#' + r.map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------
// Procedural fractal (Perlin) noise -> real volumetric cloud texture,
// instead of flat circle blobs. This is what makes overcast/storm skies
// actually read as a solid cloud ceiling rather than a few gray dots.
// ---------------------------------------------------------------------
class PerlinNoise2D {
  constructor(seed) {
    this.perm = new Uint8Array(512);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    let s = seed || 1337;
    const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }
  static _fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  static _lerp(a, b, t) { return a + t * (b - a); }
  static _grad(hash, x, y) {
    const h = hash & 3;
    const u = h < 2 ? x : y, v = h < 2 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -2 * v : 2 * v);
  }
  noise(x, y) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y);
    const u = PerlinNoise2D._fade(x), v = PerlinNoise2D._fade(y);
    const p = this.perm;
    const aa = p[X + p[Y]], ab = p[X + p[Y + 1]], ba = p[X + 1 + p[Y]], bb = p[X + 1 + p[Y + 1]];
    return PerlinNoise2D._lerp(
      PerlinNoise2D._lerp(PerlinNoise2D._grad(aa, x, y), PerlinNoise2D._grad(ba, x - 1, y), u),
      PerlinNoise2D._lerp(PerlinNoise2D._grad(ab, x, y - 1), PerlinNoise2D._grad(bb, x - 1, y - 1), u),
      v
    );
  }
  // Fractal Brownian Motion: layered octaves for realistic cloud detail
  fbm(x, y, octaves, lacunarity, gain) {
    let amp = 0.5, freq = 1, sum = 0, norm = 0;
    for (let i = 0; i < octaves; i++) {
      sum += amp * this.noise(x * freq, y * freq);
      norm += amp;
      amp *= gain;
      freq *= lacunarity;
    }
    return sum / norm; // roughly -1..1
  }
}

// Builds a seamless-horizontally-tileable cloud density texture as an
// offscreen canvas: bright/opaque where clouds are thick, transparent
// where sky shows through. Used for real volumetric-looking cloud decks.
function buildCloudTexture(width, height, seed, coverage, softness) {
  const noise = new PerlinNoise2D(seed);
  const off = document.createElement('canvas');
  off.width = width; off.height = height;
  const octx = off.getContext('2d');
  const img = octx.createImageData(width, height);
  const scale = 0.006; // spatial frequency of the base cloud shapes
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      // Sample on a cylinder (wrap x) so the texture tiles seamlessly
      // when scrolled horizontally for drifting clouds.
      const ang = (px / width) * Math.PI * 2;
      const cx = Math.cos(ang) * (width * scale) / (Math.PI * 2) * (Math.PI * 2);
      const nx = Math.cos(ang) / scale * 0.02, ny = Math.sin(ang) / scale * 0.02;
      let n = noise.fbm(nx * 0.15 + 0, py * scale, 5, 2.0, 0.55);
      n += noise.fbm(nx * 0.4, py * scale * 2.2, 3, 2.0, 0.5) * 0.3;
      // Shape into cloud density: raise to a curve so we get soft puffy
      // clumps with clear gaps, then bias by 'coverage' (0=clear,1=solid).
      let density = (n + 1) / 2; // 0..1
      density = Math.pow(density, 1.6);
      density = (density - (0.55 - coverage * 0.55)) / Math.max(0.08, softness);
      density = Math.max(0, Math.min(1, density));
      const idx = (py * width + px) * 4;
      img.data[idx] = 255; img.data[idx + 1] = 255; img.data[idx + 2] = 255;
      img.data[idx + 3] = Math.round(density * 255);
    }
  }
  octx.putImageData(img, 0, 0);
  return off;
}

class WeatherFX {
  constructor(canvas, colors) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.colors = colors;
    this.particles = [];
    this.clouds = [];
    this.stars = [];
    this.t = 0;
    this.flashTimer = 0;
    this.flashAlpha = 0;
    this.key = 'clear-day';
    this.sunElevation = 0.6; // -1 (midnight) .. 0 (horizon) .. 1 (noon), set from real sun data
    this.cloudTexA = null; this.cloudTexB = null; // volumetric cloud deck layers
    this.cloudOffsetA = 0; this.cloudOffsetB = 0;
    this._resize();
    window.addEventListener('resize', () => this._resize());
    this._raf = requestAnimationFrame(this._tick.bind(this));
  }

  _resize() {
    const dpr = window.devicePixelRatio || 1;
    this.w = this.canvas.clientWidth;
    this.h = this.canvas.clientHeight;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // frac: 0..1 progress across the current day (sunrise->sunset) or night
  // (sunset->next sunrise). elevation: sin-curve height, 1=noon, 0=horizon,
  // -1=midnight. Drives the REAL arc position + color warmth of the sun/
  // moon glow and the ambient lighting tint on clouds/fog/precipitation --
  // applied for every single condition, not just clear skies.
  setSunState(frac, elevation) {
    this.sunFrac = frac;
    this.sunElevation = elevation;
  }

  setCondition(key) {
    if (this.key === key) return;
    this.key = key;
    this.particles = [];
    this.clouds = [];
    this.stars = [];
    this._seed();
  }

  _rand(a, b) { return a + Math.random() * (b - a); }

  _seed() {
    const w = this.w, h = this.h, k = this.key;
    const needsClouds = ['mostly-clear-day','mostly-clear-night','partly-cloudy-day','partly-cloudy-night',
      'overcast','drizzle','rain','rain-heavy','rain-showers','freezing-rain','snow','snow-heavy',
      'snow-showers','snow-grains','thunderstorm','thunderstorm-hail'].includes(k);
    if (needsClouds) {
      const heavy = ['overcast','rain-heavy','thunderstorm','thunderstorm-hail'].includes(k);
      const n = heavy ? 6 : (k.includes('mostly-clear') ? 2 : 4);
      for (let i = 0; i < n; i++) {
        this.clouds.push({
          x: this._rand(0, w), y: this._rand(h * 0.05, h * 0.32),
          s: this._rand(0.6, 1.3) * (heavy ? 1.3 : 1),
          v: this._rand(4, 10),
          op: heavy ? this._rand(0.5, 0.75) : this._rand(0.3, 0.55),
        });
      }
    }
    if (k.includes('night') && !['overcast'].includes(k)) {
      const n = 40;
      for (let i = 0; i < n; i++) {
        this.stars.push({
          x: this._rand(0, w), y: this._rand(0, h * 0.55),
          r: this._rand(0.6, 1.8), ph: this._rand(0, Math.PI * 2), sp: this._rand(1, 3),
        });
      }
    }
    // Precipitation particles
    const rainKeys = ['drizzle','rain','rain-heavy','rain-showers','freezing-rain','thunderstorm','thunderstorm-hail'];
    const snowKeys = ['snow','snow-heavy','snow-showers','snow-grains'];
    if (rainKeys.includes(k)) {
      const density = { drizzle: 40, rain: 90, 'rain-heavy': 160, 'rain-showers': 120,
        'freezing-rain': 80, thunderstorm: 140, 'thunderstorm-hail': 160 }[k] || 80;
      for (let i = 0; i < density; i++) {
        this.particles.push(this._newDrop(true));
      }
      if (k === 'thunderstorm-hail') {
        for (let i = 0; i < 30; i++) this.particles.push(this._newHail(true));
      }
      if (k === 'freezing-rain') {
        for (let i = 0; i < 20; i++) this.particles.push(this._newIce(true));
      }
    }
    if (snowKeys.includes(k)) {
      const density = { snow: 70, 'snow-heavy': 140, 'snow-showers': 100, 'snow-grains': 120 }[k] || 70;
      for (let i = 0; i < density; i++) {
        this.particles.push(this._newFlake(true, k === 'snow-grains'));
      }
    }
    if (k === 'fog') {
      for (let i = 0; i < 6; i++) {
        this.particles.push({
          type: 'fogband', y: this._rand(h * 0.15, h * 0.85), x: this._rand(-w, 0),
          v: this._rand(6, 16), s: this._rand(0.7, 1.4), op: this._rand(0.15, 0.32),
        });
      }
    }
    if (k === 'clear-day' || k === 'mostly-clear-day' || k === 'partly-cloudy-day') {
      for (let i = 0; i < 10; i++) {
        this.particles.push({
          type: 'mote', x: this._rand(0, w), y: this._rand(0, h * 0.5),
          r: this._rand(1, 2.4), ph: this._rand(0, Math.PI * 2), sp: this._rand(0.3, 0.8),
          vy: this._rand(-6, -2),
        });
      }
    }
  }

  _newDrop(randomY) {
    return {
      type: 'rain', x: this._rand(0, this.w), y: randomY ? this._rand(0, this.h) : -10,
      len: this._rand(14, 28), v: this._rand(9, 16), op: this._rand(0.35, 0.75),
    };
  }
  _newFlake(randomY, grain) {
    return {
      type: 'snow', x: this._rand(0, this.w), y: randomY ? this._rand(0, this.h) : -10,
      r: grain ? this._rand(1, 2) : this._rand(2, 4.5),
      v: grain ? this._rand(4, 7) : this._rand(1, 2.6),
      sway: this._rand(0.5, 1.6), ph: this._rand(0, Math.PI * 2),
      op: this._rand(0.5, 0.95),
    };
  }
  _newHail(randomY) {
    return { type: 'hail', x: this._rand(0, this.w), y: randomY ? this._rand(0, this.h) : -10,
      r: this._rand(1.5, 3), v: this._rand(12, 18) };
  }
  _newIce(randomY) {
    return { type: 'ice', x: this._rand(0, this.w), y: randomY ? this._rand(0, this.h) : -10,
      r: this._rand(1, 2), v: this._rand(10, 14), ph: this._rand(0, Math.PI * 2) };
  }

  _tick() {
    this.t += 1;
    const { ctx, w, h, colors, key } = this;
    ctx.clearRect(0, 0, w, h);

    // Real arc position for the sun/moon: rises near one side low, peaks
    // near the top-center at solar noon/midnight, sets on the other side.
    // sunFrac drives horizontal position; sunElevation drives height +
    // warmth. This runs for EVERY condition (even overcast/rain/snow use
    // it to tint ambient light), not just clear skies.
    const frac = this.sunFrac != null ? this.sunFrac : 0.5;
    const elev = this.sunElevation != null ? this.sunElevation : 0.6;
    const arcX = w * (0.12 + 0.76 * frac);
    const absElev = Math.abs(elev);
    const arcY = h * (0.55 - 0.42 * absElev);
    // Sun/moon glow -- always present in some form (even muted through
    // cloud/fog/rain/snow) so lighting feels continuous across conditions.
    const cloudy = ['overcast','rain-heavy','thunderstorm','thunderstorm-hail','snow-heavy'].includes(key);
    const veiled = ['fog','drizzle','rain','rain-showers','freezing-rain','snow','snow-showers','snow-grains'].includes(key);
    let glowMul = 1;
    if (cloudy) glowMul = 0.18; else if (veiled) glowMul = 0.45;

    if (elev >= 0) {
      // Sun
      const warm = 1 - Math.min(1, absElev / 0.35); // 1 at horizon, 0 well above
      const sunColor = lerpHex(colors.sunCore, '#ff8a3d', warm * 0.7);
      ctx.globalAlpha = glowMul;
      this._drawGlow(arcX, arcY, 130 + 40 * absElev, colors.sunGlow);
      ctx.globalAlpha = 1;
      if (!cloudy) this._drawSunRays(arcX, arcY, 44 + 10 * absElev, sunColor);
      else { ctx.globalAlpha = 0.5; this._drawSunRays(arcX, arcY, 30, sunColor); ctx.globalAlpha = 1; }
    } else {
      // Moon
      const moonWarm = 1 - Math.min(1, absElev / 0.3);
      const moonColor = lerpHex(colors.moonCore, '#ffd9a0', moonWarm * 0.4);
      ctx.globalAlpha = glowMul;
      this._drawGlow(arcX, arcY, 95, colors.moonGlow);
      ctx.globalAlpha = Math.max(0.5, glowMul);
      this._drawMoonDisc(arcX, arcY, 26, moonColor);
      ctx.globalAlpha = 1;
      for (const s of this.stars) {
        const tw = 0.55 + 0.45 * Math.sin(this.t / (18 / s.sp) + s.ph);
        ctx.save();
        ctx.shadowColor = colors.moonCore; ctx.shadowBlur = 3;
        ctx.globalAlpha = tw;
        ctx.fillStyle = colors.moonCore;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }

    // Clouds drift -- lit by the same real sun/moon state as everything
    // else, so overcast/rain/snow clouds go warm at dawn/dusk and dark at
    // night instead of always looking the same flat gray.
    let cloudTint = colors.cloud;
    let cloudTint2 = colors.cloud2 || colors.cloud;
    if (elev >= 0) {
      const warm = 1 - Math.min(1, absElev / 0.3);
      cloudTint = lerpHex(colors.cloud, '#f4a35c', warm * 0.45);
      cloudTint2 = lerpHex(colors.cloud2 || colors.cloud, '#c97a3d', warm * 0.4);
    } else {
      const dark = Math.min(1, absElev / 0.6);
      cloudTint = lerpHex(colors.cloud, '#0b0b12', dark * 0.55);
      cloudTint2 = lerpHex(colors.cloud2 || colors.cloud, '#05050a', dark * 0.55);
    }
    for (const c of this.clouds) {
      c.x += c.v / 60;
      if (c.x > w + 90) c.x = -90;
      this._drawCloud(c.x, c.y, c.s, c.op, cloudTint, cloudTint2);
    }

    // Particles
    for (const p of this.particles) {
      if (p.type === 'rain') {
        p.y += p.v; 
        if (p.y > h + 20) { p.y = -10; p.x = this._rand(0, w); }
        ctx.save();
        ctx.shadowColor = colors.rain; ctx.shadowBlur = 3;
        ctx.strokeStyle = colors.rain; ctx.globalAlpha = p.op; ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 3, p.y + p.len); ctx.stroke();
        ctx.restore();
      } else if (p.type === 'snow') {
        p.y += p.v; p.x += Math.sin(this.t / 30 + p.ph) * p.sway * 0.1;
        if (p.y > h + 5) { p.y = -5; p.x = this._rand(0, w); }
        ctx.save();
        ctx.shadowColor = colors.snow; ctx.shadowBlur = 4;
        ctx.globalAlpha = p.op; ctx.fillStyle = colors.snow;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      } else if (p.type === 'hail') {
        p.y += p.v;
        if (p.y > h + 5) { p.y = -5; p.x = this._rand(0, w); }
        ctx.fillStyle = '#e5e7eb'; ctx.globalAlpha = 0.9;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      } else if (p.type === 'ice') {
        p.y += p.v;
        if (p.y > h + 5) { p.y = -5; p.x = this._rand(0, w); }
        const sp = 0.6 + 0.4 * Math.sin(this.t / 6 + p.ph);
        ctx.globalAlpha = sp; ctx.fillStyle = '#bae6fd';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      } else if (p.type === 'fogband') {
        p.x += p.v / 60;
        if (p.x > w + 40) p.x = -w - 40;
        const grad = ctx.createLinearGradient(p.x, 0, p.x + w * 0.9, 0);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(0.5, colors.fog);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = p.op; ctx.fillStyle = grad;
        ctx.fillRect(p.x, p.y - 18 * p.s, w * 0.9, 36 * p.s);
        ctx.globalAlpha = 1;
      } else if (p.type === 'mote') {
        p.y += p.vy / 60; p.x += Math.sin(this.t / 40 + p.ph) * 0.15;
        if (p.y < -5) p.y = h * 0.5;
        const tw = 0.3 + 0.5 * Math.sin(this.t / 20 + p.ph);
        ctx.globalAlpha = tw * 0.5; ctx.fillStyle = colors.sunCore;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Lightning flash for thunderstorms
    if (key === 'thunderstorm' || key === 'thunderstorm-hail') {
      this.flashTimer -= 1;
      if (this.flashTimer <= 0 && Math.random() < 0.012) {
        this.flashAlpha = this._rand(0.35, 0.7);
        this.flashTimer = 90 + Math.random() * 120;
      }
      if (this.flashAlpha > 0.01) {
        ctx.globalAlpha = this.flashAlpha;
        ctx.fillStyle = colors.bolt;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
        this.flashAlpha *= 0.82;
      }
    }

    this._raf = requestAnimationFrame(this._tick.bind(this));
  }

  _drawGlow(x, y, r, color) {
    const ctx = this.ctx;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  _drawSunRays(x, y, r, color) {
    const ctx = this.ctx;
    const c = color || this.colors.sunCore;
    const pulse = 1 + 0.06 * Math.sin(this.t / 40);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.t / 900);
    ctx.strokeStyle = c;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 4;
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI * 2 * i) / 8;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r * 0.55 * pulse, Math.sin(a) * r * 0.55 * pulse);
      ctx.lineTo(Math.cos(a) * r * 0.85 * pulse, Math.sin(a) * r * 0.85 * pulse);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowColor = c; ctx.shadowBlur = 18;
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  _drawMoonDisc(x, y, r, color) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = color; ctx.shadowBlur = 14;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    // Crescent shading: carve a shadow circle offset to the upper-right
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = 0.55;
    ctx.beginPath(); ctx.arc(r * 0.42, -r * 0.32, r * 0.92, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    // Soft craters
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath(); ctx.arc(-r * 0.3, r * 0.2, r * 0.16, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-r * 0.05, -r * 0.25, r * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

_drawCloud(x, y, s, op, tint, tint2) {
    const ctx = this.ctx;
    const base = tint2 || this.colors.cloud2 || this.colors.cloud;
    const highlight = tint || this.colors.cloud;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.globalAlpha = op;

    // Soft drop shadow underneath for volume
    ctx.save();
    ctx.filter = 'blur(6px)';
    ctx.globalAlpha = op * 0.35;
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.arc(2, 10, 20, 0, Math.PI * 2);
    ctx.arc(24, 4, 16, 0, Math.PI * 2);
    ctx.arc(-18, 6, 14, 0, Math.PI * 2);
    ctx.arc(12, 14, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Base puff (mid-tone, lit by real sun/moon warmth)
    ctx.globalAlpha = op;
    ctx.fillStyle = base;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.arc(22, -8, 16, 0, Math.PI * 2);
    ctx.arc(-20, -4, 14, 0, Math.PI * 2);
    ctx.arc(10, 6, 18, 0, Math.PI * 2);
    ctx.fill();

    // Highlight puff on top (lighter, offset upward) for volumetric look
    ctx.globalAlpha = op * 0.75;
    ctx.fillStyle = highlight;
    ctx.beginPath();
    ctx.arc(-2, -6, 15, 0, Math.PI * 2);
    ctx.arc(18, -13, 12, 0, Math.PI * 2);
    ctx.arc(-16, -9, 10, 0, Math.PI * 2);
    ctx.arc(8, -2, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  destroy() {
    cancelAnimationFrame(this._raf);
  }
}
