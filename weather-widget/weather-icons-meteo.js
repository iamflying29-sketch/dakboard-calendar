const METEO_PATH="./meteo_",KEY_TO_ICON={"clear-day":"clear-day","clear-night":"clear-night","mostly-clear-day":"partly-cloudy-day","mostly-clear-night":"partly-cloudy-night","partly-cloudy-day":"partly-cloudy-day","partly-cloudy-night":"partly-cloudy-night","mostly-cloudy-day":"cloudy","mostly-cloudy-night":"cloudy",overcast:"overcast",fog:"fog",drizzle:"drizzle",rain:"rain","rain-heavy":"rain","freezing-rain":"sleet",snow:"snow","snow-heavy":"snow","snow-grains":"snowflake","drizzle-light":"drizzle","drizzle-heavy":"drizzle","rain-light":"rain","snow-light":"snow","rain-showers-light":"rain","rain-showers-heavy":"rain","snow-showers-light":"snow","rain-showers":"rain","snow-showers":"snow",thunderstorm:"thunderstorms","thunderstorm-hail":"hail","thunderstorm-hail-heavy":"hail"};function extremeSvg(c){return`<svg class="weather-icon" viewBox="0 0 100 100" style="filter:drop-shadow(0 3px 4px rgba(0,0,0,0.12))">${c}</svg>`}const MOSTLY_CLEAR_ICONS={"mostly-clear-day":`<svg class="weather-icon" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="Sun">
      <circle cx="68" cy="52" r="23" fill="url(#mcd-sun)" stroke="#F8AF18"/>
      <g stroke="#F8AF18" stroke-width="6" stroke-linecap="round">
        <path d="M68 8V18"/><path d="M68 86V96"/>
        <path d="M24 52H14"/><path d="M112 52H122"/>
        <path d="M37.5 21.5L30.5 14.5"/><path d="M105.5 89.5L98.5 82.5"/>
        <path d="M98.5 21.5L105.5 14.5"/><path d="M30.5 89.5L37.5 82.5"/>
      </g>
    </g>
    <path d="M22 88c-4.5 0-8-3.6-8-8s3.5-8 8-8c1.4 0 2.7.4 3.9 1 2-4.3 6.3-7.3 11.4-7.3 6.4 0 11.7 4.6 12.6 10.7 3.2-.6 6.4 1.7 6.4 5.1 0 3.1-2.5 5.6-5.6 5.6H22z" fill="url(#mcd-cloud)" stroke="#E6EFFC" stroke-width="1.2"/>
    <defs>
      <linearGradient id="mcd-sun" x1="68" y1="29" x2="68" y2="75" gradientUnits="userSpaceOnUse"><stop stop-color="#FBBF24"/><stop offset="1" stop-color="#F8AF18"/></linearGradient>
      <linearGradient id="mcd-cloud" x1="35" y1="65" x2="35" y2="88" gradientUnits="userSpaceOnUse"><stop stop-color="#F3F7FE"/><stop offset="1" stop-color="#E6EFFC"/></linearGradient>
    </defs>
  </svg>`,"mostly-clear-night":`<svg class="weather-icon" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M56 12c-16 3-28 17-28 34 0 19 15.5 34.5 34.5 34.5 13 0 24.3-7.2 30.1-17.9C71.7 66 55 49.2 55 28.6 55 22.7 56 17.1 56 12z" fill="url(#mcn-moon)" stroke="#72B9D5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M22 96c-4.5 0-8-3.6-8-8s3.5-8 8-8c1.4 0 2.7.4 3.9 1 2-4.3 6.3-7.3 11.4-7.3 6.4 0 11.7 4.6 12.6 10.7 3.2-.6 6.4 1.7 6.4 5.1 0 3.1-2.5 5.6-5.6 5.6H22z" fill="url(#mcn-cloud)" stroke="#E6EFFC" stroke-width="1.2"/>
    <defs>
      <linearGradient id="mcn-moon" x1="58" y1="12" x2="58" y2="81" gradientUnits="userSpaceOnUse"><stop stop-color="#86C3DB"/><stop offset="1" stop-color="#72B9D5"/></linearGradient>
      <linearGradient id="mcn-cloud" x1="35" y1="73" x2="35" y2="96" gradientUnits="userSpaceOnUse"><stop stop-color="#F3F7FE"/><stop offset="1" stop-color="#E6EFFC"/></linearGradient>
    </defs>
  </svg>`},EXTREME_ICONS={tornado:extremeSvg(`
    <defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#475569"/><stop offset="100%" stop-color="#1e293b"/></linearGradient></defs>
    <path d="M15 18c0-4 16-8 35-8s35 4 35 8c0 3-10 5-20 6l-8 0c-3 2-5 8-6 14l-3 14c-1 5-2 10-4 14l-2 10c0 3 0 6-1 8l-1 8" stroke="url(#tg)" stroke-width="0" fill="url(#tg)"/>
    <path d="M20 15 Q50 22 80 15 Q72 20 65 22 L60 30 Q55 35 54 42 L52 52 Q51 58 50 64 L49 72 Q48.5 78 48 82 L47.5 88" stroke="#64748b" stroke-width="2" fill="none" opacity="0.6"/>
    <ellipse cx="50" cy="15" rx="32" ry="7" fill="#334155"/>
    <path d="M30 15 Q50 24 70 15" fill="#475569"/>
    <path d="M35 22 Q50 28 62 22 L58 35 Q52 40 50 50 L48 60 Q47 68 47 76 L47 88" fill="url(#tg)" opacity="0.85"/>
    <path d="M40 22 L44 35 Q48 42 48 52 L47.5 65 Q47 75 47.5 85" stroke="#94a3b8" stroke-width="1.5" fill="none" opacity="0.5"/>
    <ellipse cx="47.5" cy="89" rx="3" ry="1.5" fill="#475569" opacity="0.7"/>
    <g fill="#94a3b8" opacity="0.4"><circle cx="25" cy="12" r="2"/><circle cx="72" cy="13" r="2"/><circle cx="38" cy="30" r="1.5"/><circle cx="55" cy="45" r="1"/></g>
  `),hurricane:extremeSvg(`
    <defs>
      <radialGradient id="hg-eye" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#1e3a5f"/><stop offset="100%" stop-color="#0f172a"/></radialGradient>
      <linearGradient id="hg-arm" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e2e8f0"/><stop offset="100%" stop-color="#94a3b8"/></linearGradient>
    </defs>
    <circle cx="50" cy="50" r="42" fill="#1e293b"/>
    <path d="M50 8 C72 8 90 20 92 38 C94 52 84 62 72 66 C60 70 52 64 50 56" fill="url(#hg-arm)" opacity="0.9"/>
    <path d="M50 92 C28 92 10 80 8 62 C6 48 16 38 28 34 C40 30 48 36 50 44" fill="url(#hg-arm)" opacity="0.9"/>
    <path d="M8 50 C8 28 22 12 40 10 C54 8 64 18 66 30 C68 40 62 48 54 50" fill="url(#hg-arm)" opacity="0.7"/>
    <path d="M92 50 C92 72 78 88 60 90 C46 92 36 82 34 70 C32 60 38 52 46 50" fill="url(#hg-arm)" opacity="0.7"/>
    <circle cx="50" cy="50" r="9" fill="url(#hg-eye)"/>
    <circle cx="50" cy="50" r="9" fill="none" stroke="#cbd5e1" stroke-width="1.5" opacity="0.8"/>
  `),"tropical-storm":extremeSvg(`
    <defs><linearGradient id="ts-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#475569"/></linearGradient></defs>
    <circle cx="50" cy="45" r="30" fill="url(#ts-g)" opacity="0.8"/>
    <path d="M50 15 C70 15 85 25 85 40 C85 52 75 58 65 56 C55 54 52 48 50 42" fill="#cbd5e1" opacity="0.85"/>
    <path d="M50 75 C30 75 15 65 15 50 C15 38 25 32 35 34 C45 36 48 42 50 48" fill="#cbd5e1" opacity="0.85"/>
    <circle cx="50" cy="45" r="6" fill="#334155"/>
    <g stroke="#60a5fa" stroke-width="2" stroke-linecap="round" opacity="0.7">
      <line x1="30" y1="72" x2="28" y2="82"/><line x1="40" y1="74" x2="38" y2="84"/>
      <line x1="50" y1="76" x2="48" y2="86"/><line x1="60" y1="74" x2="58" y2="84"/>
      <line x1="70" y1="72" x2="68" y2="82"/>
    </g>
  `),derecho:extremeSvg(`
    <defs><linearGradient id="dr-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#334155"/><stop offset="100%" stop-color="#0f172a"/></linearGradient></defs>
    <path d="M5 25 Q50 15 95 25 Q95 45 50 50 Q5 45 5 25 Z" fill="url(#dr-g)"/>
    <path d="M10 30 Q50 22 90 30" stroke="#64748b" stroke-width="2" fill="none" opacity="0.6"/>
    <path d="M55 50 L48 62 L58 62 L44 82" stroke="#facc15" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M35 48 L30 58 L38 58 L28 72" stroke="#fbbf24" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.8"/>
    <g stroke="#60a5fa" stroke-width="1.5" stroke-linecap="round" opacity="0.6">
      <line x1="65" y1="52" x2="68" y2="65"/><line x1="72" y1="50" x2="75" y2="63"/>
      <line x1="80" y1="48" x2="83" y2="61"/>
    </g>
    <path d="M15 42 Q50 52 85 42" stroke="#475569" stroke-width="1" fill="none" stroke-dasharray="3 3" opacity="0.5"/>
  `),squall:extremeSvg(`
    <path d="M10 30 Q40 25 70 30 Q85 32 90 38 Q85 44 70 46 Q40 48 10 44 Z" fill="#475569"/>
    <g stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" opacity="0.7">
      <line x1="12" y1="55" x2="55" y2="52"/><line x1="20" y1="62" x2="70" y2="58"/>
      <line x1="15" y1="69" x2="62" y2="65"/>
    </g>
    <g stroke="#60a5fa" stroke-width="2" stroke-linecap="round" opacity="0.7">
      <line x1="60" y1="50" x2="55" y2="68"/><line x1="68" y1="48" x2="63" y2="66"/>
      <line x1="76" y1="46" x2="71" y2="64"/><line x1="84" y1="44" x2="79" y2="62"/>
    </g>
  `),waterspout:extremeSvg(`
    <defs><linearGradient id="ws-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#475569"/><stop offset="100%" stop-color="#64748b"/></linearGradient></defs>
    <ellipse cx="50" cy="18" rx="28" ry="8" fill="#334155"/>
    <path d="M35 22 Q50 30 60 22 L56 38 Q52 46 51 55 L50 65 Q49 72 49 78" fill="url(#ws-g)" opacity="0.85"/>
    <path d="M10 82 Q30 77 50 82 Q70 87 90 82" fill="#1e40af" opacity="0.6"/>
    <path d="M5 86 Q25 80 50 86 Q75 92 95 86" fill="#2563eb" opacity="0.5"/>
    <g fill="#bfdbfe" opacity="0.7"><circle cx="42" cy="80" r="2"/><circle cx="50" cy="78" r="2.5"/><circle cx="58" cy="80" r="2"/><circle cx="46" cy="76" r="1.5"/><circle cx="54" cy="76" r="1.5"/></g>
  `),blizzard:extremeSvg(`
    <path d="M18 42c-6 0-12-5-12-12s6-12 12-12c2 0 5 1 7 3 3-9 12-15 22-15 12 0 23 9 25 21 5-1 10 3 10 9s-5 10-10 10H18z" fill="#cbd5e1"/>
    <g stroke="#e2e8f0" stroke-width="2" stroke-linecap="round" opacity="0.6">
      <line x1="15" y1="50" x2="45" y2="48"/><line x1="20" y1="60" x2="55" y2="57"/>
      <line x1="10" y1="70" x2="48" y2="67"/>
    </g>
    <g fill="#ffffff">
      <circle cx="55" cy="52" r="3"/><circle cx="70" cy="58" r="3.5"/><circle cx="82" cy="50" r="3"/>
      <circle cx="60" cy="65" r="2.5"/><circle cx="75" cy="70" r="3"/><circle cx="88" cy="62" r="2.5"/>
      <circle cx="65" cy="78" r="2.5"/><circle cx="80" cy="82" r="3"/><circle cx="50" cy="80" r="2"/>
    </g>
  `),"ice-storm":extremeSvg(`
    <path d="M18 40c-6 0-12-5-12-12s6-12 12-12c2 0 5 1 7 3 3-9 12-15 22-15 12 0 23 9 25 21 5-1 10 3 10 9s-5 10-10 10H18z" fill="#94a3b8"/>
    <g fill="#bfdbfe">
      <path d="M25 42 L27 42 L26 58 Z"/><path d="M34 42 L36 42 L35 62 Z"/>
      <path d="M43 42 L45 42 L44 60 Z"/><path d="M52 42 L54 42 L53 64 Z"/>
      <path d="M61 42 L63 42 L62 58 Z"/><path d="M70 42 L72 42 L71 62 Z"/>
    </g>
    <g fill="#dbeafe" opacity="0.7">
      <circle cx="26" cy="59" r="2.5"/><circle cx="35" cy="63" r="2.5"/>
      <circle cx="44" cy="61" r="2.5"/><circle cx="53" cy="65" r="2.5"/>
      <circle cx="62" cy="59" r="2.5"/><circle cx="71" cy="63" r="2.5"/>
    </g>
  `),sandstorm:extremeSvg(`
    <defs><linearGradient id="sg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fbbf24" stop-opacity="0.2"/><stop offset="100%" stop-color="#92400e" stop-opacity="0.5"/></linearGradient></defs>
    <rect width="100" height="100" fill="url(#sg)" rx="4"/>
    <g stroke="#d97706" stroke-width="3" stroke-linecap="round" opacity="0.5">
      <path d="M5 30 Q30 25 60 32 Q80 36 95 30" fill="none"/>
      <path d="M5 50 Q35 44 65 52 Q85 56 95 50" fill="none"/>
      <path d="M5 70 Q30 64 58 72 Q80 76 95 70" fill="none"/>
    </g>
    <g fill="#d97706" opacity="0.8"><circle cx="18" cy="25" r="2.5"/><circle cx="42" cy="38" r="3"/><circle cx="72" cy="28" r="2"/><circle cx="85" cy="42" r="2.5"/><circle cx="28" cy="55" r="2"/><circle cx="55" cy="62" r="3"/><circle cx="80" cy="58" r="2.5"/><circle cx="20" cy="75" r="2"/><circle cx="48" cy="78" r="2.5"/><circle cx="75" cy="72" r="2"/></g>
  `),"dust-storm":extremeSvg(`
    <defs><linearGradient id="dg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#a8a29e" stop-opacity="0.2"/><stop offset="100%" stop-color="#57534e" stop-opacity="0.5"/></linearGradient></defs>
    <rect width="100" height="100" fill="url(#dg)" rx="4"/>
    <g stroke="#78716c" stroke-width="3" stroke-linecap="round" opacity="0.5">
      <path d="M5 30 Q30 25 60 32 Q80 36 95 30" fill="none"/>
      <path d="M5 50 Q35 44 65 52 Q85 56 95 50" fill="none"/>
      <path d="M5 70 Q30 64 58 72 Q80 76 95 70" fill="none"/>
    </g>
    <g fill="#78716c" opacity="0.7"><circle cx="18" cy="28" r="2.5"/><circle cx="45" cy="40" r="3"/><circle cx="75" cy="30" r="2"/><circle cx="30" cy="58" r="2.5"/><circle cx="60" cy="55" r="2.5"/><circle cx="85" cy="60" r="2"/><circle cx="22" cy="78" r="2"/><circle cx="50" cy="75" r="3"/><circle cx="78" cy="74" r="2.5"/></g>
  `),"volcanic-ash":extremeSvg(`
    <path d="M30 85 L50 45 L70 85 Z" fill="#44403c"/>
    <path d="M42 85 L50 60 L58 85 Z" fill="#57534e"/>
    <g fill="#6b7280" opacity="0.75">
      <circle cx="50" cy="35" r="8"/><circle cx="40" cy="30" r="7"/><circle cx="60" cy="30" r="7"/>
      <circle cx="35" cy="24" r="6"/><circle cx="65" cy="24" r="6"/>
      <circle cx="50" cy="20" r="6"/><circle cx="42" cy="16" r="5"/><circle cx="58" cy="16" r="5"/>
    </g>
    <g fill="#4b5563" opacity="0.5"><circle cx="30" cy="40" r="3"/><circle cx="70" cy="38" r="3"/><circle cx="25" cy="50" r="2"/><circle cx="75" cy="48" r="2"/></g>
  `),"wildfire-smoke":extremeSvg(`
    <g fill="#6b7280" opacity="0.7">
      <circle cx="30" cy="30" r="12"/><circle cx="50" cy="25" r="15"/><circle cx="70" cy="30" r="12"/>
      <circle cx="40" cy="18" r="10"/><circle cx="60" cy="18" r="10"/>
    </g>
    <g fill="#9ca3af" opacity="0.5">
      <circle cx="25" cy="42" r="10"/><circle cx="50" cy="40" r="12"/><circle cx="75" cy="42" r="10"/>
    </g>
    <g fill="#f59e0b">
      <path d="M35 90 Q37 78 40 82 Q42 75 45 80 Q47 72 50 78 Q52 70 55 76 Q57 72 60 80 Q63 76 65 90 Z"/>
    </g>
    <g fill="#ef4444" opacity="0.8">
      <path d="M40 90 Q42 82 45 85 Q47 78 50 82 Q52 76 55 82 Q57 78 60 90 Z"/>
    </g>
  `),"forest-fire":extremeSvg(`
    <g fill="#166534">
      <path d="M25 90 L25 70 L20 70 L25 60 L20 60 L25 50 L30 50 L30 60 L25 60 L30 70 L25 70 Z"/>
      <path d="M75 90 L75 70 L70 70 L75 60 L70 60 L75 50 L80 50 L80 60 L75 60 L80 70 L75 70 Z"/>
    </g>
    <g fill="#f59e0b">
      <path d="M38 90 Q40 72 44 78 Q46 65 50 72 Q52 60 56 68 Q58 62 62 75 Q64 70 66 90 Z"/>
    </g>
    <g fill="#ef4444">
      <path d="M42 90 Q44 76 48 80 Q50 70 54 76 Q56 68 58 78 Q60 74 62 90 Z"/>
    </g>
    <g fill="#6b7280" opacity="0.6">
      <circle cx="45" cy="45" r="10"/><circle cx="55" cy="40" r="12"/><circle cx="65" cy="44" r="9"/>
      <circle cx="50" cy="32" r="8"/>
    </g>
  `),smoke:extremeSvg(`
    <g fill="#6b7280" opacity="0.6">
      <circle cx="25" cy="55" r="14"/><circle cx="45" cy="48" r="16"/><circle cx="65" cy="52" r="14"/><circle cx="80" cy="58" r="10"/>
    </g>
    <g fill="#9ca3af" opacity="0.5">
      <circle cx="30" cy="38" r="12"/><circle cx="50" cy="32" r="14"/><circle cx="70" cy="36" r="11"/>
    </g>
    <g fill="#d1d5db" opacity="0.35">
      <circle cx="40" cy="22" r="8"/><circle cx="58" cy="20" r="9"/>
    </g>
  `),ash:extremeSvg(`
    <g fill="#6b7280" opacity="0.6">
      <circle cx="50" cy="15" r="12"/><circle cx="35" cy="12" r="9"/><circle cx="65" cy="12" r="9"/>
    </g>
    <g fill="#52525b" opacity="0.7">
      <ellipse cx="20" cy="35" rx="2" ry="3"/><ellipse cx="35" cy="42" rx="2.5" ry="3.5"/>
      <ellipse cx="50" cy="38" rx="2" ry="3"/><ellipse cx="65" cy="44" rx="2.5" ry="3.5"/>
      <ellipse cx="80" cy="36" rx="2" ry="3"/>
      <ellipse cx="25" cy="58" rx="2" ry="3"/><ellipse cx="42" cy="62" rx="2.5" ry="3.5"/>
      <ellipse cx="58" cy="56" rx="2" ry="3"/><ellipse cx="75" cy="60" rx="2.5" ry="3.5"/>
      <ellipse cx="30" cy="78" rx="2" ry="3"/><ellipse cx="50" cy="80" rx="2.5" ry="3.5"/>
      <ellipse cx="70" cy="76" rx="2" ry="3"/>
    </g>
  `),haze:extremeSvg(`
    <circle cx="50" cy="35" r="14" fill="#fbbf24" opacity="0.3"/>
    <g stroke="#a8a29e" stroke-width="4" stroke-linecap="round" opacity="0.5">
      <line x1="8" y1="35" x2="92" y2="35"/><line x1="10" y1="48" x2="90" y2="48"/>
      <line x1="12" y1="61" x2="88" y2="61"/><line x1="14" y1="74" x2="86" y2="74"/>
    </g>
    <g stroke="#d6d3d1" stroke-width="3" stroke-linecap="round" opacity="0.4">
      <line x1="15" y1="42" x2="85" y2="42"/><line x1="18" y1="55" x2="82" y2="55"/>
      <line x1="20" y1="68" x2="80" y2="68"/>
    </g>
  `),smog:extremeSvg(`
    <g fill="#374151" opacity="0.6">
      <rect x="15" y="60" width="12" height="30"/><rect x="30" y="50" width="10" height="40"/>
      <rect x="45" y="55" width="14" height="35"/><rect x="62" y="45" width="10" height="45"/>
      <rect x="75" y="58" width="12" height="32"/>
    </g>
    <g fill="#6b7280" opacity="0.5">
      <circle cx="20" cy="40" r="12"/><circle cx="40" cy="35" r="14"/><circle cx="60" cy="38" r="12"/><circle cx="80" cy="42" r="10"/>
    </g>
    <g fill="#9ca3af" opacity="0.35">
      <circle cx="30" cy="25" r="10"/><circle cx="55" cy="22" r="12"/><circle cx="75" cy="28" r="9"/>
    </g>
  `),"acid-rain":extremeSvg(`
    <path d="M18 42c-6 0-12-5-12-12s6-12 12-12c2 0 5 1 7 3 3-9 12-15 22-15 12 0 23 9 25 21 5-1 10 3 10 9s-5 10-10 10H18z" fill="#6b7280"/>
    <path d="M18 42c-6 0-12-5-12-12s6-12 12-12c2 0 5 1 7 3 3-9 12-15 22-15 12 0 23 9 25 21 5-1 10 3 10 9s-5 10-10 10H18z" fill="#84cc16" opacity="0.2"/>
    <g fill="#a3e635">
      <path d="M28 52 Q30 48 32 52 Q30 56 28 52 Z"/><path d="M40 56 Q42 52 44 56 Q42 60 40 56 Z"/>
      <path d="M52 54 Q54 50 56 54 Q54 58 52 54 Z"/><path d="M64 52 Q66 48 68 52 Q66 56 64 52 Z"/>
      <path d="M34 68 Q36 64 38 68 Q36 72 34 68 Z"/><path d="M48 70 Q50 66 52 70 Q50 74 48 70 Z"/>
      <path d="M62 66 Q64 62 66 66 Q64 70 62 66 Z"/>
    </g>
  `),"flash-flood":extremeSvg(`
    <path d="M15 35c-5 0-10-4-10-9s5-9 10-9c2 0 4 1 6 2 3-7 11-12 20-12 11 0 20 7 22 17 4-1 9 3 9 8s-4 9-9 9H15z" fill="#475569"/>
    <g stroke="#60a5fa" stroke-width="2" stroke-linecap="round" opacity="0.6">
      <line x1="25" y1="38" x2="22" y2="48"/><line x1="40" y1="38" x2="37" y2="48"/>
      <line x1="55" y1="38" x2="52" y2="48"/>
    </g>
    <path d="M5 65 Q20 58 35 65 Q50 72 65 65 Q80 58 95 65 L95 75 Q80 68 65 75 Q50 82 35 75 Q20 68 5 75 Z" fill="#2563eb" opacity="0.7"/>
    <path d="M5 75 Q20 68 35 75 Q50 82 65 75 Q80 68 95 75 L95 85 Q80 78 65 85 Q50 92 35 85 Q20 78 5 85 Z" fill="#1d4ed8" opacity="0.6"/>
    <path d="M40 52 L50 44 L60 52 L60 62 L40 62 Z" fill="#92400e" opacity="0.7"/>
    <path d="M44 56 L44 62 L48 62 L48 56 Z" fill="#78350f" opacity="0.6"/>
  `),aurora:extremeSvg(`
    <rect width="100" height="100" fill="#0f172a" rx="4"/>
    <g opacity="0.8">
      <path d="M0 80 Q15 50 30 60 Q45 70 50 40 Q55 20 65 35 Q75 50 85 30 Q95 15 100 25" stroke="#4ade80" stroke-width="10" fill="none" opacity="0.6"/>
      <path d="M0 85 Q20 55 35 65 Q50 75 55 45 Q60 25 70 40 Q80 55 90 35 Q98 20 100 30" stroke="#22d3ee" stroke-width="8" fill="none" opacity="0.5"/>
      <path d="M0 90 Q25 60 40 70 Q55 80 60 50 Q65 30 75 45 Q85 60 95 40 Q100 25 100 35" stroke="#a78bfa" stroke-width="6" fill="none" opacity="0.4"/>
    </g>
    <g fill="#ffffff"><circle cx="15" cy="15" r="1.5"/><circle cx="35" cy="10" r="1"/><circle cx="55" cy="8" r="1.5"/><circle cx="75" cy="12" r="1"/><circle cx="90" cy="8" r="1.5"/><circle cx="25" cy="25" r="1"/><circle cx="80" cy="22" r="1"/></g>
  `),eclipse:extremeSvg(`
    <rect width="100" height="100" fill="#0f172a" rx="4"/>
    <defs><radialGradient id="eg" cx="50%" cy="50%" r="50%"><stop offset="55%" stop-color="#fbbf24" stop-opacity="0.8"/><stop offset="80%" stop-color="#f59e0b" stop-opacity="0.3"/><stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/></radialGradient></defs>
    <circle cx="50" cy="50" r="30" fill="url(#eg)"/>
    <circle cx="50" cy="50" r="20" fill="#fbbf24" opacity="0.3"/>
    <circle cx="53" cy="47" r="18" fill="#0f172a"/>
    <g fill="#ffffff" opacity="0.4"><circle cx="20" cy="20" r="1"/><circle cx="80" cy="25" r="1"/><circle cx="15" cy="75" r="1"/><circle cx="85" cy="80" r="1"/></g>
  `),"eclipse-lunar":extremeSvg(`
    <rect width="100" height="100" fill="#0b1120" rx="4"/>
    <g fill="#ffffff" opacity="0.55"><circle cx="14" cy="18" r="1"/><circle cx="30" cy="10" r="1"/><circle cx="70" cy="14" r="1.2"/><circle cx="88" cy="22" r="1"/><circle cx="10" cy="70" r="1"/><circle cx="90" cy="65" r="1"/></g>
    <circle cx="50" cy="50" r="24" fill="#e2e8f0"/>
    <circle cx="50" cy="50" r="24" fill="#94a3b8" opacity="0.35"/>
    <path d="M62 30 A24 24 0 0 1 62 70 A18 18 0 0 0 62 30 Z" fill="#1e293b" opacity="0.9"/>
  `),"blood-moon":extremeSvg(`
    <rect width="100" height="100" fill="#170a08" rx="4"/>
    <g fill="#ffffff" opacity="0.4"><circle cx="14" cy="18" r="1"/><circle cx="30" cy="10" r="1"/><circle cx="70" cy="14" r="1"/><circle cx="88" cy="22" r="1"/><circle cx="10" cy="70" r="1"/><circle cx="90" cy="65" r="1"/></g>
    <defs><radialGradient id="bmg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#b91c1c" stop-opacity="0.55"/><stop offset="60%" stop-color="#7f1d1d" stop-opacity="0.25"/><stop offset="100%" stop-color="#7f1d1d" stop-opacity="0"/></radialGradient></defs>
    <circle cx="50" cy="50" r="34" fill="url(#bmg)"/>
    <circle cx="50" cy="50" r="22" fill="#9a3412"/>
    <circle cx="50" cy="50" r="22" fill="#dc2626" opacity="0.45"/>
    <circle cx="43" cy="43" r="4" fill="#7c2d12" opacity="0.5"/>
    <circle cx="58" cy="55" r="3" fill="#7c2d12" opacity="0.4"/>
  `),rainbow:extremeSvg(`
    <circle cx="70" cy="30" r="12" fill="#e2e8f0"/>
    <circle cx="80" cy="28" r="10" fill="#f1f5f9"/>
    <circle cx="60" cy="32" r="9" fill="#e2e8f0"/>
    <g fill="none" stroke-width="4" opacity="0.85">
      <path d="M10 85 A40 40 0 0 1 90 85" stroke="#ef4444"/>
      <path d="M15 85 A35 35 0 0 1 85 85" stroke="#f97316"/>
      <path d="M20 85 A30 30 0 0 1 80 85" stroke="#eab308"/>
      <path d="M25 85 A25 25 0 0 1 75 85" stroke="#22c55e"/>
      <path d="M30 85 A20 20 0 0 1 70 85" stroke="#3b82f6"/>
      <path d="M35 85 A15 15 0 0 1 65 85" stroke="#8b5cf6"/>
    </g>
  `),"meteor-shower":extremeSvg(`
    <rect width="100" height="100" fill="#0f172a" rx="4"/>
    <g fill="#ffffff" opacity="0.5"><circle cx="15" cy="20" r="1"/><circle cx="40" cy="12" r="1"/><circle cx="70" cy="18" r="1.2"/><circle cx="88" cy="10" r="1"/><circle cx="55" cy="35" r="1"/></g>
    <g stroke-linecap="round">
      <line x1="25" y1="15" x2="15" y2="40" stroke="#fef3c7" stroke-width="3" opacity="0.9"/>
      <line x1="25" y1="15" x2="22" y2="22" stroke="#ffffff" stroke-width="4"/>
      <line x1="55" y1="10" x2="42" y2="45" stroke="#fef3c7" stroke-width="2.5" opacity="0.8"/>
      <line x1="55" y1="10" x2="52" y2="18" stroke="#ffffff" stroke-width="3.5"/>
      <line x1="80" y1="20" x2="65" y2="55" stroke="#fef3c7" stroke-width="2" opacity="0.7"/>
      <line x1="80" y1="20" x2="77" y2="28" stroke="#ffffff" stroke-width="3"/>
      <line x1="40" y1="50" x2="32" y2="72" stroke="#fef3c7" stroke-width="2" opacity="0.6"/>
    </g>
  `),"meteor-impact":extremeSvg(`
    <defs><radialGradient id="mg" cx="50%" cy="60%" r="50%"><stop offset="0%" stop-color="#ffffff"/><stop offset="30%" stop-color="#fbbf24"/><stop offset="60%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/></radialGradient></defs>
    <circle cx="50" cy="60" r="35" fill="url(#mg)" opacity="0.8"/>
    <circle cx="50" cy="60" r="12" fill="#ffffff"/>
    <g stroke="#f59e0b" stroke-width="3" stroke-linecap="round" opacity="0.7">
      <line x1="50" y1="60" x2="30" y2="25"/><line x1="50" y1="60" x2="70" y2="20"/>
      <line x1="50" y1="60" x2="15" y2="50"/><line x1="50" y1="60" x2="85" y2="45"/>
      <line x1="50" y1="60" x2="20" y2="75"/><line x1="50" y1="60" x2="80" y2="78"/>
      <line x1="50" y1="60" x2="35" y2="90"/><line x1="50" y1="60" x2="65" y2="92"/>
    </g>
    <path d="M45 15 L48 25 L42 28 Z" fill="#78716c"/>
  `),"asteroid-impact":extremeSvg(`
    <defs><radialGradient id="ag" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffffff"/><stop offset="20%" stop-color="#fca5a5"/><stop offset="50%" stop-color="#ef4444"/><stop offset="100%" stop-color="#7f1d1d" stop-opacity="0"/></radialGradient></defs>
    <circle cx="50" cy="50" r="42" fill="url(#ag)" opacity="0.7"/>
    <circle cx="50" cy="50" r="18" fill="#fef2f2"/>
    <circle cx="50" cy="50" r="10" fill="#ffffff"/>
    <g stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" opacity="0.8">
      <line x1="50" y1="50" x2="20" y2="15"/><line x1="50" y1="50" x2="80" y2="12"/>
      <line x1="50" y1="50" x2="10" y2="55"/><line x1="50" y1="50" x2="90" y2="50"/>
      <line x1="50" y1="50" x2="18" y2="85"/><line x1="50" y1="50" x2="82" y2="88"/>
    </g>
    <g fill="#78716c"><circle cx="25" cy="20" r="3"/><circle cx="78" cy="18" r="2.5"/><circle cx="12" cy="60" r="2"/><circle cx="88" cy="55" r="2.5"/></g>
  `),earthquake:extremeSvg(`
    <rect x="5" y="50" width="90" height="45" fill="#78716c" rx="2"/>
    <rect x="5" y="50" width="90" height="20" fill="#a8a29e" rx="2"/>
    <path d="M5 55 L25 55 L30 48 L35 62 L40 44 L45 66 L50 42 L55 64 L60 46 L65 60 L70 50 L75 55 L95 55" stroke="#dc2626" stroke-width="3" fill="none" stroke-linejoin="round"/>
    <path d="M30 70 L32 80 L36 72 L40 85 L44 74 L48 90 L50 70" stroke="#57534e" stroke-width="2" fill="none"/>
    <path d="M55 68 L58 78 L62 70 L64 82 L68 72 L72 88" stroke="#57534e" stroke-width="2" fill="none"/>
    <g fill="#44403c" opacity="0.5"><rect x="20" y="30" width="15" height="20" rx="1"/><rect x="60" y="28" width="18" height="22" rx="1"/></g>
    <path d="M20 30 L27 22 L35 30" fill="#44403c" opacity="0.5"/>
    <path d="M60 28 L69 20 L78 28" fill="#44403c" opacity="0.5"/>
  `),tsunami:extremeSvg(`
    <rect x="0" y="75" width="100" height="25" fill="#a8a29e"/>
    <path d="M-5 45 Q10 30 25 35 Q35 38 40 32 Q50 22 60 25 Q70 28 75 22 Q85 12 92 18 Q95 20 95 30 L95 75 L-5 75 Z" fill="#2563eb"/>
    <path d="M-5 50 Q10 38 25 42 Q35 45 42 38 Q50 30 58 32 Q68 35 72 28 Q80 18 88 22 L88 25" stroke="#bfdbfe" stroke-width="3" fill="none" opacity="0.6"/>
    <path d="M75 22 Q82 15 88 18 Q92 20 90 28 Q85 22 80 25 Q75 28 75 22 Z" fill="#93c5fd"/>
    <g fill="#78716c" opacity="0.5"><rect x="15" y="65" width="8" height="10" rx="1"/><rect x="70" y="63" width="10" height="12" rx="1"/></g>
  `),"volcanic-eruption":extremeSvg(`
    <path d="M20 90 L42 40 L58 40 L80 90 Z" fill="#44403c"/>
    <path d="M35 90 L45 55 L55 55 L65 90 Z" fill="#57534e"/>
    <g fill="#ef4444" opacity="0.9">
      <path d="M44 40 Q47 30 50 35 Q53 28 56 40 Z"/>
      <path d="M46 35 Q48 22 50 28 Q52 18 54 35 Z"/>
    </g>
    <g fill="#f59e0b" opacity="0.7">
      <path d="M42 42 Q44 35 46 40" fill="none" stroke="#f59e0b" stroke-width="2"/>
      <path d="M54 42 Q56 35 58 40" fill="none" stroke="#f59e0b" stroke-width="2"/>
    </g>
    <g fill="#6b7280" opacity="0.7">
      <circle cx="42" cy="18" r="5"/><circle cx="50" cy="12" r="6"/><circle cx="58" cy="16" r="5"/>
      <circle cx="46" cy="8" r="4"/><circle cx="55" cy="6" r="4"/>
    </g>
    <g fill="#fbbf24" opacity="0.5"><circle cx="38" cy="70" r="2"/><circle cx="50" cy="65" r="2.5"/><circle cx="62" cy="72" r="2"/></g>
  `),landslide:extremeSvg(`
    <path d="M5 30 L5 90 L90 90 Z" fill="#65a30d" opacity="0.4"/>
    <path d="M25 50 L25 90 L90 90 Z" fill="#8b6f47"/>
    <path d="M35 55 L35 90 L90 90 Z" fill="#a17a4a" opacity="0.8"/>
    <g fill="#78716c">
      <circle cx="50" cy="65" r="5"/><circle cx="62" cy="72" r="6"/><circle cx="72" cy="78" r="5"/>
      <circle cx="55" cy="78" r="4"/><circle cx="80" cy="84" r="5"/><circle cx="45" cy="80" r="3.5"/>
    </g>
    <g fill="#65a30d" opacity="0.6">
      <path d="M8 28 L12 20 L16 28 Z"/><path d="M14 32 L18 24 L22 32 Z"/>
    </g>
  `),mudslide:extremeSvg(`
    <path d="M10 35 L10 90 L95 90 Z" fill="#6b5637"/>
    <path d="M20 45 L20 90 L95 90 Z" fill="#8b6f47" opacity="0.8"/>
    <path d="M30 55 Q50 50 70 60 Q85 68 95 80 L95 90 L30 90 Z" fill="#5c4a2e"/>
    <g fill="#44403c">
      <circle cx="45" cy="65" r="4"/><circle cx="58" cy="72" r="5"/><circle cx="70" cy="78" r="4"/>
      <circle cx="52" cy="80" r="3.5"/><circle cx="78" cy="84" r="4"/>
    </g>
    <g fill="#3f3f46" opacity="0.5"><rect x="55" y="60" width="3" height="8" rx="1" transform="rotate(20 56 64)"/><rect x="40" y="68" width="2.5" height="7" rx="1" transform="rotate(-15 41 71)"/></g>
  `),avalanche:extremeSvg(`
    <path d="M50 5 L85 90 L15 90 Z" fill="#94a3b8"/>
    <path d="M50 5 L65 50 L35 50 Z" fill="#cbd5e1"/>
    <path d="M30 50 Q50 45 70 55 Q85 62 90 75 L90 90 L25 90 Z" fill="#f1f5f9"/>
    <path d="M35 55 Q55 50 72 60 Q82 66 88 78" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.6"/>
    <g fill="#ffffff">
      <circle cx="45" cy="62" r="5"/><circle cx="58" cy="68" r="6"/><circle cx="70" cy="75" r="5"/>
      <circle cx="50" cy="78" r="4"/><circle cx="78" cy="82" r="5"/><circle cx="38" cy="80" r="4"/>
    </g>
  `),rockfall:extremeSvg(`
    <path d="M10 10 L10 90 L30 90 L30 10 Z" fill="#57534e"/>
    <path d="M10 10 L10 90 L25 90 L25 10 Z" fill="#44403c"/>
    <g fill="#78716c">
      <circle cx="45" cy="30" r="6"/><circle cx="55" cy="45" r="7"/><circle cx="50" cy="62" r="6"/>
      <circle cx="62" cy="75" r="7"/><circle cx="72" cy="85" r="5"/>
    </g>
    <g fill="#a8a29e">
      <circle cx="40" cy="50" r="4"/><circle cx="60" cy="60" r="4.5"/><circle cx="48" cy="78" r="4"/>
      <circle cx="70" cy="72" r="3.5"/>
    </g>
    <g stroke="#d6d3d1" stroke-width="1" fill="none" opacity="0.4">
      <path d="M35 25 Q40 22 45 25"/><path d="M50 40 Q55 37 60 40"/><path d="M55 58 Q60 55 65 58"/>
    </g>
  `),"geological-event":extremeSvg(`
    <rect x="5" y="50" width="90" height="45" fill="#78716c" rx="2"/>
    <rect x="5" y="50" width="90" height="20" fill="#a8a29e" rx="2"/>
    <path d="M10 35 L20 35 L25 25 L30 45 L35 20 L40 48 L45 22 L50 42 L55 28 L60 38 L65 30 L70 35 L90 35" stroke="#475569" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
    <path d="M35 70 L38 78 L42 72 L45 85 L48 70" stroke="#57534e" stroke-width="1.5" fill="none"/>
    <path d="M60 68 L63 76 L66 70 L70 82" stroke="#57534e" stroke-width="1.5" fill="none"/>
  `),apocalypse:extremeSvg(`
    <defs><radialGradient id="apg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fca5a5"/><stop offset="40%" stop-color="#ef4444"/><stop offset="100%" stop-color="#450a0a"/></radialGradient></defs>
    <rect width="100" height="100" fill="#0f0000" rx="4"/>
    <circle cx="50" cy="50" r="38" fill="url(#apg)" opacity="0.8"/>
    <g stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" opacity="0.7">
      <line x1="50" y1="50" x2="50" y2="15"/><line x1="50" y1="50" x2="80" y2="30"/>
      <line x1="50" y1="50" x2="85" y2="55"/><line x1="50" y1="50" x2="75" y2="80"/>
      <line x1="50" y1="50" x2="50" y2="88"/><line x1="50" y1="50" x2="22" y2="78"/>
      <line x1="50" y1="50" x2="15" y2="50"/><line x1="50" y1="50" x2="22" y2="25"/>
    </g>
    <circle cx="50" cy="50" r="8" fill="#fef2f2"/>
  `)};function meteoIcon(c){return`<img src="${METEO_PATH}${c}.svg" class="weather-icon" alt="${c}">`}const WI={sun(c){return meteoIcon("clear-day")},moon(c){return meteoIcon("clear-night")},cloud(c,e){return meteoIcon("cloudy")},cloudSun(c,e){return meteoIcon("partly-cloudy-day")},cloudMoon(c,e){return meteoIcon("partly-cloudy-night")},rain(c,e){return meteoIcon("rain")},snowIcon(c,e){return meteoIcon("snow")},fog(c){return meteoIcon("fog")},bolt(c,e){return meteoIcon("thunderstorms")},drop(c){return meteoIcon("rain")},wind(c){return meteoIcon("wind")},sunrise(c){return meteoIcon("clear-day")},sunset(c){return meteoIcon("clear-night")},uv(c){return meteoIcon("clear-day")},eye(c){return meteoIcon("mist")},aqi(c){return meteoIcon("wind")},thermo(c){return meteoIcon("clear-day")}};function wmoInfo(c,e,i){const r=!!e;let l={0:{key:r?"clear-day":"clear-night",label:"Clear"},1:{key:r?"mostly-clear-day":"mostly-clear-night",label:"Mostly Clear"},2:{key:r?"partly-cloudy-day":"partly-cloudy-night",label:"Partly Cloudy"},3:{key:"overcast",label:"Overcast"},45:{key:"fog",label:"Fog"},48:{key:"fog",label:"Freezing Fog"},51:{key:"drizzle-light",label:"Light Drizzle"},53:{key:"drizzle",label:"Drizzle"},55:{key:"drizzle-heavy",label:"Heavy Drizzle"},56:{key:"freezing-rain",label:"Freezing Drizzle"},57:{key:"freezing-rain",label:"Freezing Drizzle"},61:{key:"rain-light",label:"Light Rain"},63:{key:"rain",label:"Rain"},65:{key:"rain-heavy",label:"Heavy Rain"},66:{key:"freezing-rain",label:"Freezing Rain"},67:{key:"freezing-rain",label:"Freezing Rain"},71:{key:"snow-light",label:"Light Snow"},73:{key:"snow",label:"Snow"},75:{key:"snow-heavy",label:"Heavy Snow"},77:{key:"snow-grains",label:"Snow Grains"},80:{key:"rain-showers-light",label:"Light Showers"},81:{key:"rain-showers",label:"Rain Showers"},82:{key:"rain-showers-heavy",label:"Violent Showers"},85:{key:"snow-showers-light",label:"Light Snow Showers"},86:{key:"snow-showers",label:"Snow Showers"},95:{key:"thunderstorm",label:"Thunderstorm"},96:{key:"thunderstorm-hail",label:"Thunderstorm w/ Hail"},99:{key:"thunderstorm-hail-heavy",label:"Severe Thunderstorm"}}[c]||{key:r?"partly-cloudy-day":"partly-cloudy-night",label:"Unknown"};if(i!=null&&[0,1,2,3].includes(c)){const t=Number(i);t<=15?l={key:r?"clear-day":"clear-night",label:"Clear"}:t<=40?l={key:r?"mostly-clear-day":"mostly-clear-night",label:"Mostly Clear"}:t<=70?l={key:r?"partly-cloudy-day":"partly-cloudy-night",label:"Partly Cloudy"}:t<=95?l={key:r?"mostly-cloudy-day":"mostly-cloudy-night",label:"Mostly Cloudy"}:l={key:"overcast",label:"Overcast"}}return l}function iconSvgFor(c,e){if(MOSTLY_CLEAR_ICONS[c])return MOSTLY_CLEAR_ICONS[c];if(EXTREME_ICONS[c])return EXTREME_ICONS[c];const i=KEY_TO_ICON[c]||"cloudy";return meteoIcon(i)}const LABELS={"clear-day":"Clear","clear-night":"Clear","mostly-clear-day":"Mostly Clear","mostly-clear-night":"Mostly Clear","partly-cloudy-day":"Partly Cloudy","partly-cloudy-night":"Partly Cloudy","mostly-cloudy-day":"Mostly Cloudy","mostly-cloudy-night":"Mostly Cloudy",overcast:"Overcast",fog:"Fog",drizzle:"Drizzle",rain:"Rain","rain-heavy":"Heavy Rain","freezing-rain":"Freezing Rain",snow:"Snow","snow-heavy":"Heavy Snow","snow-grains":"Snow Grains","rain-showers":"Rain Showers","snow-showers":"Snow Showers",thunderstorm:"Thunderstorm","thunderstorm-hail":"Severe Thunderstorm",tornado:"Tornado",waterspout:"Waterspout",hurricane:"Hurricane","tropical-storm":"Tropical Storm",derecho:"Derecho",squall:"Squall",blizzard:"Blizzard","ice-storm":"Ice Storm",sandstorm:"Sandstorm","dust-storm":"Dust Storm","volcanic-ash":"Volcanic Ash","wildfire-smoke":"Wildfire Smoke","forest-fire":"Forest Fire",smoke:"Smoke",ash:"Ash",haze:"Haze",smog:"Smog","acid-rain":"Acid Rain",aurora:"Aurora",eclipse:"Solar Eclipse","eclipse-lunar":"Lunar Eclipse","blood-moon":"Blood Moon",rainbow:"Rainbow","meteor-shower":"Meteor Shower","meteor-impact":"Meteor Impact","asteroid-impact":"Asteroid Impact",earthquake:"Earthquake",tsunami:"Tsunami","volcanic-eruption":"Volcanic Eruption",landslide:"Landslide",mudslide:"Mudslide",avalanche:"Avalanche",rockfall:"Rockfall","geological-event":"Geological Event",apocalypse:"Apocalypse","flash-flood":"Flash Flood","drizzle-light":"Light Drizzle","drizzle-heavy":"Heavy Drizzle","rain-light":"Light Rain","snow-light":"Light Snow","rain-showers-light":"Showers","rain-showers-heavy":"Violent Showers","snow-showers-light":"Snow Showers","thunderstorm-hail-heavy":"Severe Thunderstorm"};function labelForKey(c){return LABELS[c]||c.replace(/-/g," ").replace(/\b\w/g,e=>e.toUpperCase())}window.WI=WI,window.wmoInfo=wmoInfo,window.iconSvgFor=iconSvgFor,window.labelForKey=labelForKey;
