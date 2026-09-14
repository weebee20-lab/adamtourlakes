/** Lee, Collier, Charlotte, Sarasota, Manatee — 339 / 341 / 342. */
const SWFL_PREFIX = ["339", "341", "342"] as const;

export function zipFromText(value: string) {
  const m = String(value ?? "").match(/\b(\d{5})(?:-\d{4})?\b/);
  return m?.[1] ?? "";
}

/** true = in area, false = outside, null = no ZIP to judge. */
export function isSwflZip(zip: string): boolean | null {
  const z = zip.replace(/\D/g, "").slice(0, 5);
  if (z.length !== 5) return null;
  return SWFL_PREFIX.some((p) => z.startsWith(p));
}
