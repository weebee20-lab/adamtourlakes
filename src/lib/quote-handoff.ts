const KEY = "adam-quote-handoff";

export type QuoteHandoff = {
  fromCalculator: boolean;
  label: string;
  zip: string;
  monthlyBill: number;
  systemKw: number;
  panelCount: number;
  wantBackup: boolean;
  batteryId: string;
  batteryName: string;
  batteryCount: number;
};

export function writeQuoteHandoff(next: QuoteHandoff) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
}

export function clearQuoteHandoff() {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* private mode */
  }
}

export function readQuoteHandoff(): QuoteHandoff | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<QuoteHandoff>;
    const panelCount = Number(parsed.panelCount) || 0;
    const systemKw = Number(parsed.systemKw) || 0;
    return {
      fromCalculator: Boolean(parsed.fromCalculator) || panelCount > 0,
      label: String(parsed.label ?? ""),
      zip: String(parsed.zip ?? ""),
      monthlyBill: Number(parsed.monthlyBill) || 0,
      systemKw,
      panelCount,
      wantBackup: Boolean(parsed.wantBackup),
      batteryId: String(parsed.batteryId ?? ""),
      batteryName: String(parsed.batteryName ?? ""),
      batteryCount: Number(parsed.batteryCount) || 0,
    };
  } catch {
    return null;
  }
}
