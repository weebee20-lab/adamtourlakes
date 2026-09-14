export function SiteMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <defs>
        <filter id="sun-core-glow" x="-90%" y="-90%" width="280%" height="280%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.35" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="sun-ray-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        const x1 = 16 + Math.cos(a) * 7.2;
        const y1 = 16 + Math.sin(a) * 7.2;
        const x2 = 16 + Math.cos(a) * 14.6;
        const y2 = 16 + Math.sin(a) * 14.6;
        return (
          <line
            key={i}
            className="sun-ray"
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="2.15"
            strokeLinecap="round"
            filter="url(#sun-ray-glow)"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        );
      })}
      <circle cx="16" cy="16" r="6.15" fill="currentColor" filter="url(#sun-core-glow)" />
      <circle cx="16" cy="16" r="2.65" fill="#fff6e4" filter="url(#sun-core-glow)" />
    </svg>
  );
}