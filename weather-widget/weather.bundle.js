(()=>{var xt=Object.defineProperty,Rt=Object.defineProperties;var Ot=Object.getOwnPropertyDescriptors;var it=Object.getOwnPropertySymbols;var Nt=Object.prototype.hasOwnProperty,Bt=Object.prototype.propertyIsEnumerable;var Me=(t,e,o)=>e in t?xt(t,e,{enumerable:!0,configurable:!0,writable:!0,value:o}):t[e]=o,d=(t,e)=>{for(var o in e||(e={}))Nt.call(e,o)&&Me(t,o,e[o]);if(it)for(var o of it(e))Bt.call(e,o)&&Me(t,o,e[o]);return t},w=(t,e)=>Rt(t,Ot(e));var y=(t,e,o)=>Me(t,typeof e!="symbol"?e+"":e,o);var P=(t,e,o)=>new Promise((i,a)=>{var s=l=>{try{r(o.next(l))}catch(h){a(h)}},n=l=>{try{r(o.throw(l))}catch(h){a(h)}},r=l=>l.done?i(l.value):Promise.resolve(l.value).then(s,n);r((o=o.apply(t,e)).next())});var Fe={cirrus:{label:"Cirrus",alias:"Mare's tail",abbr:"Ci",level:"high",form:"filament",opacity:.15},cirrostratus:{label:"Cirrostratus",alias:"Veil cloud",abbr:"Cs",level:"high",form:"stratiform",opacity:.45},cirrocumulus:{label:"Cirrocumulus",alias:"Mackerel sky",abbr:"Cc",level:"high",form:"granular",opacity:.25},altostratus:{label:"Altostratus",alias:"Grey veil",abbr:"As",level:"mid",form:"stratiform",opacity:.9},altocumulus:{label:"Altocumulus",alias:"Sheep cloud",abbr:"Ac",level:"mid",form:"granular",opacity:.45},nimbostratus:{label:"Nimbostratus",alias:"Rain cloud",abbr:"Ns",level:"mid",form:"stratiform",opacity:1},stratus:{label:"Stratus",alias:"Fog cloud",abbr:"St",level:"low",form:"stratiform",opacity:.95},stratocumulus:{label:"Stratocumulus",alias:"Roll cloud",abbr:"Sc",level:"low",form:"granular",opacity:.75},cumulus:{label:"Cumulus",alias:"Cotton cloud",abbr:"Cu",level:"low",form:"convective",opacity:.4},cumulonimbus:{label:"Cumulonimbus",alias:"Thunderhead",abbr:"Cb",level:"low",form:"convective",opacity:.28}},Ie=Object.keys(Fe),H=t=>t<0?0:t>1?1:t;function M(t,e,o){let i=H((t-e)/(o-e));return i*i*(3-2*i)}function Wt(t){let e=H(t);return{anvil:M(e,.68,1),velum:M(e,.22,.5)*(1-M(e,.68,.95))}}var ue={cirrus:0,cirrostratus:0,cirrocumulus:0,altostratus:0,altocumulus:0,nimbostratus:0,stratus:0,stratocumulus:0,cumulus:0,cumulonimbus:0};function Ut(t){var o;if(t==null)return d({},ue);if(typeof t=="string")return w(d({},ue),{[t]:1});if(Array.isArray(t)){let i=d({},ue);for(let a of t)i[a]=1;return i}let e=d({},ue);for(let i of Ie)e[i]=H((o=t[i])!=null?o:0);return e}function Ht(t,e,o,i){let a=H(t),s=H(e),n=1-s,r=1-M(a,.28,.72),l=1-M(a,.45,.85),h=a>=.15&&a<.52,u=a>=.52&&a<.85,c=a>=.85,g=s>.05;return{cirrus:M(a,.05,.55)*.42*r,cirrostratus:M(a,.1,.55)*.25*r,cirrocumulus:M(a,.14,.45)*(h?.22:.14)*r*n,altostratus:M(a,.45,.82)*(g?.85:.55)*(1-M(a,.82,.98))*n,altocumulus:M(a,.22,.55)*(h?.35:u?.62:.45)*(1-M(a,.72,.95))*n,nimbostratus:s*M(a,.55,.88),stratus:c?M(a,.65,.95)*.85*(1-s*.4):i>.1?i*.45:0,stratocumulus:M(a,.28,.78)*(h?.38:u?.82:.85)*(1-s*.6)*n,cumulus:M(a,.08,.48)*(h?.42:.28)*l*n,cumulonimbus:H(o)*M(a,.12,.45)}}function $t(t){let e=1;for(let o of Ie)e*=1-t[o]*Fe[o].opacity;return H(1-e)}var qt={tau:2.2,windBase:.006,windGust:.22,evoBase:.07,evoGust:.09,windPerHour:.25,evoPerHour:.06},Gt=Math.PI*2;function st(t){return{filter:w(d({},t.filter),{tint:[t.filter.tint[0],t.filter.tint[1],t.filter.tint[2]]}),tone:d({},t.tone),polarizer:d({},t.polarizer),celestial:w(d({},t.celestial),{radiant:t.celestial.radiant?[t.celestial.radiant[0],t.celestial.radiant[1]]:null}),clouds:d({},t.clouds),features:d({},t.features)}}function Te(t,e,o,i){let a=i/2,s=(e-t+i*1.5)%i-a;return(t+s*o+i)%i}var Zt=class{constructor(t,e={}){y(this,"current");y(this,"windOff",41.7);y(this,"evoOff",7.3);y(this,"opts");this.current=d(d({},t),st(t)),this.opts=d(d({},qt),e)}get wind(){return this.windOff}get evolution(){return this.evoOff}jump(t){Object.assign(this.current,t,st(t))}step(t,e){let o=this.opts,i=this.current,a=1-Math.exp(-e/o.tau),s=i.timeOfDay;i.timeOfDay=Te(i.timeOfDay,t.timeOfDay,a,24);let n=(i.timeOfDay-s+36)%24-12;i.sunElevation+=(t.sunElevation-i.sunElevation)*a,i.sunAzimuth=Te(i.sunAzimuth,t.sunAzimuth,a,Gt),i.cloudCover+=(t.cloudCover-i.cloudCover)*a;for(let _ of Ie)i.clouds[_]+=(t.clouds[_]-i.clouds[_])*a;i.features.anvil+=(t.features.anvil-i.features.anvil)*a,i.features.velum+=(t.features.velum-i.features.velum)*a,i.rain+=(t.rain-i.rain)*a,i.snow+=(t.snow-i.snow)*a,i.wind+=(t.wind-i.wind)*a,i.thunder+=(t.thunder-i.thunder)*a,i.haze+=(t.haze-i.haze)*a;let r=i.filter,l=t.filter;r.amount+=(l.amount-r.amount)*a,r.saturation+=(l.saturation-r.saturation)*a,r.lift+=(l.lift-r.lift)*a,r.tint=[r.tint[0]+(l.tint[0]-r.tint[0])*a,r.tint[1]+(l.tint[1]-r.tint[1])*a,r.tint[2]+(l.tint[2]-r.tint[2])*a];let h=i.tone,u=t.tone;h.exposure+=(u.exposure-h.exposure)*a,h.contrast+=(u.contrast-h.contrast)*a,h.knee+=(u.knee-h.knee)*a,h.bleach+=(u.bleach-h.bleach)*a;let c=i.polarizer,g=t.polarizer;c.strength+=(g.strength-c.strength)*a,c.saturation+=(g.saturation-c.saturation)*a,c.stopLoss+=(g.stopLoss-c.stopLoss)*a,c.angle=Te(c.angle,g.angle,a,Math.PI);let b=i.celestial,m=t.celestial;b.bortle+=(m.bortle-b.bortle)*a,b.milkyWay+=(m.milkyWay-b.milkyWay)*a,b.meteors+=(m.meteors-b.meteors)*a,b.radiant=m.radiant?[m.radiant[0],m.radiant[1]]:null,this.windOff+=(o.windBase+i.wind*o.windGust)*e+Math.abs(n)*o.windPerHour,this.evoOff+=(o.evoBase+i.wind*o.evoGust)*e+Math.abs(n)*o.evoPerHour}},jt=[.82246197,.17753803,0,.0331942,.9668058,0,.01708263,.07239744,.91051993];function Vt(t){let e=o=>[t[o],t[o+3],t[o+6]].map(i=>i.toFixed(8)).join(", ");return`mat3(${e(0)},
       ${e(1)},
       ${e(2)})`}var Yt=[1.05,.79],Kt=[.98,1.48],Pe={"dark-sky":{label:"Dark sky",bortle:2,milkyWay:1,meteors:5,radiant:null},rural:{label:"Rural",bortle:4,milkyWay:.45,meteors:5,radiant:null},suburban:{label:"Suburban",bortle:6,milkyWay:0,meteors:0,radiant:null},city:{label:"City",bortle:8,milkyWay:0,meteors:0,radiant:null},perseids:{label:"Perseids",bortle:3,milkyWay:.75,meteors:100,radiant:Yt},geminids:{label:"Geminids",bortle:3,milkyWay:.75,meteors:150,radiant:Kt}},$o=Object.keys(Pe);var ce={bortle:6,milkyWay:0,meteors:0,radiant:null};function Jt(t){return Math.min(1,Math.max(0,(5.5-t)/3.5))}function Ae(t){return{bortle:t.bortle,milkyWay:t.milkyWay,meteors:t.meteors,radiant:t.radiant?[t.radiant[0],t.radiant[1]]:null}}var nt=(t,e,o)=>Math.min(o,Math.max(e,t));function Qt(t){var i,a,s,n,r;if(t==null)return Ae(ce);if(typeof t=="string")return Ae((i=Pe[t])!=null?i:ce);let e=t.id&&(a=Pe[t.id])!=null?a:ce,o=nt((s=t.bortle)!=null?s:e.bortle,1,9);return Ae({bortle:o,milkyWay:nt((n=t.milkyWay)!=null?n:t.id?e.milkyWay:Jt(o),0,1),meteors:Math.max(0,(r=t.meteors)!=null?r:e.meteors),radiant:t.radiant!==void 0?t.radiant:e.radiant})}var j={none:{label:"None",amount:0,tint:[1,1,1],saturation:1,lift:0},sepia:{label:"Sepia",amount:1,tint:[1.07,.93,.72],saturation:.1,lift:.02},mono:{label:"Monochrome",amount:1,tint:[1,1,1],saturation:0,lift:0},faded:{label:"Faded",amount:1,tint:[1.02,.99,.94],saturation:.35,lift:.06},cyanotype:{label:"Cyanotype",amount:1,tint:[.72,.9,1.12],saturation:.08,lift:.03},gold:{label:"Gold",amount:1,tint:[1.15,.95,.6],saturation:.45,lift:.02},ash:{label:"Ash",amount:1,tint:[.92,.95,1],saturation:.2,lift:.04}},qo=Object.keys(j);var ze=j.none;function de(t){return{amount:t.amount,tint:[t.tint[0],t.tint[1],t.tint[2]],saturation:t.saturation,lift:t.lift}}function Xt(t){var o,i,a,s,n,r;if(t==null||t===!1)return de(ze);if(t===!0)return de(j.sepia);if(typeof t=="string")return de((o=j[t])!=null?o:ze);let e=t.id?(i=j[t.id])!=null?i:ze:{amount:1,tint:[1,1,1],saturation:0,lift:0};return de({amount:(a=t.amount)!=null?a:e.amount,tint:(s=t.tint)!=null?s:e.tint,saturation:(n=t.saturation)!=null?n:e.saturation,lift:(r=t.lift)!=null?r:e.lift})}var te={none:{label:"None",strength:0,angle:0,saturation:0,stopLoss:0},light:{label:"Light CPL",strength:.45,angle:0,saturation:.2,stopLoss:0},strong:{label:"Strong CPL",strength:.85,angle:0,saturation:.4,stopLoss:0},crossed:{label:"Crossed CPL",strength:.85,angle:Math.PI/2,saturation:.1,stopLoss:0}},Go=Object.keys(te);var fe=te.none;function me(t){return{strength:t.strength,angle:t.angle,saturation:t.saturation,stopLoss:t.stopLoss}}var Le=t=>Math.min(1,Math.max(0,t));function ea(t){var o,i,a,s,n,r;if(t==null||t===!1)return me(fe);if(t===!0)return me(te.light);if(typeof t=="string")return me((o=te[t])!=null?o:fe);let e=t.id&&(i=te[t.id])!=null?i:fe;return me({strength:Le((a=t.strength)!=null?a:e.strength),angle:(s=t.angle)!=null?s:e.angle,saturation:Le((n=t.saturation)!=null?n:e.saturation),stopLoss:Le((r=t.stopLoss)!=null?r:e.stopLoss)})}var U=Math.PI/180,ta=864e5,aa=2440588,oa=2451545,rt=23.4397*U;function ia(t,e){let o=t.getTime()/ta-.5+aa-oa,i=U*(357.5291+.98560028*o),a=U*(1.9148*Math.sin(i)+.02*Math.sin(2*i)+3e-4*Math.sin(3*i)),s=i+a+U*102.9372+Math.PI,n=Math.asin(Math.sin(rt)*Math.sin(s)),r=Math.atan2(Math.sin(s)*Math.cos(rt),Math.cos(s)),l=U*-e.longitude,h=U*e.latitude,u=U*(280.16+360.9856235*o)-l-r,c=Math.asin(Math.sin(h)*Math.sin(n)+Math.cos(h)*Math.cos(n)*Math.cos(u)),g=Math.atan2(Math.sin(u),Math.cos(u)*Math.sin(h)-Math.tan(n)*Math.cos(h))+Math.PI;return{elevation:c,azimuth:(g%(2*Math.PI)+2*Math.PI)%(2*Math.PI)}}function sa(t){let e=(t-6)/12;return{elevation:Math.asin(Math.sin(e*Math.PI)*.72),azimuth:Math.PI/2+e*Math.PI}}function ct(t){if(t instanceof Date)return Number.isNaN(t.getTime())?null:t;if(typeof t=="string"&&/\d{4}-\d{2}-\d{2}/.test(t)){let e=new Date(t);return Number.isNaN(e.getTime())?null:e}return null}function na(t){var o;if(typeof t=="number")return(t%24+24)%24;let e=ct(t);if(e)return e.getHours()+e.getMinutes()/60+e.getSeconds()/3600;if(typeof t=="string"){let i=/^(\d{1,2})(?::(\d{2}))?/.exec(t.trim());if(i)return((Number(i[1])+Number((o=i[2])!=null?o:0)/60)%24+24)%24}return 12}var ve={neutral:{label:"Neutral",exposure:0,contrast:1,knee:.8,bleach:0},flat:{label:"Flat",exposure:.15,contrast:.82,knee:.55,bleach:.25},punch:{label:"Punch",exposure:-.2,contrast:1.22,knee:.85,bleach:.1},filmic:{label:"Filmic",exposure:.1,contrast:1.08,knee:.42,bleach:.55},blown:{label:"Blown",exposure:.85,contrast:.95,knee:.7,bleach:.4}},Zo=Object.keys(ve);var pe=ve.neutral;function Ee(t){return{exposure:t.exposure,contrast:t.contrast,knee:t.knee,bleach:t.bleach}}function ra(t){var o,i,a,s,n,r;if(t==null)return Ee(pe);if(typeof t=="string")return Ee((o=ve[t])!=null?o:pe);let e=t.id&&(i=ve[t.id])!=null?i:pe;return Ee({exposure:(a=t.exposure)!=null?a:e.exposure,contrast:(s=t.contrast)!=null?s:e.contrast,knee:Math.min(.99,Math.max(.02,(n=t.knee)!=null?n:e.knee)),bleach:Math.min(1,Math.max(0,(r=t.bleach)!=null?r:e.bleach))})}var ye={clear:{label:"Clear",cloudCover:0,windSpeed:2,visibility:45},fair:{label:"Fair",cloudCover:.22,windSpeed:3,visibility:35},summer:{label:"Summer sky",cloudCover:.38,windSpeed:3,visibility:25,convection:.7},overcast:{label:"Overcast",cloudCover:.82,windSpeed:5,visibility:15},fog:{label:"Fog",cloudCover:.75,windSpeed:1,visibility:.6},rain:{label:"Rain",cloudCover:.95,windSpeed:7,visibility:8,precipitation:8,thunder:.08},thunderstorm:{label:"Thunderstorm",cloudCover:.97,windSpeed:12,visibility:5,precipitation:25,thunder:1,convection:.5},snow:{label:"Snow",cloudCover:.9,windSpeed:3,visibility:4,precipitation:3,precipitationType:"snow"},typhoon:{label:"Typhoon",cloudCover:1,windSpeed:30,visibility:6,precipitation:40,thunder:.5}},jo=Object.keys(ye);var z=t=>t<0?0:t>1?1:t;function la(t){return z(Math.pow(z(t/30),.55))}function ha(t){return z(Math.pow(z(t/33),.8))}function ua(t){return z(Math.pow(z(t/5),.6))}function ca(t){return z(Math.pow(z((20-t)/20),2.6))}function da(t){var c,g,b,m,_,O,S,Q,x,R,F;let e=typeof t=="string"?(c=ye[t])!=null?c:ye.clear:t!=null?t:{},o=(g=e.precipitation)!=null?g:0,i=e.precipitationType==="snow",a=i?0:la(o),s=i?ua(o):0,n=ca((b=e.visibility)!=null?b:30),r=z((m=e.convection)!=null?m:0),l,h;e.clouds!=null?(l=Ut(e.clouds),h=$t(l)):(h=z((_=e.cloudCover)!=null?_:0),l=Ht(h,Math.max(a,s),r,n));let u=Wt(l.cumulonimbus);return{clouds:l,features:{anvil:z((S=(O=e.features)==null?void 0:O.anvil)!=null?S:u.anvil),velum:z((x=(Q=e.features)==null?void 0:Q.velum)!=null?x:u.velum)},cloudCover:h,rain:a,snow:s,wind:ha((R=e.windSpeed)!=null?R:0),thunder:z((F=e.thunder)!=null?F:0),haze:n}}var dt={yaw:Math.PI,pitch:.46,fov:.86},Vo=[{yaw:Math.PI/2,pitch:0,fov:Math.PI/2},{yaw:-Math.PI/2,pitch:0,fov:Math.PI/2},{yaw:0,pitch:Math.PI/2,fov:Math.PI/2},{yaw:0,pitch:-Math.PI/2,fov:Math.PI/2},{yaw:0,pitch:0,fov:Math.PI/2},{yaw:Math.PI,pitch:0,fov:Math.PI/2}],lt={time:12,weather:"clear"};function ht(t){var s,n;let e=(s=t.time)!=null?s:lt.time,o=na(e),i=ct(e),a=t.location&&i?ia(i,t.location):sa(o);return w(d({timeOfDay:o,sunElevation:a.elevation,sunAzimuth:a.azimuth},da((n=t.weather)!=null?n:lt.weather)),{filter:Xt(t.filter),tone:ra(t.tone),polarizer:ea(t.polarizer),celestial:Qt(t.celestial)})}function ut(t){return d(d({},dt),t)}var fa=`
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`,ma=0,pa=`
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
const mat3 SRGB_TO_P3 = ${Vt(jt)};

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
    sky = mix(srgbToDisplayP3(sky), sky, clamp(wide, 0.0, 1.0) * ${ma.toFixed(4)});
  }

  // dither (to prevent banding). Last, so it lands in whatever space the 8-bit
  // drawing buffer actually quantizes
  sky += (hash12(gl_FragCoord.xy + fract(u_time)) - 0.5) * (2.0 / 255.0);

  gl_FragColor = vec4(sky, 1.0);
}
`,va=4096,ya=["u_res","u_time","u_cam","u_sun","u_cover","u_high","u_mid","u_low","u_rain","u_snow","u_wind","u_thunder","u_haze","u_cbFeat","u_windOff","u_evo","u_filtAmt","u_filtTint","u_filtSat","u_filtLift","u_p3","u_headroom","u_tone","u_pol","u_sky","u_radiant"],ga=class{constructor(t,e={}){y(this,"canvas");y(this,"opts");y(this,"gl",null);y(this,"program",null);y(this,"buffer",null);y(this,"u",{});y(this,"lost",!1);y(this,"p3",!1);y(this,"onLost",t=>{t.preventDefault(),this.lost=!0});y(this,"onRestored",()=>{this.lost=!1,this.init()});this.canvas=t,this.opts=e,t.addEventListener("webglcontextlost",this.onLost),t.addEventListener("webglcontextrestored",this.onRestored),this.init()}get available(){return this.gl!==null}get colorSpace(){return this.p3?"display-p3":"srgb"}init(){let t=this.canvas.getContext("webgl",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"low-power"});if(!t){this.gl=null;return}this.gl=t,this.p3=!1,this.opts.colorSpace!=="srgb"&&"drawingBufferColorSpace"in t&&(t.drawingBufferColorSpace="display-p3",this.p3=t.drawingBufferColorSpace==="display-p3");let e=(n,r)=>{let l=t.createShader(n);return l?(t.shaderSource(l,r),t.compileShader(l),t.getShaderParameter(l,t.COMPILE_STATUS)?l:(console.error("atmosphere shader compile error:",t.getShaderInfoLog(l)),t.deleteShader(l),null)):null},o=e(t.VERTEX_SHADER,fa),i=e(t.FRAGMENT_SHADER,pa);if(!o||!i){this.gl=null;return}let a=t.createProgram();if(!a){this.gl=null;return}if(t.attachShader(a,o),t.attachShader(a,i),t.linkProgram(a),t.deleteShader(o),t.deleteShader(i),!t.getProgramParameter(a,t.LINK_STATUS)){console.error("atmosphere shader link error:",t.getProgramInfoLog(a)),this.gl=null;return}this.program=a,t.useProgram(a),this.buffer=t.createBuffer(),t.bindBuffer(t.ARRAY_BUFFER,this.buffer),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW);let s=t.getAttribLocation(a,"a_pos");t.enableVertexAttribArray(s),t.vertexAttribPointer(s,2,t.FLOAT,!1,0,0),this.u={};for(let n of ya)this.u[n]=t.getUniformLocation(a,n)}resize(t,e){var o;this.canvas.width=t,this.canvas.height=e,(o=this.gl)==null||o.viewport(0,0,t,e)}render(t,e,o=dt,i=0,a=0){var c,g,b,m,_;let s=this.gl;if(!s||this.lost||!this.program)return;s.useProgram(this.program);let n=this.u;s.uniform2f(n.u_res,this.canvas.width,this.canvas.height),s.uniform1f(n.u_time,t%va),s.uniform3f(n.u_cam,o.yaw,o.pitch,o.fov),s.uniform2f(n.u_sun,e.sunElevation,e.sunAzimuth);let r=e.clouds;s.uniform1f(n.u_cover,e.cloudCover),s.uniform3f(n.u_high,r.cirrus,r.cirrostratus,r.cirrocumulus),s.uniform3f(n.u_mid,r.altostratus,r.altocumulus,r.nimbostratus),s.uniform4f(n.u_low,r.stratus,r.stratocumulus,r.cumulus,r.cumulonimbus),s.uniform1f(n.u_rain,e.rain),s.uniform1f(n.u_snow,e.snow),s.uniform1f(n.u_wind,e.wind),s.uniform1f(n.u_thunder,e.thunder),s.uniform1f(n.u_haze,e.haze),s.uniform2f(n.u_cbFeat,e.features.anvil,e.features.velum),s.uniform1f(n.u_windOff,i),s.uniform1f(n.u_evo,a),s.uniform1f(n.u_filtAmt,e.filter.amount),s.uniform3f(n.u_filtTint,e.filter.tint[0],e.filter.tint[1],e.filter.tint[2]),s.uniform1f(n.u_filtSat,e.filter.saturation),s.uniform1f(n.u_filtLift,e.filter.lift),s.uniform1f(n.u_p3,this.p3?1:0),s.uniform1f(n.u_headroom,Math.max(1,(c=this.opts.headroom)!=null?c:1));let l=e.tone;s.uniform4f(n.u_tone,l.exposure,l.contrast,l.knee,l.bleach);let h=e.polarizer;s.uniform4f(n.u_pol,h.strength,h.angle,h.saturation,h.stopLoss);let u=e.celestial;s.uniform4f(n.u_sky,u.bortle,u.milkyWay,u.meteors,u.radiant?1:0),s.uniform2f(n.u_radiant,(b=(g=u.radiant)==null?void 0:g[0])!=null?b:0,(_=(m=u.radiant)==null?void 0:m[1])!=null?_:0),s.drawArrays(s.TRIANGLES,0,3)}dispose(t={}){var o;let e=this.gl;this.canvas.removeEventListener("webglcontextlost",this.onLost),this.canvas.removeEventListener("webglcontextrestored",this.onRestored),e&&(this.program&&e.deleteProgram(this.program),this.buffer&&e.deleteBuffer(this.buffer),t.loseContext&&((o=e.getExtension("WEBGL_lose_context"))==null||o.loseContext())),this.gl=null,this.program=null,this.buffer=null}},wa=()=>Math.min(typeof devicePixelRatio=="number"?devicePixelRatio:1,1.5)*.55,ft=class{constructor(t,e={}){y(this,"canvas");y(this,"renderer");y(this,"animator");y(this,"opts");y(this,"target");y(this,"conditions");y(this,"cam");y(this,"raf",0);y(this,"observer",null);y(this,"startedAt",0);y(this,"last",0);y(this,"lastDraw",0);y(this,"wantRunning",!1);y(this,"motionQuery",null);y(this,"onMotionChange",()=>{this.wantRunning&&(this.reducedMotion?(this.stopLoop(),this.jump()):this.startLoop())});this.canvas=t,this.opts=e,this.conditions={time:e.time,location:e.location,weather:e.weather,filter:e.filter,tone:e.tone,polarizer:e.polarizer,celestial:e.celestial,camera:e.camera},this.target=ht(this.conditions),this.cam=ut(e.camera),this.renderer=new ga(t,{colorSpace:e.colorSpace}),this.animator=new Zt(this.target,e.animator),this.resize(),typeof ResizeObserver!="undefined"&&(this.observer=new ResizeObserver(()=>this.resize()),this.observer.observe(t)),e.respectReducedMotion!==!1&&typeof matchMedia!="undefined"&&(this.motionQuery=matchMedia("(prefers-reduced-motion: reduce)"),this.motionQuery.addEventListener("change",this.onMotionChange)),e.autoStart!==!1&&this.start()}get reducedMotion(){var t,e;return(e=(t=this.motionQuery)==null?void 0:t.matches)!=null?e:!1}get available(){return this.renderer.available}get colorSpace(){return this.renderer.colorSpace}get state(){let t=this.animator.current;return w(d({},t),{clouds:d({},t.clouds),features:d({},t.features),filter:w(d({},t.filter),{tint:[...t.filter.tint]}),tone:d({},t.tone),polarizer:d({},t.polarizer),celestial:w(d({},t.celestial),{radiant:t.celestial.radiant?[t.celestial.radiant[0],t.celestial.radiant[1]]:null})})}get camera(){return this.cam}set(t){this.applyConditions(t),this.wantRunning&&!this.raf&&this.reducedMotion&&(this.animator.jump(this.target),this.draw(performance.now()))}jump(t={}){this.applyConditions(t),this.animator.jump(this.target),this.draw(performance.now())}applyConditions(t){this.conditions=d(d({},this.conditions),t),this.target=ht(this.conditions),t.camera&&(this.cam=ut(d(d({},this.cam),t.camera)))}resize(){var i;let t=(i=this.opts.resolutionScale)!=null?i:wa(),e=this.canvas.clientWidth||this.canvas.width,o=this.canvas.clientHeight||this.canvas.height;this.renderer.resize(Math.max(1,Math.round(e*t)),Math.max(1,Math.round(o*t)))}start(){if(this.available){if(this.wantRunning=!0,this.reducedMotion){this.jump();return}this.startLoop()}}stop(){this.wantRunning=!1,this.stopLoop()}startLoop(){if(this.raf)return;let t=performance.now();this.startedAt||(this.startedAt=t),this.last=t;let e=o=>{var s;this.raf=requestAnimationFrame(e);let i=1e3/((s=this.opts.fps)!=null?s:30),a=o-this.lastDraw;a<i||(this.lastDraw=o-a%i,this.draw(o))};this.raf=requestAnimationFrame(e)}stopLoop(){this.raf&&(cancelAnimationFrame(this.raf),this.raf=0)}draw(t){this.startedAt||(this.startedAt=t,this.last=t);let e=Math.min(.2,(t-this.last)/1e3);this.last=t,this.animator.step(this.target,e),this.reducedMotion&&(this.animator.current.celestial.meteors=0),this.renderer.render((t-this.startedAt)/1e3,this.animator.current,this.cam,this.animator.wind,this.animator.evolution)}dispose(t={}){var e,o;this.stop(),(e=this.observer)==null||e.disconnect(),this.observer=null,(o=this.motionQuery)==null||o.removeEventListener("change",this.onMotionChange),this.motionQuery=null,this.renderer.dispose(t)}};function De(t,e){let o={};for(let i of Object.keys(t))o[i]=e(t[i]);return o}var Yo={en:De(ye,t=>t.label),ja:{clear:"\u5FEB\u6674",fair:"\u6674\u308C",summer:"\u590F\u7A7A",overcast:"\u66C7\u308A",fog:"\u9727",rain:"\u96E8",thunderstorm:"\u96F7\u96E8",snow:"\u96EA",typhoon:"\u53F0\u98A8"}},Ko={en:De(j,t=>t.label),ja:{none:"\u306A\u3057",sepia:"\u30BB\u30D4\u30A2",mono:"\u30E2\u30CE\u30AF\u30ED\u30FC\u30E0",faded:"\u892A\u8272",cyanotype:"\u9752\u306E\u8A18\u61B6",gold:"\u9EC4\u660F",ash:"\u7070"}},Jo={en:De(Fe,t=>({label:t.label,alias:t.alias})),ja:{cirrus:{label:"\u5DFB\u96F2",alias:"\u3059\u3058\u96F2"},cirrostratus:{label:"\u5DFB\u5C64\u96F2",alias:"\u3046\u3059\u96F2"},cirrocumulus:{label:"\u5DFB\u7A4D\u96F2",alias:"\u3046\u308D\u3053\u96F2\u30FB\u3044\u308F\u3057\u96F2"},altostratus:{label:"\u9AD8\u5C64\u96F2",alias:"\u304A\u307C\u308D\u96F2"},altocumulus:{label:"\u9AD8\u7A4D\u96F2",alias:"\u3072\u3064\u3058\u96F2"},nimbostratus:{label:"\u4E71\u5C64\u96F2",alias:"\u3042\u307E\u96F2"},stratus:{label:"\u5C64\u96F2",alias:"\u304D\u308A\u96F2"},stratocumulus:{label:"\u5C64\u7A4D\u96F2",alias:"\u304F\u3082\u308A\u96F2"},cumulus:{label:"\u7A4D\u96F2",alias:"\u308F\u305F\u96F2"},cumulonimbus:{label:"\u7A4D\u4E71\u96F2",alias:"\u5165\u9053\u96F2"}}};var ba={latitude:37.8991768,longitude:-122.4949685},v={0:{cloudCover:0,precipitation:0,windSpeed:2,visibility:45,thunder:0},1:{cloudCover:.2,precipitation:0,windSpeed:3,visibility:35,thunder:0},2:{cloudCover:.4,precipitation:0,windSpeed:4,visibility:30,thunder:0},3:{cloudCover:.96,precipitation:0,windSpeed:5,visibility:18,thunder:0},45:{cloudCover:.75,precipitation:0,windSpeed:1,visibility:.6,thunder:0},48:{cloudCover:.78,precipitation:0,windSpeed:1,visibility:.4,thunder:0},51:{cloudCover:.62,precipitation:.2,windSpeed:2,visibility:10,thunder:0,precipitationType:"rain"},53:{cloudCover:.68,precipitation:.5,windSpeed:3,visibility:8,thunder:0,precipitationType:"rain"},55:{cloudCover:.75,precipitation:1.2,windSpeed:4,visibility:6,thunder:0,precipitationType:"rain"},56:{cloudCover:.7,precipitation:.3,windSpeed:3,visibility:3,thunder:0,precipitationType:"rain"},57:{cloudCover:.76,precipitation:1,windSpeed:4,visibility:2,thunder:0,precipitationType:"rain"},61:{cloudCover:.78,precipitation:2,windSpeed:4,visibility:10,thunder:0,precipitationType:"rain"},63:{cloudCover:.85,precipitation:5,windSpeed:6,visibility:8,thunder:0,precipitationType:"rain"},65:{cloudCover:.92,precipitation:18,windSpeed:8,visibility:4,thunder:0,precipitationType:"rain"},66:{cloudCover:.85,precipitation:2,windSpeed:5,visibility:2,thunder:0,precipitationType:"rain"},67:{cloudCover:.9,precipitation:10,windSpeed:7,visibility:1,thunder:0,precipitationType:"rain"},71:{cloudCover:.78,precipitation:.8,windSpeed:4,visibility:3,thunder:0,precipitationType:"snow"},73:{cloudCover:.85,precipitation:2.5,windSpeed:5,visibility:2,thunder:0,precipitationType:"snow"},75:{cloudCover:.92,precipitation:8,windSpeed:7,visibility:1,thunder:0,precipitationType:"snow"},77:{cloudCover:.7,precipitation:.5,windSpeed:5,visibility:2,thunder:0,precipitationType:"snow"},80:{cloudCover:.55,precipitation:2.5,windSpeed:5,visibility:12,thunder:0,precipitationType:"rain",convection:.55},81:{cloudCover:.65,precipitation:6,windSpeed:6,visibility:8,thunder:0,precipitationType:"rain",convection:.7},82:{cloudCover:.75,precipitation:25,windSpeed:8,visibility:4,thunder:0,precipitationType:"rain",convection:.85},85:{cloudCover:.55,precipitation:1,windSpeed:5,visibility:4,thunder:0,precipitationType:"snow",convection:.45},86:{cloudCover:.7,precipitation:6,windSpeed:7,visibility:2,thunder:0,precipitationType:"snow",convection:.7},95:{cloudCover:.96,precipitation:15,windSpeed:10,visibility:5,thunder:1,precipitationType:"rain",convection:.75},96:{cloudCover:.97,precipitation:25,windSpeed:12,visibility:4,thunder:1,precipitationType:"rain",convection:.85},99:{cloudCover:.99,precipitation:45,windSpeed:15,visibility:3,thunder:1,precipitationType:"rain",convection:.95}},ka={"clear-day":w(d({},v[0]),{cloudCover:.03,windSpeed:3}),"clear-night":w(d({},v[0]),{overlay:"clear-night",cloudCover:0,windSpeed:2}),"mostly-clear-day":w(d({},v[1]),{cloudCover:.15,windSpeed:3}),"mostly-clear-night":w(d({},v[1]),{overlay:"clear-night",cloudCover:.1,windSpeed:2}),"partly-cloudy-day":w(d({},v[2]),{cloudCover:.4}),"partly-cloudy-night":w(d({},v[2]),{cloudCover:.4}),"mostly-cloudy-day":w(d({},v[3]),{cloudCover:.62}),"mostly-cloudy-night":w(d({},v[3]),{cloudCover:.62}),overcast:w(d({},v[3]),{cloudCover:.96}),fog:w(d({},v[45]),{overlay:"fog-bank"}),"drizzle-light":v[51],drizzle:v[53],"drizzle-heavy":v[55],"rain-light":v[61],rain:v[63],"rain-heavy":v[65],"freezing-rain":w(d({},v[67]),{overlay:"ice"}),"snow-light":v[71],snow:v[73],"snow-heavy":v[75],"snow-grains":v[77],"rain-showers-light":v[80],"rain-showers":v[81],"rain-showers-heavy":v[82],"snow-showers-light":v[85],"snow-showers":v[86],thunderstorm:v[95],"thunderstorm-hail":w(d({},v[96]),{overlay:"hail"}),"thunderstorm-hail-heavy":w(d({},v[99]),{overlay:"hail"})},_a={tornado:{cloudCover:1,precipitation:60,windSpeed:75,visibility:.2,thunder:1,convection:1,precipitationType:"rain",overlay:"tornado",label:"Tornado"},waterspout:{cloudCover:.98,precipitation:45,windSpeed:55,visibility:.5,thunder:1,convection:.95,precipitationType:"rain",overlay:"tornado",label:"Waterspout"},hurricane:{cloudCover:1,precipitation:90,windSpeed:60,visibility:.2,thunder:.9,convection:1,precipitationType:"rain",overlay:"hurricane",label:"Hurricane"},"tropical-storm":{cloudCover:1,precipitation:45,windSpeed:35,visibility:.5,thunder:.7,convection:.8,precipitationType:"rain",overlay:"rain",label:"Tropical Storm"},derecho:{cloudCover:1,precipitation:40,windSpeed:50,visibility:1,thunder:1,convection:.95,precipitationType:"rain",overlay:"lightning",label:"Derecho"},squall:{cloudCover:.95,precipitation:25,windSpeed:30,visibility:2,thunder:.8,convection:.7,precipitationType:"rain",overlay:"rain",label:"Squall"},blizzard:{cloudCover:1,precipitation:20,windSpeed:28,visibility:.1,thunder:0,convection:0,precipitationType:"snow",overlay:"snow-blizzard",label:"Blizzard"},"ice-storm":{cloudCover:.95,precipitation:18,windSpeed:12,visibility:.5,thunder:0,convection:0,precipitationType:"rain",overlay:"ice",label:"Ice Storm"},sandstorm:{cloudCover:.95,precipitation:0,windSpeed:25,visibility:.05,thunder:0,convection:0,overlay:"sand",label:"Sandstorm"},"dust-storm":{cloudCover:.92,precipitation:0,windSpeed:20,visibility:.1,thunder:0,convection:0,overlay:"dust",label:"Dust Storm"},"volcanic-ash":{cloudCover:.95,precipitation:0,windSpeed:8,visibility:.3,thunder:0,convection:0,overlay:"ash",label:"Volcanic Ash"},"wildfire-smoke":{cloudCover:.9,precipitation:0,windSpeed:6,visibility:1,thunder:0,convection:0,overlay:"smoke",label:"Wildfire Smoke"},"forest-fire":{cloudCover:.88,precipitation:0,windSpeed:8,visibility:.5,thunder:0,convection:0,overlay:"fire",label:"Forest Fire"},smoke:{cloudCover:.8,precipitation:0,windSpeed:4,visibility:1.5,thunder:0,convection:0,overlay:"smoke",label:"Smoke"},ash:{cloudCover:.85,precipitation:0,windSpeed:5,visibility:.4,thunder:0,convection:0,overlay:"ash",label:"Ash"},haze:{cloudCover:.35,precipitation:0,windSpeed:3,visibility:5,thunder:0,convection:0,overlay:"haze",label:"Haze"},smog:{cloudCover:.55,precipitation:0,windSpeed:2,visibility:2,thunder:0,convection:0,overlay:"smoke",label:"Smog"},"acid-rain":{cloudCover:.8,precipitation:12,windSpeed:6,visibility:5,thunder:.2,convection:0,precipitationType:"rain",overlay:"acid-rain",label:"Acid Rain"},"flash-flood":{cloudCover:.85,precipitation:50,windSpeed:10,visibility:2,thunder:.4,convection:.5,precipitationType:"rain",overlay:"rain",label:"Flash Flood"},aurora:{cloudCover:.2,precipitation:0,windSpeed:2,visibility:45,thunder:0,convection:0,overlay:"aurora",label:"Aurora"},eclipse:{cloudCover:.1,precipitation:0,windSpeed:2,visibility:45,thunder:0,convection:0,overlay:"eclipse",label:"Solar Eclipse"},"eclipse-lunar":{cloudCover:.05,precipitation:0,windSpeed:2,visibility:45,thunder:0,convection:0,overlay:"eclipse-lunar",label:"Lunar Eclipse"},"blood-moon":{cloudCover:.05,precipitation:0,windSpeed:2,visibility:45,thunder:0,convection:0,overlay:"blood-moon",label:"Blood Moon"},rainbow:{cloudCover:.3,precipitation:0,windSpeed:4,visibility:35,thunder:0,convection:0,overlay:"rainbow",label:"Rainbow"},"meteor-shower":{cloudCover:.15,precipitation:0,windSpeed:2,visibility:45,thunder:0,convection:0,overlay:"meteors",label:"Meteor Shower"},"meteor-impact":{cloudCover:.25,precipitation:0,windSpeed:6,visibility:30,thunder:.6,convection:0,overlay:"meteor-impact",label:"Meteor Impact"},"asteroid-impact":{cloudCover:.6,precipitation:0,windSpeed:20,visibility:10,thunder:1,convection:.5,overlay:"meteor-impact",label:"Asteroid Impact"},"close-approach":{cloudCover:.1,precipitation:0,windSpeed:2,visibility:45,thunder:0,convection:0,overlay:"close-approach",label:"Asteroid Close Approach"},supermoon:{cloudCover:.05,precipitation:0,windSpeed:2,visibility:45,thunder:0,convection:0,overlay:"supermoon",label:"Supermoon"},earthquake:{cloudCover:.5,precipitation:0,windSpeed:4,visibility:20,thunder:0,convection:0,overlay:"earthquake",label:"Earthquake"},tsunami:{cloudCover:.85,precipitation:0,windSpeed:15,visibility:2,thunder:.2,convection:0,overlay:"tsunami",label:"Tsunami"},"volcanic-eruption":{cloudCover:1,precipitation:0,windSpeed:12,visibility:.05,thunder:.8,convection:.9,overlay:"volcano",label:"Volcanic Eruption"},landslide:{cloudCover:.65,precipitation:5,windSpeed:8,visibility:2,thunder:0,convection:0,overlay:"landslide",label:"Landslide"},mudslide:{cloudCover:.7,precipitation:15,windSpeed:10,visibility:1,thunder:0,convection:0,overlay:"mudslide",label:"Mudslide"},avalanche:{cloudCover:.8,precipitation:8,windSpeed:12,visibility:.5,thunder:0,convection:0,precipitationType:"snow",overlay:"avalanche",label:"Avalanche"},rockfall:{cloudCover:.4,precipitation:0,windSpeed:6,visibility:5,thunder:0,convection:0,overlay:"rockfall",label:"Rockfall"},"geological-event":{cloudCover:.55,precipitation:0,windSpeed:5,visibility:10,thunder:0,convection:0,overlay:"earthquake",label:"Geological Event"},apocalypse:{cloudCover:1,precipitation:80,windSpeed:40,visibility:.05,thunder:1,convection:1,precipitationType:"rain",overlay:"tornado",label:"Apocalypse"}},Sa=d(d({},ka),_a),xe=class{constructor(e){this.canvas=document.createElement("canvas"),this.canvas.id="fx-overlay",this.canvas.style.cssText="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1",e.appendChild(this.canvas),this.ctx=this.canvas.getContext("2d"),this.effect=null,this.t=0,this.w=0,this.h=0,this.particles=[],this.lastTick=0,this.dpr=Math.min(typeof window!="undefined"&&window.devicePixelRatio||1,1.5)*.5,this.fps=20,this.resize(),window.addEventListener("resize",()=>this.resize()),this._tick()}resize(){this.w=this.canvas.clientWidth||window.innerWidth,this.h=this.canvas.clientHeight||window.innerHeight,this.canvas.width=Math.floor(this.w*this.dpr),this.canvas.height=Math.floor(this.h*this.dpr),this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0)}setEffect(e){if(this.effect=e||null,this.t=0,this.particles=[],e&&["clear-day","clear-night","sand","dust","ash","smoke","haze","snow-blizzard","volcano","landslide","mudslide","avalanche","rockfall","earthquake","tsunami","acid-rain","fire","hail"].includes(e)){let i={"clear-day":35,"clear-night":60,sand:300,dust:250,ash:200,smoke:150,haze:100,"snow-blizzard":400,volcano:300,landslide:250,mudslide:300,avalanche:400,rockfall:200,earthquake:250,tsunami:0,"acid-rain":120,fire:150,hail:100}[e]||300;for(let a=0;a<i;a++)this.particles.push(this._newParticle(e))}let o=document.querySelector(".ww");o&&(o.style.transition="none",o.style.transform="")}_rand(e,o){return e+Math.random()*(o-e)}_newParticle(e){let o=this.w,i=this.h;switch(e){case"clear-day":return{x:this._rand(0,o),y:this._rand(0,i),r:this._rand(.8,2.2),v:this._rand(.2,.6),vy:this._rand(-.1,.1),op:this._rand(.15,.35),life:this._rand(120,240),type:"clear-day"};case"clear-night":return{x:this._rand(0,o),y:this._rand(0,i*.6),r:this._rand(.6,1.6),v:this._rand(.05,.15),vy:this._rand(-.03,.03),op:this._rand(.25,.7),life:this._rand(80,180),twinkle:this._rand(.5,1.2),phase:this._rand(0,Math.PI*2),type:"clear-night"};case"sand":case"dust":return{x:this._rand(-o,o),y:this._rand(0,i),r:this._rand(1,3),v:this._rand(12,25),vy:this._rand(-1,1),op:this._rand(.4,.9)};case"ash":return{x:this._rand(0,o),y:this._rand(-i,0),r:this._rand(1,4),v:this._rand(2,6),vy:this._rand(2,8),op:this._rand(.3,.8)};case"smoke":case"haze":return{x:this._rand(-o,o),y:this._rand(0,i),r:this._rand(20,80),v:this._rand(4,10),vy:this._rand(-.5,.5),op:this._rand(.05,.2),grow:this._rand(.2,.8)};case"snow-blizzard":return{x:this._rand(0,o),y:this._rand(-i,i),r:this._rand(1,3),v:this._rand(18,35),vy:this._rand(4,10),op:this._rand(.5,.95)};case"volcano":return{x:this._rand(o*.45,o*.55),y:this._rand(i*.55,i*.75),r:this._rand(2,6),v:this._rand(-2,6),vy:this._rand(-6,-1),op:this._rand(.4,.9),life:this._rand(20,80)};case"landslide":case"mudslide":return{x:this._rand(-100,o),y:this._rand(-50,i*.6),r:this._rand(3,10),v:this._rand(3,10),vy:this._rand(2,8),op:this._rand(.5,.9)};case"avalanche":return{x:this._rand(0,o),y:this._rand(-i,0),r:this._rand(2,6),v:this._rand(10,25),vy:this._rand(8,18),op:this._rand(.5,.95)};case"rockfall":return{x:this._rand(-50,o+50),y:this._rand(-i*.5,0),r:this._rand(3,12),v:this._rand(-2,4),vy:this._rand(4,14),op:this._rand(.5,.9),rot:this._rand(0,Math.PI*2),rotv:this._rand(-.2,.2)};case"earthquake":return{x:this._rand(0,o),y:this._rand(i*.6,i),r:this._rand(1,4),v:this._rand(-1,1),vy:this._rand(-1,-3),op:this._rand(.3,.7),life:this._rand(10,50)};case"acid-rain":return{x:this._rand(0,o),y:this._rand(0,i),len:this._rand(14,28),v:this._rand(9,16),op:this._rand(.35,.75)};case"hail":return{x:this._rand(0,o),y:this._rand(-i,0),r:this._rand(2,6),v:this._rand(6,16),vy:this._rand(18,32),op:this._rand(.55,.9),rot:this._rand(0,Math.PI*2),rotv:this._rand(-.3,.3)};case"fire":return{x:this._rand(0,o),y:this._rand(i*.55,i),r:this._rand(2,7),v:this._rand(-1,2),vy:this._rand(-3,-.5),op:this._rand(.4,.9),life:this._rand(20,70)};default:return{}}}_tick(e){let o=e||performance.now(),i=1e3/this.fps;if(o-this.lastTick<i){requestAnimationFrame(r=>this._tick(r));return}this.lastTick=o-(o-this.lastTick)%i,this.t++;let{ctx:a,w:s,h:n}=this;a.clearRect(0,0,s,n),this.effect==="tornado"?this._drawTornado(a,s,n):this.effect==="hurricane"?this._drawHurricane(a,s,n):this.effect==="lightning"?this._drawLightningBolts(a,s,n):this.effect==="hail"?this._drawHail(a,s,n):this.effect==="ice"?this._drawIce(a,s,n):this.effect==="aurora"?this._drawAurora(a,s,n):this.effect==="eclipse"?this._drawEclipse(a,s,n):this.effect==="eclipse-lunar"?this._drawLunarEclipse(a,s,n):this.effect==="blood-moon"?this._drawBloodMoon(a,s,n):this.effect==="supermoon"?this._drawSupermoon(a,s,n):this.effect==="close-approach"?this._drawCloseApproach(a,s,n):this.effect==="rainbow"?this._drawRainbow(a,s,n):this.effect==="meteors"?this._drawMeteors(a,s,n):this.effect==="meteor-impact"?this._drawMeteorImpact(a,s,n):this.effect==="earthquake"?this._drawEarthquake(a,s,n):this.effect==="tsunami"?this._drawTsunami(a,s,n):this.effect==="volcano"?this._drawVolcano(a,s,n):this.effect==="landslide"?this._drawLandslide(a,s,n):this.effect==="mudslide"?this._drawMudslide(a,s,n):this.effect==="avalanche"?this._drawAvalanche(a,s,n):this.effect==="rockfall"?this._drawRockfall(a,s,n):this.effect==="acid-rain"?this._drawAcidRain(a,s,n):this.effect==="fire"?this._drawFire(a,s,n):this.effect==="fog-bank"?this._drawFogBank(a,s,n):this.effect==="clear-day"?this._drawClearDay(a,s,n):this.effect==="clear-night"?this._drawClearNight(a,s,n):this.particles.length&&this._drawParticles(a,s,n),requestAnimationFrame(r=>this._tick(r))}_drawTornado(e,o,i){let a=o*.5,s=i*.95,n=this.t*.04;e.save(),e.globalCompositeOperation="source-over";let r=e.createLinearGradient(a,s,a,0);r.addColorStop(0,"rgba(20,20,25,0.9)"),r.addColorStop(.45,"rgba(60,60,70,0.5)"),r.addColorStop(1,"rgba(120,120,130,0)"),e.fillStyle=r,e.beginPath();for(let l=i;l>=0;l-=4){let h=1-l/i,u=140*(1-h)+12*h,c=Math.sin(n+l*.03)*(10*(1-h)+2);e.lineTo(a+c+u*.5,l)}for(let l=0;l<=i;l+=4){let h=l/i,u=140*h+12*(1-h),c=Math.sin(n+l*.03)*(10*h+2);e.lineTo(a+c-u*.5,l)}e.closePath(),e.fill(),e.globalCompositeOperation="screen";for(let l=0;l<40;l++){let h=n+l*.35,u=80+Math.sin(this.t*.1+l)*20,c=a+Math.cos(h)*u,g=s-20+Math.sin(h)*10;e.fillStyle=`rgba(180,170,160,${.3+Math.random()*.3})`,e.beginPath(),e.arc(c,g,1.5+Math.random()*2,0,Math.PI*2),e.fill()}e.restore()}_drawHurricane(e,o,i){let a=o*.5,s=i*.45,n=this.t*.015;e.save(),e.globalCompositeOperation="source-over";for(let l=0;l<4;l++){let h=n+l*(Math.PI/2);e.strokeStyle="rgba(60,60,70,0.35)",e.lineWidth=18,e.beginPath();for(let u=40;u<Math.max(o,i)*.8;u+=8){let c=h+u*.018,g=a+Math.cos(c)*u,b=s+Math.sin(c)*u;u===40?e.moveTo(g,b):e.lineTo(g,b)}e.stroke()}let r=e.createRadialGradient(a,s,5,a,s,45);r.addColorStop(0,"rgba(200,190,170,0.9)"),r.addColorStop(.6,"rgba(90,85,80,0.6)"),r.addColorStop(1,"rgba(40,40,45,0)"),e.fillStyle=r,e.beginPath(),e.arc(a,s,45,0,Math.PI*2),e.fill(),e.restore()}_drawLightningBolts(e,o,i){if(Math.random()>.03)return;e.save(),e.globalCompositeOperation="screen",e.strokeStyle="rgba(255,250,220,0.95)",e.lineWidth=2+Math.random()*3,e.shadowColor="#fff8c5",e.shadowBlur=20;let a=this._rand(o*.2,o*.8);e.beginPath(),e.moveTo(a,0);let s=a,n=0;for(;n<i*.6;)s+=this._rand(-30,30),n+=this._rand(15,40),e.lineTo(s,n);e.stroke(),e.restore()}_drawIce(e,o,i){e.save(),e.globalCompositeOperation="screen";for(let a=0;a<30;a++){let s=(this.t*.5+a*137)%(o+60)-30,n=a*79%(i+40)-20,r=8+a%7;e.strokeStyle=`rgba(200,230,255,${.15+a%5*.05})`,e.lineWidth=1,e.beginPath();for(let l=0;l<6;l++){let h=l*Math.PI/3+this.t*.02+a,u=r*.5,c=r;e.moveTo(s+Math.cos(h)*u,n+Math.sin(h)*u),e.lineTo(s+Math.cos(h)*c,n+Math.sin(h)*c)}e.stroke()}e.restore()}_drawHail(e,o,i){e.save(),e.globalCompositeOperation="source-over",e.shadowBlur=2,e.shadowColor="rgba(160, 190, 220, 0.35)";for(let a of this.particles)a.x+=a.v,a.y+=a.vy,a.rot+=a.rotv,a.y>i+a.r&&(a.y=this._rand(-30,-10),a.x=this._rand(0,o),a.v=this._rand(6,16),a.vy=this._rand(18,32)),e.globalAlpha=a.op,e.fillStyle="#e8f0f8",e.beginPath(),e.arc(a.x,a.y,a.r,0,Math.PI*2),e.fill();e.restore()}_drawAurora(e,o,i){e.save(),e.globalCompositeOperation="screen";let a=[{hue:140,baseY:.16,amp:55,speed:.015,thickness:110},{hue:165,baseY:.26,amp:70,speed:.011,thickness:130},{hue:195,baseY:.36,amp:50,speed:.02,thickness:90}];for(let s of a){let n=i*s.baseY,r=10;for(let l=0;l<=o;l+=r){let h=n+Math.sin(l*.012+this.t*s.speed)*s.amp+Math.sin(l*.004+this.t*s.speed*.6)*s.amp*.6,u=.55+.45*Math.sin(l*.05+this.t*.08),c=e.createLinearGradient(0,h-s.thickness*.5,0,h+s.thickness*.5);c.addColorStop(0,`hsla(${s.hue}, 85%, 65%, 0)`),c.addColorStop(.5,`hsla(${s.hue}, 85%, 65%, ${.22*u})`),c.addColorStop(1,`hsla(${s.hue}, 85%, 65%, 0)`),e.fillStyle=c,e.fillRect(l,h-s.thickness*.5,r+2,s.thickness)}}e.restore()}_drawEclipse(e,o,i){let a=o*.5,s=i*.25,n=Math.min(o,i)*.12;e.save(),e.globalCompositeOperation="source-over";let r=e.createRadialGradient(a,s,n*.9,a,s,n*1.6);r.addColorStop(0,"rgba(255,240,200,0.9)"),r.addColorStop(.5,"rgba(255,220,120,0.4)"),r.addColorStop(1,"rgba(255,200,80,0)"),e.fillStyle=r,e.beginPath(),e.arc(a,s,n*1.6,0,Math.PI*2),e.fill(),e.fillStyle="rgba(10,10,12,0.85)",e.beginPath(),e.arc(a+n*.15,s,n,0,Math.PI*2),e.fill(),e.restore()}_drawLunarEclipse(e,o,i){let a=o*.5,s=i*.28,n=Math.min(o,i)*.11;e.save(),e.globalCompositeOperation="source-over";let r=e.createRadialGradient(a,s,n*.8,a,s,n*2.2);r.addColorStop(0,"rgba(226,232,240,0.35)"),r.addColorStop(1,"rgba(226,232,240,0)"),e.fillStyle=r,e.beginPath(),e.arc(a,s,n*2.2,0,Math.PI*2),e.fill(),e.fillStyle="#e8edf4",e.beginPath(),e.arc(a,s,n,0,Math.PI*2),e.fill();let l=.5+.5*Math.sin(this.t*.01);e.globalAlpha=.82,e.fillStyle="#1e293b",e.beginPath(),e.arc(a+n*(.55+.25*l),s-n*.1,n*1.05,0,Math.PI*2),e.fill(),e.restore()}_drawBloodMoon(e,o,i){let a=o*.5,s=i*.28,n=Math.min(o,i)*.11;e.save(),e.globalCompositeOperation="source-over";let r=e.createRadialGradient(a,s,n*.7,a,s,n*2.6);r.addColorStop(0,"rgba(220,38,38,0.30)"),r.addColorStop(1,"rgba(220,38,38,0)"),e.fillStyle=r,e.beginPath(),e.arc(a,s,n*2.6,0,Math.PI*2),e.fill();let l=e.createRadialGradient(a-n*.3,s-n*.3,n*.1,a,s,n);l.addColorStop(0,"#c2410c"),l.addColorStop(.55,"#9a3412"),l.addColorStop(1,"#5c1a0a"),e.fillStyle=l,e.beginPath(),e.arc(a,s,n,0,Math.PI*2),e.fill(),e.globalAlpha=.35,e.fillStyle="#7c2d12",e.beginPath(),e.arc(a-n*.25,s-n*.15,n*.28,0,Math.PI*2),e.fill(),e.beginPath(),e.arc(a+n*.3,s+n*.3,n*.2,0,Math.PI*2),e.fill(),e.restore()}_drawSupermoon(e,o,i){let a=o*.5,s=i*.3,n=Math.min(o,i)*.16;e.save(),e.globalCompositeOperation="source-over";let r=e.createRadialGradient(a,s,n*.9,a,s,n*2.4);r.addColorStop(0,"rgba(255,250,230,0.45)"),r.addColorStop(1,"rgba(255,250,230,0)"),e.fillStyle=r,e.beginPath(),e.arc(a,s,n*2.4,0,Math.PI*2),e.fill();let l=e.createRadialGradient(a-n*.3,s-n*.3,n*.1,a,s,n);l.addColorStop(0,"#fffdf2"),l.addColorStop(1,"#f3ecd0"),e.fillStyle=l,e.beginPath(),e.arc(a,s,n,0,Math.PI*2),e.fill(),e.globalAlpha=.18,e.fillStyle="#c9c0a0",e.beginPath(),e.arc(a-n*.28,s-n*.2,n*.22,0,Math.PI*2),e.fill(),e.beginPath(),e.arc(a+n*.32,s+n*.15,n*.16,0,Math.PI*2),e.fill(),e.beginPath(),e.arc(a+n*.05,s-n*.4,n*.12,0,Math.PI*2),e.fill(),e.restore()}_drawCloseApproach(e,o,i){let a=o*(.15+.7*(this.t*.0025%1)),s=i*(.15+.1*Math.sin(this.t*.01));e.save(),e.globalCompositeOperation="screen";let n=e.createRadialGradient(a,s,0,a,s,5);n.addColorStop(0,"rgba(226,232,240,0.9)"),n.addColorStop(1,"rgba(226,232,240,0)"),e.fillStyle=n,e.beginPath(),e.arc(a,s,5,0,Math.PI*2),e.fill(),e.fillStyle="#e2e8f0",e.beginPath(),e.arc(a,s,1.3,0,Math.PI*2),e.fill(),e.restore()}_drawRainbow(e,o,i){let a=o*.5,s=i*.95,n=Math.min(o,i)*.75;e.save(),e.globalCompositeOperation="screen";let r=["#ff0000","#ff7f00","#ffff00","#00ff00","#0000ff","#4b0082","#9400d3"];for(let l=0;l<r.length;l++){let h=n-l*8;e.strokeStyle=r[l],e.lineWidth=7,e.globalAlpha=.55,e.beginPath(),e.arc(a,s,h,Math.PI,0),e.stroke()}e.restore()}_drawFogBank(e,o,i){e.save(),e.globalCompositeOperation="source-over";let a=5;for(let n=0;n<a;n++){let r=i*(.25+n*.16),l=Math.sin(this.t*.006+n*1.7)*40,h=Math.sin(this.t*.01+n)*12,u=e.createLinearGradient(0,r-60+h,0,r+60+h);u.addColorStop(0,"rgba(235,238,242,0)"),u.addColorStop(.5,`rgba(235,238,242,${.22-n*.02})`),u.addColorStop(1,"rgba(235,238,242,0)"),e.fillStyle=u,e.fillRect(l-100,0,o+200,i)}let s=e.createLinearGradient(0,0,0,i);s.addColorStop(0,"rgba(240,242,246,0.06)"),s.addColorStop(1,"rgba(240,242,246,0.28)"),e.fillStyle=s,e.fillRect(0,0,o,i),e.restore()}_drawParticles(e,o,i){let a=this.effect;if(e.save(),a==="sand"||a==="dust"){e.fillStyle=a==="sand"?"rgba(194,160,120,":"rgba(160,150,130,";for(let s of this.particles)s.x+=s.v,s.y+=s.vy,s.x>o+50&&(s.x=-50,s.y=this._rand(0,i)),e.globalAlpha=s.op,e.beginPath(),e.arc(s.x,s.y,s.r,0,Math.PI*2),e.fill();e.globalAlpha=a==="sand"?.25:.18,e.fillStyle=a==="sand"?"#c2a078":"#a69b8a",e.fillRect(0,0,o,i)}else if(a==="ash"){e.fillStyle="rgba(60,55,55,";for(let s of this.particles)s.x+=Math.sin(this.t*.02+s.y*.01)*.5,s.y+=s.vy,s.y>i+10&&(s.y=-10,s.x=this._rand(0,o)),e.globalAlpha=s.op,e.beginPath(),e.arc(s.x,s.y,s.r,0,Math.PI*2),e.fill();e.globalAlpha=.15,e.fillStyle="#6b2e1d",e.fillRect(0,0,o,i)}else if(a==="smoke"||a==="haze")for(let s of this.particles){s.x+=s.v,s.y+=s.vy,s.r+=s.grow,s.x>o+s.r&&(s.x=-s.r,s.y=this._rand(0,i),s.r=this._rand(20,80));let n=a==="smoke"?"80,70,60":"120,110,100";e.fillStyle=`rgba(${n},${s.op})`,e.beginPath(),e.arc(s.x,s.y,s.r,0,Math.PI*2),e.fill()}else if(a==="snow-blizzard"){e.fillStyle="rgba(255,250,240,";for(let s of this.particles)s.x+=s.v,s.y+=s.vy,s.x>o+20&&(s.x=-20,s.y=this._rand(0,i)),s.y>i+20&&(s.y=-20,s.x=this._rand(0,o)),e.globalAlpha=s.op,e.beginPath(),e.arc(s.x,s.y,s.r,0,Math.PI*2),e.fill()}e.restore()}_drawMeteors(e,o,i){e.save(),e.globalCompositeOperation="screen",e.strokeStyle="rgba(255,255,240,0.9)",e.lineWidth=2,e.shadowColor="#fff",e.shadowBlur=6;for(let a=0;a<5;a++){if(Math.random()>.25)continue;let s=this._rand(o*.1,o*.9),n=this._rand(0,i*.4),r=this._rand(40,120),l=this._rand(Math.PI*.2,Math.PI*.8);e.beginPath(),e.moveTo(s,n),e.lineTo(s+Math.cos(l)*r,n+Math.sin(l)*r),e.stroke()}e.restore()}_drawMeteorImpact(e,o,i){e.save();let a=this.t;a<40&&(e.globalCompositeOperation="screen",e.fillStyle=`rgba(255,240,200,${Math.max(0,.9-a/40)})`,e.fillRect(0,0,o,i));let s=a*3%300;e.globalCompositeOperation="screen",e.strokeStyle="rgba(255,220,160,0.4)",e.lineWidth=3,e.beginPath(),e.arc(o*.5,i*.3,s,0,Math.PI*2),e.stroke(),e.strokeStyle="rgba(255,160,60,0.85)",e.lineWidth=4,e.shadowColor="#ff8a00",e.shadowBlur=15;let n=o*.5+a*.4,r=i*.3+a*.9;e.beginPath(),e.moveTo(n,r),e.lineTo(n-40,r-90),e.stroke(),e.restore()}_drawEarthquake(e,o,i){let a=document.querySelector(".ww");if(a){let s=(Math.random()-.5)*6,n=(Math.random()-.5)*4;a.style.transform=`translate(${s}px, ${n}px)`}e.save(),e.fillStyle="rgba(120,110,100,";for(let s of this.particles)s.x+=s.v,s.y+=s.vy,s.life--,s.life<=0&&(s.x=this._rand(0,o),s.y=this._rand(i*.7,i),s.life=this._rand(10,50)),e.globalAlpha=s.op,e.beginPath(),e.arc(s.x,s.y,s.r,0,Math.PI*2),e.fill();e.strokeStyle="rgba(30,25,20,0.6)",e.lineWidth=2,e.beginPath(),e.moveTo(o*.2,i),e.lineTo(o*.35,i*.82),e.lineTo(o*.5,i*.88),e.lineTo(o*.8,i),e.stroke(),e.restore()}_drawTsunami(e,o,i){e.save(),e.globalCompositeOperation="source-over",e.fillStyle="rgba(10,25,40,0.35)",e.fillRect(0,0,o,i);let a=i*.55+Math.sin(this.t*.03)*20,s=e.createLinearGradient(0,i-a,0,i);s.addColorStop(0,"rgba(20,60,90,0.7)"),s.addColorStop(.6,"rgba(10,40,70,0.9)"),s.addColorStop(1,"rgba(5,25,50,0.95)"),e.fillStyle=s,e.beginPath(),e.moveTo(0,i);for(let n=0;n<=o;n+=20){let r=i-a+Math.sin(n*.02+this.t*.06)*25;e.lineTo(n,r)}e.lineTo(o,i),e.closePath(),e.fill(),e.strokeStyle="rgba(220,240,255,0.6)",e.lineWidth=5,e.beginPath();for(let n=0;n<=o;n+=20){let r=i-a+Math.sin(n*.02+this.t*.06)*25;n===0?e.moveTo(n,r):e.lineTo(n,r)}e.stroke(),e.restore()}_drawVolcano(e,o,i){e.save();let a=o*.5,s=i*.62;e.fillStyle="rgba(20,15,12,0.95)",e.beginPath(),e.moveTo(0,i),e.lineTo(a,s),e.lineTo(o,i),e.closePath(),e.fill();let n=e.createRadialGradient(a,s,4,a,s-120,90);n.addColorStop(0,"rgba(60,55,50,0.95)"),n.addColorStop(.5,"rgba(90,80,70,0.7)"),n.addColorStop(1,"rgba(120,110,100,0)"),e.fillStyle=n,e.beginPath(),e.arc(a,s-60,100+Math.sin(this.t*.05)*20,0,Math.PI*2),e.fill(),e.globalCompositeOperation="screen";for(let r of this.particles)r.x+=r.v,r.y+=r.vy,r.vy+=.15,(r.y>i||r.life--<=0)&&(r.x=this._rand(o*.48,o*.52),r.y=this._rand(i*.58,i*.65),r.vy=this._rand(-6,-1),r.v=this._rand(-2,4),r.life=this._rand(20,80)),e.fillStyle=`rgba(255,${Math.floor(80+Math.random()*80)},30,${r.op})`,e.shadowColor="#ff4500",e.shadowBlur=8,e.beginPath(),e.arc(r.x,r.y,r.r,0,Math.PI*2),e.fill();e.globalCompositeOperation="source-over",e.fillStyle="rgba(80,70,65,0.18)",e.fillRect(0,0,o,i),e.restore()}_drawLandslide(e,o,i){e.save(),e.fillStyle="rgba(90,75,55,";for(let a of this.particles)a.x+=a.v,a.y+=a.vy,(a.x>o+50||a.y>i+50)&&(a.x=this._rand(-100,o),a.y=this._rand(-50,i*.5)),e.globalAlpha=a.op,e.beginPath(),e.arc(a.x,a.y,a.r,0,Math.PI*2),e.fill();e.globalAlpha=.25,e.fillStyle="#5c4a35",e.beginPath(),e.moveTo(0,i*.45),e.lineTo(o,i*.35),e.lineTo(o,i),e.lineTo(0,i),e.closePath(),e.fill(),e.restore()}_drawMudslide(e,o,i){e.save(),e.fillStyle="rgba(75,60,45,";for(let a of this.particles)a.x+=a.v*1.2,a.y+=a.vy*1.2,(a.x>o+50||a.y>i+50)&&(a.x=this._rand(-100,o),a.y=this._rand(-50,i*.5)),e.globalAlpha=a.op,e.beginPath(),e.arc(a.x,a.y,a.r,0,Math.PI*2),e.fill();e.globalAlpha=.35,e.fillStyle="#4a3b2a",e.fillRect(0,i*.5,o,i*.5),e.restore()}_drawAvalanche(e,o,i){e.save(),e.fillStyle="rgba(245,245,255,";for(let a of this.particles)a.x+=a.v,a.y+=a.vy,a.y>i+20&&(a.y=this._rand(-i,0),a.x=this._rand(0,o)),e.globalAlpha=a.op,e.beginPath(),e.arc(a.x,a.y,a.r,0,Math.PI*2),e.fill();e.globalAlpha=.3,e.fillStyle="#e8eef5",e.beginPath(),e.moveTo(0,0),e.lineTo(o,0),e.lineTo(o,i*.55),e.lineTo(0,i*.65),e.closePath(),e.fill(),e.restore()}_drawRockfall(e,o,i){e.save(),e.fillStyle="rgba(90,85,80,";for(let a of this.particles)a.x+=a.v,a.y+=a.vy,a.rot+=a.rotv,a.vy+=.2,a.y>i+20&&(a.y=this._rand(-i*.5,0),a.x=this._rand(-50,o+50),a.vy=this._rand(4,14)),e.globalAlpha=a.op,e.save(),e.translate(a.x,a.y),e.rotate(a.rot),e.fillRect(-a.r,-a.r,a.r*2,a.r*2),e.restore();e.restore()}_drawAcidRain(e,o,i){e.save(),e.globalCompositeOperation="source-over",e.fillStyle="rgba(160,180,60,0.15)",e.fillRect(0,0,o,i);for(let a of this.particles)a.y+=a.v,a.y>i+20&&(a.y=-10,a.x=this._rand(0,o)),e.strokeStyle=`rgba(200,230,80,${a.op})`,e.lineWidth=2,e.lineCap="round",e.beginPath(),e.moveTo(a.x,a.y),e.lineTo(a.x-2,a.y+a.len),e.stroke();e.restore()}_drawFire(e,o,i){e.save(),e.globalCompositeOperation="screen";for(let a of this.particles){a.x+=a.v,a.y+=a.vy,a.vy+=.05,a.life--,(a.life<=0||a.y<i*.3)&&(a.x=this._rand(o*.1,o*.9),a.y=this._rand(i*.7,i),a.vy=this._rand(-3,-.5),a.v=this._rand(-1,1),a.life=this._rand(20,70));let s=a.r*(a.life/70);e.fillStyle=`rgba(255,${Math.floor(100+Math.random()*100)},30,${a.op})`,e.shadowColor="#ff6b00",e.shadowBlur=10,e.beginPath(),e.arc(a.x,a.y,s,0,Math.PI*2),e.fill()}e.globalCompositeOperation="source-over",e.fillStyle="rgba(60,55,50,0.2)",e.fillRect(0,0,o,i),e.restore()}_drawClearDay(e,o,i){e.save(),e.globalCompositeOperation="source-over";for(let a of this.particles){a.x+=a.v,a.y+=a.vy,a.life--,(a.x>o+20||a.y<-20||a.life<=0)&&(a.x=this._rand(-20,o),a.y=this._rand(i*.2,i),a.v=this._rand(.3,.8),a.vy=this._rand(-.12,.12),a.life=this._rand(180,360));let s=.7+.3*Math.sin(this.t*.05+a.x*.01);e.globalAlpha=a.op*s,e.fillStyle="#ffffff",e.beginPath(),e.arc(a.x,a.y,a.r,0,Math.PI*2),e.fill(),e.globalAlpha=1}e.restore()}_drawClearNight(e,o,i){e.save(),e.globalCompositeOperation="screen";for(let a of this.particles){a.x+=a.v,a.y+=a.vy,a.life--;let s=.5+.5*Math.sin(this.t*a.twinkle+a.phase);(a.life<=0||a.y<-10||a.x>o+10)&&(a.x=this._rand(0,o),a.y=this._rand(i*.1,i*.7),a.v=this._rand(.05,.15),a.vy=this._rand(-.05,.05),a.life=this._rand(150,320),a.twinkle=this._rand(.08,.18),a.phase=this._rand(0,Math.PI*2)),e.fillStyle=`rgba(255,245,220,${a.op*s})`,e.beginPath(),e.arc(a.x,a.y,a.r,0,Math.PI*2),e.fill()}if(Math.random()<.012){let a=this._rand(o*.1,o*.9),s=this._rand(0,i*.4),n=this._rand(20,60),r=this._rand(Math.PI*.25,Math.PI*.55);e.strokeStyle="rgba(255,245,220,0.8)",e.lineWidth=1.5,e.beginPath(),e.moveTo(a,s),e.lineTo(a-Math.cos(r)*n,s+Math.sin(r)*n),e.stroke()}e.restore()}},ae=class{constructor(e,o={},i={}){this.canvas=e,this.colors=o,this.location=i.location||ba,this.timeOffsetMs=0,this.forceDay=i.forceDay||!1,this.forceNight=i.forceNight||!1,this.currentKey=null,this.currentParams=null,this.overlayEffect=null;let a=e.parentElement;a&&!a.querySelector("#fx-overlay")&&(this.overlay=new xe(a));try{this.sky=new ft(e,{time:this._now(),location:this.location,weather:v[0],resolutionScale:.55,fps:24,colorSpace:"srgb",celestial:{bortle:6,milkyWay:0,meteors:0}})}catch(s){console.error("Atmosphere initialization failed",s),this.sky=null}}_now(){let e=new Date(Date.now()+this.timeOffsetMs);if(!this.forceDay&&!this.forceNight)return e;let o=new Date(e.getFullYear(),e.getMonth(),e.getDate(),12,0,0),i=new Date(e.getFullYear(),e.getMonth(),e.getDate(),0,0,0);return this.forceDay?o:i}setSunState(e,o){this.sky&&(this.timeOffsetMs=0,this.sky.set({time:this._now()}))}setCondition(e){this.currentKey=e||"clear-day";let o=Sa[this.currentKey]||v[0];this.currentParams=d({},o),this.currentKey.includes("night")&&this.currentParams.isNightAdjusted,this.currentParams.precipitation>0&&!this.currentParams.precipitationType&&(this.currentParams.precipitationType="rain"),this.sky&&this.sky.set({time:this._now(),weather:{cloudCover:this.currentParams.cloudCover,precipitation:this.currentParams.precipitation,precipitationType:this.currentParams.precipitationType,windSpeed:this.currentParams.windSpeed,visibility:this.currentParams.visibility,thunder:this.currentParams.thunder||0,convection:this.currentParams.convection||0}}),this.overlayEffect=this.currentParams.overlay||null,this.overlay&&this.overlay.setEffect(this.overlayEffect)}setWeatherData(e){e=e||{};let o=this.currentParams||{},i=e.cloudCover,a=e.precipitation,s=e.windSpeed,n=e.visibility,r=e.thunder,l=e.precipitationType;this.sky&&this.sky.set({time:this._now(),weather:{cloudCover:i!=null?i:o.cloudCover!=null?o.cloudCover:0,precipitation:a!=null?a:o.precipitation!=null?o.precipitation:0,windSpeed:s!=null?s:o.windSpeed!=null?o.windSpeed:2,visibility:n!=null?n:o.visibility!=null?o.visibility:45,thunder:r!=null?r:o.thunder!=null?o.thunder:0,precipitationType:l!=null?l:o.precipitationType!=null?o.precipitationType:"rain"}})}dispose(){this.sky&&(this.sky.stop&&this.sky.stop(),this.sky.dispose&&this.sky.dispose()),this.overlay&&this.overlay.canvas.remove()}};window.WeatherAtmosphere=ae;var I=37.8991768,D=-122.4949685,A="America/Los_Angeles",Ca=900*1e3;var Ma=typeof location!="undefined"&&location.origin&&location.origin!=="null"?location.origin:"https://dakboard-weather-widget.iamflying29-sketch.deno.net",K=document.documentElement.getAttribute("data-theme")||"day",ge=new URLSearchParams(location.search).get("scene");function k(t){return getComputedStyle(document.documentElement).getPropertyValue(t).trim()}function E(t,e=8e3,o){return P(this,null,function*(){let i=new AbortController,a=setTimeout(()=>i.abort(),e);try{return yield fetch(t,Object.assign({},o,{signal:i.signal}))}finally{clearTimeout(a)}})}function mt(t){let e=parseInt(t.slice(1),16);return[e>>16&255,e>>8&255,e&255]}function Ta([t,e,o]){return"#"+[t,e,o].map(i=>Math.round(Math.max(0,Math.min(255,i))).toString(16).padStart(2,"0")).join("")}function Re(t,e,o){let i=mt(t),a=mt(e);return Ta([i[0]+(a[0]-i[0])*o,i[1]+(a[1]-i[1])*o,i[2]+(a[2]-i[2])*o])}var Aa=[[0,"#7fa8cf","#ffcf9e","#fff6ea"],[.25,"#5b9bda","#bfe0f0","#eef7fa"],[.55,"#4a90d9","#8ec9ee","#eaf6fc"],[1,"#3f86d4","#8ec9ee","#e8f4fb"]],za=[[0,"#140a1e","#3a2210","#0d0800"],[-.15,"#0a0614","#20120a","#050301"],[-.45,"#050308","#0f0803","#000000"],[-1,"#020104","#080402","#000000"]];function La(t){let e=K==="night"?za:Aa,o=K==="night"?-Math.abs(t):Math.abs(t),i=e[0],a=e[e.length-1];for(let r=0;r<e.length-1;r++){let l=e[r],h=e[r+1];if(K==="night"?o<=l[0]&&o>=h[0]:o>=l[0]&&o<=h[0]){i=l,a=h;break}}let s=a[0]-i[0],n=s!==0?(o-i[0])/s:0;return{top:Re(i[1],a[1],Math.max(0,Math.min(1,n))),mid:Re(i[2],a[2],Math.max(0,Math.min(1,n))),bottom:Re(i[3],a[3],Math.max(0,Math.min(1,n)))}}var C=1;function $(t,e){let o=new Date(t.endsWith("Z")?t:t+"Z"),i=new Date(o.toLocaleString("en-US",{timeZone:e})),s=new Date(o.toLocaleString("en-US",{timeZone:"UTC"})).getTime()-i.getTime();return new Date(o.getTime()+s)}function J(t){return/(?:Z|[+-]\d{2}:\d{2})$/.test(t)?new Date(t):$(t,A)}function Ea(t){return t===45||t===48||t>=50&&t<=99}function Pa(t,e){let o=!!e,i=Math.max(0,Math.min(100,Number(t)||0));return i<=12?{key:o?"clear-day":"clear-night",label:"Clear"}:i<=30?{key:o?"mostly-clear-day":"mostly-clear-night",label:"Mostly Clear"}:i<=50?{key:o?"partly-cloudy-day":"partly-cloudy-night",label:"Partly Cloudy"}:i<=80?{key:o?"mostly-cloudy-day":"mostly-cloudy-night",label:"Mostly Cloudy"}:{key:"overcast",label:"Overcast"}}function Fa(t,e){let o=t!=null?Number(t):null,i=e!=null?Number(e):null;return o!=null&&i!=null?Math.max(o,i):o!=null?o:i!=null?i:null}function St(t,e){let o=new Intl.DateTimeFormat("en-US",{timeZone:e,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}).formatToParts(t),i=a=>((o.find(s=>s.type===a)||{}).value||"0").padStart(2,"0");return`${i("year")}-${i("month")}-${i("day")}T${i("hour")}:${i("minute")}:${i("second")}`}function pt(t,e){if(!t||!Array.isArray(t.time))return-1;let o=St(e,A).slice(0,13);return t.time.findIndex(i=>String(i).slice(0,13)===o)}function vt(t,e,o,i,a){if(Ea(t))return wmoInfo(t,e);if(a!=null&&a>0)return a<=.02?{key:"rain-light",label:"Light Rain"}:a<=.1?{key:"rain",label:"Rain"}:{key:"rain-heavy",label:"Heavy Rain"};let s=Fa(o,i);return s!=null?Pa(s,e):wmoInfo(t,e)}function We(t){let e=new Date,o=$(t.sunrise[C],A),i=$(t.sunset[C],A),a;if(e>=o&&e<=i){let r=(e-o)/(i-o);a={frac:r,elevation:Math.sin(Math.PI*r)}}else if(e<o){let r=$(t.sunset[C-1],A),l=Math.max(0,Math.min(1,(e-r)/(o-r)));a={frac:l,elevation:-Math.sin(Math.PI*l)}}else{let r=t.sunrise[C+1]?$(t.sunrise[C+1],A):new Date(i.getTime()+432e5),l=Math.max(0,Math.min(1,(e-i)/(r-i)));a={frac:l,elevation:-Math.sin(Math.PI*l)}}let s=La(a.elevation),n=document.documentElement;return n.style.setProperty("--sky-top",s.top),n.style.setProperty("--sky-mid",s.mid),n.style.setProperty("--sky-bottom",s.bottom),a}function Oe(t){return`${Math.round(t)}\xB0`}function Ia(t){return t==null?{label:"\u2014",color:"var(--fg3)",desc:"Air quality data is unavailable right now."}:t<=50?{label:"Good",color:"var(--good)",desc:"Air quality is good. Enjoy your usual outdoor activities."}:t<=100?{label:"Moderate",color:"var(--warn)",desc:"Air quality is acceptable, though there may be a risk for sensitive groups."}:t<=150?{label:"Unhealthy (SG)",color:"var(--warn)",desc:"Sensitive groups may experience health effects. Others are unlikely to be affected."}:t<=200?{label:"Unhealthy",color:"var(--bad)",desc:"Everyone may begin to experience health effects; sensitive groups more so."}:t<=300?{label:"Very Unhealthy",color:"var(--bad)",desc:"Health alert: everyone may experience more serious health effects."}:{label:"Hazardous",color:"var(--bad)",desc:"Health warning of emergency conditions. Everyone is at risk."}}function Da(t){return["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"][Math.round(t/22.5)%16]}function xa(t,e){return`<svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="44" fill="none" stroke="${e}" stroke-width="4" opacity="0.35"/>
    <text x="50" y="16" text-anchor="middle" font-size="14" font-weight="700" fill="${e}" opacity="0.6">N</text>
    <g class="needle" style="transform: rotate(${t}deg)">
      <path d="M50 18 L58 54 L50 46 L42 54 Z" fill="${e}"/>
    </g>
  </svg>`}function Ra(t,e){let i=new Date(t).getHours(),a=i>=12?"PM":"AM";return i=i%12,i===0&&(i=12),e?`${i}${a}`:"NOW"}function Oa(t,e){if(!e)return"NOW";let o=new Date(t),i=o.getHours(),a=o.getMinutes().toString().padStart(2,"0"),s=i>=12?"PM":"AM";return i=i%12,i===0&&(i=12),`${i}:${a}`}function Na(t,e){return e===0?"Today":new Date(t+"T00:00:00").toLocaleDateString("en-US",{weekday:"short"})}function Ba(){return P(this,null,function*(){let e=`https://api.open-meteo.com/v1/gfs?${`latitude=${I}&longitude=${D}&models=ncep_nbm_conus&cell_selection=land`}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,precipitation&minutely_15=temperature_2m,weather_code,precipitation,precipitation_probability,is_day,cloud_cover&hourly=temperature_2m,weather_code,precipitation,precipitation_probability,visibility,is_day,cloud_cover&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=${encodeURIComponent(A)}&forecast_days=7&past_days=1`,o=`${Ma}/aqi?lat=${I}&lon=${D}`,i=`https://api.open-meteo.com/v1/forecast?latitude=${I}&longitude=${D}&current=uv_index&timezone=${encodeURIComponent(A)}&cell_selection=land`,a=St(new Date,A).slice(0,10),s=new Date(`${a}T12:00:00Z`);s.setUTCDate(s.getUTCDate()+6);let n=s.toISOString().slice(0,10),r=`https://api.sunrise-sunset.org/v2?lat=${I}&lng=${D}&date_start=${a}&date_end=${n}&tz=${encodeURIComponent(A)}&time_format=iso8601`,[l,h,u,c,g]=yield Promise.all([E(e).then(m=>{if(!m.ok)throw new Error(`Weather API error: ${m.status}`);return m.json()}),E(o).then(m=>m.ok?m.json():null).catch(()=>null),E(i).then(m=>m.ok?m.json():null).catch(()=>null),E(r).then(m=>m.ok?m.json():null).catch(()=>null),Ka()]),b=c&&c.tzid===A&&Array.isArray(c.days)?c.days:null;return{weather:l,aq:h,uv:u&&u.current?u.current.uv_index:null,solarDays:b,skyCoverIntervals:g}})}var oe=null,Ue=null,He=null,Wa=`https://api.weather.gov/alerts/active?status=actual&point=${I},${D}`,Ua=`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${I}&longitude=${D}&maxradiuskm=200&minmagnitude=4.0&starttime=`,Ha="https://noaa-storm-proxy.iamflying29-sketch.deno.net",$a="https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json",qa="https://services.swpc.noaa.gov/json/ovation_aurora_latest.json",Ga="https://api.nasa.gov/neo/rest/v1/feed",Za="DEMO_KEY",ja="https://api.weather.gov/gridpoints/MTR/83,111";function Va(t){let e=/^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?/.exec(t||"");if(!e)return 0;let o=parseInt(e[1]||"0",10),i=parseInt(e[2]||"0",10),a=parseInt(e[3]||"0",10);return((o*24+i)*60+a)*60*1e3}function Ya(t){return!t||!Array.isArray(t.values)?[]:t.values.map(e=>{let[o,i]=e.validTime.split("/"),a=new Date(o),s=new Date(a.getTime()+Va(i));return{start:a,end:s,value:e.value}})}function Ka(){return P(this,null,function*(){try{let t=yield E(ja);if(!t.ok)return null;let e=yield t.json();return Ya(e.properties&&e.properties.skyCover)}catch(t){return console.warn("NWS gridpoint skyCover fetch failed",t),null}})}function yt(t,e){if(!t||!t.length)return null;for(let o of t)if(e>=o.start&&e<o.end)return o.value;return null}function gt(t,e,o){if(!t||!t.length||!e||!o)return null;let i=J(e),a=J(o),s=0,n=0;for(let r of t){if(r.value==null)continue;let l=Math.max(r.start.getTime(),i.getTime()),h=Math.min(r.end.getTime(),a.getTime()),u=Math.max(0,h-l);s+=Number(r.value)*u,n+=u}return n>0?s/n:null}function wt(t,e,o){if(!t||!t.time||!e||!o)return null;let i=J(e),a=J(o),s=new Map;for(let r=0;r<t.time.length;r++){let l=$(t.time[r],A);if(l<i||l>a)continue;let h=t.weather_code[r];s.set(h,(s.get(h)||0)+1)}if(!s.size)return null;let n=null;for(let[r,l]of s)(!n||l>n.n||l===n.n&&r>n.code)&&(n={code:r,n:l});return n.code}var Ja=[{re:/tornado warning/i,key:"tornado",label:"Tornado Warning",severity:5},{re:/tsunami warning/i,key:"tsunami",label:"Tsunami Warning",severity:5},{re:/hurricane warning|typhoon warning|hurricane force wind warning/i,key:"hurricane",label:"Hurricane Warning",severity:4},{re:/tropical storm warning/i,key:"tropical-storm",label:"Tropical Storm Warning",severity:4},{re:/flash flood warning/i,key:"flash-flood",label:"Flash Flood Warning",severity:4},{re:/severe thunderstorm warning/i,key:"thunderstorm-hail",label:"Severe Thunderstorm Warning",severity:3},{re:/tornado watch|severe thunderstorm watch/i,key:"thunderstorm",label:"Severe Weather Watch",severity:2},{re:/fire warning/i,key:"forest-fire",label:"Fire Warning",severity:4},{re:/extreme fire danger|fire weather watch|red flag warning/i,key:"wildfire-smoke",label:"Fire Weather Warning",severity:3},{re:/dust storm warning|blowing dust warning/i,key:"dust-storm",label:"Dust Storm Warning",severity:3},{re:/dust advisory|blowing dust advisory/i,key:"dust-storm",label:"Blowing Dust Advisory",severity:2},{re:/blizzard warning|winter storm warning/i,key:"blizzard",label:"Winter Storm Warning",severity:3},{re:/ice storm warning/i,key:"ice-storm",label:"Ice Storm Warning",severity:3},{re:/volcano warning/i,key:"volcanic-eruption",label:"Volcano Warning",severity:4},{re:/ashfall warning/i,key:"volcanic-ash",label:"Ashfall Warning",severity:3},{re:/ashfall advisory/i,key:"ash",label:"Ashfall Advisory",severity:2},{re:/avalanche warning/i,key:"avalanche",label:"Avalanche Warning",severity:3},{re:/avalanche watch|avalanche advisory/i,key:"avalanche",label:"Avalanche Advisory",severity:2},{re:/snow squall warning/i,key:"squall",label:"Snow Squall Warning",severity:2},{re:/earthquake warning/i,key:"earthquake",label:"Earthquake Warning",severity:4},{re:/dense smoke advisory/i,key:"smoke",label:"Dense Smoke Advisory",severity:2},{re:/air quality alert/i,key:"smog",label:"Air Quality Alert",severity:1},{re:/special marine warning/i,key:"waterspout",label:"Special Marine Warning",severity:2}];function Qa(t){return{Extreme:4,Severe:3,Moderate:2,Minor:1,Unknown:0}[t]||0}function Xa(){return P(this,null,function*(){try{let t=yield E(Wa);if(!t.ok)return[];let e=yield t.json();return Array.isArray(e.features)?e.features:[]}catch(t){return console.warn("NWS alerts fetch failed",t),[]}})}function eo(){return P(this,null,function*(){try{let t=new Date(Date.now()-864e5).toISOString(),e=yield E(Ua+encodeURIComponent(t));if(!e.ok)return null;let o=yield e.json();if(!o.features||!o.features.length)return null;let i=o.features[0];return{magnitude:i.properties.mag,place:i.properties.place,time:i.properties.time}}catch(t){return console.warn("USGS earthquake fetch failed",t),null}})}function to(){return P(this,null,function*(){try{let t=yield E(`${Ha}?v=1`);return t.ok?yield t.json():null}catch(t){return console.warn("NOAA/NHC storm fetch failed",t),null}})}function ao(){return P(this,null,function*(){try{let[t,e]=yield Promise.all([E($a).then(a=>a.ok?a.json():null).catch(()=>null),E(qa).then(a=>a.ok?a.json():null).catch(()=>null)]),o=null;if(Array.isArray(t)&&t.length){let a=t[t.length-1];o=a&&a.Kp!=null?Number(a.Kp):null}let i=null;if(e&&Array.isArray(e.coordinates)){let a=(360+D)%360,s=null;for(let n of e.coordinates){let r=Math.abs(n[0]-a)+Math.abs(n[1]-I);(!s||r<s.dist)&&(s={val:n[2],dist:r})}i=s?s.val:null}return o==null&&i==null?null:{kp:o,ovationValue:i}}catch(t){return console.warn("Aurora data fetch failed",t),null}})}function oo(){return P(this,null,function*(){let t="neoCloseApproachCacheV1",e=new Date().toISOString().slice(0,10),o=null;try{o=JSON.parse(localStorage.getItem(t)||"null")}catch(i){o=null}if(o&&o.date===e)return o.result;try{let i=`${Ga}?start_date=${e}&end_date=${e}&api_key=${Za}`,a=yield E(i);if(!a.ok)return o?o.result:null;let s=yield a.json(),n=null,r=s.near_earth_objects||{};for(let l of Object.keys(r))for(let h of r[l]){let u=h.estimated_diameter&&h.estimated_diameter.meters?h.estimated_diameter.meters.estimated_diameter_max:0;for(let c of h.close_approach_data||[]){let g=c.miss_distance?Number(c.miss_distance.kilometers):NaN;u>=100&&g&&g<=384400&&(n={name:(h.name||"").replace(/[()]/g,""),diameter:Math.round(u),distKm:Math.round(g)})}}try{localStorage.setItem(t,JSON.stringify({date:e,result:n}))}catch(l){}return n}catch(i){return console.warn("NASA NEO fetch failed",i),o?o.result:null}})}function io(t,e,o){let i=null;for(let a of t){let s=a.properties.event||"",n=Qa(a.properties.severity);for(let r of Ja)if(r.re.test(s)){let l=r.severity*10+n;(!i||l>i.score)&&(i=w(d({},r),{score:l}))}}return i?{key:i.key,label:i.label,source:"NWS"}:e?{key:"earthquake",label:`Earthquake M${e.magnitude}`,source:"USGS"}:null}var so=[{penumbral:["2026-03-03T08:44:00Z","2026-03-03T14:23:00Z"],umbral:["2026-03-03T09:50:00Z","2026-03-03T13:17:00Z"],total:["2026-03-03T11:04:00Z","2026-03-03T12:03:00Z"]},{penumbral:["2026-08-28T01:23:00Z","2026-08-28T07:02:00Z"],umbral:["2026-08-28T02:33:00Z","2026-08-28T05:52:00Z"],bloodAtMax:!0,maxWindow:["2026-08-28T03:43:00Z","2026-08-28T04:43:00Z"]},{penumbral:["2028-01-12T02:00:00Z","2028-01-12T06:30:00Z"],umbral:["2028-01-12T03:46:00Z","2028-01-12T04:42:00Z"]},{penumbral:["2028-12-31T14:20:00Z","2028-12-31T19:25:00Z"],umbral:["2028-12-31T15:05:00Z","2028-12-31T18:40:00Z"],total:["2028-12-31T16:17:00Z","2028-12-31T17:29:00Z"]},{penumbral:["2029-06-26T00:50:00Z","2029-06-26T05:55:00Z"],umbral:["2029-06-26T01:33:00Z","2029-06-26T05:13:00Z"],total:["2029-06-26T02:32:00Z","2029-06-26T04:14:00Z"]},{penumbral:["2029-12-20T19:30:00Z","2029-12-21T01:55:00Z"],umbral:["2029-12-20T20:45:00Z","2029-12-21T00:40:00Z"],total:["2029-12-20T21:53:00Z","2029-12-20T23:32:00Z"]}],no="https://www.cyclecalcs.com/v2/eclipses",bt="solarEclipseScheduleCacheV1",ro=720*3600*1e3;function lo(){return P(this,null,function*(){let t=null;try{t=JSON.parse(localStorage.getItem(bt)||"null")}catch(e){t=null}if(t&&Date.now()-t.fetchedAt<ro)return t.eclipses;try{let e=new Date().toISOString().slice(0,10),o=new Date(Date.now()+3650*864e5).toISOString().slice(0,10),i=`${no}?direction=range&start=${e}&end=${o}&type=solar&visible_only=true&lat=${I}&lon=${D}&include=local,contacts`,a=yield E(i,8e3);if(!a.ok)return t?t.eclipses:null;let s=yield a.json(),r=(s.data&&s.data.eclipses||[]).filter(l=>l.local&&l.local.visible&&Array.isArray(l.local.contacts)).map(l=>{let h=l.local.contacts.find(c=>c.kind==="first_contact"),u=l.local.contacts.find(c=>c.kind==="fourth_contact");return h&&u?{window:[h.instant,u.instant]}:null}).filter(Boolean);try{localStorage.setItem(bt,JSON.stringify({fetchedAt:Date.now(),eclipses:r}))}catch(l){}return r}catch(e){return console.warn("Solar eclipse schedule fetch failed",e),t?t.eclipses:null}})}var ho="https://www.cyclecalcs.com/v2/eclipses",kt="lunarEclipseScheduleCacheV1",uo=720*3600*1e3,co=.9;function fo(t){let e={};for(let a of t.contacts_utc||[])e[a.kind]=a.instant;let o=[],i=(t.umbral_obscuration_fraction||0)>=co;return e.total_begin&&e.total_end&&o.push({window:[e.total_begin,e.total_end],key:"blood-moon",label:"Blood Moon (Total Lunar Eclipse)"}),e.partial_begin&&e.partial_end&&o.push(i?{window:[e.partial_begin,e.partial_end],key:"blood-moon",label:"Blood Moon (Lunar Eclipse)"}:{window:[e.partial_begin,e.partial_end],key:"eclipse-lunar",label:"Partial Lunar Eclipse"}),e.penumbral_begin&&e.penumbral_end&&o.push({window:[e.penumbral_begin,e.penumbral_end],key:"eclipse-lunar",label:"Lunar Eclipse"}),o}function mo(){return P(this,null,function*(){let t=null;try{t=JSON.parse(localStorage.getItem(kt)||"null")}catch(e){t=null}if(t&&Date.now()-t.fetchedAt<uo)return t.windows;try{let e=new Date().toISOString().slice(0,10),o=new Date(Date.now()+3650*864e5).toISOString().slice(0,10),i=`${ho}?direction=range&start=${e}&end=${o}&type=lunar&visible_only=true&lat=${I}&lon=${D}&include=local,contacts`,a=yield E(i,8e3);if(!a.ok)return t?t.windows:null;let s=yield a.json(),r=(s.data&&s.data.eclipses||[]).filter(l=>l.local&&l.local.visible).map(fo).reduce((l,h)=>l.concat(h),[]);try{localStorage.setItem(kt,JSON.stringify({fetchedAt:Date.now(),windows:r}))}catch(l){}return r}catch(e){return console.warn("Lunar eclipse schedule fetch failed",e),t?t.windows:null}})}var Ct=[{window:["2029-01-14T15:10:00Z","2029-01-14T17:44:00Z"]},{window:["2031-11-14T21:09:00Z","2031-11-14T21:36:00Z"]},{window:["2033-03-30T16:23:00Z","2033-03-30T18:26:00Z"]},{window:["2035-09-02T02:23:00Z","2035-09-02T03:25:00Z"]},{window:["2039-06-21T14:45:00Z","2039-06-21T16:49:00Z"]},{window:["2040-11-04T17:50:00Z","2040-11-04T18:39:00Z"]},{window:["2043-04-09T18:00:00Z","2043-04-09T19:28:00Z"]},{window:["2044-08-23T01:06:00Z","2044-08-23T02:57:00Z"]},{window:["2045-02-17T01:29:00Z","2045-02-17T02:22:00Z"]},{window:["2045-08-12T15:12:00Z","2045-08-12T17:28:00Z"]},{window:["2046-02-05T23:36:00Z","2046-02-06T02:06:00Z"]}];function po(t){if(t&&t.length)return;let e=Ct.map(o=>new Date(o.window[1]).getTime()).reduce((o,i)=>Math.max(o,i),0);Date.now()>e-365*24*3600*1e3&&console.warn("The live solar eclipse API (cyclecalcs.com) has not been reachable, and SOLAR_ECLIPSES_FALLBACK only extends through "+new Date(e).toISOString().slice(0,10)+" -- fewer than a year of known solar eclipses remain in the fallback table. Extend SOLAR_ECLIPSES_FALLBACK (cyclecalcs.com/v2/eclipses, cross-checked against timeanddate.com/eclipse) or restore network access. Lunar eclipse/ Blood Moon automation is unaffected -- it has its own algorithmic infinite-horizon failsafe that needs no network or table at all.")}function V(t,e){return t>=new Date(e[0])&&t<=new Date(e[1])}var vo=27.212220817,yo=2.993360549207802;function go(t){let e=vo/2,o=(qe(t)-yo)%e;return o<0&&(o+=e),Math.min(o,e-o)}function wo(t){let o=Ge(t)-L/2;if(o>L/2&&(o-=L),o<-L/2&&(o+=L),Math.abs(o)>1)return null;let i=go(t);return i>1.3?null:i<=.9?"total":"partial"}function bo(t,e,o,i){if(e<=0)if(i&&i.length){for(let a of i)if(V(t,a.window))return{key:a.key,label:a.label,source:"cyclecalcs.com"}}else{let a=null;for(let n of so)if(n.total&&V(t,n.total)?a={key:"blood-moon",label:"Blood Moon (Total Lunar Eclipse)",source:"NASA"}:n.bloodAtMax&&n.maxWindow&&V(t,n.maxWindow)?a={key:"blood-moon",label:"Blood Moon (Lunar Eclipse)",source:"NASA"}:n.umbral&&V(t,n.umbral)?a={key:"eclipse-lunar",label:"Partial Lunar Eclipse",source:"NASA"}:n.penumbral&&V(t,n.penumbral)&&(a={key:"eclipse-lunar",label:"Lunar Eclipse",source:"NASA"}),a)return a;let s=wo(t);if(s==="total")return{key:"blood-moon",label:"Blood Moon (Lunar Eclipse)",source:"computed"};if(s==="partial")return{key:"eclipse-lunar",label:"Lunar Eclipse",source:"computed"}}if(e>-.1){let a=o&&o.length?o:Ct;for(let s of a)if(V(t,s.window))return{key:"eclipse",label:"Solar Eclipse",source:o&&o.length?"cyclecalcs.com":"fallback table"}}return null}function ko(t,e){return!t||t.kp==null||t.ovationValue==null||e>-.15?null:t.kp>=7&&t.ovationValue>=10?{key:"aurora",label:"Aurora Borealis"}:null}var _o=[{name:"Quadrantid",raHours:15.33,decDeg:49.7,peakMonth:1,peakDay:3,windowDays:1},{name:"Lyrid",raHours:18.13,decDeg:33.3,peakMonth:4,peakDay:22,windowDays:1},{name:"Perseid",raHours:3.28,decDeg:58.1,peakMonth:8,peakDay:12,windowDays:1},{name:"Orionid",raHours:6.42,decDeg:15.8,peakMonth:10,peakDay:21,windowDays:2},{name:"Leonid",raHours:10.27,decDeg:21.8,peakMonth:11,peakDay:17,windowDays:1},{name:"Geminid",raHours:7.55,decDeg:32.4,peakMonth:12,peakDay:13,windowDays:1},{name:"Ursid",raHours:14.63,decDeg:75.3,peakMonth:12,peakDay:22,windowDays:1}];function So(t,e){return((((280.46061837+360.98564736629*(t.getTime()/864e5+24405875e-1-2451545))%360+360)%360+e)%360+360)%360}function Co(t,e,o,i,a){let n=So(o,a)-t*15;n=((n+180)%360+360)%360-180;let r=n*Math.PI/180,l=e*Math.PI/180,h=i*Math.PI/180,u=Math.sin(l)*Math.sin(h)+Math.cos(l)*Math.cos(h)*Math.cos(r);return Math.asin(Math.max(-1,Math.min(1,u)))*180/Math.PI}var L=29.530588861,Mo=24515501e-1;function qe(t){return t.getTime()/864e5+24405875e-1}function Ge(t){let e=(qe(t)-Mo)%L;return e<0&&(e+=L),e}function To(t){return(1-Math.cos(2*Math.PI*Ge(t)/L))/2}function Ao(t,e,o,i){let a=t.getUTCFullYear();for(let s of[a-1,a,a+1]){let n=Date.UTC(s,e-1,o,12,0,0);if(Math.abs(t.getTime()-n)<=i*864e5)return!0}return!1}function zo(t,e){if(e>-.15||To(t)>.65)return null;for(let o of _o)if(Ao(t,o.peakMonth,o.peakDay,o.windowDays)&&Co(o.raHours,o.decDeg,t,I,D)>=15)return{key:"meteor-shower",label:`${o.name} Meteor Shower`};return null}var Lo=[{name:"Wolf Moon",peak:"2026-01-03T10:03:00Z"},{name:"Beaver Moon",peak:"2026-11-24T14:53:00Z"},{name:"Cold Moon",peak:"2026-12-24T01:28:00Z"},{name:"Supermoon",peak:"2027-01-22T12:17:00Z"},{name:"Supermoon",peak:"2028-01-12T04:02:00Z"},{name:"Supermoon",peak:"2028-02-10T15:03:00Z"},{name:"Supermoon",peak:"2028-03-11T01:05:00Z"},{name:"Supermoon",peak:"2029-02-28T17:10:00Z"},{name:"Supermoon",peak:"2029-03-30T02:26:00Z"},{name:"Supermoon",peak:"2029-04-28T10:36:00Z"}],Eo=20,Ne=27.554549878,Po=2457707974e-3;function Fo(t){let e=(qe(t)-Po)%Ne;return e<0&&(e+=Ne),Math.min(e,Ne-e)}function Io(t){let o=Ge(t)-L/2;return o>L/2&&(o-=L),o<-L/2&&(o+=L),Math.abs(o)>1?!1:Fo(t)<=2.5}function Do(t,e){if(e>-.05)return null;for(let o of Lo)if(Math.abs(t.getTime()-new Date(o.peak).getTime())<=Eo*3600*1e3)return{key:"supermoon",label:`Supermoon (${o.name})`};return Io(t)?{key:"supermoon",label:"Supermoon"}:null}function xo(t,e){return!t||e>-.05?null:{key:"close-approach",label:`Close Approach: ${t.name}`}}function Ro(t,e){if(!t||!t.is_day||e<=.02||e>=.7)return null;let o=Number(t.precipitation)||0,i=t.cloud_cover!=null?Number(t.cloud_cover):null;return o>0&&o<4&&i!=null&&i<85?{key:"rainbow",label:"Rainbow"}:null}function Oo(t,e){let{weather:o,aq:i,uv:a,solarDays:s,alerts:n,quake:r,noaaStorms:l,skyCoverIntervals:h,aurora:u,neo:c,solarSchedule:g,lunarSchedule:b}=t,m=o.current,_=o.hourly,O=o.minutely_15,S=o.daily,Q=f=>s&&s.find(p=>p.date===f),x=f=>(Q(S.time[f])||{}).sunrise||S.sunrise[f],R=f=>(Q(S.time[f])||{}).sunset||S.sunset[f];oe=S;let F=We(S);e&&e.setSunState(F.frac,F.elevation);let Mt=gt(h,x(C),R(C)),Ze=wt(_,x(C),R(C)),se=vt(Ze!=null?Ze:S.weather_code[C],!0,Mt,null),Bo=yt(h,new Date),ne=pt(_,new Date),Wo=ne>=0?_.weather_code[ne]:m.weather_code,Uo=ne>=0?_.cloud_cover[ne]:m.cloud_cover,q=se,N=ge||se.key;ge&&(q={key:N,label:labelForKey(N)});let we=ge?null:io(n||[],r,l);if(we)q={key:we.key,label:we.label},N=q.key;else if(!ge){let f=new Date,p=bo(f,F.elevation,g,b)||ko(u,F.elevation)||zo(f,F.elevation)||Do(f,F.elevation)||xo(c,F.elevation)||Ro(m,F.elevation);p&&(q={key:p.key,label:p.label},N=q.key)}let be={theme:K,"--sun-core":k("--sun-core"),"--moon-core":k("--moon-core"),"--cloud":k("--cloud"),"--cloud2":k("--cloud2"),"--rain":k("--rain"),"--snow":k("--snow"),"--fog":k("--fog"),"--bolt":k("--bolt"),"--fg":k("--fg")};document.getElementById("nowIcon").innerHTML=iconSvgFor(N,be),document.getElementById("nowTemp").textContent=Oe(m.temperature_2m),document.getElementById("nowCond").textContent=q.label,document.getElementById("nowSub").textContent=`Feels like ${Oe(m.apparent_temperature)}`,document.getElementById("hilo").textContent=`H:${Math.round(S.temperature_2m_max[C])}\xB0  L:${Math.round(S.temperature_2m_min[C])}\xB0`,Ue=N,He=null,e&&e.setCondition(N);let je=O&&O.time&&O.time.length>0,T=je?O:_,Tt=o.current.time.slice(0,16),ke=T.time.findIndex(f=>f>=Tt);ke<0&&(ke=0);let Ve=document.getElementById("hourly");Ve.innerHTML="";for(let f=0;f<12;f++){let p=ke+f;if(p>=T.time.length)break;let B;if(f===0)B=se;else{let Se=T.is_day?!!T.is_day[p]:!0,Ce=T.cloud_cover?T.cloud_cover[p]:null,he=T.precipitation?T.precipitation[p]:null,ee=yt(h,$(T.time[p],A));B=vt(T.weather_code[p],Se,ee,Ce,he)}let W=T.precipitation_probability?T.precipitation_probability[p]:null,Z=document.createElement("div");Z.className="ww-hour",Z.innerHTML=`
      <div class="hh">${je?Oa(T.time[p],f):Ra(T.time[p],f)}</div>
      ${iconSvgFor(B.key,be)}
      <div class="ht">${Math.round(T.temperature_2m[p])}\xB0</div>
      <div class="hp">${W!=null&&W>=15?W+"%":""}</div>
    `,Ve.appendChild(Z)}let Ye=document.getElementById("daily");Ye.innerHTML="";let Ke=Math.min(...S.temperature_2m_min.slice(C,C+5)),At=Math.max(...S.temperature_2m_max.slice(C,C+5)),Je=Math.max(1,At-Ke);for(let f=0;f<5;f++){let p=C+f,B;if(f===0)B=se;else{let Dt=gt(h,x(p),R(p)),ot=wt(_,x(p),R(p));B=wmoInfo(ot!=null?ot:S.weather_code[p],!0,Dt)}let W=S.temperature_2m_min[p],Z=S.temperature_2m_max[p],Se=(W-Ke)/Je*100,Ce=(Z-W)/Je*100,he=S.precipitation_probability_max[p],ee=document.createElement("div");ee.className="ww-day-row",ee.innerHTML=`
      <div class="dn">${Na(S.time[p],f)}</div>
      ${iconSvgFor(B.key,be)}
      <div class="ww-bar"><span style="left:${Se}%;width:${Ce}%"></span></div>
      <div class="dp">${he>=15?he+"%":""}</div>
      <div class="dlo">${Math.round(W)}\xB0</div>
      <div class="dhi">${Math.round(Z)}\xB0</div>
    `,Ye.appendChild(ee)}let X=i&&typeof i.aqi=="number"?i.aqi:null,_e=Ia(X);document.getElementById("aqiVal").textContent=X!=null?Math.round(X):"\u2014",document.getElementById("aqiVal").style.color=_e.color,document.getElementById("aqiCat").textContent=_e.label;let zt=i&&i.provider?i.provider:"AirNow",Lt=i&&i.location?`${zt}: ${i.location}. `:"";document.getElementById("aqiDesc").textContent=Lt+_e.desc;let Et=X!=null?Math.min(100,X/300*100):0;document.getElementById("aqiMarker").style.left=`${Et}%`;let Pt=J(x(C)),Ft=J(R(C)),Qe=f=>f.toLocaleTimeString("en-US",{timeZone:A,hour:"numeric",minute:"2-digit"}),Xe=pt(_,new Date),re=Xe>=0&&_.visibility?_.visibility[Xe]:null,et=o.hourly_units&&o.hourly_units.visibility,tt=re==null?null:et==="ft"?(re/5280).toFixed(1):et==="km"?(re/1.609344).toFixed(1):(re/1609.344).toFixed(1),le=Number.isFinite(a)?Math.round(a*10)/10:null,G=k("--fg"),It=[{icon:WI.uv(G),label:"UV Index",value:le!=null?le:"\u2014",sub:le!=null?No(le):""},{icon:WI.sunrise(G),label:"Sunrise",value:Qe(Pt),sub:`Sunset ${Qe(Ft)}`},{icon:"",label:"Wind",value:`${Math.round(m.wind_speed_10m)} mph`,sub:Da(m.wind_direction_10m),compass:m.wind_direction_10m},{icon:WI.drop(G),label:"Humidity",value:`${Math.round(m.relative_humidity_2m)}%`,sub:""},{icon:WI.eye(G),label:"Visibility",value:tt!=null?`${tt} mi`:"\u2014",sub:""},{icon:WI.thermo(G),label:"Feels Like",value:Oe(m.apparent_temperature),sub:""}],at=document.getElementById("grid");at.innerHTML="";for(let f of It){let p=document.createElement("div");p.className="ww-card",f.compass!==void 0?p.innerHTML=`<div class="cl">${f.label}</div><div class="ww-compass">${xa(f.compass,G)}</div><div class="cv" style="font-size:16px">${f.value}</div><div class="cs">${f.sub}</div>`:p.innerHTML=`<div class="cl">${f.icon}${f.label}</div><div class="cv">${f.value}</div><div class="cs">${f.sub}</div>`,at.appendChild(p)}}function No(t){return t<3?"Low":t<6?"Moderate":t<8?"High":t<11?"Very High":"Extreme"}var ie=null;window.fxEngine=null;var Be=!1,Y=null;function $e(){return P(this,null,function*(){if(!Be){Be=!0;try{let[t,e,o,i,a,s,n,r]=yield Promise.all([Ba(),Xa(),eo(),to(),ao(),oo(),lo(),mo()]);po(n),Oo(w(d({},t),{alerts:e,quake:o,noaaStorms:i,aurora:a,neo:s,solarSchedule:n,lunarSchedule:r}),ie),Y&&(clearTimeout(Y),Y=null)}catch(t){console.error("Weather fetch failed",t);let e=document.getElementById("nowCond");e&&e.textContent==="Loading\u2026"&&(e.textContent="Weather temporarily unavailable"),Y||(Y=setTimeout(()=>{Y=null,$e()},60*1e3))}finally{Be=!1}}})}function _t(){$e(),setInterval($e,Ca),setInterval(()=>{if(oe){let t=We(oe);ie&&ie.setSunState(t.frac,t.elevation)}},60*1e3),setTimeout(()=>{try{let t=document.getElementById("fx"),e=new ae(t,{sunCore:k("--sun-core"),sunGlow:k("--sun-glow"),moonCore:k("--moon-core"),moonGlow:k("--moon-glow"),cloud:k("--cloud"),cloud2:k("--cloud2"),rain:k("--rain"),snow:k("--snow"),fog:k("--fog"),bolt:k("--bolt")},{forceDay:K==="day",forceNight:K==="night"});if(ie=e,window.fxEngine=e,oe){let o=We(oe);e.setSunState(o.frac,o.elevation)}Ue&&(e.setCondition(Ue),He!=null&&e.setWeatherData({cloudCover:He/100}))}catch(t){console.error("Atmosphere engine failed to start; continuing without it",t),ie=null,window.fxEngine=null}},0)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",_t):_t();})();
