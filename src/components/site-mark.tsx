export function SiteMark({ className }: { className?: string }) {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4 - Math.PI / 2;
    const inner = 7.35;
    const outer = 15.1;
    const spread = 0.2;
    const x = (r: number, off = 0) => 16 + Math.cos(a + off) * r;
    const y = (r: number, off = 0) => 16 + Math.sin(a + off) * r;
    return (
      <polygon
        key={i}
        points={`${x(inner, -spread)},${y(inner, -spread)} ${x(outer)},${y(outer)} ${x(inner, spread)},${y(inner, spread)}`}
        fill="currentColor"
      />
    );
  });

  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <circle className="sun-halo" cx="16" cy="16" r="15.2" fill="currentColor" />
      {rays}
      <circle cx="16" cy="16" r="6.5" fill="currentColor" />
      <circle cx="16" cy="16" r="2.9" fill="#fff6e4" />
    </svg>
  );
}