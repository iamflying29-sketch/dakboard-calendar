// =============================================================================
// Weather Atmosphere — CGI-grade weather background for DAKboard
// =============================================================================
// Replaces the old Canvas 2D particle engine with @takustaqu/atmosphere, a
// single-shader WebGL sky/weather renderer. Covers every WMO weather code plus
// rare/extreme scenarios, with supplemental Canvas overlays for conditions the
// shader cannot directly depict (tornado, sandstorm, volcanic ash, etc.).
//
// Usage: same interface as the old WeatherFX class:
//   const fx = new WeatherAtmosphere(canvas, { sunCore, moonCore, ... });
//   fx.setCondition('rain-heavy');
//   fx.setSunState(frac, elevation);   // Atmosphere uses real time/lat/lon,
//                                        // this just refreshes the sky.
// =============================================================================

import { Atmosphere } from './atmosphere.js';

// ---------------------------------------------------------------------------
// Location: Tiburon, CA (matches weather.js)
// ---------------------------------------------------------------------------
const DEFAULT_LOCATION = { latitude: 37.8991768, longitude: -122.4949685 };

// ---------------------------------------------------------------------------
// Standard WMO weather codes (0-99) -> atmosphere parameters.
// Values use real observation units: cloudCover 0..1, precipitation mm/h,
// windSpeed m/s, visibility km, thunder 0..1, convection 0..1.
// ---------------------------------------------------------------------------
const WMO_ATMOSPHERE_TABLE = {
  // Group 0: clear
  0:  { cloudCover: 0.00, precipitation: 0,   windSpeed: 2,  visibility: 45, thunder: 0 },

  // Group 1-3: cloud cover
  1:  { cloudCover: 0.22, precipitation: 0,   windSpeed: 3,  visibility: 35, thunder: 0 },
  2:  { cloudCover: 0.35, precipitation: 0,   windSpeed: 4,  visibility: 30, thunder: 0 },
  3:  { cloudCover: 0.92, precipitation: 0,   windSpeed: 5,  visibility: 18, thunder: 0 },

  // Group 45/48: fog / rime fog
  45: { cloudCover: 0.75, precipitation: 0,   windSpeed: 1,  visibility: 0.6, thunder: 0 },
  48: { cloudCover: 0.78, precipitation: 0,   windSpeed: 1,  visibility: 0.4, thunder: 0 },

  // Group 5x: drizzle
  51: { cloudCover: 0.60, precipitation: 1,   windSpeed: 3,  visibility: 8,  thunder: 0, precipitationType: 'rain' },
  53: { cloudCover: 0.68, precipitation: 3,   windSpeed: 4,  visibility: 6,  thunder: 0, precipitationType: 'rain' },
  55: { cloudCover: 0.75, precipitation: 6,   windSpeed: 5,  visibility: 4,  thunder: 0, precipitationType: 'rain' },

  // Group 56/57: freezing drizzle
  56: { cloudCover: 0.70, precipitation: 2,   windSpeed: 3,  visibility: 3,  thunder: 0, precipitationType: 'rain' },
  57: { cloudCover: 0.76, precipitation: 5,   windSpeed: 4,  visibility: 2,  thunder: 0, precipitationType: 'rain' },

  // Group 6x: rain
  61: { cloudCover: 0.78, precipitation: 4,   windSpeed: 5,  visibility: 8,  thunder: 0, precipitationType: 'rain' },
  63: { cloudCover: 0.85, precipitation: 10,  windSpeed: 6,  visibility: 6,  thunder: 0, precipitationType: 'rain' },
  65: { cloudCover: 0.92, precipitation: 22,  windSpeed: 8,  visibility: 4,  thunder: 0, precipitationType: 'rain' },

  // Group 66/67: freezing rain
  66: { cloudCover: 0.85, precipitation: 6,   windSpeed: 5,  visibility: 2,  thunder: 0, precipitationType: 'rain' },
  67: { cloudCover: 0.90, precipitation: 14,  windSpeed: 7,  visibility: 1,  thunder: 0, precipitationType: 'rain' },

  // Group 7x: snow
  71: { cloudCover: 0.78, precipitation: 1.5, windSpeed: 4,  visibility: 3,  thunder: 0, precipitationType: 'snow' },
  73: { cloudCover: 0.85, precipitation: 4,   windSpeed: 5,  visibility: 2,  thunder: 0, precipitationType: 'snow' },
  75: { cloudCover: 0.92, precipitation: 10,  windSpeed: 7,  visibility: 1,  thunder: 0, precipitationType: 'snow' },

  // Group 77: snow grains
  77: { cloudCover: 0.70, precipitation: 0.8, windSpeed: 5,  visibility: 2,  thunder: 0, precipitationType: 'snow' },

  // Group 8x: showers
  80: { cloudCover: 0.55, precipitation: 4,   windSpeed: 5,  visibility: 10, thunder: 0, precipitationType: 'rain' },
  81: { cloudCover: 0.65, precipitation: 10,  windSpeed: 6,  visibility: 8,  thunder: 0, precipitationType: 'rain' },
  82: { cloudCover: 0.75, precipitation: 30,  windSpeed: 8,  visibility: 5,  thunder: 0, precipitationType: 'rain' },
  85: { cloudCover: 0.55, precipitation: 2,   windSpeed: 5,  visibility: 4,  thunder: 0, precipitationType: 'snow' },
  86: { cloudCover: 0.70, precipitation: 12,  windSpeed: 7,  visibility: 2,  thunder: 0, precipitationType: 'snow' },

  // Group 9x: thunderstorms
  95: { cloudCover: 0.96, precipitation: 25,  windSpeed: 10, visibility: 5,  thunder: 1.0, precipitationType: 'rain' },
  96: { cloudCover: 0.97, precipitation: 30,  windSpeed: 12, visibility: 4,  thunder: 1.0, precipitationType: 'rain', convection: 0.85 },
  99: { cloudCover: 0.99, precipitation: 45,  windSpeed: 15, visibility: 3,  thunder: 1.0, precipitationType: 'rain', convection: 0.95 },
};

// ---------------------------------------------------------------------------
// Internal key mapping (matches weather-icons.js keys) -> WMO-ish parameters.
// ---------------------------------------------------------------------------
const KEY_TABLE = {
  'clear-day':          { ...WMO_ATMOSPHERE_TABLE[0], overlay: 'clear-day', cloudCover: 0.03, windSpeed: 3 },
  'clear-night':        { ...WMO_ATMOSPHERE_TABLE[0], overlay: 'clear-night', cloudCover: 0.0, windSpeed: 2 },
  // "Mostly clear" should still feel clear -- reuse the clear-day/night
  // sparkle/star overlays (a sky that's 85-90% clear still shows plenty of
  // stars at night / sun glints by day), just with a touch of cloud in the
  // WebGL sky itself so it's not identical to fully clear.
  'mostly-clear-day':   { ...WMO_ATMOSPHERE_TABLE[1], overlay: 'clear-day', cloudCover: 0.15, windSpeed: 3 },
  'mostly-clear-night': { ...WMO_ATMOSPHERE_TABLE[1], overlay: 'clear-night', cloudCover: 0.10, windSpeed: 2 },
  'partly-cloudy-day':  WMO_ATMOSPHERE_TABLE[2],
  'partly-cloudy-night':WMO_ATMOSPHERE_TABLE[2],
  'mostly-cloudy-day':  { ...WMO_ATMOSPHERE_TABLE[3], cloudCover: 0.78 },
  'mostly-cloudy-night':{ ...WMO_ATMOSPHERE_TABLE[3], cloudCover: 0.78 },
  'overcast':           WMO_ATMOSPHERE_TABLE[3],
  'fog':                { ...WMO_ATMOSPHERE_TABLE[45], overlay: 'fog-bank' },
  'drizzle':            WMO_ATMOSPHERE_TABLE[53],
  'rain':               WMO_ATMOSPHERE_TABLE[63],
  'rain-heavy':         WMO_ATMOSPHERE_TABLE[65],
  'freezing-rain':      WMO_ATMOSPHERE_TABLE[67],
  'snow':               WMO_ATMOSPHERE_TABLE[73],
  'snow-heavy':         WMO_ATMOSPHERE_TABLE[75],
  'snow-grains':        WMO_ATMOSPHERE_TABLE[77],
  'rain-showers':       WMO_ATMOSPHERE_TABLE[81],
  'snow-showers':       WMO_ATMOSPHERE_TABLE[86],
  'thunderstorm':       WMO_ATMOSPHERE_TABLE[95],
  'thunderstorm-hail':  WMO_ATMOSPHERE_TABLE[99],
};

// ---------------------------------------------------------------------------
// Rare / extreme / non-WMO scenarios -> atmosphere params + overlay effect.
// These go beyond the standard Open-Meteo WMO codes and are triggered by custom
// keys or can be injected manually for alerts/testing.
// ---------------------------------------------------------------------------
const EXTREME_TABLE = {
  // Severe storms
  'tornado':        { cloudCover: 1.00, precipitation: 60,  windSpeed: 75, visibility: 0.2, thunder: 1.0, convection: 1.0, precipitationType: 'rain', overlay: 'tornado', label: 'Tornado' },
  'waterspout':     { cloudCover: 0.98, precipitation: 45,  windSpeed: 55, visibility: 0.5, thunder: 1.0, convection: 0.95, precipitationType: 'rain', overlay: 'tornado', label: 'Waterspout' },
  'hurricane':      { cloudCover: 1.00, precipitation: 90,  windSpeed: 60, visibility: 0.2, thunder: 0.9, convection: 1.0, precipitationType: 'rain', overlay: 'hurricane', label: 'Hurricane' },
  'tropical-storm': { cloudCover: 1.00, precipitation: 45,  windSpeed: 35, visibility: 0.5, thunder: 0.7, convection: 0.8, precipitationType: 'rain', overlay: 'rain', label: 'Tropical Storm' },
  'derecho':        { cloudCover: 1.00, precipitation: 40,  windSpeed: 50, visibility: 1,  thunder: 1.0, convection: 0.95, precipitationType: 'rain', overlay: 'lightning', label: 'Derecho' },
  'squall':         { cloudCover: 0.95, precipitation: 25,  windSpeed: 30, visibility: 2,  thunder: 0.8, convection: 0.7, precipitationType: 'rain', overlay: 'rain', label: 'Squall' },

  // Winter extremes
  'blizzard':       { cloudCover: 1.00, precipitation: 20,  windSpeed: 28, visibility: 0.1, thunder: 0, convection: 0, precipitationType: 'snow', overlay: 'snow-blizzard', label: 'Blizzard' },
  'ice-storm':      { cloudCover: 0.95, precipitation: 18,  windSpeed: 12, visibility: 0.5, thunder: 0, convection: 0, precipitationType: 'rain', overlay: 'ice', label: 'Ice Storm' },

  // Visibility / aerosol events
  'sandstorm':      { cloudCover: 0.95, precipitation: 0,   windSpeed: 25, visibility: 0.05, thunder: 0, convection: 0, overlay: 'sand', label: 'Sandstorm' },
  'dust-storm':     { cloudCover: 0.92, precipitation: 0,   windSpeed: 20, visibility: 0.1,  thunder: 0, convection: 0, overlay: 'dust', label: 'Dust Storm' },
  'volcanic-ash':   { cloudCover: 0.95, precipitation: 0,   windSpeed: 8,  visibility: 0.3,  thunder: 0, convection: 0, overlay: 'ash', label: 'Volcanic Ash' },
  'wildfire-smoke': { cloudCover: 0.90, precipitation: 0,   windSpeed: 6,  visibility: 1.0,  thunder: 0, convection: 0, overlay: 'smoke', label: 'Wildfire Smoke' },
  'forest-fire':    { cloudCover: 0.88, precipitation: 0,   windSpeed: 8,  visibility: 0.5,  thunder: 0, convection: 0, overlay: 'fire', label: 'Forest Fire' },
  'smoke':          { cloudCover: 0.80, precipitation: 0,   windSpeed: 4,  visibility: 1.5,  thunder: 0, convection: 0, overlay: 'smoke', label: 'Smoke' },
  'ash':            { cloudCover: 0.85, precipitation: 0,   windSpeed: 5,  visibility: 0.4,  thunder: 0, convection: 0, overlay: 'ash', label: 'Ash' },
  'haze':           { cloudCover: 0.35, precipitation: 0,   windSpeed: 3,  visibility: 5,   thunder: 0, convection: 0, overlay: 'haze', label: 'Haze' },
  'smog':           { cloudCover: 0.55, precipitation: 0,   windSpeed: 2,  visibility: 2,   thunder: 0, convection: 0, overlay: 'smoke', label: 'Smog' },
  'acid-rain':      { cloudCover: 0.80, precipitation: 12,  windSpeed: 6,  visibility: 5,   thunder: 0.2, convection: 0, precipitationType: 'rain', overlay: 'acid-rain', label: 'Acid Rain' },
  'flash-flood':    { cloudCover: 0.85, precipitation: 50,  windSpeed: 10, visibility: 2,   thunder: 0.4, convection: 0.5, precipitationType: 'rain', overlay: 'rain', label: 'Flash Flood' },

  // Astronomical / rare sky events
  'aurora':         { cloudCover: 0.20, precipitation: 0,   windSpeed: 2,  visibility: 45, thunder: 0, convection: 0, overlay: 'aurora', label: 'Aurora' },
  'eclipse':        { cloudCover: 0.10, precipitation: 0,   windSpeed: 2,  visibility: 45, thunder: 0, convection: 0, overlay: 'eclipse', label: 'Solar Eclipse' },
  'rainbow':        { cloudCover: 0.30, precipitation: 0,   windSpeed: 4,  visibility: 35, thunder: 0, convection: 0, overlay: 'rainbow', label: 'Rainbow' },
  'meteor-shower':  { cloudCover: 0.15, precipitation: 0,   windSpeed: 2,  visibility: 45, thunder: 0, convection: 0, overlay: 'meteors', label: 'Meteor Shower' },
  'meteor-impact':  { cloudCover: 0.25, precipitation: 0,   windSpeed: 6,  visibility: 30, thunder: 0.6, convection: 0, overlay: 'meteor-impact', label: 'Meteor Impact' },
  'asteroid-impact':{ cloudCover: 0.60, precipitation: 0,   windSpeed: 20, visibility: 10, thunder: 1.0, convection: 0.5, overlay: 'meteor-impact', label: 'Asteroid Impact' },

  // Geological / natural disaster events
  'earthquake':     { cloudCover: 0.50, precipitation: 0,   windSpeed: 4,  visibility: 20, thunder: 0, convection: 0, overlay: 'earthquake', label: 'Earthquake' },
  'tsunami':        { cloudCover: 0.85, precipitation: 0,   windSpeed: 15, visibility: 2,  thunder: 0.2, convection: 0, overlay: 'tsunami', label: 'Tsunami' },
  'volcanic-eruption': { cloudCover: 1.00, precipitation: 0, windSpeed: 12, visibility: 0.05, thunder: 0.8, convection: 0.9, overlay: 'volcano', label: 'Volcanic Eruption' },
  'landslide':      { cloudCover: 0.65, precipitation: 5,   windSpeed: 8,  visibility: 2,  thunder: 0, convection: 0, overlay: 'landslide', label: 'Landslide' },
  'mudslide':       { cloudCover: 0.70, precipitation: 15,  windSpeed: 10, visibility: 1,  thunder: 0, convection: 0, overlay: 'mudslide', label: 'Mudslide' },
  'avalanche':      { cloudCover: 0.80, precipitation: 8,   windSpeed: 12, visibility: 0.5, thunder: 0, convection: 0, precipitationType: 'snow', overlay: 'avalanche', label: 'Avalanche' },
  'rockfall':       { cloudCover: 0.40, precipitation: 0,   windSpeed: 6,  visibility: 5,  thunder: 0, convection: 0, overlay: 'rockfall', label: 'Rockfall' },
  'geological-event': { cloudCover: 0.55, precipitation: 0, windSpeed: 5,  visibility: 10, thunder: 0, convection: 0, overlay: 'earthquake', label: 'Geological Event' },

  // Fallback / testing
  'apocalypse':     { cloudCover: 1.00, precipitation: 80,  windSpeed: 40, visibility: 0.05, thunder: 1.0, convection: 1.0, precipitationType: 'rain', overlay: 'tornado', label: 'Apocalypse' },
};

// Merge key tables for lookup
const ALL_CONDITIONS = { ...KEY_TABLE, ...EXTREME_TABLE };

// ---------------------------------------------------------------------------
// Supplemental Canvas overlay effects for conditions the shader cannot
// directly render (tornado funnel, sand wall, ash fall, etc.).
// ---------------------------------------------------------------------------
class WeatherOverlay {
  constructor(container) {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'fx-overlay';
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1';
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.effect = null;
    this.t = 0;
    this.w = 0;
    this.h = 0;
    this.particles = [];
    this.lastTick = 0;
    // Keep the overlay cheap on the CPU v5: 0.5x DPR and 20 fps cap.
    this.dpr = Math.min(typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1, 1.5) * 0.5;
    this.fps = 20;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this._tick();
  }

  resize() {
    this.w = this.canvas.clientWidth || window.innerWidth;
    this.h = this.canvas.clientHeight || window.innerHeight;
    this.canvas.width = Math.floor(this.w * this.dpr);
    this.canvas.height = Math.floor(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  setEffect(effect) {
    this.effect = effect || null;
    this.t = 0;
    this.particles = [];
    // Pre-seed particles based on effect
    if (effect && ['clear-day','clear-night','sand','dust','ash','smoke','haze','snow-blizzard','volcano','landslide','mudslide','avalanche','rockfall','earthquake','tsunami','acid-rain','fire'].includes(effect)) {
      const count = {
        'clear-day': 35, 'clear-night': 60,
        sand: 300, dust: 250, ash: 200, smoke: 150, haze: 100, 'snow-blizzard': 400,
        volcano: 300, landslide: 250, mudslide: 300, avalanche: 400, rockfall: 200, earthquake: 250, tsunami: 0,
        'acid-rain': 120, fire: 150
      }[effect] || 300;
      for (let i = 0; i < count; i++) this.particles.push(this._newParticle(effect));
    }
    // Shake the whole widget container for earthquake-like events
    const ww = document.querySelector('.ww');
    if (ww) {
      ww.style.transition = 'none';
      ww.style.transform = '';
    }
  }

  _rand(a, b) { return a + Math.random() * (b - a); }

  _newParticle(effect) {
    const w = this.w, h = this.h;
    switch (effect) {
      case 'clear-day':
        return { x: this._rand(0, w), y: this._rand(0, h), r: this._rand(0.8, 2.2), v: this._rand(0.2, 0.6), vy: this._rand(-0.1, 0.1), op: this._rand(0.15, 0.35), life: this._rand(120, 240), type: 'clear-day' };
      case 'clear-night':
        return { x: this._rand(0, w), y: this._rand(0, h * 0.6), r: this._rand(0.6, 1.6), v: this._rand(0.05, 0.15), vy: this._rand(-0.03, 0.03), op: this._rand(0.25, 0.7), life: this._rand(80, 180), twinkle: this._rand(0.5, 1.2), phase: this._rand(0, Math.PI * 2), type: 'clear-night' };
      case 'sand': case 'dust':
        return { x: this._rand(-w, w), y: this._rand(0, h), r: this._rand(1, 3), v: this._rand(12, 25), vy: this._rand(-1, 1), op: this._rand(0.4, 0.9) };
      case 'ash':
        return { x: this._rand(0, w), y: this._rand(-h, 0), r: this._rand(1, 4), v: this._rand(2, 6), vy: this._rand(2, 8), op: this._rand(0.3, 0.8) };
      case 'smoke': case 'haze':
        return { x: this._rand(-w, w), y: this._rand(0, h), r: this._rand(20, 80), v: this._rand(4, 10), vy: this._rand(-0.5, 0.5), op: this._rand(0.05, 0.2), grow: this._rand(0.2, 0.8) };
      case 'snow-blizzard':
        return { x: this._rand(0, w), y: this._rand(-h, h), r: this._rand(1, 3), v: this._rand(18, 35), vy: this._rand(4, 10), op: this._rand(0.5, 0.95) };
      case 'volcano':
        return { x: this._rand(w * 0.45, w * 0.55), y: this._rand(h * 0.55, h * 0.75), r: this._rand(2, 6), v: this._rand(-2, 6), vy: this._rand(-6, -1), op: this._rand(0.4, 0.9), life: this._rand(20, 80) };
      case 'landslide': case 'mudslide':
        return { x: this._rand(-100, w), y: this._rand(-50, h * 0.6), r: this._rand(3, 10), v: this._rand(3, 10), vy: this._rand(2, 8), op: this._rand(0.5, 0.9) };
      case 'avalanche':
        return { x: this._rand(0, w), y: this._rand(-h, 0), r: this._rand(2, 6), v: this._rand(10, 25), vy: this._rand(8, 18), op: this._rand(0.5, 0.95) };
      case 'rockfall':
        return { x: this._rand(-50, w + 50), y: this._rand(-h * 0.5, 0), r: this._rand(3, 12), v: this._rand(-2, 4), vy: this._rand(4, 14), op: this._rand(0.5, 0.9), rot: this._rand(0, Math.PI * 2), rotv: this._rand(-0.2, 0.2) };
      case 'earthquake':
        return { x: this._rand(0, w), y: this._rand(h * 0.6, h), r: this._rand(1, 4), v: this._rand(-1, 1), vy: this._rand(-1, -3), op: this._rand(0.3, 0.7), life: this._rand(10, 50) };
      case 'acid-rain':
        return { x: this._rand(0, w), y: this._rand(0, h), len: this._rand(14, 28), v: this._rand(9, 16), op: this._rand(0.35, 0.75) };
      case 'fire':
        return { x: this._rand(0, w), y: this._rand(h * 0.55, h), r: this._rand(2, 7), v: this._rand(-1, 2), vy: this._rand(-3, -0.5), op: this._rand(0.4, 0.9), life: this._rand(20, 70) };
      default:
        return {};
    }
  }

  _tick(now) {
    const t = now || performance.now();
    const interval = 1000 / this.fps;
    if (t - this.lastTick < interval) {
      requestAnimationFrame((next) => this._tick(next));
      return;
    }
    this.lastTick = t - (t - this.lastTick) % interval;
    this.t++;
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);

    if (this.effect === 'tornado') this._drawTornado(ctx, w, h);
    else if (this.effect === 'hurricane') this._drawHurricane(ctx, w, h);
    else if (this.effect === 'lightning') this._drawLightningBolts(ctx, w, h);
    else if (this.effect === 'ice') this._drawIce(ctx, w, h);
    else if (this.effect === 'aurora') this._drawAurora(ctx, w, h);
    else if (this.effect === 'eclipse') this._drawEclipse(ctx, w, h);
    else if (this.effect === 'rainbow') this._drawRainbow(ctx, w, h);
    else if (this.effect === 'meteors') this._drawMeteors(ctx, w, h);
    else if (this.effect === 'meteor-impact') this._drawMeteorImpact(ctx, w, h);
    else if (this.effect === 'earthquake') this._drawEarthquake(ctx, w, h);
    else if (this.effect === 'tsunami') this._drawTsunami(ctx, w, h);
    else if (this.effect === 'volcano') this._drawVolcano(ctx, w, h);
    else if (this.effect === 'landslide') this._drawLandslide(ctx, w, h);
    else if (this.effect === 'mudslide') this._drawMudslide(ctx, w, h);
    else if (this.effect === 'avalanche') this._drawAvalanche(ctx, w, h);
    else if (this.effect === 'rockfall') this._drawRockfall(ctx, w, h);
    else if (this.effect === 'acid-rain') this._drawAcidRain(ctx, w, h);
    else if (this.effect === 'fire') this._drawFire(ctx, w, h);
    else if (this.effect === 'fog-bank') this._drawFogBank(ctx, w, h);
    else if (this.effect === 'clear-day') this._drawClearDay(ctx, w, h);
    else if (this.effect === 'clear-night') this._drawClearNight(ctx, w, h);
    else if (this.particles.length) this._drawParticles(ctx, w, h);

    requestAnimationFrame((next) => this._tick(next));
  }

  _drawTornado(ctx, w, h) {
    const cx = w * 0.5, baseY = h * 0.95;
    const swirl = this.t * 0.04;
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    const grad = ctx.createLinearGradient(cx, baseY, cx, 0);
    grad.addColorStop(0, 'rgba(20,20,25,0.9)');
    grad.addColorStop(0.45, 'rgba(60,60,70,0.5)');
    grad.addColorStop(1, 'rgba(120,120,130,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    for (let y = h; y >= 0; y -= 4) {
      const p = 1 - y / h;
      const width = 140 * (1 - p) + 12 * p;
      const wave = Math.sin(swirl + y * 0.03) * (10 * (1 - p) + 2);
      ctx.lineTo(cx + wave + width * 0.5, y);
    }
    for (let y = 0; y <= h; y += 4) {
      const p = y / h;
      const width = 140 * p + 12 * (1 - p);
      const wave = Math.sin(swirl + y * 0.03) * (10 * p + 2);
      ctx.lineTo(cx + wave - width * 0.5, y);
    }
    ctx.closePath();
    ctx.fill();
    // Debris ring near ground
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 40; i++) {
      const ang = swirl + i * 0.35;
      const r = 80 + Math.sin(this.t * 0.1 + i) * 20;
      const x = cx + Math.cos(ang) * r;
      const y = baseY - 20 + Math.sin(ang) * 10;
      ctx.fillStyle = `rgba(180,170,160,${0.3 + Math.random() * 0.3})`;
      ctx.beginPath(); ctx.arc(x, y, 1.5 + Math.random() * 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  _drawHurricane(ctx, w, h) {
    const cx = w * 0.5, cy = h * 0.45;
    const angle = this.t * 0.015;
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    // Outer spiral arms
    for (let arm = 0; arm < 4; arm++) {
      const armAngle = angle + arm * (Math.PI / 2);
      ctx.strokeStyle = 'rgba(60,60,70,0.35)';
      ctx.lineWidth = 18;
      ctx.beginPath();
      for (let r = 40; r < Math.max(w, h) * 0.8; r += 8) {
        const a = armAngle + r * 0.018;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (r === 40) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // Eye
    const eyeGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 45);
    eyeGrad.addColorStop(0, 'rgba(200,190,170,0.9)');
    eyeGrad.addColorStop(0.6, 'rgba(90,85,80,0.6)');
    eyeGrad.addColorStop(1, 'rgba(40,40,45,0)');
    ctx.fillStyle = eyeGrad;
    ctx.beginPath(); ctx.arc(cx, cy, 45, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  _drawLightningBolts(ctx, w, h) {
    if (Math.random() > 0.03) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = 'rgba(255,250,220,0.95)';
    ctx.lineWidth = 2 + Math.random() * 3;
    ctx.shadowColor = '#fff8c5'; ctx.shadowBlur = 20;
    const startX = this._rand(w * 0.2, w * 0.8);
    ctx.beginPath(); ctx.moveTo(startX, 0);
    let x = startX, y = 0;
    while (y < h * 0.6) {
      x += this._rand(-30, 30); y += this._rand(15, 40);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  _drawIce(ctx, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 30; i++) {
      const x = ((this.t * 0.5 + i * 137) % (w + 60)) - 30;
      const y = ((i * 79) % (h + 40)) - 20;
      const s = 8 + (i % 7);
      ctx.strokeStyle = `rgba(200,230,255,${0.15 + (i % 5) * 0.05})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let a = 0; a < 6; a++) {
        const ang = a * Math.PI / 3 + this.t * 0.02 + i;
        const r1 = s * 0.5, r2 = s;
        ctx.moveTo(x + Math.cos(ang) * r1, y + Math.sin(ang) * r1);
        ctx.lineTo(x + Math.cos(ang) * r2, y + Math.sin(ang) * r2);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawAurora(ctx, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    // Draw each aurora curtain as a soft ribbon confined to a limited band
    // height (not filled all the way to the bottom of the screen, which
    // previously looked like a solid green landmass instead of flowing
    // lights). Each ribbon is built from many thin, vertically-faded
    // segments so it reads as a luminous curtain of light.
    const ribbons = [
      { hue: 140, baseY: 0.16, amp: 55, speed: 0.015, thickness: 110 },
      { hue: 165, baseY: 0.26, amp: 70, speed: 0.011, thickness: 130 },
      { hue: 195, baseY: 0.36, amp: 50, speed: 0.02,  thickness: 90 },
    ];
    for (const rb of ribbons) {
      const baseY = h * rb.baseY;
      const step = 10;
      for (let x = 0; x <= w; x += step) {
        const y = baseY
          + Math.sin(x * 0.012 + this.t * rb.speed) * rb.amp
          + Math.sin(x * 0.004 + this.t * rb.speed * 0.6) * rb.amp * 0.6;
        const shimmer = 0.55 + 0.45 * Math.sin(x * 0.05 + this.t * 0.08);
        const grad = ctx.createLinearGradient(0, y - rb.thickness * 0.5, 0, y + rb.thickness * 0.5);
        grad.addColorStop(0, `hsla(${rb.hue}, 85%, 65%, 0)`);
        grad.addColorStop(0.5, `hsla(${rb.hue}, 85%, 65%, ${0.22 * shimmer})`);
        grad.addColorStop(1, `hsla(${rb.hue}, 85%, 65%, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(x, y - rb.thickness * 0.5, step + 2, rb.thickness);
      }
    }
    ctx.restore();
  }

  _drawEclipse(ctx, w, h) {
    const cx = w * 0.5, cy = h * 0.25, r = Math.min(w, h) * 0.12;
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    const grad = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.6);
    grad.addColorStop(0, 'rgba(255,240,200,0.9)');
    grad.addColorStop(0.5, 'rgba(255,220,120,0.4)');
    grad.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(10,10,12,0.85)';
    ctx.beginPath();
    ctx.arc(cx + r * 0.15, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  _drawRainbow(ctx, w, h) {
    const cx = w * 0.5, cy = h * 0.95, r = Math.min(w, h) * 0.75;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const colors = ['#ff0000','#ff7f00','#ffff00','#00ff00','#0000ff','#4b0082','#9400d3'];
    for (let i = 0; i < colors.length; i++) {
      const rr = r - i * 8;
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 7;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(cx, cy, rr, Math.PI, 0);
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawFogBank(ctx, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    // Layered, slowly drifting horizontal fog bands with soft vertical falloff
    // so it reads as a real ground-hugging fog bank rather than a flat tint.
    const bands = 5;
    for (let i = 0; i < bands; i++) {
      const yCenter = h * (0.25 + i * 0.16);
      const drift = Math.sin(this.t * 0.006 + i * 1.7) * 40;
      const bob = Math.sin(this.t * 0.01 + i) * 12;
      const grad = ctx.createLinearGradient(0, yCenter - 60 + bob, 0, yCenter + 60 + bob);
      grad.addColorStop(0, 'rgba(235,238,242,0)');
      grad.addColorStop(0.5, `rgba(235,238,242,${0.22 - i * 0.02})`);
      grad.addColorStop(1, 'rgba(235,238,242,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(drift - 100, 0, w + 200, h);
    }
    // Overall soft whiteout wash, heavier near the bottom (ground fog).
    const wash = ctx.createLinearGradient(0, 0, 0, h);
    wash.addColorStop(0, 'rgba(240,242,246,0.06)');
    wash.addColorStop(1, 'rgba(240,242,246,0.28)');
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  _drawParticles(ctx, w, h) {
    const effect = this.effect;
    ctx.save();
    if (effect === 'sand' || effect === 'dust') {
      ctx.fillStyle = effect === 'sand' ? 'rgba(194,160,120,' : 'rgba(160,150,130,';
      for (const p of this.particles) {
        p.x += p.v; p.y += p.vy;
        if (p.x > w + 50) { p.x = -50; p.y = this._rand(0, h); }
        ctx.globalAlpha = p.op;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      // Overall color wash
      ctx.globalAlpha = effect === 'sand' ? 0.25 : 0.18;
      ctx.fillStyle = effect === 'sand' ? '#c2a078' : '#a69b8a';
      ctx.fillRect(0, 0, w, h);
    } else if (effect === 'ash') {
      ctx.fillStyle = 'rgba(60,55,55,';
      for (const p of this.particles) {
        p.x += Math.sin(this.t * 0.02 + p.y * 0.01) * 0.5; p.y += p.vy;
        if (p.y > h + 10) { p.y = -10; p.x = this._rand(0, w); }
        ctx.globalAlpha = p.op;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = '#6b2e1d';
      ctx.fillRect(0, 0, w, h);
    } else if (effect === 'smoke' || effect === 'haze') {
      for (const p of this.particles) {
        p.x += p.v; p.y += p.vy; p.r += p.grow;
        if (p.x > w + p.r) { p.x = -p.r; p.y = this._rand(0, h); p.r = this._rand(20, 80); }
        const c = effect === 'smoke' ? '80,70,60' : '120,110,100';
        ctx.fillStyle = `rgba(${c},${p.op})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
    } else if (effect === 'snow-blizzard') {
      ctx.fillStyle = 'rgba(255,250,240,';
      for (const p of this.particles) {
        p.x += p.v; p.y += p.vy;
        if (p.x > w + 20) { p.x = -20; p.y = this._rand(0, h); }
        if (p.y > h + 20) { p.y = -20; p.x = this._rand(0, w); }
        ctx.globalAlpha = p.op;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
    } else if (effect === 'volcano') {
      // Handled in _drawVolcano for lava-bomb physics
    } else if (effect === 'landslide' || effect === 'mudslide') {
      // Handled in dedicated draw methods for slope flow
    } else if (effect === 'avalanche') {
      // Handled in _drawAvalanche
    } else if (effect === 'rockfall') {
      // Handled in _drawRockfall
    } else if (effect === 'earthquake') {
      // Handled in _drawEarthquake for screen shake + cracks
    }
    ctx.restore();
  }

  _drawMeteors(ctx, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = 'rgba(255,255,240,0.9)';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#fff'; ctx.shadowBlur = 6;
    for (let i = 0; i < 5; i++) {
      if (Math.random() > 0.25) continue;
      const x = this._rand(w * 0.1, w * 0.9);
      const y = this._rand(0, h * 0.4);
      const len = this._rand(40, 120);
      const ang = this._rand(Math.PI * 0.2, Math.PI * 0.8);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
      ctx.stroke();
    }
    ctx.restore();
  }

  _drawMeteorImpact(ctx, w, h) {
    ctx.save();
    const t = this.t;
    // Flash on initial impact frames
    if (t < 40) {
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = `rgba(255,240,200,${Math.max(0, 0.9 - t / 40)})`;
      ctx.fillRect(0, 0, w, h);
    }
    // Shockwave ring
    const ring = (t * 3) % 300;
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = 'rgba(255,220,160,0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.3, ring, 0, Math.PI * 2);
    ctx.stroke();
    // Falling fireball trail
    ctx.strokeStyle = 'rgba(255,160,60,0.85)';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#ff8a00'; ctx.shadowBlur = 15;
    const bx = w * 0.5 + t * 0.4, by = h * 0.3 + t * 0.9;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx - 40, by - 90);
    ctx.stroke();
    ctx.restore();
  }

  _drawEarthquake(ctx, w, h) {
    // Shake the whole .ww container via CSS transform
    const ww = document.querySelector('.ww');
    if (ww) {
      const shake = (Math.random() - 0.5) * 6;
      const shakeY = (Math.random() - 0.5) * 4;
      ww.style.transform = `translate(${shake}px, ${shakeY}px)`;
    }
    // Dust / debris particles
    ctx.save();
    ctx.fillStyle = 'rgba(120,110,100,';
    for (const p of this.particles) {
      p.x += p.v; p.y += p.vy; p.life--;
      if (p.life <= 0) { p.x = this._rand(0, w); p.y = this._rand(h * 0.7, h); p.life = this._rand(10, 50); }
      ctx.globalAlpha = p.op;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    // Ground cracks
    ctx.strokeStyle = 'rgba(30,25,20,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h); ctx.lineTo(w * 0.35, h * 0.82); ctx.lineTo(w * 0.5, h * 0.88); ctx.lineTo(w * 0.8, h);
    ctx.stroke();
    ctx.restore();
  }

  _drawTsunami(ctx, w, h) {
    ctx.save();
    // Dark storm sky wash
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(10,25,40,0.35)';
    ctx.fillRect(0, 0, w, h);
    // Massive water wall rising from bottom
    const waveH = h * 0.55 + Math.sin(this.t * 0.03) * 20;
    const grad = ctx.createLinearGradient(0, h - waveH, 0, h);
    grad.addColorStop(0, 'rgba(20,60,90,0.7)');
    grad.addColorStop(0.6, 'rgba(10,40,70,0.9)');
    grad.addColorStop(1, 'rgba(5,25,50,0.95)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 20) {
      const y = h - waveH + Math.sin(x * 0.02 + this.t * 0.06) * 25;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    // White foam crest
    ctx.strokeStyle = 'rgba(220,240,255,0.6)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 20) {
      const y = h - waveH + Math.sin(x * 0.02 + this.t * 0.06) * 25;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  _drawVolcano(ctx, w, h) {
    ctx.save();
    const cx = w * 0.5, peakY = h * 0.62;
    // Mountain silhouette
    ctx.fillStyle = 'rgba(20,15,12,0.95)';
    ctx.beginPath();
    ctx.moveTo(0, h); ctx.lineTo(cx, peakY); ctx.lineTo(w, h); ctx.closePath();
    ctx.fill();
    // Eruption column
    const grad = ctx.createRadialGradient(cx, peakY, 4, cx, peakY - 120, 90);
    grad.addColorStop(0, 'rgba(60,55,50,0.95)');
    grad.addColorStop(0.5, 'rgba(90,80,70,0.7)');
    grad.addColorStop(1, 'rgba(120,110,100,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(cx, peakY - 60, 100 + Math.sin(this.t * 0.05) * 20, 0, Math.PI * 2); ctx.fill();
    // Lava bombs / particles
    ctx.globalCompositeOperation = 'screen';
    for (const p of this.particles) {
      p.x += p.v; p.y += p.vy; p.vy += 0.15; // gravity
      if (p.y > h || p.life-- <= 0) {
        p.x = this._rand(w * 0.48, w * 0.52); p.y = this._rand(h * 0.58, h * 0.65);
        p.vy = this._rand(-6, -1); p.v = this._rand(-2, 4); p.life = this._rand(20, 80);
      }
      ctx.fillStyle = `rgba(255,${Math.floor(80 + Math.random() * 80)},30,${p.op})`;
      ctx.shadowColor = '#ff4500'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    // Ash fall overlay
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(80,70,65,0.18)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  _drawLandslide(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(90,75,55,';
    for (const p of this.particles) {
      p.x += p.v; p.y += p.vy;
      if (p.x > w + 50 || p.y > h + 50) { p.x = this._rand(-100, w); p.y = this._rand(-50, h * 0.5); }
      ctx.globalAlpha = p.op;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    // Slope flow
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#5c4a35';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.45); ctx.lineTo(w, h * 0.35); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  _drawMudslide(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(75,60,45,';
    for (const p of this.particles) {
      p.x += p.v * 1.2; p.y += p.vy * 1.2;
      if (p.x > w + 50 || p.y > h + 50) { p.x = this._rand(-100, w); p.y = this._rand(-50, h * 0.5); }
      ctx.globalAlpha = p.op;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#4a3b2a';
    ctx.fillRect(0, h * 0.5, w, h * 0.5);
    ctx.restore();
  }

  _drawAvalanche(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(245,245,255,';
    for (const p of this.particles) {
      p.x += p.v; p.y += p.vy;
      if (p.y > h + 20) { p.y = this._rand(-h, 0); p.x = this._rand(0, w); }
      ctx.globalAlpha = p.op;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    // Snow cascade sheet
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#e8eef5';
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(w, 0); ctx.lineTo(w, h * 0.55); ctx.lineTo(0, h * 0.65); ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  _drawRockfall(ctx, w, h) {
    ctx.save();
    ctx.fillStyle = 'rgba(90,85,80,';
    for (const p of this.particles) {
      p.x += p.v; p.y += p.vy; p.rot += p.rotv; p.vy += 0.2;
      if (p.y > h + 20) { p.y = this._rand(-h * 0.5, 0); p.x = this._rand(-50, w + 50); p.vy = this._rand(4, 14); }
      ctx.globalAlpha = p.op;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
      ctx.restore();
    }
    ctx.restore();
  }

  _drawAcidRain(ctx, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    // Toxic green-yellow tint wash
    ctx.fillStyle = 'rgba(160,180,60,0.15)';
    ctx.fillRect(0, 0, w, h);
    // Droplets
    for (const p of this.particles) {
      p.y += p.v;
      if (p.y > h + 20) { p.y = -10; p.x = this._rand(0, w); }
      ctx.strokeStyle = `rgba(200,230,80,${p.op})`;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 2, p.y + p.len); ctx.stroke();
    }
    ctx.restore();
  }

  _drawFire(ctx, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const p of this.particles) {
      p.x += p.v; p.y += p.vy; p.vy += 0.05; p.life--;
      if (p.life <= 0 || p.y < h * 0.3) {
        p.x = this._rand(w * 0.1, w * 0.9); p.y = this._rand(h * 0.7, h);
        p.vy = this._rand(-3, -0.5); p.v = this._rand(-1, 1); p.life = this._rand(20, 70);
      }
      const r = p.r * (p.life / 70);
      ctx.fillStyle = `rgba(255,${Math.floor(100 + Math.random() * 100)},30,${p.op})`;
      ctx.shadowColor = '#ff6b00'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
    }
    // Smoke haze overlay
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(60,55,50,0.2)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  _drawClearDay(ctx, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    for (const p of this.particles) {
      p.x += p.v; p.y += p.vy; p.life--;
      if (p.x > w + 20 || p.y < -20 || p.life <= 0) {
        p.x = this._rand(-20, w); p.y = this._rand(h * 0.2, h);
        p.v = this._rand(0.3, 0.8); p.vy = this._rand(-0.12, 0.12);
        p.life = this._rand(180, 360);
      }
      const tw = 0.7 + 0.3 * Math.sin(this.t * 0.05 + p.x * 0.01);
      ctx.globalAlpha = p.op * tw;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  _drawClearNight(ctx, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (const p of this.particles) {
      p.x += p.v; p.y += p.vy; p.life--;
      const tw = 0.5 + 0.5 * Math.sin(this.t * p.twinkle + p.phase);
      if (p.life <= 0 || p.y < -10 || p.x > w + 10) {
        p.x = this._rand(0, w); p.y = this._rand(h * 0.1, h * 0.7);
        p.v = this._rand(0.05, 0.15); p.vy = this._rand(-0.05, 0.05);
        p.life = this._rand(150, 320); p.twinkle = this._rand(0.08, 0.18);
        p.phase = this._rand(0, Math.PI * 2);
      }
      ctx.fillStyle = `rgba(255,245,220,${p.op * tw})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    // Occasional shooting star for clear nights
    if (Math.random() < 0.012) {
      const x = this._rand(w * 0.1, w * 0.9);
      const y = this._rand(0, h * 0.4);
      const len = this._rand(20, 60);
      const ang = this._rand(Math.PI * 0.25, Math.PI * 0.55);
      ctx.strokeStyle = 'rgba(255,245,220,0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x - Math.cos(ang) * len, y + Math.sin(ang) * len);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// ---------------------------------------------------------------------------
// Main wrapper class — same interface as the old WeatherFX.
// ---------------------------------------------------------------------------
export class WeatherAtmosphere {
  constructor(canvas, colors = {}, options = {}) {
    this.canvas = canvas;
    this.colors = colors;
    this.location = options.location || DEFAULT_LOCATION;
    this.timeOffsetMs = 0;
    this.forceDay = options.forceDay || false;
    this.forceNight = options.forceNight || false;
    this.currentKey = null;
    this.currentParams = null;
    this.overlayEffect = null;

    // Wrap the original canvas so the overlay can sit on top.
    const parent = canvas.parentElement;
    if (parent && !parent.querySelector('#fx-overlay')) {
      this.overlay = new WeatherOverlay(parent);
    }

    try {
      // Balance visual quality against the DAKboard CPU v5's limited GPU:
      // 0.55x res / 24 fps is noticeably crisper than the previous 0.4x/20fps
      // while still staying well short of full native resolution.
      this.sky = new Atmosphere(canvas, {
        time: this._now(),
        location: this.location,
        weather: WMO_ATMOSPHERE_TABLE[0],
        resolutionScale: 0.55,
        fps: 24,
        colorSpace: 'srgb',
        celestial: { bortle: 6, milkyWay: 0, meteors: 0 },
      });
    } catch (err) {
      console.error('Atmosphere initialization failed', err);
      this.sky = null;
    }
  }

  _now() {
    const now = new Date(Date.now() + this.timeOffsetMs);
    if (!this.forceDay && !this.forceNight) return now;
    // Lock the sky to local noon or midnight so the theme always matches the
    // page name, regardless of when the user is previewing it.
    const noon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    return this.forceDay ? noon : midnight;
  }

  setSunState(frac, elevation) {
    // Atmosphere uses real lat/lon/time. The old engine used synthetic frac
    // and elevation, but for the highest-quality sky we simply let Atmosphere
    // draw the real sky at the current moment. Calling this refreshes time so
    // the sun/moon arc creeps forward between full weather refreshes.
    if (this.sky) {
      this.timeOffsetMs = 0;
      this.sky.set({ time: this._now() });
    }
  }

  setCondition(key) {
    this.currentKey = key || 'clear-day';
    const def = ALL_CONDITIONS[this.currentKey] || WMO_ATMOSPHERE_TABLE[0];
    this.currentParams = { ...def };

    // Night keys get a slight nocturnal visibility adjustment automatically.
    if (this.currentKey.includes('night') && !this.currentParams.isNightAdjusted) {
      // Atmosphere handles day/night via time; no extra work needed.
    }

    // Ensure precipitationType is explicit.
    if (this.currentParams.precipitation > 0 && !this.currentParams.precipitationType) {
      this.currentParams.precipitationType = 'rain';
    }

    if (this.sky) {
      this.sky.set({
        time: this._now(),
        weather: {
          cloudCover: this.currentParams.cloudCover,
          precipitation: this.currentParams.precipitation,
          precipitationType: this.currentParams.precipitationType,
          windSpeed: this.currentParams.windSpeed,
          visibility: this.currentParams.visibility,
          thunder: this.currentParams.thunder || 0,
          convection: this.currentParams.convection || 0,
        }
      });
    }

    // Activate supplemental overlay for rare/extreme conditions.
    this.overlayEffect = this.currentParams.overlay || null;
    if (this.overlay) {
      this.overlay.setEffect(this.overlayEffect);
    }
  }

  // Allow setting live API values for higher fidelity.
  // NOTE: avoid `?.` / `??` here -- this file is loaded as a <script type="module">
  // on an embedded DAKboard device with an older WebView that does not support
  // that syntax, and a parse error in a module script silently kills the whole
  // module (the widget then freezes on "Loading..." forever with no visible error).
  setWeatherData(opts) {
    opts = opts || {};
    const fallback = this.currentParams || {};
    const cloudCover = opts.cloudCover;
    const precipitation = opts.precipitation;
    const windSpeed = opts.windSpeed;
    const visibility = opts.visibility;
    const thunder = opts.thunder;
    const precipitationType = opts.precipitationType;
    if (this.sky) {
      this.sky.set({
        time: this._now(),
        weather: {
          cloudCover: cloudCover != null ? cloudCover : (fallback.cloudCover != null ? fallback.cloudCover : 0),
          precipitation: precipitation != null ? precipitation : (fallback.precipitation != null ? fallback.precipitation : 0),
          windSpeed: windSpeed != null ? windSpeed : (fallback.windSpeed != null ? fallback.windSpeed : 2),
          visibility: visibility != null ? visibility : (fallback.visibility != null ? fallback.visibility : 45),
          thunder: thunder != null ? thunder : (fallback.thunder != null ? fallback.thunder : 0),
          precipitationType: precipitationType != null ? precipitationType : (fallback.precipitationType != null ? fallback.precipitationType : 'rain'),
        }
      });
    }
  }

  dispose() {
    if (this.sky) { this.sky.stop && this.sky.stop(); this.sky.dispose && this.sky.dispose(); }
    if (this.overlay) { this.overlay.canvas.remove(); }
  }
}

// Also expose for direct browser console / legacy use.
window.WeatherAtmosphere = WeatherAtmosphere;
