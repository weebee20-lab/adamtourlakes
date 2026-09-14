const KEY = "adam-quote-handoff";

export type QuoteHandoff = {
  label: string;
  zip: string;
  monthlyBill: number;
  wantBackup: boolean;
};

export function writeQuoteHandoff(next: QuoteHandoff) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(next));
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
    return {
      label: String(parsed.label ?? ""),
      zip: String(parsed.zip ?? ""),
      monthlyBill: Number(parsed.monthlyBill) || 0,
      wantBackup: Boolean(parsed.wantBackup),
    };
  } catch {
    return null;
  }
}