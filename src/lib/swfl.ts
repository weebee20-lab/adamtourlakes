/** Lee, Collier, Charlotte, Sarasota, Manatee — 339 / 341 / 342. */
const SWFL_PREFIX = ["339", "341", "342"] as const;

export function zipFromText(value: string) {
  const m = String(value ?? "").match(/\b(\d{5})(?:-\d{4})?\b/);
  return m?.[1] ?? "";
}

function digits5(zip: string) {
  return zip.replace(/\D/g, "").slice(0, 5);
}

/** true = in area, false = outside, null = no ZIP to judge. */
export function isSwflZip(zip: string): boolean | null {
  const z = digits5(zip);
  if (z.length !== 5) return null;
  return SWFL_PREFIX.some((p) => z.startsWith(p));
}

/** Florida ZIP prefixes 320–349. */
export function isFloridaZip(zip: string): boolean | null {
  const z = digits5(zip);
  if (z.length !== 5) return null;
  const n = Number(z.slice(0, 3));
  return n >= 320 && n <= 349;
}

export function isFloridaLocation(loc: { state?: string; zip?: string; label?: string }): boolean | null {
  const st = (loc.state || "").trim().toUpperCase();
  const zip = loc.zip || zipFromText(loc.label || "");
  const zipOk = zip ? isFloridaZip(zip) : null;
  if (zipOk === false) return false;
  if (st && st !== "FL" && st !== "FLORIDA") return false;
  if (zipOk === true || st === "FL" || st === "FLORIDA") return true;
  return null;
}