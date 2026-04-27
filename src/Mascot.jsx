import React from 'react'

// Mascot moods map to different expressions
export default function Mascot({ size = 120, mood = 'happy', animate = true }) {
  const floatAnim = animate ? { animation: 'mascotFloat 3s ease-in-out infinite' } : {}
  const blinkAnim = animate ? { animation: 'mascotBlink 5s ease-in-out infinite' } : {}

  // Eyes based on mood
  const eyes = {
    happy: (
      <>
        {/* Left eye - happy curved */}
        <ellipse cx="34" cy="46" rx="5" ry="5.5" fill="#1a1a2e" />
        <circle cx="36" cy="44" r="1.5" fill="white" />
        {/* Right eye - winking */}
        <path d="M52 44 Q56 42 60 44" stroke="#1a1a2e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M52 46 Q56 44 60 46" stroke="#1a1a2e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </>
    ),
    thinking: (
      <>
        <ellipse cx="34" cy="46" rx="5" ry="5.5" fill="#1a1a2e" />
        <circle cx="36" cy="44" r="1.5" fill="white" />
        <ellipse cx="56" cy="46" rx="5" ry="5.5" fill="#1a1a2e" />
        <circle cx="58" cy="44" r="1.5" fill="white" />
        {/* thought dots */}
        <circle cx="72" cy="32" r="2" fill="#94a3b8" />
        <circle cx="77" cy="26" r="2.5" fill="#94a3b8" />
        <circle cx="83" cy="19" r="3.5" fill="#94a3b8" opacity="0.6" />
      </>
    ),
    loading: (
      <>
        <ellipse cx="34" cy="46" rx="5" ry="3" fill="#1a1a2e" style={blinkAnim} />
        <ellipse cx="56" cy="46" rx="5" ry="3" fill="#1a1a2e" style={blinkAnim} />
      </>
    ),
    excited: (
      <>
        <ellipse cx="34" cy="46" rx="5.5" ry="6" fill="#1a1a2e" />
        <circle cx="36.5" cy="43.5" r="2" fill="white" />
        <ellipse cx="56" cy="46" rx="5.5" ry="6" fill="#1a1a2e" />
        <circle cx="58.5" cy="43.5" r="2" fill="white" />
        {/* sparkles */}
        <text x="68" y="34" fontSize="8">✨</text>
      </>
    ),
    sad: (
      <>
        <ellipse cx="34" cy="48" rx="5" ry="5.5" fill="#1a1a2e" />
        <circle cx="36" cy="46" r="1.5" fill="white" />
        <ellipse cx="56" cy="48" rx="5" ry="5.5" fill="#1a1a2e" />
        <circle cx="58" cy="46" r="1.5" fill="white" />
      </>
    ),
  }

  const mouth = {
    happy:    <path d="M38 57 Q45 63 52 57" stroke="#8b4513" strokeWidth="2" fill="none" strokeLinecap="round" />,
    thinking: <path d="M40 58 Q45 56 50 58" stroke="#8b4513" strokeWidth="2" fill="none" strokeLinecap="round" />,
    loading:  <path d="M40 59 Q45 59 50 59" stroke="#8b4513" strokeWidth="1.5" fill="none" strokeLinecap="round" />,
    excited:  <path d="M37 56 Q45 65 53 56" stroke="#8b4513" strokeWidth="2.2" fill="none" strokeLinecap="round" />,
    sad:      <path d="M40 60 Q45 56 50 60" stroke="#8b4513" strokeWidth="2" fill="none" strokeLinecap="round" />,
  }

  return (
    <div style={{ display: 'inline-block', ...floatAnim }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Body: Blue hoodie ── */}
        <ellipse cx="50" cy="112" rx="30" ry="22" fill="#2563EB" />
        {/* Hoodie center seam */}
        <line x1="50" y1="90" x2="50" y2="128" stroke="#1D4ED8" strokeWidth="1.5" />
        {/* Hoodie pocket */}
        <rect x="35" y="108" width="30" height="16" rx="5" fill="#1D4ED8" opacity="0.5" />
        {/* Hoodie icon: bar chart */}
        <rect x="43" y="113" width="3" height="7" rx="1" fill="#60A5FA" />
        <rect x="47.5" y="110" width="3" height="10" rx="1" fill="#60A5FA" />
        <rect x="52" y="115" width="3" height="5" rx="1" fill="#60A5FA" />
        {/* Arrow up */}
        <path d="M57 114 L60 110 L63 114" stroke="#60A5FA" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
        <line x1="60" y1="110" x2="60" y2="117" stroke="#60A5FA" strokeWidth="1.5" />

        {/* Paws / arms */}
        {/* Left arm holding clipboard */}
        <ellipse cx="24" cy="105" rx="9" ry="6" fill="#2563EB" transform="rotate(-20 24 105)" />
        <ellipse cx="17" cy="113" rx="7" ry="5" fill="#d4a06a" transform="rotate(-10 17 113)" />
        {/* Clipboard */}
        <rect x="4" y="95" width="20" height="26" rx="3" fill="#e8d5b0" stroke="#c4a46a" strokeWidth="1" />
        <rect x="8" y="93" width="12" height="5" rx="2" fill="#b8956a" />
        <line x1="8" y1="103" x2="20" y2="103" stroke="#8b7355" strokeWidth="1" />
        <line x1="8" y1="107" x2="20" y2="107" stroke="#8b7355" strokeWidth="1" />
        <line x1="8" y1="111" x2="20" y2="111" stroke="#8b7355" strokeWidth="1" />
        <line x1="8" y1="115" x2="16" y2="115" stroke="#8b7355" strokeWidth="1" />

        {/* Right arm with pencil */}
        <ellipse cx="76" cy="105" rx="9" ry="6" fill="#2563EB" transform="rotate(20 76 105)" />
        <ellipse cx="82" cy="112" rx="7" ry="5" fill="#d4a06a" transform="rotate(10 82 112)" />
        {/* Pencil */}
        <rect x="85" y="95" width="5" height="22" rx="1" fill="#FFD700" transform="rotate(15 85 95)" />
        <polygon points="88,116 90,116 89,121" fill="#f97316" transform="rotate(15 89 118)" />
        <rect x="85" y="95" width="5" height="4" rx="1" fill="#E2E8F0" transform="rotate(15 85 95)" />

        {/* ── Head ── */}
        {/* Ears */}
        <polygon points="24,22 18,5 35,18" fill="#9ca3af" />
        <polygon points="26,21 21,9 34,18" fill="#f9a8d4" opacity="0.7" />
        <polygon points="76,22 82,5 65,18" fill="#9ca3af" />
        <polygon points="74,21 79,9 66,18" fill="#f9a8d4" opacity="0.7" />

        {/* Head base */}
        <ellipse cx="50" cy="45" rx="28" ry="27" fill="#d1d5db" />

        {/* Forehead fur gradient */}
        <ellipse cx="50" cy="30" rx="20" ry="12" fill="#9ca3af" opacity="0.4" />

        {/* ── Glasses ── */}
        {/* Left lens */}
        <circle cx="34" cy="46" r="11" fill="none" stroke="#1a1a2e" strokeWidth="2.5" />
        <circle cx="34" cy="46" r="11" fill="#bfdbfe" opacity="0.15" />
        {/* Right lens */}
        <circle cx="56" cy="46" r="11" fill="none" stroke="#1a1a2e" strokeWidth="2.5" />
        <circle cx="56" cy="46" r="11" fill="#bfdbfe" opacity="0.15" />
        {/* Bridge */}
        <path d="M45 46 Q50 43 55 46" stroke="#1a1a2e" strokeWidth="2" fill="none" />
        {/* Left arm */}
        <line x1="23" y1="44" x2="17" y2="43" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
        {/* Right arm */}
        <line x1="67" y1="44" x2="73" y2="43" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />

        {/* ── Eyes (inside glasses) ── */}
        {eyes[mood] || eyes.happy}

        {/* Nose */}
        <ellipse cx="50" cy="54" rx="3" ry="2" fill="#f87171" />

        {/* Mouth */}
        {mouth[mood] || mouth.happy}

        {/* Whiskers left */}
        <line x1="14" y1="53" x2="32" y2="55" stroke="#6b7280" strokeWidth="0.8" opacity="0.6" />
        <line x1="14" y1="57" x2="32" y2="57" stroke="#6b7280" strokeWidth="0.8" opacity="0.6" />
        {/* Whiskers right */}
        <line x1="68" y1="55" x2="86" y2="53" stroke="#6b7280" strokeWidth="0.8" opacity="0.6" />
        <line x1="68" y1="57" x2="86" y2="57" stroke="#6b7280" strokeWidth="0.8" opacity="0.6" />

        {/* Blush */}
        <ellipse cx="24" cy="60" rx="6" ry="3.5" fill="#fca5a5" opacity="0.45" />
        <ellipse cx="76" cy="60" rx="6" ry="3.5" fill="#fca5a5" opacity="0.45" />

        {/* Coin stack */}
        <ellipse cx="78" cy="128" rx="10" ry="4" fill="#ca8a04" />
        <ellipse cx="78" cy="124" rx="10" ry="4" fill="#eab308" />
        <ellipse cx="78" cy="120" rx="10" ry="4" fill="#fbbf24" />
        <text x="78" y="123" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#92400e">¥</text>
      </svg>
    </div>
  )
}
