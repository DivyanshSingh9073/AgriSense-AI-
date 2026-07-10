/**
 * Abstract "field + AI overlay" scene built from layered SVG shapes rather
 * than a photo — keeps the hero on-brand with the design tokens, needs no
 * external asset, and never breaks on a slow network.
 */
export function HeroIllustration() {
  return (
    <svg viewBox="0 0 480 420" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of a field monitored by AI">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EBF5F7" />
          <stop offset="100%" stopColor="#FBF3E3" />
        </linearGradient>
        <linearGradient id="field1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2A6B54" />
          <stop offset="100%" stopColor="#1F4D3A" />
        </linearGradient>
        <linearGradient id="field2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3FA34C" />
          <stop offset="100%" stopColor="#2F8A3C" />
        </linearGradient>
      </defs>

      <rect width="480" height="420" rx="24" fill="url(#sky)" />

      {/* Sun */}
      <circle cx="380" cy="80" r="34" fill="#D9A441" opacity="0.85" />

      {/* Rolling field bands */}
      <path d="M0 260 Q120 220 240 260 T480 260 V420 H0 Z" fill="url(#field1)" />
      <path d="M0 300 Q120 270 240 300 T480 300 V420 H0 Z" fill="url(#field2)" opacity="0.9" />
      <path d="M0 340 Q120 320 240 340 T480 340 V420 H0 Z" fill="#8B5E34" opacity="0.35" />

      {/* Crop rows */}
      {Array.from({ length: 10 }).map((_, i) => (
        <line
          key={i}
          x1={20 + i * 46}
          y1={380}
          x2={5 + i * 46}
          y2={310}
          stroke="#EAF3EF"
          strokeWidth="2"
          opacity="0.25"
        />
      ))}

      {/* Scan grid overlay, representing AI analysis */}
      <g opacity="0.55">
        <rect x="60" y="150" width="180" height="120" rx="12" stroke="#D9A441" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
        <line x1="60" y1="190" x2="240" y2="190" stroke="#D9A441" strokeWidth="1" opacity="0.6" />
        <line x1="60" y1="230" x2="240" y2="230" stroke="#D9A441" strokeWidth="1" opacity="0.6" />
        <line x1="120" y1="150" x2="120" y2="270" stroke="#D9A441" strokeWidth="1" opacity="0.6" />
        <line x1="180" y1="150" x2="180" y2="270" stroke="#D9A441" strokeWidth="1" opacity="0.6" />
      </g>

      {/* Floating data node */}
      <circle cx="150" cy="210" r="6" fill="#D9A441" />
      <circle cx="150" cy="210" r="12" stroke="#D9A441" strokeWidth="1.5" opacity="0.5" />

      {/* Leaf marker (crop health) */}
      <g transform="translate(330 190)">
        <circle cx="0" cy="0" r="30" fill="#FFFFFF" opacity="0.9" />
        <path
          d="M0 15C-10 15 -16 5 -14 -8C-2 -10 8 -4 8 8C8 12 4 15 0 15Z"
          fill="#3FA34C"
        />
      </g>
    </svg>
  );
}
