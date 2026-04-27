import React from 'react'

/**
 * Mascot: Professor Fin — กันแว่นใส่ hoodie สีน้ำเงิน
 * Moods: happy | thinking | loading | excited | sad | wink
 */
export default function Mascot({ size = 120, mood = 'happy', animate = true, color = '#2563EB' }) {
  const floatStyle = animate ? { animation: 'float 3.2s ease-in-out infinite', display:'inline-block' } : { display:'inline-block' }

  const blinkStyle = animate ? { animation: 'blink 5s ease-in-out infinite', transformOrigin:'center' } : {}

  // Darken/lighten helpers
  const hoodieColor  = color
  const hoodieShade  = color + 'CC'   // slightly transparent shade

  /* ── Eye expressions ── */
  const eyes = {
    happy: <>
      <ellipse cx="35" cy="47" rx="5.5" ry="5.8" fill="#1C1B2E" style={blinkStyle}/>
      <circle cx="37.5" cy="44.5" r="1.8" fill="white"/>
      <ellipse cx="57" cy="47" rx="5.5" ry="5.8" fill="#1C1B2E" style={blinkStyle}/>
      <circle cx="59.5" cy="44.5" r="1.8" fill="white"/>
    </>,
    wink: <>
      <ellipse cx="35" cy="47" rx="5.5" ry="5.8" fill="#1C1B2E"/>
      <circle cx="37.5" cy="44.5" r="1.8" fill="white"/>
      {/* Right eye winking */}
      <path d="M51 47 Q57 43 63 47" stroke="#1C1B2E" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
      <path d="M52 49 Q57 46 62 49" stroke="#1C1B2E" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.5"/>
    </>,
    thinking: <>
      <ellipse cx="35" cy="47" rx="5.5" ry="5.8" fill="#1C1B2E"/>
      <circle cx="37.5" cy="44.5" r="1.8" fill="white"/>
      <ellipse cx="57" cy="47" rx="5.5" ry="5.8" fill="#1C1B2E"/>
      <circle cx="59.5" cy="44.5" r="1.8" fill="white"/>
      {/* thought cloud dots */}
      <circle cx="75" cy="32" r="2.2" fill="#94A3B8"/>
      <circle cx="81" cy="25" r="2.8" fill="#CBD5E1"/>
      <circle cx="88" cy="17" r="4" fill="#E2E8F0" opacity="0.7"/>
    </>,
    excited: <>
      <ellipse cx="35" cy="46" rx="6.5" ry="7" fill="#1C1B2E"/>
      <circle cx="38" cy="43" r="2.2" fill="white"/>
      <ellipse cx="57" cy="46" rx="6.5" ry="7" fill="#1C1B2E"/>
      <circle cx="60" cy="43" r="2.2" fill="white"/>
      <text x="68" y="35" fontSize="9">✨</text>
    </>,
    loading: <>
      <ellipse cx="35" cy="47" rx="5.5" ry="3.5" fill="#1C1B2E" style={{animation:'blink 1.2s ease-in-out infinite'}}/>
      <ellipse cx="57" cy="47" rx="5.5" ry="3.5" fill="#1C1B2E" style={{animation:'blink 1.2s ease-in-out infinite 0.15s'}}/>
    </>,
    sad: <>
      <ellipse cx="35" cy="49" rx="5" ry="5.5" fill="#1C1B2E"/>
      <circle cx="37.5" cy="46.5" r="1.6" fill="white"/>
      <ellipse cx="57" cy="49" rx="5" ry="5.5" fill="#1C1B2E"/>
      <circle cx="59.5" cy="46.5" r="1.6" fill="white"/>
    </>,
  }

  const mouths = {
    happy:    <path d="M38 58 Q46 65 54 58" stroke="#7C4A2A" strokeWidth="2.2" fill="none" strokeLinecap="round"/>,
    wink:     <path d="M39 58 Q46 65 54 58" stroke="#7C4A2A" strokeWidth="2.2" fill="none" strokeLinecap="round"/>,
    thinking: <path d="M40 60 Q46 57 52 60" stroke="#7C4A2A" strokeWidth="2" fill="none" strokeLinecap="round"/>,
    excited:  <path d="M37 57 Q46 67 55 57" stroke="#7C4A2A" strokeWidth="2.4" fill="none" strokeLinecap="round"/>,
    loading:  <path d="M41 61 Q46 61 51 61" stroke="#7C4A2A" strokeWidth="1.8" fill="none" strokeLinecap="round"/>,
    sad:      <path d="M40 63 Q46 58 52 63" stroke="#7C4A2A" strokeWidth="2" fill="none" strokeLinecap="round"/>,
  }

  const currentMood = eyes[mood] ? mood : 'happy'

  return (
    <div style={floatStyle}>
      <svg width={size} height={Math.round(size*1.42)} viewBox="0 0 100 142" fill="none" xmlns="http://www.w3.org/2000/svg">

        {/* ── Shadow ── */}
        <ellipse cx="50" cy="138" rx="22" ry="4.5" fill="rgba(0,0,0,0.10)"/>

        {/* ── Body: Hoodie ── */}
        <ellipse cx="50" cy="116" rx="32" ry="24" fill={hoodieColor}/>
        {/* Hood collar */}
        <path d="M28 96 Q50 108 72 96" stroke={hoodieShade} strokeWidth="3" fill="none"/>
        {/* Center zip line */}
        <line x1="50" y1="96" x2="50" y2="132" stroke={hoodieShade} strokeWidth="1.5"/>
        {/* Pocket */}
        <rect x="33" y="112" width="34" height="18" rx="6" fill={hoodieShade} opacity="0.6"/>

        {/* Chart icon on hoodie */}
        <rect x="41" y="117" width="3.5" height="8" rx="1.2" fill="rgba(255,255,255,0.85)"/>
        <rect x="46" y="113" width="3.5" height="12" rx="1.2" fill="rgba(255,255,255,0.85)"/>
        <rect x="51" y="119" width="3.5" height="6" rx="1.2" fill="rgba(255,255,255,0.85)"/>
        {/* Arrow up */}
        <path d="M57 116 L60 112 L63 116" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
        <line x1="60" y1="112" x2="60" y2="119" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8"/>

        {/* ── Left arm + clipboard ── */}
        <ellipse cx="23" cy="108" rx="10" ry="7" fill={hoodieColor} transform="rotate(-25 23 108)"/>
        {/* Paw */}
        <ellipse cx="14" cy="118" rx="8" ry="6" fill="#D4A574"/>
        <ellipse cx="11" cy="116" rx="2" ry="1.5" fill="#C49060"/>
        <ellipse cx="13.5" cy="114" rx="2" ry="1.5" fill="#C49060"/>
        <ellipse cx="16.5" cy="113.5" rx="2" ry="1.5" fill="#C49060"/>
        {/* Clipboard */}
        <rect x="0" y="94" width="22" height="28" rx="3.5" fill="#E8D5A3" stroke="#C4A060" strokeWidth="1.2"/>
        <rect x="7" y="92" width="13" height="6" rx="3" fill="#A08040"/>
        <line x1="4" y1="104" x2="18" y2="104" stroke="#9C835A" strokeWidth="1.2"/>
        <line x1="4" y1="108.5" x2="18" y2="108.5" stroke="#9C835A" strokeWidth="1.2"/>
        <line x1="4" y1="113" x2="18" y2="113" stroke="#9C835A" strokeWidth="1.2"/>
        <line x1="4" y1="117.5" x2="13" y2="117.5" stroke="#9C835A" strokeWidth="1.2"/>

        {/* ── Right arm + pencil ── */}
        <ellipse cx="77" cy="108" rx="10" ry="7" fill={hoodieColor} transform="rotate(25 77 108)"/>
        {/* Paw */}
        <ellipse cx="86" cy="117" rx="8" ry="6" fill="#D4A574"/>
        {/* Pencil */}
        <g transform="rotate(18 87 100)">
          <rect x="84" y="93" width="6" height="25" rx="1.2" fill="#FFD700"/>
          <rect x="84" y="93" width="6" height="5" rx="1.2" fill="#E8E8E8"/>
          <polygon points="84,118 90,118 87,124" fill="#F97316"/>
          <line x1="87" y1="118" x2="87" y2="124" stroke="#CC5500" strokeWidth="0.8"/>
        </g>

        {/* ── Coin stack ── */}
        <ellipse cx="82" cy="133" rx="11" ry="4" fill="#B45309"/>
        <ellipse cx="82" cy="129" rx="11" ry="4" fill="#D97706"/>
        <ellipse cx="82" cy="125" rx="11" ry="4" fill="#F59E0B"/>
        <ellipse cx="82" cy="122" rx="11" ry="4" fill="#FCD34D"/>
        <text x="82" y="125.5" textAnchor="middle" fontSize="5.5" fontWeight="bold" fill="#92400E">¥</text>

        {/* ── Head ── */}
        {/* Ears */}
        <polygon points="25,23 18,5 36,19" fill="#B0B8C5"/>
        <polygon points="26,21 20,8 35,19" fill="#FBBFD0" opacity="0.8"/>
        <polygon points="75,23 82,5 64,19" fill="#B0B8C5"/>
        <polygon points="74,21 80,8 65,19" fill="#FBBFD0" opacity="0.8"/>

        {/* Head */}
        <ellipse cx="50" cy="46" rx="30" ry="29" fill="#D1D9E6"/>
        {/* Fur texture top */}
        <ellipse cx="50" cy="28" rx="22" ry="13" fill="#B8C2D4" opacity="0.45"/>

        {/* ── Glasses ── */}
        {/* Left lens frame */}
        <circle cx="35" cy="47" r="13" fill="rgba(191,219,254,0.18)" stroke="#1C1B2E" strokeWidth="2.8"/>
        {/* Right lens frame */}
        <circle cx="57" cy="47" r="13" fill="rgba(191,219,254,0.18)" stroke="#1C1B2E" strokeWidth="2.8"/>
        {/* Bridge */}
        <path d="M48 47 Q52 44 56 47" stroke="#1C1B2E" strokeWidth="2.2" fill="none"/>
        {/* Left temple */}
        <line x1="22" y1="45" x2="16" y2="43" stroke="#1C1B2E" strokeWidth="2.2" strokeLinecap="round"/>
        {/* Right temple */}
        <line x1="70" y1="45" x2="76" y2="43" stroke="#1C1B2E" strokeWidth="2.2" strokeLinecap="round"/>
        {/* Lens glare */}
        <path d="M27 40 Q30 37 33 40" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M49 40 Q52 37 55 40" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

        {/* ── Eyes (inside glasses) ── */}
        {eyes[currentMood]}

        {/* Nose */}
        <ellipse cx="46" cy="56" rx="3.2" ry="2.2" fill="#F87171"/>

        {/* Mouth */}
        {mouths[currentMood]}

        {/* Blush */}
        <ellipse cx="24" cy="62" rx="7" ry="4" fill="#FCA5A5" opacity="0.4"/>
        <ellipse cx="76" cy="62" rx="7" ry="4" fill="#FCA5A5" opacity="0.4"/>

        {/* Whiskers */}
        <line x1="10" y1="55" x2="30" y2="57" stroke="#64748B" strokeWidth="0.9" opacity="0.55"/>
        <line x1="10" y1="59" x2="30" y2="59" stroke="#64748B" strokeWidth="0.9" opacity="0.55"/>
        <line x1="70" y1="57" x2="90" y2="55" stroke="#64748B" strokeWidth="0.9" opacity="0.55"/>
        <line x1="70" y1="59" x2="90" y2="59" stroke="#64748B" strokeWidth="0.9" opacity="0.55"/>
      </svg>
    </div>
  )
}
