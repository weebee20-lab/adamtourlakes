export function SiteMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <circle cx="16" cy="16" r="14.5" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="16" cy="16" r="5" fill="currentColor" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        const x1 = 16 + Math.cos(a) * 8;
        const y1 = 16 + Math.sin(a) * 8;
        const x2 = 16 + Math.cos(a) * 12.5;
        const y2 = 16 + Math.sin(a) * 12.5;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}
