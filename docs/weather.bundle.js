(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // docs/atmosphere.js
  var CLOUD_GENERA = {
    cirrus: { label: "Cirrus", alias: "Mare's tail", abbr: "Ci", level: "high", form: "filament", opacity: 0.15 },
    cirrostratus: { label: "Cirrostratus", alias: "Veil cloud", abbr: "Cs", level: "high", form: "stratiform", opacity: 0.45 },
    cirrocumulus: { label: "Cirrocumulus", alias: "Mackerel sky", abbr: "Cc", level: "high", form: "granular", opacity: 0.25 },
    altostratus: { label: "Altostratus", alias: "Grey veil", abbr: "As", level: "mid", form: "stratiform", opacity: 0.9 },
    altocumulus: { label: "Altocumulus", alias: "Sheep cloud", abbr: "Ac", level: "mid", form: "granular", opacity: 0.45 },
    nimbostratus: { label: "Nimbostratus", alias: "Rain cloud", abbr: "Ns", level: "mid", form: "stratiform", opacity: 1 },
    stratus: { label: "Stratus", alias: "Fog cloud", abbr: "St", level: "low", form: "stratiform", opacity: 0.95 },
    stratocumulus: { label: "Stratocumulus", alias: "Roll cloud", abbr: "Sc", level: "low", form: "granular", opacity: 0.75 },
    cumulus: { label: "Cumulus", alias: "Cotton cloud", abbr: "Cu", level: "low", form: "convective", opacity: 0.4 },
    cumulonimbus: { label: "Cumulonimbus", alias: "Thunderhead", abbr: "Cb", level: "low", form: "convective", opacity: 0.28 }
  };
  var CLOUD_GENERA_IDS = Object.keys(CLOUD_GENERA);
  var clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
  function ramp(x, a, b) {
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  }
  function defaultCloudFeatures(cumulonimbus) {
    const cb = clamp01(cumulonimbus);
    return {
      anvil: ramp(cb, 0.68, 1),
      velum: ramp(cb, 0.22, 0.5) * (1 - ramp(cb, 0.68, 0.95))
    };
  }
  var NO_CLOUDS = {
    cirrus: 0,
    cirrostratus: 0,
    cirrocumulus: 0,
    altostratus: 0,
    altocumulus: 0,
    nimbostratus: 0,
    stratus: 0,
    stratocumulus: 0,
    cumulus: 0,
    cumulonimbus: 0
  };
  function resolveClouds(input) {
    var _a;
    if (input == null) return __spreadValues({}, NO_CLOUDS);
    if (typeof input === "string") return __spreadProps(__spreadValues({}, NO_CLOUDS), { [input]: 1 });
    if (Array.isArray(input)) {
      const mix2 = __spreadValues({}, NO_CLOUDS);
      for (const g of input) mix2[g] = 1;
      return mix2;
    }
    const mix = __spreadValues({}, NO_CLOUDS);
    for (const g of CLOUD_GENERA_IDS) mix[g] = clamp01((_a = input[g]) != null ? _a : 0);
    return mix;
  }
  function defaultCloudMix(cover, precipitation, convection, haze) {
    const c = clamp01(cover);
    const wet = clamp01(precipitation);
    const dry = 1 - wet;
    const visibleAloft = 1 - ramp(c, 0.45, 0.85);
    const stillLumpy = 1 - ramp(c, 0.5, 0.85);
    return {
      cirrus: ramp(c, 0.02, 0.45) * 0.7 * visibleAloft,
      cirrostratus: ramp(c, 0.1, 0.45) * 0.45 * visibleAloft,
      cirrocumulus: ramp(c, 0.14, 0.4) * 0.35 * visibleAloft * dry,
      altostratus: ramp(c, 0.55, 0.9) * 0.85 * dry,
      altocumulus: ramp(c, 0.22, 0.55) * 0.7 * (1 - ramp(c, 0.7, 0.95)) * dry,
      nimbostratus: wet * ramp(c, 0.5, 0.85),
      stratus: ramp(c, 0.5, 0.9) * haze * 0.9,
      stratocumulus: ramp(c, 0.3, 0.75) * 0.85 * (1 - wet * 0.7),
      cumulus: ramp(c, 0.03, 0.35) * stillLumpy * dry,
      // Cap convection by cloud cover. Cumulonimbus is itself a cloud, so a
      // towering cumulonimbus in a sky reported as zero cloud cover is a
      // contradiction.
      cumulonimbus: clamp01(convection) * ramp(c, 0.02, 0.25)
    };
  }
  function aggregateCover(mix) {
    let clear = 1;
    for (const g of CLOUD_GENERA_IDS) clear *= 1 - mix[g] * CLOUD_GENERA[g].opacity;
    return clamp01(1 - clear);
  }
  var DEFAULTS = {
    tau: 2.2,
    // keep translation subtle; let shape change in place (evo) carry the motion
    windBase: 6e-3,
    windGust: 0.22,
    evoBase: 0.07,
    evoGust: 0.09,
    windPerHour: 0.25,
    evoPerHour: 0.06
  };
  var TAU_2PI = Math.PI * 2;
  function copyNested(s) {
    return {
      filter: __spreadProps(__spreadValues({}, s.filter), { tint: [s.filter.tint[0], s.filter.tint[1], s.filter.tint[2]] }),
      tone: __spreadValues({}, s.tone),
      polarizer: __spreadValues({}, s.polarizer),
      celestial: __spreadProps(__spreadValues({}, s.celestial), { radiant: s.celestial.radiant ? [s.celestial.radiant[0], s.celestial.radiant[1]] : null }),
      clouds: __spreadValues({}, s.clouds),
      features: __spreadValues({}, s.features)
    };
  }
  function lerpWrapped(from, to, k, period) {
    const half = period / 2;
    const d = (to - from + period * 1.5) % period - half;
    return (from + d * k + period) % period;
  }
  var StateAnimator = class {
    constructor(initial, options = {}) {
      /** the current (interpolated) state. Pass this to renderer.render every frame */
      __publicField(this, "current");
      /**
       * Wind and shape evolution advance by integrating "speed × dt".
       * That keeps the integrated offset continuous even when the weather
       * changes and the speed changes with it, so the clouds never jump.
       */
      __publicField(this, "windOff", 41.7);
      // arbitrary seed, just to avoid starting at the origin
      __publicField(this, "evoOff", 7.3);
      __publicField(this, "opts");
      this.current = __spreadValues(__spreadValues({}, initial), copyNested(initial));
      this.opts = __spreadValues(__spreadValues({}, DEFAULTS), options);
    }
    get wind() {
      return this.windOff;
    }
    get evolution() {
      return this.evoOff;
    }
    /** Jump straight to the target, with no transition */
    jump(target) {
      Object.assign(this.current, target, copyNested(target));
    }
    /** Advance one frame. `dt` is in seconds */
    step(target, dt) {
      const o = this.opts;
      const c = this.current;
      const k = 1 - Math.exp(-dt / o.tau);
      const beforeTod = c.timeOfDay;
      c.timeOfDay = lerpWrapped(c.timeOfDay, target.timeOfDay, k, 24);
      const todStep = (c.timeOfDay - beforeTod + 36) % 24 - 12;
      c.sunElevation += (target.sunElevation - c.sunElevation) * k;
      c.sunAzimuth = lerpWrapped(c.sunAzimuth, target.sunAzimuth, k, TAU_2PI);
      c.cloudCover += (target.cloudCover - c.cloudCover) * k;
      for (const g of CLOUD_GENERA_IDS) {
        c.clouds[g] += (target.clouds[g] - c.clouds[g]) * k;
      }
      c.features.anvil += (target.features.anvil - c.features.anvil) * k;
      c.features.velum += (target.features.velum - c.features.velum) * k;
      c.rain += (target.rain - c.rain) * k;
      c.snow += (target.snow - c.snow) * k;
      c.wind += (target.wind - c.wind) * k;
      c.thunder += (target.thunder - c.thunder) * k;
      c.haze += (target.haze - c.haze) * k;
      const f = c.filter, tf = target.filter;
      f.amount += (tf.amount - f.amount) * k;
      f.saturation += (tf.saturation - f.saturation) * k;
      f.lift += (tf.lift - f.lift) * k;
      f.tint = [
        f.tint[0] + (tf.tint[0] - f.tint[0]) * k,
        f.tint[1] + (tf.tint[1] - f.tint[1]) * k,
        f.tint[2] + (tf.tint[2] - f.tint[2]) * k
      ];
      const tn = c.tone, tt = target.tone;
      tn.exposure += (tt.exposure - tn.exposure) * k;
      tn.contrast += (tt.contrast - tn.contrast) * k;
      tn.knee += (tt.knee - tn.knee) * k;
      tn.bleach += (tt.bleach - tn.bleach) * k;
      const pz = c.polarizer, pt = target.polarizer;
      pz.strength += (pt.strength - pz.strength) * k;
      pz.saturation += (pt.saturation - pz.saturation) * k;
      pz.stopLoss += (pt.stopLoss - pz.stopLoss) * k;
      pz.angle = lerpWrapped(pz.angle, pt.angle, k, Math.PI);
      const ce = c.celestial, ct = target.celestial;
      ce.bortle += (ct.bortle - ce.bortle) * k;
      ce.milkyWay += (ct.milkyWay - ce.milkyWay) * k;
      ce.meteors += (ct.meteors - ce.meteors) * k;
      ce.radiant = ct.radiant ? [ct.radiant[0], ct.radiant[1]] : null;
      this.windOff += (o.windBase + c.wind * o.windGust) * dt + Math.abs(todStep) * o.windPerHour;
      this.evoOff += (o.evoBase + c.wind * o.evoGust) * dt + Math.abs(todStep) * o.evoPerHour;
    }
  };
  var SRGB_TO_DISPLAY_P3 = [
    0.82246197,
    0.17753803,
    0,
    0.0331942,
    0.9668058,
    0,
    0.01708263,
    0.07239744,
    0.91051993
  ];
  function glslMat3(m) {
    const col = (j) => [m[j], m[j + 3], m[j + 6]].map((v) => v.toFixed(8)).join(", ");
    return `mat3(${col(0)},
       ${col(1)},
       ${col(2)})`;
  }
  var PERSEUS = [1.05, 0.79];
  var GEMINI = [0.98, 1.48];
  var CELESTIAL_PRESETS = {
    "dark-sky": { label: "Dark sky", bortle: 2, milkyWay: 1, meteors: 5, radiant: null },
    rural: { label: "Rural", bortle: 4, milkyWay: 0.45, meteors: 5, radiant: null },
    suburban: { label: "Suburban", bortle: 6, milkyWay: 0, meteors: 0, radiant: null },
    city: { label: "City", bortle: 8, milkyWay: 0, meteors: 0, radiant: null },
    perseids: { label: "Perseids", bortle: 3, milkyWay: 0.75, meteors: 100, radiant: PERSEUS },
    geminids: { label: "Geminids", bortle: 3, milkyWay: 0.75, meteors: 150, radiant: GEMINI }
  };
  var CELESTIAL_IDS = Object.keys(CELESTIAL_PRESETS);
  var DEFAULT_CELESTIAL = {
    bortle: 6,
    milkyWay: 0,
    meteors: 0,
    radiant: null
  };
  function milkyWayFromBortle(bortle) {
    return Math.min(1, Math.max(0, (5.5 - bortle) / 3.5));
  }
  function toCelestial(c) {
    return {
      bortle: c.bortle,
      milkyWay: c.milkyWay,
      meteors: c.meteors,
      radiant: c.radiant ? [c.radiant[0], c.radiant[1]] : null
    };
  }
  var clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  function resolveCelestial(input) {
    var _a, _b, _c, _d, _e;
    if (input == null) return toCelestial(DEFAULT_CELESTIAL);
    if (typeof input === "string") {
      return toCelestial((_a = CELESTIAL_PRESETS[input]) != null ? _a : DEFAULT_CELESTIAL);
    }
    const base = input.id ? (_b = CELESTIAL_PRESETS[input.id]) != null ? _b : DEFAULT_CELESTIAL : DEFAULT_CELESTIAL;
    const bortle = clamp((_c = input.bortle) != null ? _c : base.bortle, 1, 9);
    return toCelestial({
      bortle,
      // Only derive when the caller neither named a preset nor gave a value —
      // a preset's Milky Way is an authored choice and shouldn't be overwritten
      milkyWay: clamp(
        (_d = input.milkyWay) != null ? _d : input.id ? base.milkyWay : milkyWayFromBortle(bortle),
        0,
        1
      ),
      meteors: Math.max(0, (_e = input.meteors) != null ? _e : base.meteors),
      radiant: input.radiant !== void 0 ? input.radiant : base.radiant
    });
  }
  var FILTER_PRESETS = {
    none: { label: "None", amount: 0, tint: [1, 1, 1], saturation: 1, lift: 0 },
    sepia: { label: "Sepia", amount: 1, tint: [1.07, 0.93, 0.72], saturation: 0.1, lift: 0.02 },
    mono: { label: "Monochrome", amount: 1, tint: [1, 1, 1], saturation: 0, lift: 0 },
    faded: { label: "Faded", amount: 1, tint: [1.02, 0.99, 0.94], saturation: 0.35, lift: 0.06 },
    cyanotype: { label: "Cyanotype", amount: 1, tint: [0.72, 0.9, 1.12], saturation: 0.08, lift: 0.03 },
    gold: { label: "Gold", amount: 1, tint: [1.15, 0.95, 0.6], saturation: 0.45, lift: 0.02 },
    ash: { label: "Ash", amount: 1, tint: [0.92, 0.95, 1], saturation: 0.2, lift: 0.04 }
  };
  var FILTER_IDS = Object.keys(FILTER_PRESETS);
  var NO_FILTER = FILTER_PRESETS.none;
  function toFilter(f) {
    return {
      amount: f.amount,
      tint: [f.tint[0], f.tint[1], f.tint[2]],
      saturation: f.saturation,
      lift: f.lift
    };
  }
  function resolveFilter(input) {
    var _a, _b, _c, _d, _e, _f;
    if (input == null || input === false) return toFilter(NO_FILTER);
    if (input === true) return toFilter(FILTER_PRESETS.sepia);
    if (typeof input === "string") {
      return toFilter((_a = FILTER_PRESETS[input]) != null ? _a : NO_FILTER);
    }
    const base = input.id ? (_b = FILTER_PRESETS[input.id]) != null ? _b : NO_FILTER : { amount: 1, tint: [1, 1, 1], saturation: 0, lift: 0 };
    return toFilter({
      amount: (_c = input.amount) != null ? _c : base.amount,
      tint: (_d = input.tint) != null ? _d : base.tint,
      saturation: (_e = input.saturation) != null ? _e : base.saturation,
      lift: (_f = input.lift) != null ? _f : base.lift
    });
  }
  var POLARIZER_PRESETS = {
    none: { label: "None", strength: 0, angle: 0, saturation: 0, stopLoss: 0 },
    light: { label: "Light CPL", strength: 0.45, angle: 0, saturation: 0.2, stopLoss: 0 },
    strong: { label: "Strong CPL", strength: 0.85, angle: 0, saturation: 0.4, stopLoss: 0 },
    // rotated off the darkening axis: the 90°-from-sun band brightens instead.
    // Mostly useful for seeing what the filter is actually keyed to
    crossed: { label: "Crossed CPL", strength: 0.85, angle: Math.PI / 2, saturation: 0.1, stopLoss: 0 }
  };
  var POLARIZER_IDS = Object.keys(POLARIZER_PRESETS);
  var NO_POLARIZER = POLARIZER_PRESETS.none;
  function toPolarizer(p) {
    return { strength: p.strength, angle: p.angle, saturation: p.saturation, stopLoss: p.stopLoss };
  }
  var clamp012 = (v) => Math.min(1, Math.max(0, v));
  function resolvePolarizer(input) {
    var _a, _b, _c, _d, _e, _f;
    if (input == null || input === false) return toPolarizer(NO_POLARIZER);
    if (input === true) return toPolarizer(POLARIZER_PRESETS.light);
    if (typeof input === "string") return toPolarizer((_a = POLARIZER_PRESETS[input]) != null ? _a : NO_POLARIZER);
    const base = input.id ? (_b = POLARIZER_PRESETS[input.id]) != null ? _b : NO_POLARIZER : NO_POLARIZER;
    return toPolarizer({
      strength: clamp012((_c = input.strength) != null ? _c : base.strength),
      // left unwrapped: the animator interpolates it along the shorter arc over π
      // (a polarizer is symmetric every 180°), and wrapping here would fight that
      angle: (_d = input.angle) != null ? _d : base.angle,
      saturation: clamp012((_e = input.saturation) != null ? _e : base.saturation),
      stopLoss: clamp012((_f = input.stopLoss) != null ? _f : base.stopLoss)
    });
  }
  var RAD = Math.PI / 180;
  var DAY_MS = 864e5;
  var J1970 = 2440588;
  var J2000 = 2451545;
  var OBLIQUITY = 23.4397 * RAD;
  function solarPosition(date, loc) {
    const d = date.getTime() / DAY_MS - 0.5 + J1970 - J2000;
    const M = RAD * (357.5291 + 0.98560028 * d);
    const C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 3e-4 * Math.sin(3 * M));
    const L = M + C + RAD * 102.9372 + Math.PI;
    const dec = Math.asin(Math.sin(OBLIQUITY) * Math.sin(L));
    const ra = Math.atan2(Math.sin(L) * Math.cos(OBLIQUITY), Math.cos(L));
    const lw = RAD * -loc.longitude;
    const phi = RAD * loc.latitude;
    const H = RAD * (280.16 + 360.9856235 * d) - lw - ra;
    const elevation = Math.asin(
      Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H)
    );
    const azimuth = Math.atan2(
      Math.sin(H),
      Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi)
    ) + Math.PI;
    return { elevation, azimuth: (azimuth % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) };
  }
  function nominalSolarPosition(timeOfDay) {
    const phase = (timeOfDay - 6) / 12;
    return {
      elevation: Math.asin(Math.sin(phase * Math.PI) * 0.72),
      azimuth: Math.PI / 2 + phase * Math.PI
      // east → south → west
    };
  }
  function toDate(t) {
    if (t instanceof Date) return Number.isNaN(t.getTime()) ? null : t;
    if (typeof t === "string" && /\d{4}-\d{2}-\d{2}/.test(t)) {
      const d = new Date(t);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    return null;
  }
  function toTimeOfDay(t) {
    var _a;
    if (typeof t === "number") return (t % 24 + 24) % 24;
    const d = toDate(t);
    if (d) return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
    if (typeof t === "string") {
      const m = /^(\d{1,2})(?::(\d{2}))?/.exec(t.trim());
      if (m) return ((Number(m[1]) + Number((_a = m[2]) != null ? _a : 0) / 60) % 24 + 24) % 24;
    }
    return 12;
  }
  var TONE_PRESETS = {
    neutral: { label: "Neutral", exposure: 0, contrast: 1, knee: 0.8, bleach: 0 },
    flat: { label: "Flat", exposure: 0.15, contrast: 0.82, knee: 0.55, bleach: 0.25 },
    punch: { label: "Punch", exposure: -0.2, contrast: 1.22, knee: 0.85, bleach: 0.1 },
    filmic: { label: "Filmic", exposure: 0.1, contrast: 1.08, knee: 0.42, bleach: 0.55 },
    blown: { label: "Blown", exposure: 0.85, contrast: 0.95, knee: 0.7, bleach: 0.4 }
  };
  var TONE_IDS = Object.keys(TONE_PRESETS);
  var NEUTRAL_TONE = TONE_PRESETS.neutral;
  function toTone(t) {
    return { exposure: t.exposure, contrast: t.contrast, knee: t.knee, bleach: t.bleach };
  }
  function resolveTone(input) {
    var _a, _b, _c, _d, _e, _f;
    if (input == null) return toTone(NEUTRAL_TONE);
    if (typeof input === "string") return toTone((_a = TONE_PRESETS[input]) != null ? _a : NEUTRAL_TONE);
    const base = input.id ? (_b = TONE_PRESETS[input.id]) != null ? _b : NEUTRAL_TONE : NEUTRAL_TONE;
    return toTone({
      exposure: (_c = input.exposure) != null ? _c : base.exposure,
      contrast: (_d = input.contrast) != null ? _d : base.contrast,
      // a knee at 0 would put the shoulder on black; keep it off the floor
      knee: Math.min(0.99, Math.max(0.02, (_e = input.knee) != null ? _e : base.knee)),
      bleach: Math.min(1, Math.max(0, (_f = input.bleach) != null ? _f : base.bleach))
    });
  }
  var WEATHER_PRESETS = {
    clear: { label: "Clear", cloudCover: 0, windSpeed: 2, visibility: 45 },
    fair: { label: "Fair", cloudCover: 0.22, windSpeed: 3, visibility: 35 },
    summer: { label: "Summer sky", cloudCover: 0.38, windSpeed: 3, visibility: 25, convection: 0.7 },
    overcast: { label: "Overcast", cloudCover: 0.82, windSpeed: 5, visibility: 15 },
    fog: { label: "Fog", cloudCover: 0.75, windSpeed: 1, visibility: 0.6 },
    rain: { label: "Rain", cloudCover: 0.95, windSpeed: 7, visibility: 8, precipitation: 8, thunder: 0.08 },
    thunderstorm: { label: "Thunderstorm", cloudCover: 0.97, windSpeed: 12, visibility: 5, precipitation: 25, thunder: 1, convection: 0.5 },
    snow: { label: "Snow", cloudCover: 0.9, windSpeed: 3, visibility: 4, precipitation: 3, precipitationType: "snow" },
    typhoon: { label: "Typhoon", cloudCover: 1, windSpeed: 30, visibility: 6, precipitation: 40, thunder: 0.5 }
  };
  var WEATHER_IDS = Object.keys(WEATHER_PRESETS);
  var clamp013 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
  function precipCurve(mmPerHour) {
    return clamp013(Math.pow(clamp013(mmPerHour / 30), 0.55));
  }
  function windCurve(mps) {
    return clamp013(Math.pow(clamp013(mps / 33), 0.8));
  }
  function snowCurve(mmPerHour) {
    return clamp013(Math.pow(clamp013(mmPerHour / 5), 0.6));
  }
  function hazeCurve(km) {
    return clamp013(Math.pow(clamp013((20 - km) / 20), 2.6));
  }
  function resolveWeather(input) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    const w = typeof input === "string" ? (_a = WEATHER_PRESETS[input]) != null ? _a : WEATHER_PRESETS.clear : input != null ? input : {};
    const mm = (_b = w.precipitation) != null ? _b : 0;
    const isSnow = w.precipitationType === "snow";
    const rain = isSnow ? 0 : precipCurve(mm);
    const snow = isSnow ? snowCurve(mm) : 0;
    const haze = hazeCurve((_c = w.visibility) != null ? _c : 30);
    const convection = clamp013((_d = w.convection) != null ? _d : 0);
    let clouds;
    let cloudCover;
    if (w.clouds != null) {
      clouds = resolveClouds(w.clouds);
      cloudCover = aggregateCover(clouds);
    } else {
      cloudCover = clamp013((_e = w.cloudCover) != null ? _e : 0);
      clouds = defaultCloudMix(cloudCover, Math.max(rain, snow), convection, haze);
    }
    const auto = defaultCloudFeatures(clouds.cumulonimbus);
    return {
      clouds,
      features: {
        anvil: clamp013((_g = (_f = w.features) == null ? void 0 : _f.anvil) != null ? _g : auto.anvil),
        velum: clamp013((_i = (_h = w.features) == null ? void 0 : _h.velum) != null ? _i : auto.velum)
      },
      cloudCover,
      rain,
      snow,
      wind: windCurve((_j = w.windSpeed) != null ? _j : 0),
      thunder: clamp013((_k = w.thunder) != null ? _k : 0),
      haze
    };
  }
  var DEFAULT_CAMERA = {
    yaw: Math.PI,
    pitch: 0.46,
    fov: 0.86
  };
  var CUBE_FACE_CAMERAS = [
    { yaw: Math.PI / 2, pitch: 0, fov: Math.PI / 2 },
    // +X east
    { yaw: -Math.PI / 2, pitch: 0, fov: Math.PI / 2 },
    // -X west
    { yaw: 0, pitch: Math.PI / 2, fov: Math.PI / 2 },
    // +Y zenith
    { yaw: 0, pitch: -Math.PI / 2, fov: Math.PI / 2 },
    // -Y nadir
    { yaw: 0, pitch: 0, fov: Math.PI / 2 },
    // +Z north
    { yaw: Math.PI, pitch: 0, fov: Math.PI / 2 }
    // -Z south
  ];
  var DEFAULT_CONDITIONS = {
    time: 12,
    weather: "clear"
  };
  function resolveConditions(c) {
    var _a, _b;
    const time = (_a = c.time) != null ? _a : DEFAULT_CONDITIONS.time;
    const timeOfDay = toTimeOfDay(time);
    const date = toDate(time);
    const sun = c.location && date ? solarPosition(date, c.location) : nominalSolarPosition(timeOfDay);
    return __spreadProps(__spreadValues({
      timeOfDay,
      sunElevation: sun.elevation,
      sunAzimuth: sun.azimuth
    }, resolveWeather((_b = c.weather) != null ? _b : DEFAULT_CONDITIONS.weather)), {
      filter: resolveFilter(c.filter),
      tone: resolveTone(c.tone),
      polarizer: resolvePolarizer(c.polarizer),
      celestial: resolveCelestial(c.celestial)
    });
  }
  function resolveCamera(c) {
    return __spreadValues(__spreadValues({}, DEFAULT_CAMERA), c);
  }
  var VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;
  var GAMUT_REACH = 0;
  var FRAG = `
// highp is optional for fragment shaders in WebGL1. Without this guard the
// shader fails to compile outright on older mobile GPUs, and the sky silently
// disappears (available === false). Banding gets worse at mediump, but a
// degraded sky beats no sky.
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  u_res;
uniform float u_time;      // seconds
uniform vec3  u_cam;       // yaw, pitch, fov (radians)
uniform vec2  u_sun;       // sun's elevation, azimuth (radians)
uniform float u_cover;     // 0..1 total occlusion (accumulated from the cloud-genus mix)
uniform vec3  u_high;      // amount of the ten cloud genera: cirrus Ci, cirrostratus Cs, cirrocumulus Cc
uniform vec3  u_mid;       //                                 altostratus As, altocumulus Ac, nimbostratus Ns
uniform vec4  u_low;       //                                 stratus St, stratocumulus Sc, cumulus Cu, cumulonimbus Cb
uniform float u_rain;      // 0..1 rain
uniform float u_snow;      // 0..1 snow
uniform float u_wind;      // 0..1 wind
uniform float u_thunder;   // 0..1 thunder
uniform float u_haze;      // 0..1 haze
uniform vec2  u_cbFeat;    // cumulonimbus companion forms: anvil, veil
uniform float u_windOff;   // wind's integrated offset (speed\xD7dt accumulated on the CPU side)
uniform float u_evo;       // shape evolution's integrated offset (same idea)
uniform float u_filtAmt;   // color filter: strength
uniform vec3  u_filtTint;  //               white point
uniform float u_filtSat;   //               saturation kept
uniform float u_filtLift;  //               black lift
uniform float u_p3;        // 1 when the drawing buffer is Display P3, else 0
uniform float u_headroom;  // display ceiling in multiples of SDR white. 1 = SDR
uniform vec4  u_tone;      // tone curve: exposure (stops), contrast, knee, bleach
uniform vec4  u_pol;       // polarizer: strength, angle, saturation, stopLoss
uniform vec4  u_sky;       // celestial: bortle, milkyWay, meteors/hr, hasRadiant
uniform vec2  u_radiant;   // meteor radiant: elevation, azimuth (radians)

const float PI = 3.14159265;

// \u2500\u2500 Linear light \u2500\u2500
// Every color literal below is authored as an sRGB-encoded value (that is how
// they were hand-tuned), but compositing them in that space is wrong: mixing two
// gamma-encoded colors darkens the midpoint, and adding light is only additive in
// linear light. So each literal is decoded on the way in with L(), the whole
// composite runs in linear light, and the result is tone-mapped and re-encoded at
// the end.
//
// Two properties make this a small change rather than a rewrite:
//   - a mix()'s endpoints are preserved exactly; only midpoints move (that IS the fix)
//   - a multiplicative tint is exactly equivalent, since L(g*v) = L(g)*L(v) above
//     the knee \u2014 so every "* vec3(1.12, 0.92, 0.76)" style gain keeps its meaning
vec3 L(vec3 c) {
  c = max(c, 0.0);
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}
vec3 encodeSrgb(vec3 c) {
  c = max(c, 0.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

/**
 * An artistic overlay: a wash of the whole picture toward some color.
 *
 * Unlike adding light, this is not a physical process \u2014 it is a chosen
 * appearance, and every one of these was hand-tuned as a display-space blend. So
 * do the blend where it was authored and come back to linear. That keeps the
 * palette exactly as published while the additive light stays correct.
 */
vec3 overlay(vec3 lin, vec3 dispCol, float a) {
  return L(mix(encodeSrgb(lin), dispCol, a));
}

// How much light each source emits, in multiples of SDR white. Nowhere near
// physically right (the sun is ~10^5 SDR white); these are set to what reads
// correctly once the shoulder has them.
//
// SUN_LUM deliberately blooms wider than the pre-linear-light renderer did. That
// is not drift to be corrected \u2014 a sun you cannot look at is what the eye
// actually reports, and it was judged closer to perception than the old flat
// disc. Emission is the one place this pipeline is *meant* to depart from the
// published look; brightness that leaks in anywhere else is a bug.
//
// Raise u_headroom and this is the range they expand into.
const float SUN_LUM   = 12.0;
const float HALO_LUM  = 1.6;
const float FLASH_LUM = 6.0;
const float MOON_LUM  = 2.6;
const float STAR_LUM  = 2.5;

/**
 * Linear scene light \u2192 display.
 *
 * Scene-referred, so every stage here means what it says: the exposure is a
 * multiply, the contrast pivots on 18% grey, and the highlights desaturate the way
 * film does. None of that was expressible while compositing ran on gamma-encoded
 * values.
 *
 * The shoulder is identity below u_tone.z, so at the default knee of 0.8 only
 * blown highlights are shaped and the published look is untouched. Bring the knee
 * down to put the curve through the midtones \u2014 that is where it becomes a look.
 * The same shoulder is what expands into u_headroom when there is HDR to expand
 * into, so a curve dialled in today stays the curve later.
 */
vec3 tonemap(vec3 c) {
  const float PIVOT = 0.18;   // 18% grey, the photographic anchor

  c = max(c, 0.0) * exp2(u_tone.x);

  if (abs(u_tone.y - 1.0) > 0.001) {
    c = PIVOT * pow(max(c / PIVOT, 1e-5), vec3(u_tone.y));
  }

  float knee = u_tone.z;

  // bleach: as a pixel climbs toward the ceiling, pull it toward its own peak
  // channel. Keeps brightness, drops hue \u2014 so a blown sky goes white instead of
  // clipping into a muddy cast
  if (u_tone.w > 0.001) {
    float peak = max(max(c.r, c.g), c.b);
    float t = clamp((peak - knee) / max(1.0 - knee, 1e-4), 0.0, 1.0);
    c = mix(c, vec3(peak), t * u_tone.w);
  }

  // x/(1+x) shoulder, rescaled to start with slope 1 at the knee and approach
  // the headroom as x grows
  vec3 hi = max(c - knee, 0.0);
  float span = max(u_headroom - knee, 1e-4);
  return min(c, knee) + span * (hi / (span + hi));
}

/**
 * Degree of polarization of Rayleigh-scattered skylight along this view ray.
 *
 * sin(theta)^2 / (1 + cos(theta)^2) for scattering angle theta \u2014 zero straight at
 * the sun and straight away from it, peaking in the band 90 degrees off. Capped
 * below 1 because multiple scattering, aerosols and ground bounce all depolarize
 * a real sky; a clear high-altitude sky tops out near 0.75.
 */
float skyPolarization(vec3 rd, vec3 sunDir) {
  float ct = dot(rd, sunDir);
  return 0.75 * (1.0 - ct * ct) / (1.0 + ct * ct);
}

/**
 * Transmission through a circular polarizer, normalized so unpolarized light
 * passes unchanged (Malus's law with the filter's flat 50% loss factored out \u2014
 * u_pol.w reintroduces the real loss if asked for).
 *
 * Angle 0 is the crossed orientation, the one that kills the polarized component
 * and darkens the sky. Rotating by 90 degrees passes it instead and the same band
 * brightens, which is exactly what happens when you turn the ring on a real one.
 */
float polarizerTransmission(float dop, float ePhi) {
  float d = sin(ePhi - u_pol.y);
  float t = (1.0 - dop) + 2.0 * dop * d * d;
  t = mix(1.0, t, u_pol.x);
  return t * mix(1.0, 0.40, u_pol.w);   // 0.40 ~ the real 1.3-stop bite
}

// \u2500\u2500 Wide gamut \u2500\u2500
// Everything above is authored and composited as sRGB-encoded values, so the
// conversion is: decode with the sRGB transfer function, change primaries,
// re-encode with the same curve (Display P3 shares it). Matrix from gamut.ts.
const mat3 SRGB_TO_P3 = ${glslMat3(SRGB_TO_DISPLAY_P3)};

vec3 srgbToDisplayP3(vec3 c) {
  // clamp before every pow(): a negative base is undefined, and mix() computes
  // both branches, so one NaN would leak into the selected one
  c = max(c, 0.0);
  vec3 lin = mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
  lin = max(SRGB_TO_P3 * lin, 0.0);
  return mix(lin * 12.92, 1.055 * pow(lin, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, lin));
}

float hash11(float n) { return fract(sin(n) * 43758.5453123); }
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + vec2(17.3, 9.1);
    a *= 0.5;
  }
  return v;
}
float fbm4(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + vec2(17.3, 9.1);
    a *= 0.5;
  }
  return v;
}
// two octaves, for modulators that only need broad unevenness cheaply
float fbm2(vec2 p) {
  return vnoise(p) * 0.667 + vnoise(p * 2.03 + vec2(17.3, 9.1)) * 0.333;
}
// \u2500\u2500 Camera \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// World space is x=east, y=up, z=north. yaw=0 faces north; pitch>0 looks up.

vec3 viewRay(vec2 ndc, float yaw, float pitch, float fov, float aspect) {
  float t = tan(fov * 0.5);
  vec3 d = normalize(vec3(ndc.x * aspect * t, ndc.y * t, 1.0));
  float cp = cos(pitch), sp = sin(pitch);
  d = vec3(d.x, d.y * cp + d.z * sp, -d.y * sp + d.z * cp);
  float cy = cos(yaw), sy = sin(yaw);
  return normalize(vec3(d.x * cy + d.z * sy, d.y, -d.x * sy + d.z * cy));
}

// world direction \u2192 NDC. Positive z means in front of the screen (used for the lens flare's optical axis)
vec3 projectDir(vec3 d, float yaw, float pitch, float fov, float aspect) {
  float cy = cos(yaw), sy = sin(yaw);
  vec3 v = vec3(d.x * cy - d.z * sy, d.y, d.x * sy + d.z * cy);
  float cp = cos(pitch), sp = sin(pitch);
  v = vec3(v.x, v.y * cp - v.z * sp, v.y * sp + v.z * cp);
  float t = tan(fov * 0.5);
  float z = max(v.z, 1e-4);
  return vec3(v.x / (z * t * aspect), v.y / (z * t), v.z);
}

// view direction \u2192 a 2D coordinate for placing stars (folded onto a plane per cubemap face)
// an offset is added per face so neighboring faces don't share the same cell IDs
vec2 starGrid(vec3 d) {
  vec3 a = abs(d);
  if (a.x >= a.y && a.x >= a.z) return d.zy / a.x + vec2(d.x > 0.0 ? 11.0 : 23.0, 0.0);
  if (a.y >= a.z)               return d.xz / a.y + vec2(d.y > 0.0 ? 37.0 : 53.0, 0.0);
  return d.xy / a.z + vec2(d.z > 0.0 ? 71.0 : 97.0, 0.0);
}

// azimuth, elevation \u2192 unit direction vector
vec3 dirFromAngles(float elevation, float azimuth) {
  float ce = cos(elevation);
  return vec3(ce * sin(azimuth), sin(elevation), ce * cos(azimuth));
}

/**
 * The Milky Way, as a band around a fixed galactic pole.
 *
 * The renderer has no sidereal time \u2014 the star field is pinned to the view
 * direction, not to a rotating celestial sphere \u2014 so the galactic plane is a
 * fixed great circle too. Chosen to arc overhead at an angle that reads like a
 * summer sky rather than to match any particular date.
 *
 * Returns additive light, which is only correct because the composite is linear
 * now: a faint band over a near-black sky is exactly the case where adding in
 * gamma-encoded values goes wrong.
 */
float milkyWayBand(vec3 rd, float amt, out float bulgeOut, out float riftOut,
                   out float glowOut, out float baseOut) {
  bulgeOut = 0.0;
  riftOut = 0.0;
  glowOut = 0.0;
  baseOut = 0.0;
  if (amt < 0.001) return 0.0;
  const vec3 POLE = vec3(0.4338, 0.8073, 0.4000);
  float lat = asin(clamp(dot(rd, POLE), -1.0, 1.0));

  // a coordinate running ALONG the band, so structure can be stretched the way
  // a galaxy's is instead of being isotropic blobs
  vec3 e1 = normalize(cross(POLE, vec3(0.0, 1.0, 0.0)));
  vec3 e2 = cross(POLE, e1);
  float lon = atan(dot(rd, e2), dot(rd, e1));

  // The galactic-centre bulge: the band is not uniform along its length \u2014 one
  // stretch swells wide and bright, and the rest thins away from it. Chord
  // distance (2 sin(dl/2)) keeps the falloff periodic in lon with no seam.
  // -2.45 sits low in the default framing's field of view (measured, not
  // guessed), so the band reads brightest near the horizon and thins overhead.
  float dl = 2.0 * sin(0.5 * (lon + 2.45));
  float bulge = exp(-dl * dl * 2.2);
  bulgeOut = bulge;

  // width swells around the bulge (smaller exponent = wider profile) and the
  // whole band brightens there
  float w = mix(1.45, 0.70, bulge);
  float band = exp(-lat * lat * 30.0 * w) * 0.62 + exp(-lat * lat * 6.0 * w) * 0.38;
  band *= 0.40 + 1.05 * bulge;
  // the SMOOTH band, before the star-cloud structure and the dust: the star
  // grain follows this. Real star density varies gently along the band \u2014 the
  // patchiness the eye sees is absorption, which the rift term carries \u2014 and
  // driving the grain off the structured value instead punches holes of
  // missing stars into every dip of the glow
  baseOut = band * amt;

  // star clouds: two octaves, stretched along the band
  vec2 q = vec2(lon * 2.6, lat * 7.0);
  float structure = fbm4(q) * 0.62 + fbm(q * 3.4) * 0.38;
  band *= 0.30 + 1.25 * structure;

  // Dust, three scales. All of it lives close to the plane, so skip the whole
  // stack for the wide faint skirts of the profile.
  if (abs(lat) < 0.45) {
    // the Great Rift: one long dark lane running along the band past the bulge,
    // wandering off-axis, its width and depth uneven along its length. This is
    // deliberately a path in (lon, lat), not a threshold on isotropic noise \u2014
    // that is what keeps it reading as a rift and not as blobs. A second,
    // finer wobble roughens the shoulders so the edge reads torn, not drawn.
    float riftPath = (fbm2(vec2(lon * 1.1, 2.7)) - 0.5) * 0.24
                   + (fbm2(vec2(lon * 6.3, 4.4)) - 0.5) * 0.055;
    float riftHalf = 0.035 + 0.060 * fbm2(vec2(lon * 1.7, 8.9));
    float rp = (lat - riftPath) / riftHalf;
    float riftDepth = smoothstep(0.04, 0.50, bulge)
                    * (0.45 + 0.55 * fbm2(vec2(lon * 2.3, 15.1)));
    // exported: the dust sits in FRONT of the star field, so the star layers
    // multiply this in \u2014 a rift that only dims the glow floats behind the
    // stars. Faded with amt (saturating well below full) or the rift-hidden
    // stars would pop back the instant the Milky Way crosses zero
    riftOut = exp(-rp * rp) * riftDepth * min(amt * 2.0, 1.0);
    band *= 1.0 - 0.85 * riftOut;

    // Several soft irregular mid-scale lanes, not one drawn line \u2014 and their
    // latitude sheared by a longer noise so they cross the band at shifting
    // angles instead of stacking into corduroy parallel to it
    float laneLat = lat + (fbm2(vec2(lon * 3.1, 7.7)) - 0.5) * 0.16;
    float dust = fbm(vec2(lon * 1.9, laneLat * 5.5) + 11.0);
    float lanes = smoothstep(0.40, 0.66, dust) * smoothstep(0.20, 0.02, abs(laneLat));
    band *= 1.0 - 0.42 * lanes;

    // small-scale mottling, sheared against the band axis for the same reason:
    // the patchiness that keeps the bright parts from reading as an airbrush
    float mott = smoothstep(0.46, 0.80, fbm(vec2(lon * 4.6 + lat * 2.2, lat * 14.0) + 31.0))
               * smoothstep(0.28, 0.05, abs(lat));
    band *= 1.0 - 0.50 * mott;
  }

  // the bulge as light, not only as width: a broad band-shaped swelling for the
  // glow pass to add in the core color. Rift-cut here so it cannot fill the
  // dark lane back in
  glowOut = bulge * bulge * exp(-lat * lat * 7.0) * (1.0 - 0.75 * riftOut) * amt;

  return max(band, 0.0) * amt;
}


/**
 * One meteor from one independent stream. See meteorStreak for the rate maths.
 */
vec3 meteorOne(vec3 rd, float t, float rate, float hasRadiant, vec2 radiant, float seed) {
  const float CELL = 1.2;                       // seconds per slot
  // Fraction of the slot the head takes to cross its nominal span. It does not
  // stop there: BURN_IN..BURN_OUT is when it goes out, and it keeps travelling
  // the whole time. Halting it and then dimming \u2014 which is what this did at
  // first \u2014 reads exactly as "it stopped", because it did.
  const float FLIGHT = 0.22;
  const float BURN_IN = 0.72;                   // in units of the nominal flight
  const float BURN_OUT = 1.20;
  float slot = floor(t / CELL) + seed;
  float p = hash11(slot * 1.37);
  if (p > clamp(rate / 3600.0 * CELL, 0.0, 0.92)) return vec3(0.0);

  float ph = fract(t / CELL);
  float travel = ph / FLIGHT;                   // 1.0 at the nominal end, keeps rising
  if (travel > BURN_OUT) return vec3(0.0);

  float a = hash11(slot * 3.11) * 6.2831;
  float e = 0.12 + hash11(slot * 5.77) * 1.15;
  vec3 origin = dirFromAngles(e, a);
  vec3 dir;
  if (hasRadiant > 0.5) {
    vec3 rad = dirFromAngles(radiant.x, radiant.y);
    vec3 away = normalize(origin - rad * dot(origin, rad));
    origin = normalize(rad + away * (0.10 + hash11(slot * 7.3) * 0.35));
    // re-derive the tangent AT the moved origin. Reusing away would leave dir
    // non-orthogonal to origin, and the perp term below \u2014 which subtracts both
    // components \u2014 would then never reach zero, hiding the streak completely
    dir = normalize(origin - rad);
    dir = normalize(dir - origin * dot(dir, origin));
  } else {
    vec3 up = abs(origin.y) > 0.9 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
    vec3 rt = normalize(cross(up, origin));
    vec3 uu = cross(origin, rt);
    float th = hash11(slot * 9.13) * 6.2831;
    dir = normalize(rt * cos(th) + uu * sin(th));
  }

  float along = dot(rd, dir);
  float front = dot(rd, origin);
  if (front < 0.45) return vec3(0.0);
  float perp = length(rd - dir * along - origin * front);

  // how far it crosses, in radians. 0.58..1.06 is 33 to 61 degrees
  float span = 0.58 + hash11(slot * 11.7) * 0.48;
  float head = travel * span;                   // never clamped \u2014 it never halts
  float back = head - along;
  if (back < 0.0) return vec3(0.0);

  // the trail marks where the head has already been, so it grows out of nothing
  // rather than existing at full length on the first frame
  float maxTrail = span * 0.88;
  float trailLen = min(maxTrail, head);
  if (back > trailLen) return vec3(0.0);
  float u = back / max(trailLen, 1e-4);

  // near-constant width, about a pixel: any taper draws a wedge, and a wedge
  // reads as a comet. Brightness carries the shape instead
  float width = mix(0.0019, 0.0016, clamp(u, 0.0, 1.0));
  float core = exp(-(perp * perp) / (width * width));

  float u01 = clamp(u, 0.0, 1.0);
  float prof = smoothstep(0.0, 0.07, u01) * (1.0 - smoothstep(0.30, 1.0, u01));
  // decay on age, not position, so the tail is left behind rather than towed
  prof *= exp(-(back / max(span, 1e-4) * FLIGHT) * 3.2);

  // It burns out over a long, smooth ramp while still moving, so there is never a
  // frame where it is stationary and visible. Squared so the last of it goes
  // gently rather than stepping off.
  float burn = 1.0 - smoothstep(BURN_IN, BURN_OUT, travel);
  burn *= burn;
  float life = smoothstep(0.0, 0.035, ph) * burn;

  float hue = hash11(slot * 17.3);
  vec3 trailCol = hue < 0.38 ? vec3(0.62, 1.00, 0.70)
                : hue < 0.72 ? vec3(1.00, 0.88, 0.55)
                             : vec3(0.86, 0.92, 1.00);
  vec3 col = mix(trailCol, vec3(1.0), (1.0 - smoothstep(0.0, 0.30, u01)) * 0.7);

  return col * core * prof * life * (0.55 + 0.45 * hash11(slot * 13.9));
}

/**
 * Meteors \u2014 the same event machinery as lightning: chop the clock into slots,
 * hash each one, and fire if it clears the threshold.
 *
 * Drawn in ray space, so a meteor stays where it is in the sky while the view
 * swings rather than being glued to the frame.
 *
 * zhr is a real ZHR, and a ZHR is defined for an observer watching the *whole
 * sky*. A 49-degree frame covers under a tenth of it, so an honest ZHR 100 puts
 * roughly one meteor in shot every few minutes \u2014 correct, and useless as a
 * control. What was actually wrong was the ceiling: one meteor per slot capped
 * the whole-sky rate no matter how high the number went. Several independent
 * streams run in parallel now, each carrying its share, so the rate means
 * something across the range and more than one can be in the air at once (which
 * is what shower photographs show anyway).
 */
vec3 meteorStreak(vec3 rd, float t, float zhr, float hasRadiant, vec2 radiant) {
  if (zhr < 0.01) return vec3(0.0);
  const int STREAMS = 4;
  vec3 total = vec3(0.0);
  for (int k = 0; k < STREAMS; k++) {
    float fk = float(k);
    // offset each stream's clock and its hash, or all four fire together
    total += meteorOne(rd, t + fk * 0.31, zhr / float(STREAMS), hasRadiant, radiant, fk * 131.7);
  }
  return total;
}




// \u2500\u2500 Clouds \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// cloud field density and lit-ness (x=density 0..1, y=lit-ness -1..1, z=raw density value)
// the difference against a resample shifted slightly toward the sun becomes lit/shadowed
vec3 cloudField(vec2 cuv, float churn, vec2 ldir, float edge, float ramp) {
  // shape evolution: the warp field itself drifts slowly, so the silhouette
  // crumbles and reassembles over time
  // (u_evo is integrated on the CPU side, so the offset doesn't jump even when the wind picks up)
  vec2 q = cuv + (0.30 + churn * 0.34) * vec2(
    fbm(cuv * 1.6 + u_evo),
    fbm(cuv * 1.6 - u_evo * 0.8)
  );
  // detail drifts at a different speed from the base, so edges erode and reform gradually.
  // rides u_evo rather than u_time: the CPU integrates it, so the phase
  // survives u_time's wrap, and the rate follows the wind like the rest of
  // the cloud motion (the factors reproduce the old u_time \xD7 0.026 / 0.017
  // at light wind)
  vec2 drift = vec2(u_evo * 0.33, -u_evo * 0.21);
  float base = fbm(q);
  float detail = fbm(q * 3.3 + 17.0 + drift);
  float dcomb = (base * 0.72 + detail * 0.28 - 0.5) * 2.2 + 0.5;
  float den = smoothstep(edge - 0.01, edge + ramp, dcomb);
  vec2 ql = q + ldir * 0.16;
  float dl = fbm(ql) * 0.72 + fbm(ql * 3.3 + 17.0 + drift) * 0.28;
  // \xD74 saturates immediately into flat blocks of light and dark, so keep it gentle
  float lit = clamp((dcomb - dl) * 2.5, -1.0, 1.0);
  return vec3(den, lit, dcomb);
}

// \u2500\u2500 Forms of the ten cloud genera \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// The ten genera reduce to "4 forms (filament/stratiform/granular/convective)
// \xD7 3 altitudes". Altitude is handled by the cloud plane's projection scale;
// per-genus differences are the parameters passed to the functions below.
// Convective forms (cumulus/cumulonimbus) aren't a plane, so each is built
// inline in the body instead.

// intersection of the view ray with a cloud plane at altitude alt. Higher clouds make same-size lumps look smaller
vec2 planeUV(vec3 rd, float rdY, float alt, float wind) {
  return rd.xz / rdY * alt + vec2(wind, wind * 0.15);
}

// Stratiform (cirrostratus / altostratus / nimbostratus / stratus) \u2014 sheet-like clouds.
//
// Higher clouds look flatter, but a thick low-hanging layer (nimbostratus)
// shows a belly of "boundary-less mass sagging and undulating". turb is
// that strength. Raising breakup opens up gaps. Return value: x=coverage,
// y=thickness (0=thin, 1=thick)
vec2 stratiform(vec2 uv, float breakup, float turb) {
  vec2 q = uv + vec2(u_evo * 0.15, 0.0);
  float d;
  if (turb > 0.001) {
    // domain-warp to let the mass sag, and add detail at another scale for a smoke-like skin
    q += turb * 1.15 * vec2(fbm4(uv * 0.60 + u_evo * 0.35),
                            fbm4(uv * 0.60 + 9.0 - u_evo * 0.28));
    float n = fbm(q);
    d = mix(n, n * 0.66 + fbm(q * 2.7 + 11.0) * 0.34, turb);
  } else {
    d = fbm4(q);
  }
  // fbm's values cluster toward the middle, so the thickness threshold needs
  // to be narrow or the shading goes dull
  return vec2(mix(1.0, smoothstep(0.34, 0.70, d), breakup),
              smoothstep(0.34, 0.68, d));
}

// Granular (cirrocumulus / altocumulus / stratocumulus) \u2014 mackerel sky, sheep clouds, roll clouds.
//
// What defines these three's look is "grains of a consistent size, placed
// irregularly". Arranging grains on a grid is too regular and reads as
// wallpaper; using fbm mixes large and small grains into cumulus instead.
// **Thresholding a single noise octave** is the sweet spot: one consistent
// feature size, with placement that's irregular the way noise is.
//
// Raising pack makes grains bigger and denser, merging into a mottled
// pattern. roll < 1 stretches them into rolls. Return value: x=coverage, y=lit-ness (-1..1)
vec2 granular(vec2 uv, float pack, float roll, float patch, vec2 ldir) {
  // slowly reshuffle the arrangement of grains
  vec2 q = uv * vec2(1.0, roll)
         + 0.7 * vec2(vnoise(uv * 0.22 + u_evo * 0.20),
                      vnoise(uv * 0.22 + 17.0 - u_evo * 0.16));
  float n  = vnoise(q) * 0.72 + vnoise(q * 2.1 + 5.0) * 0.28;
  // fraying at the edge. Thresholding a single noise octave alone gives a
  // smooth curved boundary, reading as spilled milk rather than cloud.
  // Add high frequency at small amplitude to break it up.
  float fineN = fbm4(q * 5.0);
  n += (fineN - 0.47) * 0.17;

  // keep the threshold band narrow. Too wide and the edge bleeds endlessly
  // into a formless smudge
  float e0 = 0.62 - pack * 0.24;
  float cell = smoothstep(e0, e0 + 0.11, n);
  // grains gather sparsely into "flocks". Filling uniformly gives the whole
  // sky the same face everywhere. Raising patch merges the flocks into one
  // mottled sheet covering the sky (stratocumulus)
  float f = fbm4(uv * 0.16 + 21.0);
  cell *= smoothstep(mix(0.34, 0.02, patch), mix(0.68, 0.38, patch), f);

  // lit-ness: the difference against density resampled shifted toward the sun (per-grain shading)
  vec2 ql = q + ldir * 0.35;
  float nl = vnoise(ql) * 0.72 + vnoise(ql * 2.1 + 5.0) * 0.28;
  float lit = (n - nl) * 4.0;
  // fine surface grain, taken from the same field that frays the edge
  lit += (fineN - fbm4((q + ldir * 0.12) * 5.0)) * 2.4;
  return vec2(cell, clamp(lit, -1.0, 1.0));
}

// Filament (cirrus) \u2014 a stroke swept by a brush.
// Stretch strongly along the wind direction (uv's x-axis), and bend it with
// low frequency across the perpendicular direction for a flowing look
float filament(vec2 uv) {
  float bend = fbm4(uv * vec2(0.30, 0.85)) - 0.5;
  vec2 q = uv + vec2(0.0, bend * 1.5);
  float f = smoothstep(0.46, 0.76, fbm(q * vec2(0.30, 3.2)));
  return f * smoothstep(0.32, 0.62, fbm4(uv * 0.20 + 13.0));   // sparseness of the strands
}

// A cluster of round lobes (the cauliflower texture of cumulus/cumulonimbus).
//
// As long as noise is cut with a threshold, the boundary is fractal at every
// scale. Dropping octaves smooths it, but never makes it round (it just
// becomes a formless, meandering shape). Cutting a sum of jittered spheres
// on a grid, on the other hand, always gives a boundary made of overlapping
// circular arcs. Real cumulus silhouettes look like "arcs joined together"
// precisely because they *are* a cluster of risen bubbles \u2014 this construction
// mirrors that origin directly.
float blobs(vec2 p, float radius) {
  vec2 ip = floor(p), fp = fract(p);
  float sum = 0.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = vec2(hash12(ip + g), hash12(ip + g + 31.7));
      float r = radius * (0.60 + 0.70 * hash12(ip + g + 7.3));
      vec2 d = g + o - fp;
      float q = max(1.0 - dot(d, d) / (r * r), 0.0);
      sum += q * q;   // squaring smooths the falloff at the edge
    }
  }
  return sum;
}

// lens-flare ghost (a soft disc)
float ghost(vec2 p, vec2 pos, float r, float aspect) {
  float d = length((p - pos) * vec2(aspect, 1.0));
  return smoothstep(r, r * 0.4, d);
}

// cloud color (lighting shared by every layer)
vec3 cloudColor(float den, float lit, float thick, float dayF, float nightF, float sunsetF,
                float flash, float gloom, float darkMul, vec3 cloudSun) {
  // under full overcast there's no direct sunlight, only diffuse light:
  // weaken the lit/shadow contrast, the base shadow, and the silver lining together
  float diffuse = smoothstep(0.55, 0.95, u_cover);
  float litE = lit * (1.0 - diffuse * 0.75);
  vec3 ambient = mix(vec3(0.035, 0.045, 0.07), vec3(0.68, 0.73, 0.82), dayF);
  // magic hour: the sky's afterglow tints clouds a faint pink even after sunset
  ambient += vec3(0.30, 0.17, 0.13) * sunsetF * (1.0 - dayF);
  // sunset colors linger on clouds right after sundown too
  float sunAmt = max(dayF, sunsetF * 0.55);
  // the lit face
  vec3 c = ambient + cloudSun * sunAmt * (0.42 + 0.45 * litE);
  // shadow from thickness: instead of a flat grey, sink smoothly into a
  // blue-tinted shadow color (ambient light from the sky) as thickness increases
  float sh = thick * (0.62 - diffuse * 0.28) * darkMul;
  sh *= 0.75 + 0.25 * (1.0 - litE);   // the sun-facing side has a shallower shadow
  vec3 shadowCol = ambient * vec3(0.50, 0.54, 0.64) + vec3(0.02, 0.03, 0.05);
  c = mix(c, shadowCol, clamp(sh, 0.0, 0.85));
  // night: a faint glow from moonlight
  c += vec3(0.10, 0.12, 0.18) * nightF * (0.3 + 0.4 * litE);
  // silver lining (the edge glows on the sun side \u2014 only with direct light)
  float rim = den * (1.0 - den) * 4.0 * max(litE, 0.0) * (1.0 - diffuse);
  c += cloudSun * rim * 0.35 * max(dayF, sunsetF * 0.5);
  // severe-weather clouds: a torn, leaden grey
  c = mix(c, vec3(0.09, 0.10, 0.12) + vec3(0.10) * dayF, gloom * 0.85);
  // lightning flickers inside the cloud
  c += flash * vec3(0.75, 0.8, 1.0) * (0.35 + den * 0.65);
  return c;
}

void main() {
  vec2 p = gl_FragCoord.xy / u_res;          // 0..1 (y is up)
  float aspect = u_res.x / u_res.y;

  // \u2500\u2500 Lens droplets (rain only. Refract the UV before deciding the view direction, distorting the image itself) \u2500\u2500
  float dropAmt = smoothstep(0.05, 0.5, u_rain);
  float dropMask = 0.0;
  if (dropAmt > 0.001) {
    vec2 dg = p * vec2(aspect, 1.0) * 4.0;
    vec2 cell = floor(dg);
    float rc = hash12(cell);
    // attaches occasionally over a long cycle, lingers a while, then dries
    float cyc = u_time * 0.05 + rc * 9.0;
    float phase = fract(cyc);
    float active = step(0.6, hash12(cell + floor(cyc) * 0.618));
    float life = smoothstep(0.0, 0.04, phase) * smoothstep(0.55, 0.30, phase);
    vec2 dpos = vec2(0.25) + 0.5 * vec2(hash12(cell + 11.1), hash12(cell + 23.3));
    vec2 dv = fract(dg) - dpos;
    float r = 0.05 + hash12(cell + 31.7) * 0.08;
    float inside = smoothstep(r, r * 0.6, length(dv));
    float str = inside * life * active * dropAmt;
    p += dv * str * 2.2;
    dropMask = max(dropMask, str);
  }

  // \u2500\u2500 View ray \u2500\u2500
  vec3 rd = viewRay(p * 2.0 - 1.0, u_cam.x, u_cam.y, u_cam.z, aspect);
  float el = asin(clamp(rd.y, -1.0, 1.0));
  float h = clamp(el / (PI * 0.5), 0.0, 1.0);   // horizon=0, zenith=1

  // \u2500\u2500 Sun and day/night \u2500\u2500
  vec3 sunDir = dirFromAngles(u_sun.x, u_sun.y);
  float sunEl = sunDir.y;                      // sine of elevation, -1..1
  float dayF = smoothstep(-0.12, 0.25, sunEl);
  float nightF = 1.0 - dayF;
  float sunsetF = smoothstep(0.35, 0.02, abs(sunEl));

  // \u2500\u2500 Severity of the weather (rebuilt from rain/snow/wind instead of the old "storm") \u2500\u2500
  float gloom = clamp(max(u_rain, max(u_snow * 0.5, u_wind * 0.7)), 0.0, 1.0);
  float churn = clamp(u_wind * 0.9 + u_rain * 0.3, 0.0, 1.0);

  // \u2500\u2500 Base sky gradient \u2500\u2500
  // These four and the two ramps below stay display-encoded: the gradient was
  // hand-tuned as a straight line in that space, and a straight line in linear
  // light is a different curve (measurably ~+28/255 brighter at the midpoint).
  // Interpolate where it was authored, then decode once into the scene.
  vec3 dayZen  = vec3(0.10, 0.34, 0.74);      // deep summer blue
  vec3 dayHor  = vec3(0.66, 0.83, 0.96);
  vec3 nightZen = vec3(0.010, 0.018, 0.048);
  vec3 nightHor = vec3(0.045, 0.065, 0.115);
  vec3 zen = mix(nightZen, dayZen, dayF);
  vec3 hor = mix(nightHor, dayHor, dayF);
  // the approach to zenith color should look like scattering: saturate it
  // exponentially against elevation
  // (the top of the screen isn't the zenith, so holding this in screen
  // coordinates would make the blue shallower depending on framing)
  vec3 sky = L(mix(hor, zen, 1.0 - exp(-max(el, 0.0) * 2.6)));

  // How much this pixel should reach past sRGB, accumulated by the sections
  // below (magic hour, stars, moon, sun, lightning) and spent at the very end.
  // Only saturated light sources claim it \u2014 the clouds deliberately don't, since
  // their sunlit edges are small and high-frequency and widening them would
  // harden the outline.
  //
  // Invariant: a claim is the *fraction of the pixel that source contributes* \u2014
  // the same weight it composites with, bleed factors included. Claim more and
  // you widen whatever lies underneath: exp(-sunAng * 4.0) alone still reads 0.1
  // a third of a radian out, which drags a whole quadrant of plain blue sky with
  // the sun.
  float wide = 0.0;

  // magic hour: the horizon in the sun's direction turns amber, the sky above turns mauve
  // (since this looks at a compass direction, facing away shows an unlit sky)
  float towardSun = clamp(dot(normalize(vec3(rd.x, 0.0, rd.z) + 1e-5),
                              normalize(vec3(sunDir.x, 0.0, sunDir.z) + 1e-5)), -1.0, 1.0);
  float sunSide = 0.35 + 0.65 * smoothstep(-0.4, 1.0, towardSun);
  vec3 warm = vec3(1.0, 0.47, 0.22);
  vec3 mauve = vec3(0.45, 0.28, 0.45);
  sky = overlay(sky, warm, sunsetF * smoothstep(0.55, 0.0, h) * 0.55 * sunSide);
  sky = overlay(sky, mauve, sunsetF * smoothstep(0.10, 0.50, h) * 0.35);
  wide = max(wide, sunsetF * smoothstep(0.55, 0.0, h) * sunSide * 0.5);

  // \u2500\u2500 Circular polarizer \u2500\u2500
  // Applied here on purpose: this is the scattered skylight, and it is the only
  // thing a CPL acts on. Everything composited after this point \u2014 clouds (Mie
  // scattering, essentially unpolarized), the sun, the moon, the stars \u2014 is
  // direct or depolarized light and passes through untouched. That ordering is
  // what makes the clouds "pop": the sky behind them drops and they do not.
  float dop = skyPolarization(rd, sunDir);
  if (u_pol.x > 0.001) {
    // The e-vector is perpendicular to the scattering plane, so it already lies
    // across the view ray; measure its angle in the frame's own basis, or the
    // filter would not track the camera as it swings.
    vec3 fwd = dirFromAngles(u_cam.y, u_cam.x);
    vec3 camRight = normalize(cross(vec3(0.0, 1.0, 0.0), fwd) + vec3(1e-6, 0.0, 0.0));
    vec3 camUp = cross(fwd, camRight);
    vec3 e = normalize(cross(rd, sunDir) + vec3(1e-6));
    float ePhi = atan(dot(e, camUp), dot(e, camRight));

    sky *= polarizerTransmission(dop, ePhi);

    // the veil a polarizer removes is multiply-scattered white light, so what
    // survives reads more saturated than the darkening alone would explain.
    // dot() against the Rec.709 coefficients is a real luminance here \u2014 in the
    // old gamma-encoded pipeline it never was
    if (u_pol.z > 0.001) {
      float lum = dot(sky, vec3(0.2126, 0.7152, 0.0722));
      sky = max(mix(vec3(lum), sky, 1.0 + u_pol.z * dop * u_pol.x), 0.0);
    }
  }

  // overcast: the sky's blue drains toward a bright grey (including the sky peeking through gaps)
  float overcastSky = smoothstep(0.5, 0.95, u_cover);
  sky = overlay(sky, mix(vec3(0.050, 0.055, 0.070), vec3(0.70, 0.73, 0.76), dayF), overcastSky * 0.85);

  // severe weather: darken the whole sky to a leaden grey
  sky = overlay(sky, vec3(0.16, 0.18, 0.21) * (0.25 + 0.75 * dayF), gloom * 0.75);

  // \u2500\u2500 Stars (night, low cloud. Determined by direction, so they stay pinned to the celestial sphere as the view swings) \u2500\u2500
  {
    // fold the view direction onto a cubemap-like 2D grid.
    // pulling from a 3D grid leaves most lattice points off the sphere the
    // view ray actually passes through, so almost no stars show up
    vec2 sg = starGrid(rd) * 62.0;
    vec2 cell = floor(sg);
    float sr = hash12(cell);
    // Nearly the full cell. At the old +/-0.25 every star sat in the middle of its
    // own cell, which reads as a lattice the moment enough of them are visible \u2014
    // and the magnitude model made a lot more of them visible.
    vec2 off = (vec2(hash12(cell + 7.7), hash12(cell + 3.3)) - 0.5) * 0.84;
    float d = length(fract(sg) - 0.5 - off);

    float darkness = (9.0 - u_sky.x) / 8.0;
    // The Milky Way is a star cloud, not luminous fog: it reaches deeper into the
    // field where the band runs, and most of its brightness arrives as resolved
    // stars. The diffuse term below is only the unresolved remainder.
    // how far below the suburban default this site sits: gates every
    // dark-sky-only term, so Bortle 6 and up stay exactly the sky this has
    // always drawn
    float deep = clamp((6.0 - u_sky.x) / 5.0, 0.0, 1.0);
    float mwBulge; float mwRift; float mwGlow; float mwBase;
    float mwHere = milkyWayBand(rd, u_sky.y, mwBulge, mwRift, mwGlow, mwBase);

    // Intrinsic brightness, power-law distributed: a handful of bright stars, a
    // great many faint ones. This is what carries the variation \u2014 deriving
    // brightness from distance above the visibility limit instead (as this did at
    // first) puts most of the visible population against the clamp at maximum
    // size, and every star ends up the same.
    float mag0 = pow(sr, 8.0);

    // The limit decides *whether* a star shows, not how bright it is. It falls as
    // the sky darkens, so dragging light pollution reveals fainter stars rather
    // than switching populations on and off.
    float cutoff = mix(0.002, 0.93, clamp((u_sky.x - 1.0) / 8.0, 0.0, 1.0));
    // The band is a star cloud first and a glow second, so it has to reach much
    // deeper into the field than it did \u2014 at 0.55 the density inside the band was
    // barely distinguishable from the sky beside it and the whole thing read as a
    // smooth smear. Squared so the dense core pulls far harder than the wings.
    // (floored: the bulge can push the band past 1, and a negative cutoff would
    // invert the renormalisation below)
    cutoff *= max(1.0 - 0.93 * mwHere * (0.45 + 0.55 * mwHere), 0.02);
    // dust extinction raises the limiting magnitude: inside the Rift the faint
    // stars vanish outright, not just dim \u2014 that is what makes it read as a
    // thing standing in front of the field
    cutoff = min(cutoff * (1.0 + 2.5 * mwRift), 0.93);
    float shows = smoothstep(cutoff * 0.75, cutoff * 1.9 + 0.004, mag0);

    // renormalised across the surviving population so the full range of sizes is
    // present at every Bortle. cutoff tops out at 0.93, so this cannot blow up
    float m = clamp((mag0 - cutoff) / max(1.0 - cutoff, 0.07), 0.0, 1.0);
    float radius = mix(0.030, 0.20, m * m);
    float amp = mix(0.05, 1.0, m * m * m);          // cubed: the bright ones carry
    float star = smoothstep(radius, 0.0, d) * amp * shows * (0.55 + 0.45 * darkness);
    // The band's extra depth cannot come through the cutoff at a dark site \u2014
    // it is already saturated by Bortle 1 \u2014 so it arrives as amplitude, and
    // the Rift takes it back away: the dust is in front of these stars.
    star *= (1.0 + 1.0 * mwBase) * (1.0 - 0.70 * mwRift);
    float twinkle = 0.8 + 0.2 * sin(u_time * (1.0 + fract(sr * 13.0) * 2.0) + sr * 40.0);
    vec3 tint = L(mix(vec3(0.8, 0.88, 1.0), vec3(1.0, 0.93, 0.85), fract(sr * 71.0)));
    // at a dark site the top of the population splits into its two real color
    // classes \u2014 hot blue-white and cool amber \u2014 instead of a uniform grey
    tint = mix(tint, L(mix(vec3(0.60, 0.76, 1.00), vec3(1.00, 0.78, 0.55),
                           step(0.5, fract(sr * 71.0)))),
               deep * smoothstep(0.70, 0.92, m) * 0.85);
    // atmospheric extinction: near the skyline stars redden and dim rather
    // than switching off (the suburban horizon keeps its old hard fade)
    tint *= mix(vec3(1.0), vec3(0.95, 0.72, 0.52), deep * smoothstep(0.30, 0.02, h));
    // stars reach the skyline at a dark site; under light pollution the
    // horizon dome still swallows the lowest ones (0.16 is the old suburban
    // behavior, kept exactly)
    // the lower edge dips below the horizon at a dark site, so the grain meets
    // the skyline instead of stopping on a visible line just above it
    float horizonGate = smoothstep(mix(0.02, -0.02, deep), mix(0.16, 0.05, deep), h);
    float vis = star * twinkle * nightF
              * horizonGate
              * clamp(1.0 - u_cover * 1.4, 0.0, 1.0) * (1.0 - gloom);
    sky += tint * vis * STAR_LUM;
    // a star's blue or amber is genuinely outside sRGB \u2014 the strongest claim here
    wide = max(wide, vis * 0.9);

    // the Milky Way shares the star field's occlusion exactly \u2014 same night, same
    // cloud, same gloom \u2014 so it is gated here rather than duplicating all of it
    float mwGate = nightF * horizonGate
                 * clamp(1.0 - u_cover * 1.4, 0.0, 1.0) * (1.0 - gloom);
    float mw = mwHere * mwGate;

    // \u2500\u2500 Second, finer star layer: the unresolved-into-resolved crowd \u2500\u2500
    // One star per cell tops out the density the main grid can reach, and a real
    // dark-sky band is grain, not a ceiling. A denser grid of small faint stars
    // fills in underneath: thickest inside the band, spreading over the whole
    // sky as the site darkens. Scaled by deep so it is *exactly* zero at Bortle
    // 6 and up \u2014 the default sky never pays for it or shows it \u2014 and fades in
    // continuously below.
    if (deep > 0.0) {
      vec2 sg2 = starGrid(rd) * 158.0;
      vec2 cell2 = floor(sg2);
      float sr2 = hash12(cell2 + 19.19);
      vec2 off2 = (vec2(hash12(cell2 + 5.1), hash12(cell2 + 9.7)) - 0.5) * 0.88;
      float d2 = length(fract(sg2) - 0.5 - off2);
      float mag2 = pow(sr2, 6.0);
      // how far down the population this site+direction reaches: the band shows
      // most of it, the dark sky beside it a decent fraction
      // in-band reach tops out near half the cells: any denser and the grains
      // sit inside each other's contrast radius and fuse into a plateau
      // the band term starts a little above the profile's skirt, so the deep
      // wings do not smear the band's density gain over the whole sky
      float reach = deep * (0.16 + 0.46 * clamp(mwBase * 1.2 - 0.10, 0.0, 1.0))
                  * (1.0 - 0.60 * mwRift);
      float c2 = pow(1.0 - 0.88 * reach, 6.0);
      float shows2 = smoothstep(c2 * 0.6, c2 * 1.9 + 0.003, mag2);
      float m2 = clamp((mag2 - c2) / max(1.0 - c2, 0.2), 0.0, 1.0);
      // small and dim on purpose: these read as texture between the resolved
      // stars, not as a second population of discs
      // radius floor: cells are ~6px, so anything under ~0.12 cell radius
      // starts skipping pixel centers and the population thins out unseen
      float radius2 = mix(0.15, 0.26, m2);
      // brightened inside the band \u2014 the cutoff has no depth left to give at a
      // dark site, so the density contrast is carried by amplitude \u2014 and cut
      // by the Rift, which stands in front of these stars too. The boost is
      // moderate on purpose: pushed harder, the grains merge into a texture
      // and stop reading as stars at all
      float amp2 = mix(0.06, 0.42, m2 * m2) * deep
                 * (1.0 + 1.6 * clamp(mwBase - 0.08, 0.0, 1.2)) * (1.0 - 0.75 * mwRift);
      float star2 = smoothstep(radius2, 0.0, d2) * amp2 * shows2;
      vec3 tint2 = L(mix(vec3(0.84, 0.89, 1.0), vec3(1.0, 0.93, 0.87), fract(sr2 * 53.0)));
      sky += tint2 * star2 * mwGate * STAR_LUM;
      wide = max(wide, star2 * mwGate * 0.5);

      // Third grid, band-only: the near-continuous sand of the star clouds.
      // One dim, half-resolved star per finer cell; the sky outside the band
      // never evaluates it, and the default sky never reaches here at all
      float band3 = deep * clamp(mwBase * 1.1 - 0.12, 0.0, 1.0) * (1.0 - 0.85 * mwRift);
      if (band3 > 0.0) {
        vec2 sg3 = starGrid(rd) * 258.0;
        vec2 cell3 = floor(sg3);
        float sr3 = hash12(cell3 + 41.7);
        vec2 off3 = (vec2(hash12(cell3 + 13.1), hash12(cell3 + 27.9)) - 0.5) * 0.86;
        float d3 = length(fract(sg3) - 0.5 - off3);
        float mag3 = pow(sr3, 4.0);
        // visible fraction is 0.30*band3 exactly (the pow4 cancels against the
        // mag3 distribution): a third of the cells lit keeps the grains
        // separable \u2014 at 90% they fuse into a plateau and stop reading as stars
        float c3 = pow(1.0 - 0.40 * min(band3, 1.0), 4.0);
        float shows3 = smoothstep(c3 * 0.6, c3 * 1.9 + 0.003, mag3);
        float m3 = clamp((mag3 - c3) / max(1.0 - c3, 0.25), 0.0, 1.0);
        // radius floor matters: these cells are ~3.6px, so a disc under ~0.2
        // cell radius falls between pixel centers and never draws at all
        // deliberately just under the eye's "one star" threshold: this layer is
        // the sand between the countable stars, not a third countable class
        float star3 = smoothstep(mix(0.22, 0.36, m3), 0.0, d3)
                    * mix(0.10, 0.25, m3 * m3) * band3 * shows3
                    * (1.0 - 0.78 * mwRift);
        vec3 tint3 = L(mix(vec3(0.86, 0.90, 1.0), vec3(1.0, 0.94, 0.88), fract(sr3 * 37.0)));
        sky += tint3 * star3 * mwGate * STAR_LUM;
        wide = max(wide, star3 * mwGate * 0.4);
      }
    }

    if (mw > 0.0001) {
      // Colour follows the band's own structure: lavender through the body of
      // the band, pink-magenta where the bulge swells (reddened by its own
      // dust), blue out along the thin reaches \u2014 the hue map of a long-exposure
      // photograph, carried well below photographic saturation. Light pollution
      // then does what it does to everything \u2014 washes the colour out and pulls
      // it toward the sky glow \u2014 so the same slider that thins the stars also
      // drains the band.
      vec3 core = vec3(1.00, 0.62, 0.80);        // the bulge, reddened by its own dust
      vec3 body = vec3(0.63, 0.54, 0.94);        // the band's lavender midriff
      vec3 edge = vec3(0.38, 0.52, 1.00);        // hot young stars out along the arms
      float dens = clamp(mwHere / max(u_sky.y, 1e-4), 0.0, 1.0);
      vec3 mwCol = mix(edge, body, smoothstep(0.03, 0.40, dens));
      mwCol = mix(mwCol, core, mwBulge * smoothstep(0.20, 0.75, dens));
      float wash = clamp((u_sky.x - 2.0) / 5.0, 0.0, 1.0);
      mwCol = mix(mwCol, vec3(0.74, 0.75, 0.70), wash * 0.8);
      // Only the unresolved remainder \u2014 the stars carry the rest. Kept low, and
      // weighted toward the dense parts, so it does not flatten into fog.
      sky += L(mwCol) * mw * (0.30 + 0.70 * dens) * 0.050;
      // the bulge carried as luminance too, so the swelling reads as light and
      // not only as width (rift-cut inside milkyWayBand)
      sky += L(mix(core, vec3(0.74, 0.75, 0.70), wash * 0.8)) * mwGlow * mwGate * 0.047;
      wide = max(wide, mw * 0.22);
    }
  }

  // \u2500\u2500 Moon (night. Placed opposite the sun \u2014 the full-moon relationship) \u2500\u2500
  {
    vec3 moonDir = dirFromAngles(0.62, u_sun.y + PI);
    float ang = acos(clamp(dot(rd, moonDir), -1.0, 1.0));
    float moon = smoothstep(0.048, 0.043, ang);
    // the crescent bite: carve it out with a circle offset slightly from the moon's center
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), moonDir));
    vec3 up = cross(moonDir, right);
    vec3 biteDir = normalize(moonDir - right * 0.013 + up * 0.013);
    float bite = smoothstep(0.054, 0.048, acos(clamp(dot(rd, biteDir), -1.0, 1.0)));
    float vis = nightF * clamp(1.0 - u_cover * 0.9 - gloom, 0.0, 1.0);
    float cres = clamp(moon - bite, 0.0, 1.0);

    // Moon-fixed frame: the ray projected onto the disc plane, in units of the
    // disc radius. The mare pattern samples this, so it stays glued to the
    // surface however the camera swings.
    vec2 muv = vec2(dot(rd, right), dot(rd, up)) / 0.048;
    float mare = smoothstep(0.42, 0.72, fbm(muv * 2.3 + vec2(4.7, 9.2)));

    // Earthshine. The shadowed disc is rock, not glass: it occludes the stars
    // behind it (a replace, not an add) and holds a faint blue-grey glow of
    // sunlight bounced off the Earth, an order of magnitude under the crescent.
    // The occlusion saturates early so a clear-night vis of 0.9 does not leak
    // 10% of every star through the rock, yet it still follows vis down under
    // cloud so a heavy overcast dims the disc away instead of punching a dark
    // hole in the cloud glow (and vis=0 keeps the mix an identity by day).
    vec3 shine = L(vec3(0.62, 0.68, 0.78)) * (1.0 - 0.5 * mare) * 0.016 * MOON_LUM;
    sky = mix(sky, shine, moon * smoothstep(0.0, 0.55, vis));

    // The lit crescent: overexposed warm white, linear-light emission
    sky += L(vec3(1.0, 0.96, 0.88)) * cres * vis * MOON_LUM;

    // Bloom leans toward the crescent (away from the bite offset), warm like
    // the light that causes it; the shadowed limb keeps only a trace. Kept
    // tight so it does not wash the Milky Way band nearby.
    vec2 biteOff = normalize(vec2(-0.013, 0.013));
    float sideW = 0.5 - 0.5 * dot(muv, biteOff) / max(length(muv), 1e-3);
    sideW = 0.12 + 0.88 * sideW;
    float rim = exp(-max(ang - 0.045, 0.0) * 30.0) * (1.0 - moon);
    // near-white with only a hint of warmth: a stronger yellow muddied to
    // brown against the lavender of the Milky Way band
    sky += L(vec3(1.0, 0.95, 0.87)) * rim * sideW * 0.30 * vis;
    // a whisper of scattered moonlight haze just past the limb, all around
    sky += L(vec3(0.45, 0.55, 0.75)) * exp(-max(ang - 0.045, 0.0) * 11.0)
         * (1.0 - moon) * 0.035 * vis;
    wide = max(wide, max(cres, rim * sideW * 0.30) * vis * 0.7);
  }

  // \u2500\u2500 Meteors \u2500\u2500
  {
    vec3 m = meteorStreak(rd, u_time, u_sky.z, u_sky.w, u_radiant);
    float mi = max(max(m.r, m.g), m.b);
    if (mi > 0.0001) {
      float vis = nightF * clamp(1.0 - u_cover * 1.2, 0.0, 1.0) * (1.0 - gloom);
      // burns hot enough to claim gamut like the other light sources
      sky += L(m) * vis * STAR_LUM * 0.85;
      wide = max(wide, mi * vis * 0.85);
    }
  }

  // \u2500\u2500 Sun (an overexposed blowout. The core saturates flat, the edge falls off steeply) \u2500\u2500
  float sunVis = smoothstep(-0.06, 0.06, sunEl)
               * clamp(1.0 - u_cover * 0.75 - gloom * 0.95, 0.0, 1.0);
  float sunAng = acos(clamp(dot(rd, sunDir), -1.0, 1.0));
  {
    vec3 sunCol = L(mix(vec3(1.0, 0.98, 0.92), vec3(1.05, 0.6, 0.3), sunsetF));
    // gain the core and clamp \u2192 produces a flat, saturated white patch at the center
    float core = clamp(exp(-sunAng * sunAng * 900.0) * 2.2, 0.0, 1.0);
    sky = mix(sky, vec3(SUN_LUM), core * sunVis);
    // keep the surrounding bleed subtle (a scattering halo)
    float halo = exp(-sunAng * 4.0);
    sky += sunCol * halo * 0.22 * sunVis * HALO_LUM;
    // no sunsetF gate: at midday sunCol is near-white and the widening is
    // self-cancelling, so this only bites once the halo has turned orange.
    // halo carries the same 0.22 as its bleed \u2014 see the invariant above
    wide = max(wide, max(core, halo * 0.22) * sunVis * 0.6);
  }

  // night city lights (a warm glow along the horizon \u2014 a Tokyo-like sky)
  // 0.4 at Bortle 6, which is what this has always drawn; nothing at Bortle 1
  sky += L(vec3(0.26, 0.16, 0.09)) * exp(-h * 8.0) * nightF
       * (0.4 * (u_sky.x - 1.0) / 5.0) * (1.0 - gloom * 0.6);

  // airglow: at a truly dark site the horizon carries a faint green-grey rim of
  // atmospheric chemiluminescence instead of city light. A thin rim \u2014 a fat
  // scale height reads as haze and swallows the lowest stars. Shares the second
  // star layer's gate, so it is exactly absent at Bortle 6 and up.
  float agDeep = clamp((6.0 - u_sky.x) / 5.0, 0.0, 1.0);
  if (agDeep > 0.0) {
    // rippled around the compass \u2014 real airglow hangs in uneven waves, and a
    // uniform rim reads as a printed strip. Seeded off the horizontal ray
    // components, so it is seamless in azimuth and pinned as the view swings
    float agN = fbm2(vec2(rd.x, rd.z) * 2.5 + 31.0);
    sky += L(vec3(0.30, 0.52, 0.38)) * exp(-h * (9.0 + 7.0 * agN)) * nightF
         * (0.07 * (0.55 + 0.90 * agN) * agDeep)
         * clamp(1.0 - u_cover * 1.2, 0.0, 1.0) * (1.0 - gloom);
  }

  // \u2500\u2500 Lightning (computed before the clouds so it lights them too) \u2500\u2500
  float flash = 0.0;
  {
    float lt = u_time * 0.55;
    float cell = floor(lt);
    float p1 = hash11(cell);
    float thresh = mix(1.05, 0.55, u_thunder);   // never fires when thunder=0
    if (p1 > thresh) {
      float ph = fract(lt);
      flash = exp(-ph * 9.0) * (0.65 + 0.35 * sin(ph * 70.0 + p1 * 30.0));
    }
  }

  // \u2500\u2500 Shared setup for the cloud layers (intersection of view ray \xD7 cloud plane) \u2500\u2500
  float rdY = max(rd.y, 0.03);
  float horizonFade = smoothstep(0.0, 0.24, rd.y);
  float az = atan(rd.x, rd.z);
  // the cloud plane's coordinate system is world xz; fold the sun direction onto the same plane
  vec2 ldir = normalize(sunDir.xz + vec2(1e-4, 1e-4));
  // display-encoded: this tints the cloud palette, which is authored there
  vec3 cloudSun = mix(vec3(1.05, 1.0, 0.95), vec3(1.1, 0.55, 0.3), sunsetF);

  // the cloud plane's projection scale (= altitude). Higher layers are larger, so the same lump looks smaller
  const float ALT_HIGH = 3.2;
  const float ALT_MID = 1.8;
  const float ALT_LOW = 0.95;
  // a cloud genus with amount 0 is skipped entirely \u2014 a clear sky costs almost nothing
  float ramp = 0.08 + 0.14 * (1.0 - rdY);   // widen near the horizon to suppress aliasing

  // \u2500\u2500 High layer, 5000\u201313000m \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  // Cirrus Ci (mare's tail) \u2014 the first to blush pink at magic hour
  if (u_high.x > 0.001) {
    // the extra x-crawl rides u_windOff too (see cloudField): 0.14 matches
    // the old u_time \xD7 0.004 at light wind, and speeds up when it blows
    float f = filament(planeUV(rd, rdY, ALT_HIGH, u_windOff * 0.3) + vec2(u_windOff * 0.14, 0.0));
    vec3 col = mix(vec3(1.0), vec3(1.05, 0.62, 0.55), sunsetF);
    col = mix(vec3(0.25, 0.30, 0.45), col, max(dayF, sunsetF));
    sky = overlay(sky, col, f * u_high.x * 0.62 * horizonFade * (1.0 - gloom * 0.8));
  }
  // Cirrostratus Cs (veil cloud) \u2014 a thin veil across the whole sky. Haloes the sun
  if (u_high.y > 0.001) {
    vec2 s = stratiform(planeUV(rd, rdY, ALT_HIGH * 0.5, u_windOff * 0.3), 0.35, 0.0);
    vec3 col = mix(vec3(0.86, 0.89, 0.95), vec3(1.02, 0.80, 0.72), sunsetF);
    col = mix(vec3(0.22, 0.26, 0.38), col, max(dayF, sunsetF * 0.8));
    sky = overlay(sky, col, s.x * u_high.y * 0.45 * horizonFade);
    // the 22\xB0 halo (refraction through ice crystals)
    sky += L(vec3(1.0, 0.95, 0.85)) * smoothstep(0.028, 0.0, abs(sunAng - 0.384))
         * u_high.y * sunVis * 0.30;
  }
  // Cirrocumulus Cc (mackerel sky) \u2014 fine grains packed densely up high
  if (u_high.z > 0.001) {
    vec2 g = granular(planeUV(rd, rdY, ALT_HIGH * 5.5, u_windOff * 0.3), 0.55, 1.0, 0.25, ldir);
    vec3 col = cloudColor(g.x, g.y * 0.8, 0.16, dayF, nightF, sunsetF, flash, gloom, 0.5, cloudSun);
    sky = overlay(sky, col, g.x * u_high.z * 0.85 * horizonFade);
  }

  // \u2500\u2500 Mid layer, 2000\u20137000m \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  // Altostratus As (grey veil) \u2014 a translucent sheet.
  // Not one uniform film but "torn membranes overlapping in patches", with
  // the sun showing through broadly, outline-less, as if through frosted
  // glass. These two things are altostratus's face.
  if (u_mid.x > 0.001) {
    vec2 uv = planeUV(rd, rdY, ALT_MID * 0.55, u_windOff * 0.6);
    vec2 s = stratiform(uv, 0.50, 0.35);
    // mottling from overlapping membranes. Stretched along the flow, it lines up into bands converging on the horizon
    float fleck = smoothstep(0.40, 0.74, fbm4(uv * vec2(2.4, 4.8) + 41.0));
    float thick = clamp(s.y * 0.62 + fleck * 0.38, 0.0, 1.0);

    vec3 shade  = mix(vec3(0.055, 0.062, 0.078), vec3(0.40, 0.43, 0.51), dayF);
    vec3 bright = mix(vec3(0.10, 0.11, 0.14), vec3(0.90, 0.91, 0.92), dayF);
    bright = mix(bright, bright * vec3(1.12, 0.92, 0.76), sunsetF * 0.8);
    vec3 col = mix(bright, shade, thick);

    // the sun through frosted glass: light wraps around more the closer to
    // the sun's direction and the thinner the membrane. The sun's disc is
    // hidden by the membrane, leaving only a broad, outline-less bloom
    float through = exp(-sunAng * 1.7) * max(dayF, sunsetF * 0.6);
    col += mix(vec3(1.0, 0.98, 0.92), vec3(1.05, 0.72, 0.45), sunsetF)
         * through * (1.0 - thick * 0.75) * 0.85;
    col += flash * vec3(0.75, 0.80, 1.0) * 0.5;

    sky = overlay(sky, col, s.x * u_mid.x * 0.95 * horizonFade);
  }
  // Altocumulus Ac (sheep cloud) \u2014 larger than cirrocumulus, with grains shaded individually
  if (u_mid.y > 0.001) {
    vec2 g = granular(planeUV(rd, rdY, ALT_MID * 2.2, u_windOff * 0.6), 0.80, 0.85, 0.35, ldir);
    vec3 col = cloudColor(g.x, g.y, 0.30, dayF, nightF, sunsetF, flash, gloom, 0.9, cloudSun);
    sky = overlay(sky, col, g.x * u_mid.y * 0.95 * horizonFade);
  }
  // Nimbostratus Ns (rain cloud) \u2014 the rain-bearing cloud. Its undulating base's thickness variation becomes the light/dark directly
  if (u_mid.z > 0.001) {
    vec2 s = stratiform(planeUV(rd, rdY, ALT_MID * 0.30, u_windOff * 0.6), 0.10, 1.0);
    // no direct sunlight reaches it at all, so color can be one-dimensional: "thickness \u2192 shade".
    // cloudColor's shadow blending caps at 0.85 and never sinks to the photo's charcoal
    vec3 lit = mix(vec3(0.050, 0.055, 0.068), vec3(0.74, 0.75, 0.76), dayF);
    lit += vec3(0.12, 0.06, 0.03) * sunsetF;
    // real rain clouds sit between "charcoal and mid-grey", never pure black or white.
    // the thicker the cloud, the lower the dark end sinks
    vec3 col = lit * mix(0.74, mix(0.40, 0.20, u_mid.z), s.y);
    col += flash * vec3(0.75, 0.80, 1.0) * 0.6;
    sky = overlay(sky, col, s.x * u_mid.z * 0.99 * horizonFade);
  }

  // \u2500\u2500 Cumulonimbus Cb (thunderhead) \u2500\u2500
  //
  // "Pick one height per azimuth, fill below it" \u2014 a 1D height profile \u2014 can
  // only ever produce a triangular hill. It can't give cauliflower-shaped
  // round bulges, or lateral overhang. Solve it as a 2D field over azimuth
  // and elevation instead.
  //
  // To connect around the full azimuth loop, embed a cylindrical surface
  // ("radius = height") as a 2D noise field. Higher up, the circumference is
  // longer so the mass also spreads wider \u2014 which happens to match how a
  // real tower actually spreads.
  float cbAmt = u_low.w * (1.0 - gloom * 0.6);
  // how much of this pixel the tower covers \u2014 later layers use it to avoid
  // dragging their translucent fringes across the bright mass
  float cbMask = 0.0;
  if (cbAmt > 0.001) {
    float azw = az + u_windOff * 0.15;
    vec2 dirc = vec2(sin(azw), cos(azw));
    // "2\u20133 towers across the whole sky" is a fine distribution. A large
    // radius adds features along the circumference and produces a forest of
    // small towers, so pull this one at a deliberately low frequency only.
    // this also sets a tower's width-to-height proportion: at 1.4 the towers
    // come out as narrow totem-pole pillars \u2014 a real cumulonimbus is a
    // mountain about as wide as it is tall
    vec2 acir = dirc * 0.85;
    // the noise must advance the same amount vertically as horizontally *on
    // screen*, or every stroke of texture stretches vertically. Per screen
    // radian, azimuth advances the noise by r/cos\u03B8 but elevation only by
    // r'\xB7cos\u03B8 (rd.y = sin\u03B8) \u2014 so isotropy needs r'/r = 1/cos\xB2\u03B8 = 1/(1\u2212rd.y\xB2),
    // whose solution is r = r0\xB7\u221A((1+y)/(1\u2212y)). Anything less (linear,
    // exponential) leaves a residual 1/cos\xB2\u03B8 vertical smear that reads as
    // the cloud being painted with a vertical brush
    vec2 cyl = dirc * (2.6 * sqrt((1.0 + rd.y) / max(1.0 - rd.y, 0.045)));

    // which azimuth a tower stands at. Keep the cutoff high for a "stands
    // here and there" distribution (too low connects into a band along the horizon).
    // growth/decay rides on the integrated offset u_evo, not u_time \u2014
    // that lets growth speed be set externally (via StateAnimator's evo
    // speed), and keeps the phase from jumping when the weather changes
    float mass = fbm4(acir + vec2(0.0, u_evo * 0.12));
    // fbm maxima are sometimes knife-ridges crossing the azimuth circle at a
    // steep angle. Raised to a height they become tall needle towers \u2014 the
    // most common failure shape. Erode narrow peaks morphologically: clamp
    // to the taller of the two neighbors, which shaves any peak thinner
    // than ~2\xD70.08 rad and leaves broad mountains untouched
    float massL = fbm4(vec2(sin(azw - 0.08), cos(azw - 0.08)) * 0.85 + vec2(0.0, u_evo * 0.12));
    float massR = fbm4(vec2(sin(azw + 0.08), cos(azw + 0.08)) * 0.85 + vec2(0.0, u_evo * 0.12));
    float massE = min(mass, max(massL, massR));
    // a second, wider erosion ring: a knife-ridge longer than the first
    // ring slips through it and still stands as a needle. The small
    // allowance lets a broad dome rise a little above its shoulders
    float massL2 = fbm4(vec2(sin(azw - 0.13), cos(azw - 0.13)) * 0.85 + vec2(0.0, u_evo * 0.12));
    float massR2 = fbm4(vec2(sin(azw + 0.13), cos(azw + 0.13)) * 0.85 + vec2(0.0, u_evo * 0.12));
    massE = min(massE, max(massL2, massR2) + 0.06);
    // the tower's thrust. Whether this is peaked or not decides how boxy it looks.
    // left as a gentle hill, a wide range of azimuths reach the same height
    // and the top becomes a flat slab.
    // peaking it makes height drop off sharply across azimuth, so it can
    // stay tall while still narrowing upward
    float env = pow(max(massE - 0.42, 0.0) * 4.6, 1.5);
    // the tropopause. Give it a slight undulation across azimuth (perfectly
    // flat reads as a slab cutting across the sky).
    // if a tower grows past this, its top gets sliced perfectly flat and
    // reads as a slab. Leave the roundness to the tower's own tapering, and
    // place the tropopause at the height "only the tallest tower's tip reaches"
    float anvilTop = 0.62 + 0.16 * cbAmt + (fbm4(acir * 1.6 + 11.0) - 0.5) * 0.10;

    // the mass itself. A domain-warped 2D field does double duty as both
    // silhouette bumpiness and internal grain.
    // warping is meant to break up the overall shape. Applying the same
    // amount at every scale stretches even fine lumps in the same direction,
    // reading as a diagonal smear.
    // weaken the distortion the finer the scale, to keep it round
    vec2 warp = vec2(fbm4(cyl * 1.5 + u_evo * 0.30),
                     fbm4(cyl * 1.5 + 31.0 - u_evo * 0.25));
    vec2 w  = cyl + 0.42 * warp;   // coarse scale
    vec2 wf = cyl + 0.14 * warp;   // fine scale
    // the silhouette is cut from a sum of spheres (round lobes). But spheres
    // have zero high-frequency content, so alone the silhouette becomes an
    // endlessly smooth blob and detail disappears.
    // layer high-frequency noise at small amplitude to fray the edge while keeping the lobes round.
    // the two just handle different sizes \u2014 neither can be dropped.
    // lobes need at least 3 scales. With only 2, zooming in reveals no new
    // structure, just a stretched-out smear.
    // cauliflower looking "still cauliflower no matter how close you get" is
    // because the same shape repeats in a nested way.
    // kept separate per scale since shading shifts each one differently
    float bCoarse = blobs(w * 0.62, 0.82);
    float bMid    = blobs(w * 1.55 + 13.0, 0.78);
    float bFine   = blobs(wf * 3.60 + 41.0, 0.74);
    // a fourth octave: real cauliflower is bumps-on-bumps down past what the
    // eye can separate \u2014 stopping at three reads as sculpted foam. Each
    // octave roughly halves the size and the weight
    float bMicro  = blobs(wf * 7.60 + 97.0, 0.72);
    // match each scale's contribution between silhouette and shading. If
    // shading alone is strong, it reads as surface blotches/spots rather than lobes.
    // the micro octave joins mean-neutrally: folding it in raw deepens the
    // noise floor, and the deeper valleys punch holes through the mass
    float shape = bCoarse + 0.42 * bMid + 0.34 * bFine + 0.20 * (bMicro - 0.50);
    float fine = fbm(wf * 5.5);

    // The silhouette is decided by one formula: "thrust \u2212 height".
    //
    // Multiplying a cut by azimuth (a vertical flank) with a cut by height
    // (a flat ceiling) produces a mesa no matter what noise rides on top. If
    // thrust is a gentle hill across azimuth, subtracting height alone
    // naturally narrows it upward, with the top becoming a parabola \u2014 a
    // round head. Making the height term quadratic accelerates the tapering
    // higher up, giving a cumulonimbus with a wide base and a round top.
    float rise = env * (1.05 + 1.35 * cbAmt);
    // the linear term is height, the quadratic term is the "narrowing
    // upward" roundness. The -1.0 bias decides how wide the base is.
    // to stretch height alone, lower the linear term (raising the gain fattens the base too).
    // only let the sphere term act where there's thrust. Otherwise a single
    // sphere clears the threshold even in open sky away from any tower, and
    // a white bubble floats there on its own.
    // but the factor applied must be "smooth" \u2014 a sharp mask turns the edge into a straight line
    float near = smoothstep(0.0, 1.2, rise);
    // how far this azimuth's tower reaches (solving rise \u2212 (y + 0.8y\xB2) \u2212 1 = 0
    // for y, with hgt = y + 0.6y^2). Used for shading and the companion forms' attachment height
    float towerTop = (sqrt(1.0 + 2.4 * max(rise - 1.0, 0.0)) - 1.0) / 1.2;
    // a very fine fray at the edge. Riding this inside the blurred alpha
    // band gives a "blurry, yet detailed" edge. Cheap: just two vnoise calls
    float wisp = vnoise(wf * 13.0) * 0.62 + vnoise(wf * 27.0 + 7.0) * 0.38;
    // quadratic-in-height taper: the linear term is height, the quadratic
    // term rounds the top. Too strong a quadratic pinches the upper half
    // into a needle \u2014 a real tower's head is still ~half the base's width
    float hgt = rd.y + rd.y * rd.y * 0.6;
    float noiseSum = (shape - 0.86) * 1.5 + (fine - 0.47) * 0.72
                   + (wisp - 0.50) * 0.22;
    // negative noise may carve the silhouette at full strength, but keep
    // positive noise weaker: a blob spike reaching far above the envelope
    // becomes a turret floating in open sky, detached from the tower that
    // spawned it. (gating the positive side by height instead smooths the
    // flanks into a bald cone \u2014 the bumps live above the local envelope too)
    float field = rise - hgt - 1.0
                + (min(noiseSum, 0.0) + max(noiseSum, 0.0) * 0.60) * near;
    // and cap how far above the envelope's top any bump may reach: a blob
    // cluster hanging higher than that has open sky under it \u2014 it reads as
    // a chunk torn off the tower, not a turret growing out of it
    field -= smoothstep(towerTop + 0.10, towerTop + 0.35, rd.y) * 3.0;
    // well below this azimuth's own top, the mass must stay solid: a lobe
    // valley deep enough to cut the tower in two leaves its head floating in
    // open sky, and sky showing through the middle reads as moth-eaten holes
    // (the real thing is kilometers thick; only its rim is translucent).
    // fades out toward the top so the head keeps its ragged noise silhouette
    field += smoothstep(1.0, 0.60, rd.y / max(towerTop, 1e-3)) * 1.15 * near;
    // \u2500\u2500 Anvil cloud (incus) \u2500\u2500
    // A tower with nowhere left to go at the tropopause flares sideways into
    // a mushroom cap. Drawing this as a separate elevation band breaks down \u2014
    // away from the tower the band floats alone in open sky, and near the
    // zenith the cylindrical projection smears it into diagonal streaks.
    // Widening the tower's own silhouette just under the cap inherits the
    // mass's texture, shading and edge treatment, so nothing can detach.
    if (u_cbFeat.x > 0.001) {
      // resample the tower's thrust slightly upwind and fold it in, so the
      // cap spreads asymmetrically, downwind of the tower
      vec2 dircU = vec2(sin(azw + 0.55), cos(azw + 0.55));
      float massU = fbm4(dircU * 0.85 + vec2(0.0, u_evo * 0.12));
      float riseU = pow(max(massU - 0.42, 0.0) * 4.6, 1.5) * (1.05 + 1.35 * cbAmt);
      float reach = max(towerTop, max(riseU - 1.0, 0.0) * 0.47 * 0.85);
      // only azimuths whose tower (or upwind neighbor) got near the
      // tropopause flare out; the elevation window hugs the cap's underside.
      // the upwind term alone must never create mass: over an azimuth whose
      // own tower is stubby it would hang a cap in open sky with nothing
      // beneath it \u2014 demand the local tower carries at least half the height
      float flare = smoothstep(anvilTop * 0.50, anvilTop * 0.95, reach)
                  * smoothstep(anvilTop * 0.30, anvilTop * 0.60, towerTop)
                  * smoothstep(anvilTop - 0.26, anvilTop - 0.06, rd.y)
                  * smoothstep(anvilTop + 0.10, anvilTop - 0.02, rd.y)
                  * u_cbFeat.x;
      field += flare * 0.85;
    }
    // carve away only what's above the tropopause. Using min() to cap it
    // gives a perfectly flat ceiling
    field -= smoothstep(anvilTop - 0.06, anvilTop + 0.14, rd.y) * 2.2;
    // the edge should fade thin, not cut sharp \u2014 a sharp cut reads as a
    // pasted-on cutout. But too wide a band wraps the whole mass in fog and
    // the cloud never reads as a solid object: photos show a sunlit head
    // whose boundary is crisp with only a thin frayed fringe. Keep the band
    // narrow, and let wisp/fine (already folded into field) supply the fraying
    float m = smoothstep(-0.11, 0.24, field);

    if (m > 0.001) {
      // use the difference against a resample shifted toward the sun as surface orientation.
      // in cylindrical coordinates, dirc is "up"; its perpendicular is "sideways along azimuth"
      vec2 tangent = vec2(dirc.y, -dirc.x) * sin(u_sun.y - azw);
      vec2 lightOff = normalize(tangent + dirc * 0.9 + vec2(1e-4));

      // \u2500\u2500 the shift distance must match "that mass's own size" \u2500\u2500
      // shifting less than a lobe's radius leaves both sample points near
      // the same hilltop inside the lobe, and the difference goes to zero.
      // that means a large face's interior has no shading at all \u2014 only the
      // rim around it shades, leaving a solid-white interior.
      // shift a coarse lobe by about one lobe's worth, a fine lump by its own size.
      float formBig   = (bCoarse - blobs((w + lightOff * 1.30) * 0.62, 0.82)) * 0.80;
      float formSmall = (bMid    - blobs((w + lightOff * 0.42) * 1.55 + 13.0, 0.78)) * 0.75;
      // shade the finest scale from spheres too. Substituting noise here
      // makes the skin read as swirling fibers instead of a cluster of round lumps
      float formFine = (bFine - blobs((wf + lightOff * 0.164) * 3.60 + 41.0, 0.74)) * 0.70;
      float formMicro = (bMicro - blobs((wf + lightOff * 0.078) * 7.60 + 97.0, 0.72)) * 0.65;
      // let noise handle only the very finest fraying
      float micro = (fine - fbm((wf + lightOff * 0.035) * 5.5)) * 1.6;

      // \u2500\u2500 two octaves above the lobes \u2500\u2500
      // per-lobe shading alone caps the light/shadow structure at one lobe's
      // size: any face wider than that averages out to an even speckle and
      // reads as flat. Clusters of lobes must shade together...
      float bHuge = blobs(w * 0.30 + 71.0, 0.85);
      float formHuge = (bHuge - blobs((w + lightOff * 2.60) * 0.30 + 71.0, 0.85)) * 0.85;
      // ...and the mountain as a whole needs a sun side and a shade side:
      // resample the thrust with the azimuth nudged toward the sun \u2014 if the
      // mass grows in that direction this flank faces away from the sun
      float shiftA = 0.35 * sin(u_sun.y - azw);
      float massS = fbm4(vec2(sin(azw + shiftA), cos(azw + shiftA)) * 0.85
                         + vec2(0.0, u_evo * 0.12));
      // on a narrow tower the azimuth gradient is steep and this term slams
      // to its clamp, painting the whole spire near-black \u2014 fade it out as
      // the local mass thins
      float flank = clamp((mass - massS) * 3.0, -0.55, 0.55)
                  * smoothstep(0.25, 0.85, env);

      // less light reaches lower down the tower. Reference the slowly-varying
      // cap height, not this azimuth's towerTop \u2014 that changes abruptly at a
      // spire's flank and paints vertical light/dark seams down the mass
      float depth = 1.0 - smoothstep(0.0, max(anvilTop * 0.8, 0.3), rd.y);

      // walk across three points \u2014 white, mid, shadow \u2014 keeping the value continuous.
      // measured against real photos, a sunlit cumulus sits near 0.93, and
      // even its shadow only sinks to about 0.55.
      // placing hi at 1.0 leaves no room to lay grain on top and produces a solid-white patch
      // the shadow points sit clearly on the blue side: a cloud's shade is
      // lit by the sky, so letting it fall to a neutral grey reads as dirt
      // (measured on photos: shadow \u2248 (0.55, 0.63, 0.75), never colorless)
      // the shade is lit almost entirely by the blue sky dome, so under a
      // clear sky it takes on a clear blue cast \u2014 deeper than a photo's
      // "neutral" reading suggests. The overcast pull below neutralizes it
      // again when there's no blue sky to reflect
      // daytime hi was authored warm of white (R > B) while every other
      // layer's lit face leans blue (cloudColor: cool ambient + cloudSun),
      // so the tower read as a cream mass in a neutral sky. Match the other
      // clouds' color temperature; sunset warmth is layered on below and
      // keeps its own tint
      vec3 hi  = mix(vec3(0.13, 0.14, 0.18), vec3(0.918, 0.948, 0.985), dayF);
      vec3 mid = mix(vec3(0.09, 0.10, 0.13), vec3(0.765, 0.825, 0.920), dayF);
      vec3 lo  = mix(vec3(0.05, 0.06, 0.08), vec3(0.415, 0.545, 0.775), dayF);
      hi  = mix(hi,  hi  * vec3(1.10, 0.84, 0.62), sunsetF * 0.85);
      mid = mix(mid, mid * vec3(1.06, 0.82, 0.66), sunsetF * 0.85);
      lo  = mix(lo,  lo  * vec3(0.96, 0.86, 0.86), sunsetF * 0.6);
      // under overcast the other layers drop to diffuse sky light (see
      // cloudColor); if the tower keeps its sunny warm-white palette it
      // floats above them as a cream-yellow mass. Pull it to the same
      // blue-grey ambient as the deck it's embedded in
      float diffuse = smoothstep(0.55, 0.95, u_cover);
      hi  = mix(hi,  mix(vec3(0.115, 0.125, 0.16), vec3(0.800, 0.835, 0.900), dayF), diffuse * 0.85);
      mid = mix(mid, mix(vec3(0.085, 0.095, 0.12), vec3(0.680, 0.720, 0.805), dayF), diffuse * 0.85);
      lo  = mix(lo,  mix(vec3(0.050, 0.058, 0.08), vec3(0.520, 0.570, 0.680), dayF), diffuse * 0.85);

      // weight the scales so the coarse lobes carry the shading \u2014 letting
      // the fine scales compete washes the big forms out into an even
      // speckle, and the mass reads as porridge instead of cauliflower
      float ndl = flank * 0.75 + formHuge * 0.85 + formBig * 1.10
                + formSmall * 0.48 + formFine * 0.28 + formMicro * 0.18;
      // clouds are brighter where thicker, from multiple scattering \u2014 that's
      // why the edge drops slightly toward grey.
      // this splits a lobe's core into white and its valley into grey, so
      // shading stays tied to lobe shape
      float core = clamp((shape - 0.60) * 0.50, -0.34, 0.36);

      // \u2500\u2500 don't make the tone mapping asymmetric \u2500\u2500
      // stacking smoothstep compresses only the bright end toward its
      // ceiling, leaving only the shadows with any gradation. Shadows then
      // read as "holes punched in a white mass" rather than "the shaded side
      // of a lobe". A lobe always has both a lit and a shaded face, so leave
      // equal headroom on both sides
      // diffuse light also flattens the lit/shadow modelling, same as cloudColor.
      // the gain here is the lobes' light/shadow swing: measured on photos a
      // lobe's lit face vs its valley spans ~0.35 in luma \u2014 at half that the
      // mass reads as flat fog no matter how good the silhouette is
      float t = clamp((ndl * 0.80 + core) * (1.0 - diffuse * 0.55) + 0.58, 0.0, 1.0);
      vec3 tcol = t < 0.5 ? mix(lo, mid, t * 2.0) : mix(mid, hi, (t - 0.5) * 2.0);
      // apply grain by **multiplication**, last. Adding it into the tonal
      // values instead saturates and disappears in the bright areas;
      // multiplying leaves skin even on a face right at the edge of blowout.
      // multiplicative grain acts at the same ratio whether bright or dark,
      // so it adds "skin" without raising overall contrast
      tcol *= 1.0 + micro * 0.13 + (wisp - 0.5) * 0.09;
      // sink continuously toward the cloud base (never in discrete steps).
      // the base is in the tower's own shadow but lit by the sky, so it
      // sinks toward blue-grey, not plain grey
      tcol *= mix(vec3(1.0), vec3(0.55, 0.645, 0.845), depth * depth);
      // the edge is thin, so light passes through it (silver lining \u2014 only with direct sun)
      tcol += cloudSun * m * (1.0 - m) * 4.0 * 0.22
            * max(t - 0.45, 0.0) * max(dayF, sunsetF * 0.6) * (1.0 - diffuse);
      // in severe weather the cumulonimbus itself sits inside the storm.
      // leaving it bright here makes a pure-white cloud float in a leaden
      // sky. Pull it toward the same leaden grey as the other layers.
      tcol = mix(tcol, vec3(0.19, 0.20, 0.23) * (0.25 + 0.75 * dayF), gloom * 0.85);
      tcol += flash * vec3(0.75, 0.80, 1.0) * 0.55;

      // cumulonimbus isn't a cloud-plane projection, so high frequency
      // doesn't blow up near the horizon. Applying the same strong fade as
      // the other layers would dissolve the cloud base into haze and make it vanish.
      float cbFade = smoothstep(-0.02, 0.06, rd.y);
      cbMask = clamp(m, 0.0, 1.0) * 0.97 * cbFade;
      sky = overlay(sky, tcol, cbMask);
    }

    // \u2500\u2500 Veil cloud (velum) \u2500\u2500
    // A thin, flat cap draped like white cloth over the tower's head.
    //
    // Building this from an elevation band like "|rd.y - constant| < width"
    // makes it structurally a line no matter how frayed the edge gets \u2014 it
    // can never have thickness or skin. Use the same sphere field as the
    // tower, but heavily flattened vertically per cylindrical coordinate.
    // Round lobes stretch horizontally and overlap into a "flat mass",
    // giving it thickness variation and skin naturally.
    if (u_cbFeat.y > 0.001) {
      // veil forms as a horizontal sheet at a stable layer, so its height
      // stays roughly constant regardless of azimuth. Scaling it with tower
      // height turns the veil into a zigzag tracing the ridgeline.
      // **what ties it to the tower is presence, not height** \u2014 only show it
      // around a tower that actually reaches that high
      float velumY = 0.30 + 0.18 * cbAmt + (fbm4(dirc * 2.2 + 29.0) - 0.47) * 0.05;
      // the reach gate must stay strict: relaxed, the veil stretches into
      // long horizontal streaks across azimuths that hold no real tower
      float reach = smoothstep(velumY * 0.85, velumY * 1.25, towerTop);
      float spread = clamp(max(massE - 0.50, 0.0) * 6.0, 0.0, 1.0) * reach;
      if (spread > 0.02) {
        float dY = rd.y - velumY;
        // cylindrical coordinates flattened vertically by 26\xD7. This multiplier decides how thin the cap is
        vec2 vcyl = dirc * 2.4 + vec2(0.0, dY * 26.0);
        float vb = blobs(vcyl * 0.9 + 61.0, 0.86);
        // the sphere field gives thickness variation; a vertical falloff keeps it from spilling outside the cap
        float vfield = (vb - 0.58) * 1.4 + (spread - 0.42) * 1.7 - abs(dY) * 21.0;
        // a thin veil, so the edge dissolves broadly into the sky
        float v = smoothstep(-0.16, 0.40, vfield) * u_cbFeat.y;
        if (v > 0.001) {
          // lean the same slightly-blue white as the tower's daytime hi \u2014
          // a neutral-warm white here reads as cream against the other layers
          vec3 vcol = mix(vec3(0.11, 0.12, 0.15), vec3(0.935, 0.950, 0.970), dayF);
          vcol = mix(vcol, vcol * vec3(1.10, 0.88, 0.72), sunsetF * 0.8);
          vcol = mix(vcol, vec3(0.21, 0.22, 0.25) * (0.25 + 0.75 * dayF), gloom * 0.85);
          // the underside sinks into shadow, the top face catches the sun
          vcol *= mix(0.80, 1.05, smoothstep(-0.030, 0.024, dY));
          // skin. Multiplicative so it adds texture without changing overall brightness
          float vFray = vnoise(vcyl * 4.2 + 3.0) * 0.6 + vnoise(vcyl * 9.5 + 11.0) * 0.4 - 0.5;
          vcol *= 1.0 + vFray * 0.22;
          sky = overlay(sky, vcol, v * 0.70 * horizonFade);
        }
      }
    }
  }

  // \u2500\u2500 Low layer, under 2000m \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  // Stratocumulus Sc (roll cloud) \u2014 large mottled masses, arranged as rolls
  if (u_low.y > 0.001) {
    vec2 g = granular(planeUV(rd, rdY, ALT_LOW * 1.9, u_windOff * 1.2), 1.22, 0.5, 0.78, ldir);
    vec3 col = cloudColor(g.x, g.y, 0.48, dayF, nightF, sunsetF, flash, gloom, 1.05, cloudSun);
    sky = overlay(sky, col, g.x * u_low.y * 0.95 * horizonFade);
  }
  // Cumulus Cu (cotton cloud) \u2014 dome-shaped billowing lumps. The heaviest layer, so skip it at tiny amounts
  if (u_low.z > 0.02) {
    vec2 cuv = planeUV(rd, rdY, ALT_LOW * 2.5, u_windOff);
    // during high wind the whole sky wobbles slightly.
    // driven by u_windOff (which only advances in wind) so the phase is
    // continuous across u_time's wrap; at full gust its rate matches the
    // old u_time * 2.3 / 1.7 frequencies
    cuv += u_wind * 0.01 * vec2(
      sin(u_windOff * 10.0 + rd.y * 8.0),
      cos(u_windOff * 7.4 + rd.x * 6.0)
    );
    // the smaller the amount, the higher the threshold \u2014 sparse clouds only sprout here and there
    float edge = 0.88 - u_low.z * 0.52;
    vec3 dl = cloudField(cuv, churn, ldir, edge, ramp);
    // a thin, translucent veil cloud: give the density threshold a wide skirt below it
    // (it drifts as a bright haze around the lumps, and in places that never formed one)
    // must scale with the amount, or a residual haze is all that's left in an otherwise cloudless sky
    float veil = smoothstep(edge - 0.26, edge + 0.02, dl.z) * 0.42 * u_low.z;
    float alpha = max(dl.x, veil) * u_low.z * horizonFade;
    // over a cumulonimbus tower, a translucent fringe reads as a dirty
    // smudge stamped onto the bright mass \u2014 let only near-opaque cores
    // cross it (a half-dense patch is the worst case: neither cloud nor sky)
    alpha *= 1.0 - cbMask * (1.0 - smoothstep(0.60, 0.97, dl.x)) * 0.92;
    // shade from continuous thickness across the wide ramp, not from the saturated density (den)
    float thick = smoothstep(edge, edge + 0.35, dl.z);
    vec3 c = cloudColor(dl.x, dl.y, thick, dayF, nightF, sunsetF, flash, gloom, 1.0, cloudSun);
    sky = overlay(sky, c, alpha * 0.97);

    // fast-moving ragged clouds nearby (fragments of cumulus)
    vec2 fuv = planeUV(rd, rdY, ALT_LOW * 1.2, u_windOff * 1.9) + 51.7;
    float fedge = 0.94 - u_low.z * 0.42;
    vec3 fl = cloudField(fuv, churn * 1.2, ldir, fedge, ramp);
    float falpha = fl.x * u_low.z * horizonFade * (1.0 - cbMask * 0.6);
    float fthick = smoothstep(fedge, fedge + 0.35, fl.z);
    vec3 fc = cloudColor(fl.x, fl.y, fthick, dayF, nightF, sunsetF, flash, gloom, 1.25, cloudSun);
    sky = overlay(sky, fc, falpha * 0.95);
  }
  // Stratus St (fog cloud) \u2014 hangs low. Denser toward the horizon
  if (u_low.x > 0.001) {
    vec2 s = stratiform(planeUV(rd, rdY, ALT_LOW * 0.5, u_windOff * 1.2), 0.45, 0.45);
    vec3 col = cloudColor(0.95, -0.25, 0.60,
                          dayF, nightF, sunsetF, flash, gloom, 1.2, cloudSun) * 0.86;
    float lowBias = mix(1.0, 0.40, smoothstep(0.05, 0.55, rd.y));
    sky = overlay(sky, col, s.x * u_low.x * lowBias * 0.95 * horizonFade);
  }

  // \u2500\u2500 Light leaking in under the cloud base \u2500\u2500
  // Even under a thick deck covering the whole sky, right along the horizon
  // distant light having passed beneath the clouds breaks through and
  // brightens things. This single band is usually what sells a rain-cloud sky.
  float deck = max(u_mid.z, max(u_mid.x, u_low.x));
  if (deck > 0.01) {
    vec3 leak = mix(vec3(0.055, 0.058, 0.066), vec3(0.70, 0.70, 0.63), dayF);
    leak = mix(leak, vec3(0.86, 0.60, 0.40), sunsetF * 0.7);
    float band = smoothstep(0.22, 0.005, rd.y) * smoothstep(-0.02, 0.02, rd.y);
    sky = overlay(sky, leak, band * deck * 0.88);
  }

  // \u2500\u2500 Pannus (ragged scud beneath rain clouds) \u2500\u2500
  // Dark fragments racing fast beneath the cloud base. Layering dark shapes
  // over the bright leaking horizon reads as "there's another layer beneath
  // the thick deck", adding depth.
  // Near the horizon the cloud plane's projection diverges and high
  // frequency breaks down, so squeeze this into a band and stretch the
  // threshold's ramp wide to dissolve it into an outline-less haze instead.
  float fband = smoothstep(0.015, 0.075, rd.y) * smoothstep(0.42, 0.10, rd.y);
  if (u_mid.z > 0.02 && fband > 0.001) {
    vec2 fuv = planeUV(rd, rdY, ALT_LOW * 0.42, u_windOff * 2.4) + 77.0;
    vec3 fr = cloudField(fuv, churn + 0.45, ldir, 0.90 - u_mid.z * 0.22, ramp * 2.2);
    vec3 fcol = mix(vec3(0.030, 0.033, 0.040), vec3(0.26, 0.27, 0.29), dayF);
    sky = overlay(sky, fcol, fr.x * u_mid.z * fband * 0.80);
  }

  // \u2500\u2500 Below the horizon (out of frame with the default framing; used when looking down and for the skybox's lower hemisphere) \u2500\u2500
  {
    vec3 ground = mix(vec3(0.020, 0.022, 0.028), vec3(0.17, 0.165, 0.150), dayF);
    ground = mix(ground, ground * 0.6, gloom * 0.5);
    ground += vec3(0.06, 0.03, 0.015) * sunsetF * 0.5;
    sky = overlay(sky, ground, smoothstep(0.0, -0.05, rd.y));
  }

  // \u2500\u2500 Rain (thin threads slanting with the wind. A lens-face phenomenon, so screen space) \u2500\u2500
  if (u_rain > 0.001) {
    vec2 rp = vec2(p.x * aspect, p.y);
    // ordinary rain falls nearly vertical; only high wind slants it strongly
    rp.x -= rp.y * mix(0.06, 0.8, smoothstep(0.3, 1.0, u_wind));
    float rain = 0.0;
    for (int i = 0; i < 2; i++) {
      float fi = float(i);
      vec2 g = rp * vec2(mix(220.0, 380.0, fi), mix(2.6, 4.2, fi));
      float colId = floor(g.x) + fi * 57.0;
      float drop = fract(g.y + u_time * mix(5.5, 8.5, fi) * (0.6 + 0.4 * u_wind) + hash11(colId) * 13.0);
      float active = step(mix(0.9, 0.72, u_rain), hash11(colId * 1.37 + fi * 91.0));
      // draw only the thin thread down the column's center
      float line = smoothstep(0.16, 0.05, abs(fract(g.x) - 0.5));
      rain += active * line * smoothstep(0.24, 0.03, drop) * smoothstep(0.0, 0.015, drop);
    }
    sky = overlay(sky, encodeSrgb(sky) * 0.92 + vec3(0.5, 0.55, 0.63) * 0.35, clamp(rain, 0.0, 1.0) * u_rain * 0.32);
  }

  // \u2500\u2500 Snow \u2500\u2500
  // What actually reads in real snowfall isn't "flakes of one size falling
  // at even spacing". From large, blurred flakes up close to fine ones far
  // away, both size and density scatter continuously with depth. Uniform
  // flake size, or a visible grid, reads as artificial on its own.
  //
  // And another thing: the strongest impression in heavy snow isn't the
  // flakes themselves, but **visibility being whited out**. Drawing flakes
  // alone reads as "white dots floating in a clear sky".
  if (u_snow > 0.001) {
    vec2 sp = vec2(p.x * aspect, p.y);
    float flakes = 0.0;
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float k = fi * 0.25;                    // 0=near, 1=far
      // apply with a square so it gets rapidly finer with distance (linear reads as uniform size)
      float sc = mix(8.0, 160.0, k * k);
      float fall = u_time * mix(0.30, 0.035, k);

      vec2 g = sp * vec2(sc * (0.82 + 0.36 * hash11(fi * 5.3)), sc);
      g.y += fall * sc;
      // drift sideways with the wind, and tumble left and right while falling
      g.x += (u_wind * fall * 2.6 + sin(g.y * 0.22 + fi * 2.7) * 0.35) * sc * 0.06;
      // shift sideways per row. Without this the square grid's lattice
      // shows straight through as "flakes falling at even spacing"
      g.x += hash11(floor(g.y) * 1.37 + fi * 13.0) * 4.0;

      vec2 cell = floor(g);
      float r = hash12(cell + fi * 37.0);
      float active = step(mix(0.94, 0.40, u_snow), r);
      // scatter position across the whole cell (centering it makes the grid stand out)
      vec2 off = vec2(hash12(cell + 5.1), hash12(cell + 9.7)) * 0.9 + 0.05;
      float d = length(fract(g) - off);
      // bigger, blurrier-edged and fainter up close (out of focus)
      float rad = mix(0.40, 0.10, k);
      float edge = mix(0.10, 0.72, k);
      flakes += active * smoothstep(rad, rad * edge, d) * mix(0.55, 1.0, k);
    }
    sky = overlay(sky, vec3(0.95, 0.96, 1.0), clamp(flakes, 0.0, 1.0) * u_snow * 0.85);

    // the snowfall itself whites out visibility \u2014 flakes alone don't sell the impression of heavy snow.
    // a snowy sky is bright grey, unlike a rain cloud, so lift it here
    vec3 whiteout = mix(vec3(0.28, 0.30, 0.34), vec3(0.92, 0.93, 0.95), dayF);
    sky = overlay(sky, whiteout, u_snow * 0.55);
  }

  // lightning's glow reflected across the whole sky
  sky += flash * L(vec3(0.85, 0.9, 1.1)) * (0.18 + 0.3 * (1.0 - h)) * FLASH_LUM;
  // the blue-white of a flash already runs past 1.0 and gets clipped; in P3 more
  // of it survives. Claimed at the glow's own weight, so it covers the whole sky
  // during a flash and nothing between flashes
  wide = max(wide, clamp(flash * (0.18 + 0.3 * (1.0 - h)), 0.0, 1.0) * 0.7);

  // \u2500\u2500 Haze/mist (the shorter the visibility, the further out \u2014 toward the horizon \u2014 it crushes white) \u2500\u2500
  if (u_haze > 0.001) {
    vec3 hazeCol = mix(vec3(0.10, 0.11, 0.13), vec3(0.78, 0.80, 0.83), dayF);
    hazeCol = mix(hazeCol, hazeCol * vec3(1.10, 0.98, 0.90), sunsetF * 0.7);
    hazeCol = mix(hazeCol, hazeCol * vec3(0.38, 0.40, 0.45), gloom);
    // thin haze only crushes the horizon; the thicker it gets, the higher it climbs toward the zenith, covering the whole sky
    float reach = mix(0.22, 1.0, u_haze * u_haze);
    float hz = u_haze * mix(1.0, reach, smoothstep(0.0, 0.45, h));
    // cutting haze is half the reason to carry the filter
    hz *= 1.0 - u_pol.x * dop * 0.45;
    sky = overlay(sky, hazeCol, clamp(hz, 0.0, 0.96));
  }

  // \u2500\u2500 Lens flare (only while the sun is on screen. An artifact inside the lens, so screen space) \u2500\u2500
  if (sunVis > 0.001) {
    vec3 proj = projectDir(sunDir, u_cam.x, u_cam.y, u_cam.z, aspect);
    if (proj.z > 0.0) {
      vec2 sunPos = proj.xy * 0.5 + 0.5;
      vec2 axis = vec2(0.5, 0.5) - sunPos;   // the optical axis from the sun to screen center
      // weaken the further it strays off-screen
      float onScreen = smoothstep(1.6, 0.9, max(abs(proj.x), abs(proj.y)));
      float fl = sunVis * smoothstep(0.02, 0.18, sunEl) * onScreen;
      vec3 flare = vec3(0.0);
      // ghosts lined up along the optical axis (each a different color, from chromatic aberration)
      flare += L(vec3(1.0, 0.75, 0.45)) * 0.055 * ghost(p, sunPos + axis * 0.45, 0.030, aspect);
      flare += L(vec3(0.45, 1.0, 0.60)) * 0.045 * ghost(p, sunPos + axis * 0.75, 0.018, aspect);
      flare += L(vec3(0.55, 0.65, 1.0)) * 0.050 * ghost(p, sunPos + axis * 1.35, 0.055, aspect);
      flare += L(vec3(1.0, 0.55, 0.75)) * 0.035 * ghost(p, sunPos + axis * 1.80, 0.095, aspect);
      // a large, faint colored ring
      float rg = length((p - (sunPos + axis * 1.1)) * vec2(aspect, 1.0));
      flare += L(vec3(0.9, 0.75, 1.0)) * 0.030 * smoothstep(0.012, 0.0, abs(rg - 0.16));
      // an anamorphic-ish horizontal streak
      vec2 dsun = (p - sunPos) * vec2(aspect, 1.0);
      flare += L(vec3(0.8, 0.85, 1.0)) * 0.10 * exp(-abs(dsun.y) * 60.0) * exp(-abs(dsun.x) * 4.0);
      sky += flare * fl;
    }
  }

  // the rim of a lens droplet: bleeds slightly dark
  sky = overlay(sky, encodeSrgb(sky) * 0.88 + vec3(0.03), clamp(dropMask, 0.0, 1.0) * 0.55);

  // \u2500\u2500 Vignette \u2500\u2500
  // Display-referred, unlike the polarizer above. A polarizer is a real
  // transmission and belongs in linear light; a vignette is a chosen falloff that
  // was dialled in on encoded values, and multiplying linear light by the same
  // factor lands visibly weaker (0.5 goes to 0.48 instead of 0.45).
  sky = L(encodeSrgb(sky) * (1.0 - 0.22 * length(p - vec2(0.5, 0.45))));

  // \u2500\u2500 Linear light \u2192 display \u2500\u2500
  // Everything above this line is linear scene light and may run far past 1.0
  // (the sun's core, a lightning flash). Everything below is display-referred:
  // the film grade, the gamut conversion and the dither all keep their original
  // meaning only in encoded values, so they stay on this side of the encode.
  sky = encodeSrgb(tonemap(max(sky, 0.0)));

  // \u2500\u2500 Color filter \u2500\u2500
  if (u_filtAmt > 0.001) {
    float lum = dot(sky, vec3(0.2126, 0.7152, 0.0722));
    vec3 g = mix(vec3(lum), sky, u_filtSat) * u_filtTint;
    g = g * (1.0 - u_filtLift) + u_filtLift;   // lift only the blacks (whites don't move)
    sky = mix(sky, g, clamp(u_filtAmt, 0.0, 1.0));
  }

  // \u2500\u2500 Wide gamut \u2500\u2500
  if (u_p3 > 0.5) {
    // Reading the untransformed values as P3 numbers gives "the same nominal
    // color, at the highest purity P3 can express" \u2014 so reaching past sRGB is
    // exactly undoing part of the conversion. wide=0 is appearance-preserving,
    // wide=1 degenerates to the naive over-saturated flip; nothing in between
    // can blow up, and no new color literal is needed.
    sky = mix(srgbToDisplayP3(sky), sky, clamp(wide, 0.0, 1.0) * ${GAMUT_REACH.toFixed(4)});
  }

  // dither (to prevent banding). Last, so it lands in whatever space the 8-bit
  // drawing buffer actually quantizes
  sky += (hash12(gl_FragCoord.xy + fract(u_time)) - 0.5) * (2.0 / 255.0);

  gl_FragColor = vec4(sky, 1.0);
}
`;
  var TIME_WRAP_SEC = 4096;
  var UNIFORM_NAMES = [
    "u_res",
    "u_time",
    "u_cam",
    "u_sun",
    "u_cover",
    "u_high",
    "u_mid",
    "u_low",
    "u_rain",
    "u_snow",
    "u_wind",
    "u_thunder",
    "u_haze",
    "u_cbFeat",
    "u_windOff",
    "u_evo",
    "u_filtAmt",
    "u_filtTint",
    "u_filtSat",
    "u_filtLift",
    "u_p3",
    "u_headroom",
    "u_tone",
    "u_pol",
    "u_sky",
    "u_radiant"
  ];
  var AtmosphereRenderer = class {
    constructor(canvas, options = {}) {
      __publicField(this, "canvas");
      __publicField(this, "opts");
      __publicField(this, "gl", null);
      __publicField(this, "program", null);
      __publicField(this, "buffer", null);
      __publicField(this, "u", {});
      __publicField(this, "lost", false);
      __publicField(this, "p3", false);
      // kept so dispose() can detach them. A disposed renderer that still listens
      // would re-init on a context restore and steal the live renderer's program
      __publicField(this, "onLost", (e) => {
        e.preventDefault();
        this.lost = true;
      });
      __publicField(this, "onRestored", () => {
        this.lost = false;
        this.init();
      });
      this.canvas = canvas;
      this.opts = options;
      canvas.addEventListener("webglcontextlost", this.onLost);
      canvas.addEventListener("webglcontextrestored", this.onRestored);
      this.init();
    }
    /** false in environments where WebGL isn't available (the caller should keep its fallback background) */
    get available() {
      return this.gl !== null;
    }
    /**
     * The space actually being rendered into — `'display-p3'` only where the
     * browser supports it, whatever was requested.
     *
     * A 2D canvas that receives a `drawImage` of this one should be created with
     * the same `colorSpace`, or the wide-gamut pixels get clipped in the copy.
     */
    get colorSpace() {
      return this.p3 ? "display-p3" : "srgb";
    }
    init() {
      const gl = this.canvas.getContext("webgl", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: "low-power"
      });
      if (!gl) {
        this.gl = null;
        return;
      }
      this.gl = gl;
      this.p3 = false;
      if (this.opts.colorSpace !== "srgb" && "drawingBufferColorSpace" in gl) {
        gl.drawingBufferColorSpace = "display-p3";
        this.p3 = gl.drawingBufferColorSpace === "display-p3";
      }
      const compile = (type, src) => {
        const sh = gl.createShader(type);
        if (!sh) return null;
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
          console.error("atmosphere shader compile error:", gl.getShaderInfoLog(sh));
          gl.deleteShader(sh);
          return null;
        }
        return sh;
      };
      const vs = compile(gl.VERTEX_SHADER, VERT);
      const fs = compile(gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) {
        this.gl = null;
        return;
      }
      const prog = gl.createProgram();
      if (!prog) {
        this.gl = null;
        return;
      }
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error("atmosphere shader link error:", gl.getProgramInfoLog(prog));
        this.gl = null;
        return;
      }
      this.program = prog;
      gl.useProgram(prog);
      this.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "a_pos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      this.u = {};
      for (const name of UNIFORM_NAMES) this.u[name] = gl.getUniformLocation(prog, name);
    }
    resize(width, height) {
      var _a;
      this.canvas.width = width;
      this.canvas.height = height;
      (_a = this.gl) == null ? void 0 : _a.viewport(0, 0, width, height);
    }
    /**
     * Draw one frame.
     *
     * @param timeSec elapsed seconds (used for real-time phenomena: rain, snow, lightning, twinkling).
     *   Wrapped modulo {@link TIME_WRAP_SEC} before upload — the shader's float32
     *   would otherwise quantize fast cycles (rain) into visible stepping after a
     *   few hours. Cloud motion rides the integrated offsets, so the wrap only
     *   reshuffles short-lived screen effects once per period.
     * @param s       the resolved state
     * @param camera  the viewpoint. Defaults to the default framing
     * @param windOff wind's integrated offset (speed×dt, accumulated by the caller)
     * @param evo     shape evolution's integrated offset (same idea)
     */
    render(timeSec, s, camera = DEFAULT_CAMERA, windOff = 0, evo = 0) {
      var _a, _b, _c, _d, _e;
      const gl = this.gl;
      if (!gl || this.lost || !this.program) return;
      gl.useProgram(this.program);
      const u = this.u;
      gl.uniform2f(u.u_res, this.canvas.width, this.canvas.height);
      gl.uniform1f(u.u_time, timeSec % TIME_WRAP_SEC);
      gl.uniform3f(u.u_cam, camera.yaw, camera.pitch, camera.fov);
      gl.uniform2f(u.u_sun, s.sunElevation, s.sunAzimuth);
      const c = s.clouds;
      gl.uniform1f(u.u_cover, s.cloudCover);
      gl.uniform3f(u.u_high, c.cirrus, c.cirrostratus, c.cirrocumulus);
      gl.uniform3f(u.u_mid, c.altostratus, c.altocumulus, c.nimbostratus);
      gl.uniform4f(u.u_low, c.stratus, c.stratocumulus, c.cumulus, c.cumulonimbus);
      gl.uniform1f(u.u_rain, s.rain);
      gl.uniform1f(u.u_snow, s.snow);
      gl.uniform1f(u.u_wind, s.wind);
      gl.uniform1f(u.u_thunder, s.thunder);
      gl.uniform1f(u.u_haze, s.haze);
      gl.uniform2f(u.u_cbFeat, s.features.anvil, s.features.velum);
      gl.uniform1f(u.u_windOff, windOff);
      gl.uniform1f(u.u_evo, evo);
      gl.uniform1f(u.u_filtAmt, s.filter.amount);
      gl.uniform3f(u.u_filtTint, s.filter.tint[0], s.filter.tint[1], s.filter.tint[2]);
      gl.uniform1f(u.u_filtSat, s.filter.saturation);
      gl.uniform1f(u.u_filtLift, s.filter.lift);
      gl.uniform1f(u.u_p3, this.p3 ? 1 : 0);
      gl.uniform1f(u.u_headroom, Math.max(1, (_a = this.opts.headroom) != null ? _a : 1));
      const t = s.tone;
      gl.uniform4f(u.u_tone, t.exposure, t.contrast, t.knee, t.bleach);
      const pz = s.polarizer;
      gl.uniform4f(u.u_pol, pz.strength, pz.angle, pz.saturation, pz.stopLoss);
      const ce = s.celestial;
      gl.uniform4f(u.u_sky, ce.bortle, ce.milkyWay, ce.meteors, ce.radiant ? 1 : 0);
      gl.uniform2f(u.u_radiant, (_c = (_b = ce.radiant) == null ? void 0 : _b[0]) != null ? _c : 0, (_e = (_d = ce.radiant) == null ? void 0 : _d[1]) != null ? _e : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    /**
     * Release GPU resources.
     *
     * @param options.loseContext
     *   Force the WebGL context itself to be released. Off by default: the same
     *   canvas usually gets reused across remounts (React StrictMode runs
     *   effects twice, and getContext would otherwise come back in a lost
     *   state). Turn it on for a throwaway canvas — e.g. an offscreen one used
     *   to bake a cubemap. Browsers cap how many contexts can be alive at once
     *   and evict the oldest, so leaking throwaway contexts eventually kills
     *   the live renderer's own context.
     */
    dispose(options = {}) {
      var _a;
      const gl = this.gl;
      this.canvas.removeEventListener("webglcontextlost", this.onLost);
      this.canvas.removeEventListener("webglcontextrestored", this.onRestored);
      if (gl) {
        if (this.program) gl.deleteProgram(this.program);
        if (this.buffer) gl.deleteBuffer(this.buffer);
        if (options.loseContext) {
          (_a = gl.getExtension("WEBGL_lose_context")) == null ? void 0 : _a.loseContext();
        }
      }
      this.gl = null;
      this.program = null;
      this.buffer = null;
    }
  };
  var DEFAULT_RESOLUTION_SCALE = () => Math.min(typeof devicePixelRatio === "number" ? devicePixelRatio : 1, 1.5) * 0.55;
  var Atmosphere = class {
    constructor(canvas, options = {}) {
      __publicField(this, "canvas");
      __publicField(this, "renderer");
      __publicField(this, "animator");
      __publicField(this, "opts");
      __publicField(this, "target");
      __publicField(this, "conditions");
      __publicField(this, "cam");
      __publicField(this, "raf", 0);
      __publicField(this, "observer", null);
      __publicField(this, "startedAt", 0);
      __publicField(this, "last", 0);
      __publicField(this, "lastDraw", 0);
      // "the caller wants rendering" — kept separate from the raf loop, so
      // reduced-motion can pause the loop without forgetting the caller's intent
      __publicField(this, "wantRunning", false);
      __publicField(this, "motionQuery", null);
      __publicField(this, "onMotionChange", () => {
        if (!this.wantRunning) return;
        if (this.reducedMotion) {
          this.stopLoop();
          this.jump();
        } else {
          this.startLoop();
        }
      });
      this.canvas = canvas;
      this.opts = options;
      this.conditions = {
        time: options.time,
        location: options.location,
        weather: options.weather,
        filter: options.filter,
        tone: options.tone,
        polarizer: options.polarizer,
        celestial: options.celestial,
        camera: options.camera
      };
      this.target = resolveConditions(this.conditions);
      this.cam = resolveCamera(options.camera);
      this.renderer = new AtmosphereRenderer(canvas, { colorSpace: options.colorSpace });
      this.animator = new StateAnimator(this.target, options.animator);
      this.resize();
      if (typeof ResizeObserver !== "undefined") {
        this.observer = new ResizeObserver(() => this.resize());
        this.observer.observe(canvas);
      }
      if (options.respectReducedMotion !== false && typeof matchMedia !== "undefined") {
        this.motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
        this.motionQuery.addEventListener("change", this.onMotionChange);
      }
      if (options.autoStart !== false) this.start();
    }
    /** true when the environment asks for reduced motion (and the option honors it) */
    get reducedMotion() {
      var _a, _b;
      return (_b = (_a = this.motionQuery) == null ? void 0 : _a.matches) != null ? _b : false;
    }
    /** false in environments where WebGL isn't available */
    get available() {
      return this.renderer.available;
    }
    /** the space actually being rendered into (`'display-p3'` only where supported) */
    get colorSpace() {
      return this.renderer.colorSpace;
    }
    /**
     * A snapshot of the current (mid-transition) state.
     *
     * The animator mutates its state in place every frame, so this returns a
     * copy — safe to hold on to and compare across frames. For a zero-copy live
     * view (e.g. a custom render loop), use `StateAnimator.current` directly.
     */
    get state() {
      const c = this.animator.current;
      return __spreadProps(__spreadValues({}, c), {
        clouds: __spreadValues({}, c.clouds),
        features: __spreadValues({}, c.features),
        filter: __spreadProps(__spreadValues({}, c.filter), { tint: [...c.filter.tint] }),
        tone: __spreadValues({}, c.tone),
        polarizer: __spreadValues({}, c.polarizer),
        celestial: __spreadProps(__spreadValues({}, c.celestial), {
          radiant: c.celestial.radiant ? [c.celestial.radiant[0], c.celestial.radiant[1]] : null
        })
      });
    }
    /** the direction currently being faced */
    get camera() {
      return this.cam;
    }
    /**
     * update the target. Only the given fields change, transitioning over a few
     * seconds (under reduced motion the change applies as a cut instead)
     */
    set(c) {
      this.applyConditions(c);
      if (this.wantRunning && !this.raf && this.reducedMotion) {
        this.animator.jump(this.target);
        this.draw(performance.now());
      }
    }
    /** apply instantly, with no transition (for initial display, or a scene cut) */
    jump(c = {}) {
      this.applyConditions(c);
      this.animator.jump(this.target);
      this.draw(performance.now());
    }
    applyConditions(c) {
      this.conditions = __spreadValues(__spreadValues({}, this.conditions), c);
      this.target = resolveConditions(this.conditions);
      if (c.camera) this.cam = resolveCamera(__spreadValues(__spreadValues({}, this.cam), c.camera));
    }
    /** recompute internal resolution from the canvas's displayed size */
    resize() {
      var _a;
      const scale = (_a = this.opts.resolutionScale) != null ? _a : DEFAULT_RESOLUTION_SCALE();
      const w = this.canvas.clientWidth || this.canvas.width;
      const h = this.canvas.clientHeight || this.canvas.height;
      this.renderer.resize(
        Math.max(1, Math.round(w * scale)),
        Math.max(1, Math.round(h * scale))
      );
    }
    start() {
      if (!this.available) return;
      this.wantRunning = true;
      if (this.reducedMotion) {
        this.jump();
        return;
      }
      this.startLoop();
    }
    /** stop the render loop (let the GPU rest). State is preserved */
    stop() {
      this.wantRunning = false;
      this.stopLoop();
    }
    startLoop() {
      if (this.raf) return;
      const now = performance.now();
      if (!this.startedAt) this.startedAt = now;
      this.last = now;
      const tick = (t) => {
        var _a;
        this.raf = requestAnimationFrame(tick);
        const interval = 1e3 / ((_a = this.opts.fps) != null ? _a : 30);
        const elapsed = t - this.lastDraw;
        if (elapsed < interval) return;
        this.lastDraw = t - elapsed % interval;
        this.draw(t);
      };
      this.raf = requestAnimationFrame(tick);
    }
    stopLoop() {
      if (!this.raf) return;
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
    draw(t) {
      if (!this.startedAt) {
        this.startedAt = t;
        this.last = t;
      }
      const dt = Math.min(0.2, (t - this.last) / 1e3);
      this.last = t;
      this.animator.step(this.target, dt);
      if (this.reducedMotion) this.animator.current.celestial.meteors = 0;
      this.renderer.render(
        (t - this.startedAt) / 1e3,
        this.animator.current,
        this.cam,
        this.animator.wind,
        this.animator.evolution
      );
    }
    /**
     * Stop drawing and release resources.
     *
     * @param options.loseContext see {@link AtmosphereRenderer.dispose}. Turn it
     *   on only for a throwaway canvas; a canvas that gets remounted should keep
     *   its context.
     */
    dispose(options = {}) {
      var _a, _b;
      this.stop();
      (_a = this.observer) == null ? void 0 : _a.disconnect();
      this.observer = null;
      (_b = this.motionQuery) == null ? void 0 : _b.removeEventListener("change", this.onMotionChange);
      this.motionQuery = null;
      this.renderer.dispose(options);
    }
  };
  function mapValues(src, fn) {
    const out = {};
    for (const k of Object.keys(src)) out[k] = fn(src[k]);
    return out;
  }
  var WEATHER_LABELS = {
    en: mapValues(WEATHER_PRESETS, (p) => p.label),
    ja: {
      clear: "\u5FEB\u6674",
      fair: "\u6674\u308C",
      summer: "\u590F\u7A7A",
      overcast: "\u66C7\u308A",
      fog: "\u9727",
      rain: "\u96E8",
      thunderstorm: "\u96F7\u96E8",
      snow: "\u96EA",
      typhoon: "\u53F0\u98A8"
    }
  };
  var FILTER_LABELS = {
    en: mapValues(FILTER_PRESETS, (p) => p.label),
    ja: {
      none: "\u306A\u3057",
      sepia: "\u30BB\u30D4\u30A2",
      mono: "\u30E2\u30CE\u30AF\u30ED\u30FC\u30E0",
      faded: "\u892A\u8272",
      cyanotype: "\u9752\u306E\u8A18\u61B6",
      gold: "\u9EC4\u660F",
      ash: "\u7070"
    }
  };
  var CLOUD_LABELS = {
    en: mapValues(CLOUD_GENERA, (g) => ({ label: g.label, alias: g.alias })),
    ja: {
      cirrus: { label: "\u5DFB\u96F2", alias: "\u3059\u3058\u96F2" },
      cirrostratus: { label: "\u5DFB\u5C64\u96F2", alias: "\u3046\u3059\u96F2" },
      cirrocumulus: { label: "\u5DFB\u7A4D\u96F2", alias: "\u3046\u308D\u3053\u96F2\u30FB\u3044\u308F\u3057\u96F2" },
      altostratus: { label: "\u9AD8\u5C64\u96F2", alias: "\u304A\u307C\u308D\u96F2" },
      altocumulus: { label: "\u9AD8\u7A4D\u96F2", alias: "\u3072\u3064\u3058\u96F2" },
      nimbostratus: { label: "\u4E71\u5C64\u96F2", alias: "\u3042\u307E\u96F2" },
      stratus: { label: "\u5C64\u96F2", alias: "\u304D\u308A\u96F2" },
      stratocumulus: { label: "\u5C64\u7A4D\u96F2", alias: "\u304F\u3082\u308A\u96F2" },
      cumulus: { label: "\u7A4D\u96F2", alias: "\u308F\u305F\u96F2" },
      cumulonimbus: { label: "\u7A4D\u4E71\u96F2", alias: "\u5165\u9053\u96F2" }
    }
  };

  // docs/weather-atmosphere.js
  var DEFAULT_LOCATION = { latitude: 37.8991768, longitude: -122.4949685 };
  var WMO_ATMOSPHERE_TABLE = {
    // Group 0: clear
    0: { cloudCover: 0, precipitation: 0, windSpeed: 2, visibility: 45, thunder: 0 },
    // Group 1-3: cloud cover
    1: { cloudCover: 0.22, precipitation: 0, windSpeed: 3, visibility: 35, thunder: 0 },
    2: { cloudCover: 0.45, precipitation: 0, windSpeed: 4, visibility: 30, thunder: 0 },
    3: { cloudCover: 0.92, precipitation: 0, windSpeed: 5, visibility: 18, thunder: 0 },
    // Group 45/48: fog / rime fog
    45: { cloudCover: 0.75, precipitation: 0, windSpeed: 1, visibility: 0.6, thunder: 0 },
    48: { cloudCover: 0.78, precipitation: 0, windSpeed: 1, visibility: 0.4, thunder: 0 },
    // Group 5x: drizzle
    51: { cloudCover: 0.6, precipitation: 1, windSpeed: 3, visibility: 8, thunder: 0, precipitationType: "rain" },
    53: { cloudCover: 0.68, precipitation: 3, windSpeed: 4, visibility: 6, thunder: 0, precipitationType: "rain" },
    55: { cloudCover: 0.75, precipitation: 6, windSpeed: 5, visibility: 4, thunder: 0, precipitationType: "rain" },
    // Group 56/57: freezing drizzle
    56: { cloudCover: 0.7, precipitation: 2, windSpeed: 3, visibility: 3, thunder: 0, precipitationType: "rain" },
    57: { cloudCover: 0.76, precipitation: 5, windSpeed: 4, visibility: 2, thunder: 0, precipitationType: "rain" },
    // Group 6x: rain
    61: { cloudCover: 0.78, precipitation: 4, windSpeed: 5, visibility: 8, thunder: 0, precipitationType: "rain" },
    63: { cloudCover: 0.85, precipitation: 10, windSpeed: 6, visibility: 6, thunder: 0, precipitationType: "rain" },
    65: { cloudCover: 0.92, precipitation: 22, windSpeed: 8, visibility: 4, thunder: 0, precipitationType: "rain" },
    // Group 66/67: freezing rain
    66: { cloudCover: 0.85, precipitation: 6, windSpeed: 5, visibility: 2, thunder: 0, precipitationType: "rain" },
    67: { cloudCover: 0.9, precipitation: 14, windSpeed: 7, visibility: 1, thunder: 0, precipitationType: "rain" },
    // Group 7x: snow
    71: { cloudCover: 0.78, precipitation: 1.5, windSpeed: 4, visibility: 3, thunder: 0, precipitationType: "snow" },
    73: { cloudCover: 0.85, precipitation: 4, windSpeed: 5, visibility: 2, thunder: 0, precipitationType: "snow" },
    75: { cloudCover: 0.92, precipitation: 10, windSpeed: 7, visibility: 1, thunder: 0, precipitationType: "snow" },
    // Group 77: snow grains
    77: { cloudCover: 0.7, precipitation: 0.8, windSpeed: 5, visibility: 2, thunder: 0, precipitationType: "snow" },
    // Group 8x: showers
    80: { cloudCover: 0.55, precipitation: 4, windSpeed: 5, visibility: 10, thunder: 0, precipitationType: "rain" },
    81: { cloudCover: 0.65, precipitation: 10, windSpeed: 6, visibility: 8, thunder: 0, precipitationType: "rain" },
    82: { cloudCover: 0.75, precipitation: 30, windSpeed: 8, visibility: 5, thunder: 0, precipitationType: "rain" },
    85: { cloudCover: 0.55, precipitation: 2, windSpeed: 5, visibility: 4, thunder: 0, precipitationType: "snow" },
    86: { cloudCover: 0.7, precipitation: 12, windSpeed: 7, visibility: 2, thunder: 0, precipitationType: "snow" },
    // Group 9x: thunderstorms
    95: { cloudCover: 0.96, precipitation: 25, windSpeed: 10, visibility: 5, thunder: 1, precipitationType: "rain" },
    96: { cloudCover: 0.97, precipitation: 30, windSpeed: 12, visibility: 4, thunder: 1, precipitationType: "rain", convection: 0.85 },
    99: { cloudCover: 0.99, precipitation: 45, windSpeed: 15, visibility: 3, thunder: 1, precipitationType: "rain", convection: 0.95 }
  };
  var KEY_TABLE = {
    "clear-day": __spreadProps(__spreadValues({}, WMO_ATMOSPHERE_TABLE[0]), { overlay: "clear-day", cloudCover: 0.03, windSpeed: 3 }),
    "clear-night": __spreadProps(__spreadValues({}, WMO_ATMOSPHERE_TABLE[0]), { overlay: "clear-night", cloudCover: 0, windSpeed: 2 }),
    // "Mostly clear" should still feel clear -- reuse the clear-day/night
    // sparkle/star overlays (a sky that's 85-90% clear still shows plenty of
    // stars at night / sun glints by day), just with a touch of cloud in the
    // WebGL sky itself so it's not identical to fully clear.
    "mostly-clear-day": __spreadProps(__spreadValues({}, WMO_ATMOSPHERE_TABLE[1]), { overlay: "clear-day", cloudCover: 0.15, windSpeed: 3 }),
    "mostly-clear-night": __spreadProps(__spreadValues({}, WMO_ATMOSPHERE_TABLE[1]), { overlay: "clear-night", cloudCover: 0.1, windSpeed: 2 }),
    "partly-cloudy-day": WMO_ATMOSPHERE_TABLE[2],
    "partly-cloudy-night": WMO_ATMOSPHERE_TABLE[2],
    "mostly-cloudy-day": __spreadProps(__spreadValues({}, WMO_ATMOSPHERE_TABLE[3]), { cloudCover: 0.78 }),
    "mostly-cloudy-night": __spreadProps(__spreadValues({}, WMO_ATMOSPHERE_TABLE[3]), { cloudCover: 0.78 }),
    "overcast": WMO_ATMOSPHERE_TABLE[3],
    "fog": __spreadProps(__spreadValues({}, WMO_ATMOSPHERE_TABLE[45]), { overlay: "fog-bank" }),
    "drizzle": WMO_ATMOSPHERE_TABLE[53],
    "rain": WMO_ATMOSPHERE_TABLE[63],
    "rain-heavy": WMO_ATMOSPHERE_TABLE[65],
    "freezing-rain": WMO_ATMOSPHERE_TABLE[67],
    "snow": WMO_ATMOSPHERE_TABLE[73],
    "snow-heavy": WMO_ATMOSPHERE_TABLE[75],
    "snow-grains": WMO_ATMOSPHERE_TABLE[77],
    "rain-showers": WMO_ATMOSPHERE_TABLE[81],
    "snow-showers": WMO_ATMOSPHERE_TABLE[86],
    "thunderstorm": WMO_ATMOSPHERE_TABLE[95],
    "thunderstorm-hail": WMO_ATMOSPHERE_TABLE[99]
  };
  var EXTREME_TABLE = {
    // Severe storms
    "tornado": { cloudCover: 1, precipitation: 60, windSpeed: 75, visibility: 0.2, thunder: 1, convection: 1, precipitationType: "rain", overlay: "tornado", label: "Tornado" },
    "waterspout": { cloudCover: 0.98, precipitation: 45, windSpeed: 55, visibility: 0.5, thunder: 1, convection: 0.95, precipitationType: "rain", overlay: "tornado", label: "Waterspout" },
    "hurricane": { cloudCover: 1, precipitation: 90, windSpeed: 60, visibility: 0.2, thunder: 0.9, convection: 1, precipitationType: "rain", overlay: "hurricane", label: "Hurricane" },
    "tropical-storm": { cloudCover: 1, precipitation: 45, windSpeed: 35, visibility: 0.5, thunder: 0.7, convection: 0.8, precipitationType: "rain", overlay: "rain", label: "Tropical Storm" },
    "derecho": { cloudCover: 1, precipitation: 40, windSpeed: 50, visibility: 1, thunder: 1, convection: 0.95, precipitationType: "rain", overlay: "lightning", label: "Derecho" },
    "squall": { cloudCover: 0.95, precipitation: 25, windSpeed: 30, visibility: 2, thunder: 0.8, convection: 0.7, precipitationType: "rain", overlay: "rain", label: "Squall" },
    // Winter extremes
    "blizzard": { cloudCover: 1, precipitation: 20, windSpeed: 28, visibility: 0.1, thunder: 0, convection: 0, precipitationType: "snow", overlay: "snow-blizzard", label: "Blizzard" },
    "ice-storm": { cloudCover: 0.95, precipitation: 18, windSpeed: 12, visibility: 0.5, thunder: 0, convection: 0, precipitationType: "rain", overlay: "ice", label: "Ice Storm" },
    // Visibility / aerosol events
    "sandstorm": { cloudCover: 0.95, precipitation: 0, windSpeed: 25, visibility: 0.05, thunder: 0, convection: 0, overlay: "sand", label: "Sandstorm" },
    "dust-storm": { cloudCover: 0.92, precipitation: 0, windSpeed: 20, visibility: 0.1, thunder: 0, convection: 0, overlay: "dust", label: "Dust Storm" },
    "volcanic-ash": { cloudCover: 0.95, precipitation: 0, windSpeed: 8, visibility: 0.3, thunder: 0, convection: 0, overlay: "ash", label: "Volcanic Ash" },
    "wildfire-smoke": { cloudCover: 0.9, precipitation: 0, windSpeed: 6, visibility: 1, thunder: 0, convection: 0, overlay: "smoke", label: "Wildfire Smoke" },
    "forest-fire": { cloudCover: 0.88, precipitation: 0, windSpeed: 8, visibility: 0.5, thunder: 0, convection: 0, overlay: "fire", label: "Forest Fire" },
    "smoke": { cloudCover: 0.8, precipitation: 0, windSpeed: 4, visibility: 1.5, thunder: 0, convection: 0, overlay: "smoke", label: "Smoke" },
    "ash": { cloudCover: 0.85, precipitation: 0, windSpeed: 5, visibility: 0.4, thunder: 0, convection: 0, overlay: "ash", label: "Ash" },
    "haze": { cloudCover: 0.35, precipitation: 0, windSpeed: 3, visibility: 5, thunder: 0, convection: 0, overlay: "haze", label: "Haze" },
    "smog": { cloudCover: 0.55, precipitation: 0, windSpeed: 2, visibility: 2, thunder: 0, convection: 0, overlay: "smoke", label: "Smog" },
    "acid-rain": { cloudCover: 0.8, precipitation: 12, windSpeed: 6, visibility: 5, thunder: 0.2, convection: 0, precipitationType: "rain", overlay: "acid-rain", label: "Acid Rain" },
    "flash-flood": { cloudCover: 0.85, precipitation: 50, windSpeed: 10, visibility: 2, thunder: 0.4, convection: 0.5, precipitationType: "rain", overlay: "rain", label: "Flash Flood" },
    // Astronomical / rare sky events
    "aurora": { cloudCover: 0.2, precipitation: 0, windSpeed: 2, visibility: 45, thunder: 0, convection: 0, overlay: "aurora", label: "Aurora" },
    "eclipse": { cloudCover: 0.1, precipitation: 0, windSpeed: 2, visibility: 45, thunder: 0, convection: 0, overlay: "eclipse", label: "Solar Eclipse" },
    "rainbow": { cloudCover: 0.3, precipitation: 0, windSpeed: 4, visibility: 35, thunder: 0, convection: 0, overlay: "rainbow", label: "Rainbow" },
    "meteor-shower": { cloudCover: 0.15, precipitation: 0, windSpeed: 2, visibility: 45, thunder: 0, convection: 0, overlay: "meteors", label: "Meteor Shower" },
    "meteor-impact": { cloudCover: 0.25, precipitation: 0, windSpeed: 6, visibility: 30, thunder: 0.6, convection: 0, overlay: "meteor-impact", label: "Meteor Impact" },
    "asteroid-impact": { cloudCover: 0.6, precipitation: 0, windSpeed: 20, visibility: 10, thunder: 1, convection: 0.5, overlay: "meteor-impact", label: "Asteroid Impact" },
    // Geological / natural disaster events
    "earthquake": { cloudCover: 0.5, precipitation: 0, windSpeed: 4, visibility: 20, thunder: 0, convection: 0, overlay: "earthquake", label: "Earthquake" },
    "tsunami": { cloudCover: 0.85, precipitation: 0, windSpeed: 15, visibility: 2, thunder: 0.2, convection: 0, overlay: "tsunami", label: "Tsunami" },
    "volcanic-eruption": { cloudCover: 1, precipitation: 0, windSpeed: 12, visibility: 0.05, thunder: 0.8, convection: 0.9, overlay: "volcano", label: "Volcanic Eruption" },
    "landslide": { cloudCover: 0.65, precipitation: 5, windSpeed: 8, visibility: 2, thunder: 0, convection: 0, overlay: "landslide", label: "Landslide" },
    "mudslide": { cloudCover: 0.7, precipitation: 15, windSpeed: 10, visibility: 1, thunder: 0, convection: 0, overlay: "mudslide", label: "Mudslide" },
    "avalanche": { cloudCover: 0.8, precipitation: 8, windSpeed: 12, visibility: 0.5, thunder: 0, convection: 0, precipitationType: "snow", overlay: "avalanche", label: "Avalanche" },
    "rockfall": { cloudCover: 0.4, precipitation: 0, windSpeed: 6, visibility: 5, thunder: 0, convection: 0, overlay: "rockfall", label: "Rockfall" },
    "geological-event": { cloudCover: 0.55, precipitation: 0, windSpeed: 5, visibility: 10, thunder: 0, convection: 0, overlay: "earthquake", label: "Geological Event" },
    // Fallback / testing
    "apocalypse": { cloudCover: 1, precipitation: 80, windSpeed: 40, visibility: 0.05, thunder: 1, convection: 1, precipitationType: "rain", overlay: "tornado", label: "Apocalypse" }
  };
  var ALL_CONDITIONS = __spreadValues(__spreadValues({}, KEY_TABLE), EXTREME_TABLE);
  var WeatherOverlay = class {
    constructor(container) {
      this.canvas = document.createElement("canvas");
      this.canvas.id = "fx-overlay";
      this.canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1";
      container.appendChild(this.canvas);
      this.ctx = this.canvas.getContext("2d");
      this.effect = null;
      this.t = 0;
      this.w = 0;
      this.h = 0;
      this.particles = [];
      this.lastTick = 0;
      this.dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 1.5) * 0.5;
      this.fps = 20;
      this.resize();
      window.addEventListener("resize", () => this.resize());
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
      if (effect && ["clear-day", "clear-night", "sand", "dust", "ash", "smoke", "haze", "snow-blizzard", "volcano", "landslide", "mudslide", "avalanche", "rockfall", "earthquake", "tsunami", "acid-rain", "fire"].includes(effect)) {
        const count = {
          "clear-day": 35,
          "clear-night": 60,
          sand: 300,
          dust: 250,
          ash: 200,
          smoke: 150,
          haze: 100,
          "snow-blizzard": 400,
          volcano: 300,
          landslide: 250,
          mudslide: 300,
          avalanche: 400,
          rockfall: 200,
          earthquake: 250,
          tsunami: 0,
          "acid-rain": 120,
          fire: 150
        }[effect] || 300;
        for (let i = 0; i < count; i++) this.particles.push(this._newParticle(effect));
      }
      const ww = document.querySelector(".ww");
      if (ww) {
        ww.style.transition = "none";
        ww.style.transform = "";
      }
    }
    _rand(a, b) {
      return a + Math.random() * (b - a);
    }
    _newParticle(effect) {
      const w = this.w, h = this.h;
      switch (effect) {
        case "clear-day":
          return { x: this._rand(0, w), y: this._rand(0, h), r: this._rand(0.8, 2.2), v: this._rand(0.2, 0.6), vy: this._rand(-0.1, 0.1), op: this._rand(0.15, 0.35), life: this._rand(120, 240), type: "clear-day" };
        case "clear-night":
          return { x: this._rand(0, w), y: this._rand(0, h * 0.6), r: this._rand(0.6, 1.6), v: this._rand(0.05, 0.15), vy: this._rand(-0.03, 0.03), op: this._rand(0.25, 0.7), life: this._rand(80, 180), twinkle: this._rand(0.5, 1.2), phase: this._rand(0, Math.PI * 2), type: "clear-night" };
        case "sand":
        case "dust":
          return { x: this._rand(-w, w), y: this._rand(0, h), r: this._rand(1, 3), v: this._rand(12, 25), vy: this._rand(-1, 1), op: this._rand(0.4, 0.9) };
        case "ash":
          return { x: this._rand(0, w), y: this._rand(-h, 0), r: this._rand(1, 4), v: this._rand(2, 6), vy: this._rand(2, 8), op: this._rand(0.3, 0.8) };
        case "smoke":
        case "haze":
          return { x: this._rand(-w, w), y: this._rand(0, h), r: this._rand(20, 80), v: this._rand(4, 10), vy: this._rand(-0.5, 0.5), op: this._rand(0.05, 0.2), grow: this._rand(0.2, 0.8) };
        case "snow-blizzard":
          return { x: this._rand(0, w), y: this._rand(-h, h), r: this._rand(1, 3), v: this._rand(18, 35), vy: this._rand(4, 10), op: this._rand(0.5, 0.95) };
        case "volcano":
          return { x: this._rand(w * 0.45, w * 0.55), y: this._rand(h * 0.55, h * 0.75), r: this._rand(2, 6), v: this._rand(-2, 6), vy: this._rand(-6, -1), op: this._rand(0.4, 0.9), life: this._rand(20, 80) };
        case "landslide":
        case "mudslide":
          return { x: this._rand(-100, w), y: this._rand(-50, h * 0.6), r: this._rand(3, 10), v: this._rand(3, 10), vy: this._rand(2, 8), op: this._rand(0.5, 0.9) };
        case "avalanche":
          return { x: this._rand(0, w), y: this._rand(-h, 0), r: this._rand(2, 6), v: this._rand(10, 25), vy: this._rand(8, 18), op: this._rand(0.5, 0.95) };
        case "rockfall":
          return { x: this._rand(-50, w + 50), y: this._rand(-h * 0.5, 0), r: this._rand(3, 12), v: this._rand(-2, 4), vy: this._rand(4, 14), op: this._rand(0.5, 0.9), rot: this._rand(0, Math.PI * 2), rotv: this._rand(-0.2, 0.2) };
        case "earthquake":
          return { x: this._rand(0, w), y: this._rand(h * 0.6, h), r: this._rand(1, 4), v: this._rand(-1, 1), vy: this._rand(-1, -3), op: this._rand(0.3, 0.7), life: this._rand(10, 50) };
        case "acid-rain":
          return { x: this._rand(0, w), y: this._rand(0, h), len: this._rand(14, 28), v: this._rand(9, 16), op: this._rand(0.35, 0.75) };
        case "fire":
          return { x: this._rand(0, w), y: this._rand(h * 0.55, h), r: this._rand(2, 7), v: this._rand(-1, 2), vy: this._rand(-3, -0.5), op: this._rand(0.4, 0.9), life: this._rand(20, 70) };
        default:
          return {};
      }
    }
    _tick(now) {
      const t = now || performance.now();
      const interval = 1e3 / this.fps;
      if (t - this.lastTick < interval) {
        requestAnimationFrame((next) => this._tick(next));
        return;
      }
      this.lastTick = t - (t - this.lastTick) % interval;
      this.t++;
      const { ctx, w, h } = this;
      ctx.clearRect(0, 0, w, h);
      if (this.effect === "tornado") this._drawTornado(ctx, w, h);
      else if (this.effect === "hurricane") this._drawHurricane(ctx, w, h);
      else if (this.effect === "lightning") this._drawLightningBolts(ctx, w, h);
      else if (this.effect === "ice") this._drawIce(ctx, w, h);
      else if (this.effect === "aurora") this._drawAurora(ctx, w, h);
      else if (this.effect === "eclipse") this._drawEclipse(ctx, w, h);
      else if (this.effect === "rainbow") this._drawRainbow(ctx, w, h);
      else if (this.effect === "meteors") this._drawMeteors(ctx, w, h);
      else if (this.effect === "meteor-impact") this._drawMeteorImpact(ctx, w, h);
      else if (this.effect === "earthquake") this._drawEarthquake(ctx, w, h);
      else if (this.effect === "tsunami") this._drawTsunami(ctx, w, h);
      else if (this.effect === "volcano") this._drawVolcano(ctx, w, h);
      else if (this.effect === "landslide") this._drawLandslide(ctx, w, h);
      else if (this.effect === "mudslide") this._drawMudslide(ctx, w, h);
      else if (this.effect === "avalanche") this._drawAvalanche(ctx, w, h);
      else if (this.effect === "rockfall") this._drawRockfall(ctx, w, h);
      else if (this.effect === "acid-rain") this._drawAcidRain(ctx, w, h);
      else if (this.effect === "fire") this._drawFire(ctx, w, h);
      else if (this.effect === "fog-bank") this._drawFogBank(ctx, w, h);
      else if (this.effect === "clear-day") this._drawClearDay(ctx, w, h);
      else if (this.effect === "clear-night") this._drawClearNight(ctx, w, h);
      else if (this.particles.length) this._drawParticles(ctx, w, h);
      requestAnimationFrame((next) => this._tick(next));
    }
    _drawTornado(ctx, w, h) {
      const cx = w * 0.5, baseY = h * 0.95;
      const swirl = this.t * 0.04;
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      const grad = ctx.createLinearGradient(cx, baseY, cx, 0);
      grad.addColorStop(0, "rgba(20,20,25,0.9)");
      grad.addColorStop(0.45, "rgba(60,60,70,0.5)");
      grad.addColorStop(1, "rgba(120,120,130,0)");
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
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 40; i++) {
        const ang = swirl + i * 0.35;
        const r = 80 + Math.sin(this.t * 0.1 + i) * 20;
        const x = cx + Math.cos(ang) * r;
        const y = baseY - 20 + Math.sin(ang) * 10;
        ctx.fillStyle = `rgba(180,170,160,${0.3 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.5 + Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    _drawHurricane(ctx, w, h) {
      const cx = w * 0.5, cy = h * 0.45;
      const angle = this.t * 0.015;
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      for (let arm = 0; arm < 4; arm++) {
        const armAngle = angle + arm * (Math.PI / 2);
        ctx.strokeStyle = "rgba(60,60,70,0.35)";
        ctx.lineWidth = 18;
        ctx.beginPath();
        for (let r = 40; r < Math.max(w, h) * 0.8; r += 8) {
          const a = armAngle + r * 0.018;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          if (r === 40) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      const eyeGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 45);
      eyeGrad.addColorStop(0, "rgba(200,190,170,0.9)");
      eyeGrad.addColorStop(0.6, "rgba(90,85,80,0.6)");
      eyeGrad.addColorStop(1, "rgba(40,40,45,0)");
      ctx.fillStyle = eyeGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    _drawLightningBolts(ctx, w, h) {
      if (Math.random() > 0.03) return;
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.strokeStyle = "rgba(255,250,220,0.95)";
      ctx.lineWidth = 2 + Math.random() * 3;
      ctx.shadowColor = "#fff8c5";
      ctx.shadowBlur = 20;
      const startX = this._rand(w * 0.2, w * 0.8);
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      let x = startX, y = 0;
      while (y < h * 0.6) {
        x += this._rand(-30, 30);
        y += this._rand(15, 40);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }
    _drawIce(ctx, w, h) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 30; i++) {
        const x = (this.t * 0.5 + i * 137) % (w + 60) - 30;
        const y = i * 79 % (h + 40) - 20;
        const s = 8 + i % 7;
        ctx.strokeStyle = `rgba(200,230,255,${0.15 + i % 5 * 0.05})`;
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
      ctx.globalCompositeOperation = "screen";
      const ribbons = [
        { hue: 140, baseY: 0.16, amp: 55, speed: 0.015, thickness: 110 },
        { hue: 165, baseY: 0.26, amp: 70, speed: 0.011, thickness: 130 },
        { hue: 195, baseY: 0.36, amp: 50, speed: 0.02, thickness: 90 }
      ];
      for (const rb of ribbons) {
        const baseY = h * rb.baseY;
        const step = 10;
        for (let x = 0; x <= w; x += step) {
          const y = baseY + Math.sin(x * 0.012 + this.t * rb.speed) * rb.amp + Math.sin(x * 4e-3 + this.t * rb.speed * 0.6) * rb.amp * 0.6;
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
      ctx.globalCompositeOperation = "source-over";
      const grad = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.6);
      grad.addColorStop(0, "rgba(255,240,200,0.9)");
      grad.addColorStop(0.5, "rgba(255,220,120,0.4)");
      grad.addColorStop(1, "rgba(255,200,80,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(10,10,12,0.85)";
      ctx.beginPath();
      ctx.arc(cx + r * 0.15, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    _drawRainbow(ctx, w, h) {
      const cx = w * 0.5, cy = h * 0.95, r = Math.min(w, h) * 0.75;
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      const colors = ["#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#0000ff", "#4b0082", "#9400d3"];
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
      ctx.globalCompositeOperation = "source-over";
      const bands = 5;
      for (let i = 0; i < bands; i++) {
        const yCenter = h * (0.25 + i * 0.16);
        const drift = Math.sin(this.t * 6e-3 + i * 1.7) * 40;
        const bob = Math.sin(this.t * 0.01 + i) * 12;
        const grad = ctx.createLinearGradient(0, yCenter - 60 + bob, 0, yCenter + 60 + bob);
        grad.addColorStop(0, "rgba(235,238,242,0)");
        grad.addColorStop(0.5, `rgba(235,238,242,${0.22 - i * 0.02})`);
        grad.addColorStop(1, "rgba(235,238,242,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(drift - 100, 0, w + 200, h);
      }
      const wash = ctx.createLinearGradient(0, 0, 0, h);
      wash.addColorStop(0, "rgba(240,242,246,0.06)");
      wash.addColorStop(1, "rgba(240,242,246,0.28)");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
    _drawParticles(ctx, w, h) {
      const effect = this.effect;
      ctx.save();
      if (effect === "sand" || effect === "dust") {
        ctx.fillStyle = effect === "sand" ? "rgba(194,160,120," : "rgba(160,150,130,";
        for (const p of this.particles) {
          p.x += p.v;
          p.y += p.vy;
          if (p.x > w + 50) {
            p.x = -50;
            p.y = this._rand(0, h);
          }
          ctx.globalAlpha = p.op;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = effect === "sand" ? 0.25 : 0.18;
        ctx.fillStyle = effect === "sand" ? "#c2a078" : "#a69b8a";
        ctx.fillRect(0, 0, w, h);
      } else if (effect === "ash") {
        ctx.fillStyle = "rgba(60,55,55,";
        for (const p of this.particles) {
          p.x += Math.sin(this.t * 0.02 + p.y * 0.01) * 0.5;
          p.y += p.vy;
          if (p.y > h + 10) {
            p.y = -10;
            p.x = this._rand(0, w);
          }
          ctx.globalAlpha = p.op;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = "#6b2e1d";
        ctx.fillRect(0, 0, w, h);
      } else if (effect === "smoke" || effect === "haze") {
        for (const p of this.particles) {
          p.x += p.v;
          p.y += p.vy;
          p.r += p.grow;
          if (p.x > w + p.r) {
            p.x = -p.r;
            p.y = this._rand(0, h);
            p.r = this._rand(20, 80);
          }
          const c = effect === "smoke" ? "80,70,60" : "120,110,100";
          ctx.fillStyle = `rgba(${c},${p.op})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (effect === "snow-blizzard") {
        ctx.fillStyle = "rgba(255,250,240,";
        for (const p of this.particles) {
          p.x += p.v;
          p.y += p.vy;
          if (p.x > w + 20) {
            p.x = -20;
            p.y = this._rand(0, h);
          }
          if (p.y > h + 20) {
            p.y = -20;
            p.x = this._rand(0, w);
          }
          ctx.globalAlpha = p.op;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (effect === "volcano") {
      } else if (effect === "landslide" || effect === "mudslide") {
      } else if (effect === "avalanche") {
      } else if (effect === "rockfall") {
      } else if (effect === "earthquake") {
      }
      ctx.restore();
    }
    _drawMeteors(ctx, w, h) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.strokeStyle = "rgba(255,255,240,0.9)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#fff";
      ctx.shadowBlur = 6;
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
      if (t < 40) {
        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = `rgba(255,240,200,${Math.max(0, 0.9 - t / 40)})`;
        ctx.fillRect(0, 0, w, h);
      }
      const ring = t * 3 % 300;
      ctx.globalCompositeOperation = "screen";
      ctx.strokeStyle = "rgba(255,220,160,0.4)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.3, ring, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,160,60,0.85)";
      ctx.lineWidth = 4;
      ctx.shadowColor = "#ff8a00";
      ctx.shadowBlur = 15;
      const bx = w * 0.5 + t * 0.4, by = h * 0.3 + t * 0.9;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx - 40, by - 90);
      ctx.stroke();
      ctx.restore();
    }
    _drawEarthquake(ctx, w, h) {
      const ww = document.querySelector(".ww");
      if (ww) {
        const shake = (Math.random() - 0.5) * 6;
        const shakeY = (Math.random() - 0.5) * 4;
        ww.style.transform = `translate(${shake}px, ${shakeY}px)`;
      }
      ctx.save();
      ctx.fillStyle = "rgba(120,110,100,";
      for (const p of this.particles) {
        p.x += p.v;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) {
          p.x = this._rand(0, w);
          p.y = this._rand(h * 0.7, h);
          p.life = this._rand(10, 50);
        }
        ctx.globalAlpha = p.op;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(30,25,20,0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h);
      ctx.lineTo(w * 0.35, h * 0.82);
      ctx.lineTo(w * 0.5, h * 0.88);
      ctx.lineTo(w * 0.8, h);
      ctx.stroke();
      ctx.restore();
    }
    _drawTsunami(ctx, w, h) {
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(10,25,40,0.35)";
      ctx.fillRect(0, 0, w, h);
      const waveH = h * 0.55 + Math.sin(this.t * 0.03) * 20;
      const grad = ctx.createLinearGradient(0, h - waveH, 0, h);
      grad.addColorStop(0, "rgba(20,60,90,0.7)");
      grad.addColorStop(0.6, "rgba(10,40,70,0.9)");
      grad.addColorStop(1, "rgba(5,25,50,0.95)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 20) {
        const y = h - waveH + Math.sin(x * 0.02 + this.t * 0.06) * 25;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(220,240,255,0.6)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 20) {
        const y = h - waveH + Math.sin(x * 0.02 + this.t * 0.06) * 25;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }
    _drawVolcano(ctx, w, h) {
      ctx.save();
      const cx = w * 0.5, peakY = h * 0.62;
      ctx.fillStyle = "rgba(20,15,12,0.95)";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(cx, peakY);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      const grad = ctx.createRadialGradient(cx, peakY, 4, cx, peakY - 120, 90);
      grad.addColorStop(0, "rgba(60,55,50,0.95)");
      grad.addColorStop(0.5, "rgba(90,80,70,0.7)");
      grad.addColorStop(1, "rgba(120,110,100,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, peakY - 60, 100 + Math.sin(this.t * 0.05) * 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "screen";
      for (const p of this.particles) {
        p.x += p.v;
        p.y += p.vy;
        p.vy += 0.15;
        if (p.y > h || p.life-- <= 0) {
          p.x = this._rand(w * 0.48, w * 0.52);
          p.y = this._rand(h * 0.58, h * 0.65);
          p.vy = this._rand(-6, -1);
          p.v = this._rand(-2, 4);
          p.life = this._rand(20, 80);
        }
        ctx.fillStyle = `rgba(255,${Math.floor(80 + Math.random() * 80)},30,${p.op})`;
        ctx.shadowColor = "#ff4500";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(80,70,65,0.18)";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
    _drawLandslide(ctx, w, h) {
      ctx.save();
      ctx.fillStyle = "rgba(90,75,55,";
      for (const p of this.particles) {
        p.x += p.v;
        p.y += p.vy;
        if (p.x > w + 50 || p.y > h + 50) {
          p.x = this._rand(-100, w);
          p.y = this._rand(-50, h * 0.5);
        }
        ctx.globalAlpha = p.op;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = "#5c4a35";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.45);
      ctx.lineTo(w, h * 0.35);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    _drawMudslide(ctx, w, h) {
      ctx.save();
      ctx.fillStyle = "rgba(75,60,45,";
      for (const p of this.particles) {
        p.x += p.v * 1.2;
        p.y += p.vy * 1.2;
        if (p.x > w + 50 || p.y > h + 50) {
          p.x = this._rand(-100, w);
          p.y = this._rand(-50, h * 0.5);
        }
        ctx.globalAlpha = p.op;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = "#4a3b2a";
      ctx.fillRect(0, h * 0.5, w, h * 0.5);
      ctx.restore();
    }
    _drawAvalanche(ctx, w, h) {
      ctx.save();
      ctx.fillStyle = "rgba(245,245,255,";
      for (const p of this.particles) {
        p.x += p.v;
        p.y += p.vy;
        if (p.y > h + 20) {
          p.y = this._rand(-h, 0);
          p.x = this._rand(0, w);
        }
        ctx.globalAlpha = p.op;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = "#e8eef5";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w, 0);
      ctx.lineTo(w, h * 0.55);
      ctx.lineTo(0, h * 0.65);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    _drawRockfall(ctx, w, h) {
      ctx.save();
      ctx.fillStyle = "rgba(90,85,80,";
      for (const p of this.particles) {
        p.x += p.v;
        p.y += p.vy;
        p.rot += p.rotv;
        p.vy += 0.2;
        if (p.y > h + 20) {
          p.y = this._rand(-h * 0.5, 0);
          p.x = this._rand(-50, w + 50);
          p.vy = this._rand(4, 14);
        }
        ctx.globalAlpha = p.op;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
        ctx.restore();
      }
      ctx.restore();
    }
    _drawAcidRain(ctx, w, h) {
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(160,180,60,0.15)";
      ctx.fillRect(0, 0, w, h);
      for (const p of this.particles) {
        p.y += p.v;
        if (p.y > h + 20) {
          p.y = -10;
          p.x = this._rand(0, w);
        }
        ctx.strokeStyle = `rgba(200,230,80,${p.op})`;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 2, p.y + p.len);
        ctx.stroke();
      }
      ctx.restore();
    }
    _drawFire(ctx, w, h) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (const p of this.particles) {
        p.x += p.v;
        p.y += p.vy;
        p.vy += 0.05;
        p.life--;
        if (p.life <= 0 || p.y < h * 0.3) {
          p.x = this._rand(w * 0.1, w * 0.9);
          p.y = this._rand(h * 0.7, h);
          p.vy = this._rand(-3, -0.5);
          p.v = this._rand(-1, 1);
          p.life = this._rand(20, 70);
        }
        const r = p.r * (p.life / 70);
        ctx.fillStyle = `rgba(255,${Math.floor(100 + Math.random() * 100)},30,${p.op})`;
        ctx.shadowColor = "#ff6b00";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(60,55,50,0.2)";
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    }
    _drawClearDay(ctx, w, h) {
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      for (const p of this.particles) {
        p.x += p.v;
        p.y += p.vy;
        p.life--;
        if (p.x > w + 20 || p.y < -20 || p.life <= 0) {
          p.x = this._rand(-20, w);
          p.y = this._rand(h * 0.2, h);
          p.v = this._rand(0.3, 0.8);
          p.vy = this._rand(-0.12, 0.12);
          p.life = this._rand(180, 360);
        }
        const tw = 0.7 + 0.3 * Math.sin(this.t * 0.05 + p.x * 0.01);
        ctx.globalAlpha = p.op * tw;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }
    _drawClearNight(ctx, w, h) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (const p of this.particles) {
        p.x += p.v;
        p.y += p.vy;
        p.life--;
        const tw = 0.5 + 0.5 * Math.sin(this.t * p.twinkle + p.phase);
        if (p.life <= 0 || p.y < -10 || p.x > w + 10) {
          p.x = this._rand(0, w);
          p.y = this._rand(h * 0.1, h * 0.7);
          p.v = this._rand(0.05, 0.15);
          p.vy = this._rand(-0.05, 0.05);
          p.life = this._rand(150, 320);
          p.twinkle = this._rand(0.08, 0.18);
          p.phase = this._rand(0, Math.PI * 2);
        }
        ctx.fillStyle = `rgba(255,245,220,${p.op * tw})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (Math.random() < 0.012) {
        const x = this._rand(w * 0.1, w * 0.9);
        const y = this._rand(0, h * 0.4);
        const len = this._rand(20, 60);
        const ang = this._rand(Math.PI * 0.25, Math.PI * 0.55);
        ctx.strokeStyle = "rgba(255,245,220,0.8)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - Math.cos(ang) * len, y + Math.sin(ang) * len);
        ctx.stroke();
      }
      ctx.restore();
    }
  };
  var WeatherAtmosphere = class {
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
      const parent = canvas.parentElement;
      if (parent && !parent.querySelector("#fx-overlay")) {
        this.overlay = new WeatherOverlay(parent);
      }
      try {
        this.sky = new Atmosphere(canvas, {
          time: this._now(),
          location: this.location,
          weather: WMO_ATMOSPHERE_TABLE[0],
          resolutionScale: 0.55,
          fps: 24,
          colorSpace: "srgb",
          celestial: { bortle: 6, milkyWay: 0, meteors: 0 }
        });
      } catch (err) {
        console.error("Atmosphere initialization failed", err);
        this.sky = null;
      }
    }
    _now() {
      const now = new Date(Date.now() + this.timeOffsetMs);
      if (!this.forceDay && !this.forceNight) return now;
      const noon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      return this.forceDay ? noon : midnight;
    }
    setSunState(frac, elevation) {
      if (this.sky) {
        this.timeOffsetMs = 0;
        this.sky.set({ time: this._now() });
      }
    }
    setCondition(key) {
      this.currentKey = key || "clear-day";
      const def = ALL_CONDITIONS[this.currentKey] || WMO_ATMOSPHERE_TABLE[0];
      this.currentParams = __spreadValues({}, def);
      if (this.currentKey.includes("night") && !this.currentParams.isNightAdjusted) {
      }
      if (this.currentParams.precipitation > 0 && !this.currentParams.precipitationType) {
        this.currentParams.precipitationType = "rain";
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
            convection: this.currentParams.convection || 0
          }
        });
      }
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
            cloudCover: cloudCover != null ? cloudCover : fallback.cloudCover != null ? fallback.cloudCover : 0,
            precipitation: precipitation != null ? precipitation : fallback.precipitation != null ? fallback.precipitation : 0,
            windSpeed: windSpeed != null ? windSpeed : fallback.windSpeed != null ? fallback.windSpeed : 2,
            visibility: visibility != null ? visibility : fallback.visibility != null ? fallback.visibility : 45,
            thunder: thunder != null ? thunder : fallback.thunder != null ? fallback.thunder : 0,
            precipitationType: precipitationType != null ? precipitationType : fallback.precipitationType != null ? fallback.precipitationType : "rain"
          }
        });
      }
    }
    dispose() {
      if (this.sky) {
        this.sky.stop && this.sky.stop();
        this.sky.dispose && this.sky.dispose();
      }
      if (this.overlay) {
        this.overlay.canvas.remove();
      }
    }
  };
  window.WeatherAtmosphere = WeatherAtmosphere;

  // docs/weather.js
  var LAT = 37.8991768;
  var LON = -122.4949685;
  var TZ = "America/Los_Angeles";
  var REFRESH_MS = 15 * 60 * 1e3;
  var THEME = document.documentElement.getAttribute("data-theme") || "day";
  var FORCED_SCENE = new URLSearchParams(location.search).get("scene");
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }
  function rgbToHex([r, g, b]) {
    return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
  }
  function lerpColor(a, b, t) {
    const ca = hexToRgb(a), cb = hexToRgb(b);
    return rgbToHex([ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t, ca[2] + (cb[2] - ca[2]) * t]);
  }
  var DAY_SKY_STOPS = [
    // elevation, top, mid, bottom
    [0, "#7fa8cf", "#ffcf9e", "#fff6ea"],
    [0.25, "#5b9bda", "#bfe0f0", "#eef7fa"],
    [0.55, "#4a90d9", "#8ec9ee", "#eaf6fc"],
    [1, "#3f86d4", "#8ec9ee", "#e8f4fb"]
  ];
  var NIGHT_SKY_STOPS = [
    // elevation (negative), top, mid, bottom
    [0, "#140a1e", "#3a2210", "#0d0800"],
    [-0.15, "#0a0614", "#20120a", "#050301"],
    [-0.45, "#050308", "#0f0803", "#000000"],
    [-1, "#020104", "#080402", "#000000"]
  ];
  function skyColorsFor(elevation) {
    const stops = THEME === "night" ? NIGHT_SKY_STOPS : DAY_SKY_STOPS;
    const e = THEME === "night" ? -Math.abs(elevation) : Math.abs(elevation);
    let lo = stops[0], hi = stops[stops.length - 1];
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i], b = stops[i + 1];
      const inRange = THEME === "night" ? e <= a[0] && e >= b[0] : e >= a[0] && e <= b[0];
      if (inRange) {
        lo = a;
        hi = b;
        break;
      }
    }
    const span = hi[0] - lo[0];
    const t = span !== 0 ? (e - lo[0]) / span : 0;
    return {
      top: lerpColor(lo[1], hi[1], Math.max(0, Math.min(1, t))),
      mid: lerpColor(lo[2], hi[2], Math.max(0, Math.min(1, t))),
      bottom: lerpColor(lo[3], hi[3], Math.max(0, Math.min(1, t)))
    };
  }
  var TODAY_IDX = 1;
  function applySkyForNow(daily) {
    const now = /* @__PURE__ */ new Date();
    const todaySunrise = new Date(daily.sunrise[TODAY_IDX]);
    const todaySunset = new Date(daily.sunset[TODAY_IDX]);
    let state;
    if (now >= todaySunrise && now <= todaySunset) {
      const frac = (now - todaySunrise) / (todaySunset - todaySunrise);
      state = { frac, elevation: Math.sin(Math.PI * frac) };
    } else if (now < todaySunrise) {
      const yesterdaySunset = new Date(daily.sunset[TODAY_IDX - 1]);
      const frac = Math.max(0, Math.min(1, (now - yesterdaySunset) / (todaySunrise - yesterdaySunset)));
      state = { frac, elevation: -Math.sin(Math.PI * frac) };
    } else {
      const tomorrowSunrise = daily.sunrise[TODAY_IDX + 1] ? new Date(daily.sunrise[TODAY_IDX + 1]) : new Date(todaySunset.getTime() + 12 * 3600 * 1e3);
      const frac = Math.max(0, Math.min(1, (now - todaySunset) / (tomorrowSunrise - todaySunset)));
      state = { frac, elevation: -Math.sin(Math.PI * frac) };
    }
    const colors = skyColorsFor(state.elevation);
    const root = document.documentElement;
    root.style.setProperty("--sky-top", colors.top);
    root.style.setProperty("--sky-mid", colors.mid);
    root.style.setProperty("--sky-bottom", colors.bottom);
    return state;
  }
  function fToLabel(f) {
    return `${Math.round(f)}\xB0`;
  }
  function aqiCategory(aqi) {
    if (aqi == null) return { label: "\u2014", color: "var(--fg3)", desc: "Air quality data is unavailable right now." };
    if (aqi <= 50) return { label: "Good", color: "var(--good)", desc: "Air quality is good. Enjoy your usual outdoor activities." };
    if (aqi <= 100) return { label: "Moderate", color: "var(--warn)", desc: "Air quality is acceptable, though there may be a risk for sensitive groups." };
    if (aqi <= 150) return { label: "Unhealthy (SG)", color: "var(--warn)", desc: "Sensitive groups may experience health effects. Others are unlikely to be affected." };
    if (aqi <= 200) return { label: "Unhealthy", color: "var(--bad)", desc: "Everyone may begin to experience health effects; sensitive groups more so." };
    if (aqi <= 300) return { label: "Very Unhealthy", color: "var(--bad)", desc: "Health alert: everyone may experience more serious health effects." };
    return { label: "Hazardous", color: "var(--bad)", desc: "Health warning of emergency conditions. Everyone is at risk." };
  }
  function windDirLabel(deg) {
    const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
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
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return idx0 ? `${h}${ampm}` : "NOW";
  }
  function minuteLabel(dateStr, idx0) {
    if (!idx0) return "NOW";
    const d = new Date(dateStr);
    let h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m}`;
  }
  function dayLabel(dateStr, idx) {
    if (idx === 0) return "Today";
    const d = /* @__PURE__ */ new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short" });
  }
  function fetchWeather() {
    return __async(this, null, function* () {
      const baseParams = `latitude=${LAT}&longitude=${LON}&cell_selection=land&elevation=4`;
      const wUrl = `https://api.open-meteo.com/v1/forecast?${baseParams}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m&minutely_15=temperature_2m,weather_code,precipitation_probability,is_day,cloud_cover&hourly=temperature_2m,weather_code,precipitation_probability,visibility,is_day,cloud_cover&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=${encodeURIComponent(TZ)}&forecast_days=7&past_days=1`;
      const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LON}&current=us_aqi&timezone=${encodeURIComponent(TZ)}`;
      const [wRes, aqRes, skyCoverIntervals] = yield Promise.all([
        fetch(wUrl).then((r) => r.json()),
        fetch(aqUrl).then((r) => r.json()).catch(() => null),
        fetchNwsSkyCover()
      ]);
      return { weather: wRes, aq: aqRes, skyCoverIntervals };
    });
  }
  var lastDaily = null;
  var NWS_ALERTS_URL = `https://api.weather.gov/alerts/active?status=actual&point=${LAT},${LON}`;
  var USGS_QUAKE_URL = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${LAT}&longitude=${LON}&maxradiuskm=200&minmagnitude=4.0&starttime=`;
  var NOAA_STORMS_URL = "https://noaa-storm-proxy.iamflying29-sketch.deno.net";
  var NWS_GRIDPOINT_URL = "https://api.weather.gov/gridpoints/MTR/83,111";
  function parseIsoDurationMs(iso) {
    const m = /^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?/.exec(iso || "");
    if (!m) return 0;
    const days = parseInt(m[1] || "0", 10);
    const hours = parseInt(m[2] || "0", 10);
    const mins = parseInt(m[3] || "0", 10);
    return ((days * 24 + hours) * 60 + mins) * 60 * 1e3;
  }
  function parseNwsIntervals(field) {
    if (!field || !Array.isArray(field.values)) return [];
    return field.values.map((v) => {
      const [startStr, durStr] = v.validTime.split("/");
      const start = new Date(startStr);
      const end = new Date(start.getTime() + parseIsoDurationMs(durStr));
      return { start, end, value: v.value };
    });
  }
  function fetchNwsSkyCover() {
    return __async(this, null, function* () {
      try {
        const r = yield fetch(NWS_GRIDPOINT_URL);
        if (!r.ok) return null;
        const data = yield r.json();
        return parseNwsIntervals(data.properties && data.properties.skyCover);
      } catch (e) {
        console.warn("NWS gridpoint skyCover fetch failed", e);
        return null;
      }
    });
  }
  function skyCoverAt(intervals, date) {
    if (!intervals || !intervals.length) return null;
    for (const iv of intervals) {
      if (date >= iv.start && date < iv.end) return iv.value;
    }
    return null;
  }
  function avgDaytimeSkyCover(intervals, dateStr) {
    if (!intervals || !intervals.length) return null;
    const samples = [];
    for (let h = 9; h <= 18; h++) {
      const d = /* @__PURE__ */ new Date(`${dateStr}T${String(h).padStart(2, "0")}:00:00`);
      const v = skyCoverAt(intervals, d);
      if (v != null) samples.push(v);
    }
    if (!samples.length) return null;
    return samples.reduce((a, b) => a + b, 0) / samples.length;
  }
  var NWS_EVENT_MAP = [
    { re: /tornado/i, key: "tornado", label: "Tornado Warning", severity: 5 },
    { re: /tsunami/i, key: "tsunami", label: "Tsunami Warning", severity: 5 },
    { re: /hurricane/i, key: "hurricane", label: "Hurricane Warning", severity: 4 },
    { re: /tropical storm/i, key: "tropical-storm", label: "Tropical Storm Warning", severity: 4 },
    { re: /flash flood/i, key: "flash-flood", label: "Flash Flood Warning", severity: 4 },
    { re: /severe thunderstorm/i, key: "thunderstorm-hail", label: "Severe Thunderstorm Warning", severity: 3 },
    { re: /tornado watch|severe thunderstorm watch/i, key: "thunderstorm", label: "Severe Weather Watch", severity: 2 },
    { re: /fire weather|red flag/i, key: "wildfire-smoke", label: "Fire Weather Warning", severity: 3 },
    { re: /dust storm/i, key: "dust-storm", label: "Dust Storm Warning", severity: 3 },
    { re: /blizzard|winter storm/i, key: "blizzard", label: "Winter Storm Warning", severity: 3 },
    { re: /ice storm/i, key: "ice-storm", label: "Ice Storm Warning", severity: 3 },
    { re: /volcanic/i, key: "volcanic-eruption", label: "Volcanic Warning", severity: 4 }
  ];
  function nwsSeverityValue(sev) {
    const map = { Extreme: 4, Severe: 3, Moderate: 2, Minor: 1, Unknown: 0 };
    return map[sev] || 0;
  }
  function fetchNwsAlerts() {
    return __async(this, null, function* () {
      try {
        const r = yield fetch(NWS_ALERTS_URL);
        if (!r.ok) return [];
        const data = yield r.json();
        return Array.isArray(data.features) ? data.features : [];
      } catch (e) {
        console.warn("NWS alerts fetch failed", e);
        return [];
      }
    });
  }
  function fetchEarthquake() {
    return __async(this, null, function* () {
      try {
        const yesterday = new Date(Date.now() - 24 * 3600 * 1e3).toISOString();
        const r = yield fetch(USGS_QUAKE_URL + encodeURIComponent(yesterday));
        if (!r.ok) return null;
        const data = yield r.json();
        if (!data.features || !data.features.length) return null;
        const q = data.features[0];
        return {
          magnitude: q.properties.mag,
          place: q.properties.place,
          time: q.properties.time
        };
      } catch (e) {
        console.warn("USGS earthquake fetch failed", e);
        return null;
      }
    });
  }
  function fetchNoaaStorms() {
    return __async(this, null, function* () {
      try {
        const r = yield fetch(`${NOAA_STORMS_URL}?v=1`);
        if (!r.ok) return null;
        return yield r.json();
      } catch (e) {
        console.warn("NOAA/NHC storm fetch failed", e);
        return null;
      }
    });
  }
  function chooseAlertCondition(alerts, quake, noaaStorms) {
    let best = null;
    for (const f of alerts) {
      const event = f.properties.event || "";
      const severity = nwsSeverityValue(f.properties.severity);
      for (const m of NWS_EVENT_MAP) {
        if (m.re.test(event)) {
          const score = m.severity * 10 + severity;
          if (!best || score > best.score) {
            best = __spreadProps(__spreadValues({}, m), { score });
          }
        }
      }
    }
    if (best) return { key: best.key, label: best.label, source: "NWS" };
    if (quake) {
      return {
        key: "earthquake",
        label: `Earthquake M${quake.magnitude}`,
        source: "USGS"
      };
    }
    return null;
  }
  function render(data, fx) {
    const { weather, aq, alerts, quake, noaaStorms, skyCoverIntervals } = data;
    const cur = weather.current;
    const hourly = weather.hourly;
    const minutely15 = weather.minutely_15;
    const daily = weather.daily;
    lastDaily = daily;
    const sunState = applySkyForNow(daily);
    if (fx) fx.setSunState(sunState.frac, sunState.elevation);
    const isDay = !!cur.is_day;
    const _skyCoverNow = skyCoverAt(skyCoverIntervals, /* @__PURE__ */ new Date());
    const liveCloudCover = _skyCoverNow != null ? _skyCoverNow : cur.cloud_cover;
    let info = wmoInfo(cur.weather_code, isDay, liveCloudCover);
    let displayKey = FORCED_SCENE || info.key;
    if (FORCED_SCENE) {
      info = { key: displayKey, label: labelForKey(displayKey) };
    }
    const alertInfo = !FORCED_SCENE ? chooseAlertCondition(alerts || [], quake, noaaStorms) : null;
    if (alertInfo) {
      info = { key: alertInfo.key, label: alertInfo.label };
      displayKey = info.key;
    }
    const vars = {
      theme: THEME,
      "--sun-core": cssVar("--sun-core"),
      "--moon-core": cssVar("--moon-core"),
      "--cloud": cssVar("--cloud"),
      "--cloud2": cssVar("--cloud2"),
      "--rain": cssVar("--rain"),
      "--snow": cssVar("--snow"),
      "--fog": cssVar("--fog"),
      "--bolt": cssVar("--bolt"),
      "--fg": cssVar("--fg")
    };
    document.getElementById("nowIcon").innerHTML = iconSvgFor(displayKey, vars);
    document.getElementById("nowTemp").textContent = fToLabel(cur.temperature_2m);
    document.getElementById("nowCond").textContent = info.label;
    document.getElementById("nowSub").textContent = `Feels like ${fToLabel(cur.apparent_temperature)}`;
    document.getElementById("hilo").textContent = `H:${Math.round(daily.temperature_2m_max[TODAY_IDX])}\xB0  L:${Math.round(daily.temperature_2m_min[TODAY_IDX])}\xB0`;
    if (fx) fx.setCondition(displayKey);
    if (fx && liveCloudCover != null) {
      fx.setWeatherData({ cloudCover: liveCloudCover / 100 });
    }
    const m15 = minutely15 && minutely15.time && minutely15.time.length > 0;
    const stripData = m15 ? minutely15 : hourly;
    const nowSlot = weather.current.time.slice(0, 16);
    let startIdx = stripData.time.findIndex((t) => t >= nowSlot);
    if (startIdx < 0) startIdx = 0;
    const hourlyEl = document.getElementById("hourly");
    hourlyEl.innerHTML = "";
    for (let i = 0; i < 12; i++) {
      const idx = startIdx + i;
      if (idx >= stripData.time.length) break;
      const hIsDay = stripData.is_day ? !!stripData.is_day[idx] : true;
      const hCC = stripData.cloud_cover ? stripData.cloud_cover[idx] : null;
      const nwsCC = skyCoverAt(skyCoverIntervals, new Date(stripData.time[idx]));
      const hi = wmoInfo(stripData.weather_code[idx], hIsDay, nwsCC != null ? nwsCC : hCC);
      const pop = stripData.precipitation_probability ? stripData.precipitation_probability[idx] : null;
      const el = document.createElement("div");
      el.className = "ww-hour";
      el.innerHTML = `
      <div class="hh">${m15 ? minuteLabel(stripData.time[idx], i) : hourLabel(stripData.time[idx], i)}</div>
      ${iconSvgFor(hi.key, vars)}
      <div class="ht">${Math.round(stripData.temperature_2m[idx])}\xB0</div>
      <div class="hp">${pop != null && pop >= 15 ? pop + "%" : ""}</div>
    `;
      hourlyEl.appendChild(el);
    }
    const dailyEl = document.getElementById("daily");
    dailyEl.innerHTML = "";
    const globalMin = Math.min(...daily.temperature_2m_min.slice(TODAY_IDX, TODAY_IDX + 5));
    const globalMax = Math.max(...daily.temperature_2m_max.slice(TODAY_IDX, TODAY_IDX + 5));
    const span = Math.max(1, globalMax - globalMin);
    for (let i = 0; i < 5; i++) {
      const idx = TODAY_IDX + i;
      const nwsDayCC = avgDaytimeSkyCover(skyCoverIntervals, daily.time[idx]);
      const di = wmoInfo(daily.weather_code[idx], true, nwsDayCC);
      const lo = daily.temperature_2m_min[idx], hi = daily.temperature_2m_max[idx];
      const left = (lo - globalMin) / span * 100;
      const width = (hi - lo) / span * 100;
      const pop = daily.precipitation_probability_max[idx];
      const row = document.createElement("div");
      row.className = "ww-day-row";
      row.innerHTML = `
      <div class="dn">${dayLabel(daily.time[idx], i)}</div>
      ${iconSvgFor(di.key, vars)}
      <div class="ww-bar"><span style="left:${left}%;width:${width}%"></span></div>
      <div class="dp">${pop >= 15 ? pop + "%" : ""}</div>
      <div class="dlo">${Math.round(lo)}\xB0</div>
      <div class="dhi">${Math.round(hi)}\xB0</div>
    `;
      dailyEl.appendChild(row);
    }
    const aqiVal = aq && aq.current ? aq.current.us_aqi : null;
    const aqiCat = aqiCategory(aqiVal);
    document.getElementById("aqiVal").textContent = aqiVal != null ? Math.round(aqiVal) : "\u2014";
    document.getElementById("aqiVal").style.color = aqiCat.color;
    document.getElementById("aqiCat").textContent = aqiCat.label;
    document.getElementById("aqiDesc").textContent = aqiCat.desc;
    const aqiPct = aqiVal != null ? Math.min(100, aqiVal / 300 * 100) : 0;
    document.getElementById("aqiMarker").style.left = `${aqiPct}%`;
    const sunrise = new Date(daily.sunrise[TODAY_IDX]);
    const sunset = new Date(daily.sunset[TODAY_IDX]);
    const fmtT = (d) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const visMiles = hourly.visibility && hourly.visibility[startIdx] != null ? (hourly.visibility[startIdx] / 1609.34).toFixed(1) : "\u2014";
    const fg = cssVar("--fg");
    const cards = [
      { icon: WI.uv(fg), label: "UV Index", value: Math.round(daily.uv_index_max[TODAY_IDX]), sub: uvLabel(daily.uv_index_max[TODAY_IDX]) },
      { icon: WI.sunrise(fg), label: "Sunrise", value: fmtT(sunrise), sub: `Sunset ${fmtT(sunset)}` },
      { icon: "", label: "Wind", value: `${Math.round(cur.wind_speed_10m)} mph`, sub: windDirLabel(cur.wind_direction_10m), compass: cur.wind_direction_10m },
      { icon: WI.drop(fg), label: "Humidity", value: `${Math.round(cur.relative_humidity_2m)}%`, sub: "" },
      { icon: WI.eye(fg), label: "Visibility", value: `${visMiles} mi`, sub: "" },
      { icon: WI.thermo(fg), label: "Feels Like", value: fToLabel(cur.apparent_temperature), sub: "" }
    ];
    const gridEl = document.getElementById("grid");
    gridEl.innerHTML = "";
    for (const c of cards) {
      const div = document.createElement("div");
      div.className = "ww-card";
      if (c.compass !== void 0) {
        div.innerHTML = `<div class="cl">${c.label}</div><div class="ww-compass">${windCompassSvg(c.compass, fg)}</div><div class="cv" style="font-size:16px">${c.value}</div><div class="cs">${c.sub}</div>`;
      } else {
        div.innerHTML = `<div class="cl">${c.icon}${c.label}</div><div class="cv">${c.value}</div><div class="cs">${c.sub}</div>`;
      }
      gridEl.appendChild(div);
    }
  }
  function uvLabel(uv) {
    if (uv < 3) return "Low";
    if (uv < 6) return "Moderate";
    if (uv < 8) return "High";
    if (uv < 11) return "Very High";
    return "Extreme";
  }
  var fxEngine = null;
  window.fxEngine = null;
  function refresh() {
    return __async(this, null, function* () {
      try {
        const [weatherData, alerts, quake, noaaStorms] = yield Promise.all([
          fetchWeather(),
          fetchNwsAlerts(),
          fetchEarthquake(),
          fetchNoaaStorms()
        ]);
        render(__spreadProps(__spreadValues({}, weatherData), { alerts, quake, noaaStorms }), fxEngine);
      } catch (e) {
        console.error("Weather fetch failed", e);
      }
    });
  }
  function boot() {
    const canvas = document.getElementById("fx");
    fxEngine = new WeatherAtmosphere(canvas, {
      sunCore: cssVar("--sun-core"),
      sunGlow: cssVar("--sun-glow"),
      moonCore: cssVar("--moon-core"),
      moonGlow: cssVar("--moon-glow"),
      cloud: cssVar("--cloud"),
      cloud2: cssVar("--cloud2"),
      rain: cssVar("--rain"),
      snow: cssVar("--snow"),
      fog: cssVar("--fog"),
      bolt: cssVar("--bolt")
    }, {
      forceDay: THEME === "day",
      forceNight: THEME === "night"
    });
    window.fxEngine = fxEngine;
    refresh();
    setInterval(refresh, REFRESH_MS);
    setInterval(() => {
      if (lastDaily) {
        const s = applySkyForNow(lastDaily);
        if (fxEngine) fxEngine.setSunState(s.frac, s.elevation);
      }
    }, 60 * 1e3);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
