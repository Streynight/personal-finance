import React from 'react'

/**
 * MoneyPaw Mascot — น้องแมวเหรียญ 🐱💰
 * Cute animated cat holding a gold coin
 */
export default function Mascot({ size = 80, mood = 'happy', animate = true }) {
  const s = size
  const eyeStyle = animate
    ? { animation: 'blink 4s ease-in-out infinite' }
    : {}
  const floatStyle = animate
    ? { animation: 'float 3s ease-in-out infinite', display: 'inline-block' }
    : { display: 'inline-block' }
  const tailStyle = animate
    ? { animation: 'tailWag 1.5s ease-in-out infinite', transformOrigin: 'top left' }
    : {}

  const moodMouth = {
    happy:  <path d="M36 52 Q40 57 44 52" stroke="#5C3D2E" strokeWidth="1.8" fill="none" strokeLinecap="round" />,
    loading:<path d="M36 54 Q40 54 44 54" stroke="#5C3D2E" strokeWidth="1.8" fill="none" strokeLinecap="round" />,
    sad:    <path d="M36 56 Q40 52 44 56" stroke="#5C3D2E" strokeWidth="1.8" fill="none" strokeLinecap="round" />,
  }

  return (
    <div style={floatStyle}>
      <svg
        width={s}
        height={s}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="MoneyPaw mascot"
      >
        {/* Shadow */}
        <ellipse cx="40" cy="76" rx="18" ry="4" fill="#000" opacity="0.15" />

        {/* Body */}
        <ellipse cx="40" cy="58" rx="18" ry="14" fill="#F4C842" />

        {/* Belly patch */}
        <ellipse cx="40" cy="60" rx="10" ry="9" fill="#FDE68A" />

        {/* Tail */}
        <g style={tailStyle}>
          <path
            d="M58 62 Q72 58 70 72 Q66 76 62 70 Q68 68 66 62 Q62 58 58 62Z"
            fill="#F4C842"
          />
        </g>

        {/* Head */}
        <circle cx="40" cy="34" r="20" fill="#F4C842" />

        {/* Left ear */}
        <polygon points="22,20 16,6 30,16" fill="#F4C842" />
        <polygon points="23,19 18,9 29,17" fill="#FCA5A5" />

        {/* Right ear */}
        <polygon points="58,20 64,6 50,16" fill="#F4C842" />
        <polygon points="57,19 62,9 51,17" fill="#FCA5A5" />

        {/* Eyes */}
        <g style={eyeStyle}>
          <ellipse cx="33" cy="34" rx="4" ry="4.5" fill="#2D1B0E" />
          <ellipse cx="47" cy="34" rx="4" ry="4.5" fill="#2D1B0E" />
          {/* Eye shine */}
          <circle cx="35" cy="32" r="1.2" fill="white" />
          <circle cx="49" cy="32" r="1.2" fill="white" />
        </g>

        {/* Blush */}
        <ellipse cx="27" cy="40" rx="4" ry="2.5" fill="#FCA5A5" opacity="0.6" />
        <ellipse cx="53" cy="40" rx="4" ry="2.5" fill="#FCA5A5" opacity="0.6" />

        {/* Nose */}
        <ellipse cx="40" cy="42" rx="2" ry="1.4" fill="#F87171" />

        {/* Mouth */}
        {moodMouth[mood] || moodMouth.happy}

        {/* Whiskers left */}
        <line x1="20" y1="41" x2="34" y2="43" stroke="#5C3D2E" strokeWidth="1" opacity="0.5" />
        <line x1="20" y1="44" x2="34" y2="44" stroke="#5C3D2E" strokeWidth="1" opacity="0.5" />

        {/* Whiskers right */}
        <line x1="46" y1="43" x2="60" y2="41" stroke="#5C3D2E" strokeWidth="1" opacity="0.5" />
        <line x1="46" y1="44" x2="60" y2="44" stroke="#5C3D2E" strokeWidth="1" opacity="0.5" />

        {/* Gold coin held by paw */}
        <circle cx="56" cy="55" r="9" fill="#F59E0B" />
        <circle cx="56" cy="55" r="7" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1" />
        <text x="56" y="59" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#92400E">¥</text>

        {/* Paw on coin */}
        <ellipse cx="52" cy="58" rx="4" ry="3" fill="#F4C842" />
        <ellipse cx="50" cy="56.5" rx="1.5" ry="1.2" fill="#FDE68A" />
        <ellipse cx="52.5" cy="55.5" rx="1.5" ry="1.2" fill="#FDE68A" />
        <ellipse cx="55" cy="56" rx="1.5" ry="1.2" fill="#FDE68A" />
      </svg>
    </div>
  )
}
