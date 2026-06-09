export function Header() {
  return (
    <header className="w-full pb-5 md:pb-8 text-center border-b-2" style={{ borderColor: 'var(--border)' }}>
      <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-tight" style={{ color: 'var(--text)' }}>
        Daiva & Nath
      </h1>

      {/* Bohemian botanical divider */}
      <div className="flex items-center justify-center gap-3 mt-3 mb-1 mx-4 md:mx-auto" style={{ maxWidth: '500px' }}>

        {/* Left botanical arm */}
        <svg width="160" height="28" viewBox="0 0 160 28" fill="none" aria-hidden="true" className="flex-1 min-w-0">
          <line x1="160" y1="14" x2="0" y2="14" stroke="var(--border)" strokeWidth="0.8" opacity="0.5"/>
          {/* leaf pair 1 — closest to center */}
          <ellipse cx="130" cy="10" rx="12" ry="3.8" fill="var(--border)" opacity="0.48" transform="rotate(18 130 10)"/>
          <ellipse cx="130" cy="18" rx="12" ry="3.8" fill="var(--border)" opacity="0.48" transform="rotate(-18 130 18)"/>
          {/* leaf pair 2 */}
          <ellipse cx="96" cy="9"  rx="10" ry="3.2" fill="var(--accent)" opacity="0.35" transform="rotate(22 96 9)"/>
          <ellipse cx="96" cy="19" rx="10" ry="3.2" fill="var(--accent)" opacity="0.35" transform="rotate(-22 96 19)"/>
          {/* leaf pair 3 — near tip */}
          <ellipse cx="63" cy="10" rx="8"  ry="2.6" fill="var(--border)" opacity="0.4"  transform="rotate(28 63 10)"/>
          <ellipse cx="63" cy="18" rx="8"  ry="2.6" fill="var(--border)" opacity="0.4"  transform="rotate(-28 63 18)"/>
          {/* berry cluster at tip */}
          <circle cx="10" cy="12" r="3"   fill="var(--blush)" opacity="0.65"/>
          <circle cx="7"  cy="18" r="2"   fill="var(--blush)" opacity="0.45"/>
          <circle cx="18" cy="18" r="2"   fill="var(--blush)" opacity="0.45"/>
        </svg>

        {/* Right botanical arm — mirror of left */}
        <svg width="160" height="28" viewBox="0 0 160 28" fill="none" aria-hidden="true" className="flex-1 min-w-0" style={{ transform: 'scaleX(-1)' }}>
          <line x1="160" y1="14" x2="0" y2="14" stroke="var(--border)" strokeWidth="0.8" opacity="0.5"/>
          <ellipse cx="130" cy="10" rx="12" ry="3.8" fill="var(--border)" opacity="0.48" transform="rotate(18 130 10)"/>
          <ellipse cx="130" cy="18" rx="12" ry="3.8" fill="var(--border)" opacity="0.48" transform="rotate(-18 130 18)"/>
          <ellipse cx="96" cy="9"  rx="10" ry="3.2" fill="var(--accent)" opacity="0.35" transform="rotate(22 96 9)"/>
          <ellipse cx="96" cy="19" rx="10" ry="3.2" fill="var(--accent)" opacity="0.35" transform="rotate(-22 96 19)"/>
          <ellipse cx="63" cy="10" rx="8"  ry="2.6" fill="var(--border)" opacity="0.4"  transform="rotate(28 63 10)"/>
          <ellipse cx="63" cy="18" rx="8"  ry="2.6" fill="var(--border)" opacity="0.4"  transform="rotate(-28 63 18)"/>
          <circle cx="10" cy="12" r="3"   fill="var(--blush)" opacity="0.65"/>
          <circle cx="7"  cy="18" r="2"   fill="var(--blush)" opacity="0.45"/>
          <circle cx="18" cy="18" r="2"   fill="var(--blush)" opacity="0.45"/>
        </svg>
      </div>

      <p className="font-body text-xs md:text-sm mt-1 tracking-widest uppercase opacity-55" style={{ color: 'var(--text)' }}>
        Nuestro Baúl de Recuerdos
      </p>
    </header>
  )
}
