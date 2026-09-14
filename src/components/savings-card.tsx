import { ArrowRight } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { completeMonthlyKwh } from "@/lib/solar/calc";
import { LIFETIME, UTILITY_INFLATION } from "@/lib/solar/panels";
import { usageKwhFromBill } from "@/lib/solar/utility";
import { cn, formatKwh, formatNumber, formatUsd } from "@/lib/utils";
import { useDesigner, useSavings } from "@/store/designer";

const SavingsChart = lazy(() => import("@/components/savings-chart").then((m) => ({ default: m.SavingsChart })));

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function SavingsCard() {
  const monthlyBill = useDesigner((s) => s.monthlyBill);
  const setMonthlyBill = useDesigner((s) => s.setMonthlyBill);
  const billMode = useDesigner((s) => s.billMode);
  const setBillMode = useDesigner((s) => s.setBillMode);
  const monthlyKwhInput = useDesigner((s) => s.monthlyKwhInput);
  const setMonthlyKwhMonth = useDesigner((s) => s.setMonthlyKwhMonth);
  const location = useDesigner((s) => s.location);
  const sizeToBill = useDesigner((s) => s.sizeToBill);
  const setWantBackup = useDesigner((s) => s.setWantBackup);
  const s = useSavings();
  const navigate = useNavigate();
  const hasSystem = s.panelCount > 0;
  const ready = hasSystem && !!location;
  const [billDraft, setBillDraft] = useState(String(monthlyBill || ""));

  useEffect(() => {
    if (document.activeElement?.id !== "bill") setBillDraft(monthlyBill ? String(monthlyBill) : "");
  }, [monthlyBill]);

  const predictedKwh = completeMonthlyKwh(
    monthlyKwhInput,
    location?.lat ?? 27,
    location?.climate ?? "hot",
    usageKwhFromBill(monthlyBill, location?.rate ?? 0.15, location?.customerCharge ?? 0),
  );
  const filledKwh = monthlyKwhInput.filter((v) => v != null).length;
  const chartData = MONTH_LABELS.map((month, i) => ({
    month,
    kwh: Math.round(s.monthlyKwh[i] ?? 0),
    currentBill: Math.round(s.currentBills[i] ?? 0),
    newBill: Math.round(s.solarBills[i] ?? 0),
  }));

  return (
    <Card className="helio-savings-card w-full">
      <CardHeader>
        <h1 className="font-display text-lg font-semibold tracking-tight">System Sizing and Savings</h1>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-surface-2 p-1 ring-1 ring-border">
          <Button
            type="button"
            size="sm"
            variant={billMode === "bill" ? "gold" : "ghost"}
            className="h-auto whitespace-normal px-2 py-2 text-xs leading-tight"
            aria-pressed={billMode === "bill"}
            onClick={() => setBillMode("bill")}
          >
            Average Monthly Electric Bill
          </Button>
          <Button
            type="button"
            size="sm"
            variant={billMode === "kwh" ? "gold" : "ghost"}
            className="h-auto whitespace-normal px-2 py-2 text-xs leading-tight"
            aria-pressed={billMode === "kwh"}
            onClick={() => setBillMode("kwh")}
          >
            Monthly kWh Usage
          </Button>
        </div>
        {billMode === "bill" ? (
          <>
            <p id="bill-hint" className="text-xs leading-snug text-muted-foreground">
              Enter your average monthly electric bill amount. Try to be as accurate as possible so the design is
              true. Or, you can input Monthly kWh Usage by clicking that toggle.
            </p>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground" aria-hidden>
                $
              </span>
              <Input
                id="bill"
                inputMode="decimal"
                className="pl-7"
                aria-label="Average monthly electric bill"
                aria-describedby="bill-hint"
                value={billDraft}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d.]/g, "");
                  setBillDraft(raw);
                  if (raw === "" || raw === ".") {
                    setMonthlyBill(0);
                    return;
                  }
                  const n = Number(raw);
                  if (Number.isFinite(n)) setMonthlyBill(n);
                }}
              />
            </div>
          </>
        ) : (
          <>
            <p className="text-xs leading-snug text-muted-foreground">
              Enter any monthly kWh usage numbers you have. These will be shown in a chart on your utility bill. Empty
              months are estimated from this ZIP’s seasonal usage and your utility rate
              {location?.utilityName ? ` (${location.utilityName})` : ""}.
            </p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {MONTH_LABELS.map((label, i) => {
                const entered = monthlyKwhInput[i];
                const predicted = predictedKwh[i] ?? 0;
                return (
                  <label key={label} className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">{label}</span>
                    <Input
                      inputMode="numeric"
                      className={cn("h-9 px-2 text-sm tabular-nums", entered == null && filledKwh > 0 && "text-muted-foreground")}
                      value={entered ?? ""}
                      placeholder={predicted > 0 ? String(Math.round(predicted)) : "kWh"}
                      onChange={(e) => {
                        const raw = e.target.value.trim();
                        if (!raw) {
                          setMonthlyKwhMonth(i, null);
                          return;
                        }
                        const n = Number(raw);
                        setMonthlyKwhMonth(i, Number.isFinite(n) && n >= 0 ? n : null);
                      }}
                    />
                  </label>
                );
              })}
            </div>
            <p className="font-num text-sm font-medium">
              Avg Bill {formatUsd(monthlyBill)}
              <span className="font-normal text-muted-foreground">
                {" "}
                · {formatKwh(predictedKwh.reduce((a, b) => a + b, 0) / 12)} / mo
              </span>
            </p>
          </>
        )}

        <Button
          type="button"
          className="w-full"
          onClick={sizeToBill}
          disabled={!(location && (location.ghi || location.zipGhi) > 0.5) || monthlyBill <= 0}
        >
          Size Solar System To My Bill
        </Button>
        {!location?.zip ? (
          <p className="text-xs text-muted-foreground">Enter an address or ZIP first so sizing uses NASA sun hours for that home.</p>
        ) : null}

        <Separator />

        <div className="grid grid-cols-2 gap-3">
          <BigStat label="First-Year Savings" value={hasSystem && s.annualKwh > 0 ? formatUsd(s.yearOneSavings) : "—"} />
          <BigStat
            label={`${LIFETIME}-Year Net Savings`}
            value={hasSystem && s.annualKwh > 0 ? formatUsd(s.lifetimeNet) : "—"}
            emphasize
          />
        </div>

        <dl className="flex flex-col text-sm">
          <Row label="System Size" value={s.panelCount ? `${formatNumber(s.systemKw, 2)} kW` : "—"} />
          <Row label="Panels" value={s.panelCount ? String(s.panelCount) : "—"} />
          <Row label="Annual Production" value={hasSystem && s.annualKwh > 0 ? formatKwh(s.annualKwh) : "—"} />
          <Row label="Bill Offset" value={hasSystem ? `${Math.round(s.offsetPct * 100)}%` : "—"} />
          <Row label="Estimated Installed Price" value={s.panelCount ? `${formatUsd(s.costLow)} – ${formatUsd(s.costHigh)}` : "—"} />
          <Row
            label="Payback"
            value={
              hasSystem && Number.isFinite(s.paybackLow) && Number.isFinite(s.paybackHigh)
                ? `${formatNumber(s.paybackLow, 1)}–${formatNumber(s.paybackHigh, 1)} yrs`
                : "—"
            }
          />
        </dl>

        {hasSystem && s.annualKwh > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-center font-display text-sm font-semibold tracking-tight">Estimated Monthly Solar Production</p>
            <Suspense fallback={<div className="h-52 rounded-md bg-muted/60" />}>
              <SavingsChart data={chartData} />
            </Suspense>
            <p className="text-xs text-muted-foreground">
              Bars are estimated AC production (kWh). Today’s bill follows seasonal usage
              {location ? " for this ZIP" : " (typical sunbelt year)"} (air-conditioning and heating), scaled to your
              average. The solid line is what’s left after that month’s generation.
            </p>
          </div>
        ) : null}

        <p className="text-xs leading-relaxed text-muted-foreground">
          Uses typical-year irradiance and EIA residential rates. Installed price is shown as a range. {LIFETIME}-year
          net savings uses the midpoint of that range ({ready ? formatUsd(s.costMid) : "—"}), 0.4% annual degradation, and
          {` ${Math.round(UTILITY_INFLATION * 100)}%`} utility inflation. Not a bid or guarantee.
        </p>

        {ready ? (
          <div className="flex flex-col gap-3">
            <p className="text-center text-sm font-medium">Want backup batteries with this system?</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                size="lg"
                className="w-full"
                onClick={() => {
                  setWantBackup(true);
                  void navigate({ to: "/batteries" });
                }}
              >
                Yes, size batteries
                <ArrowRight className="size-4" />
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setWantBackup(false);
                  void navigate({ to: "/contact" });
                }}
              >
                No — contact Adam
              </Button>
            </div>
          </div>
        ) : (
          <Button size="lg" className="w-full" disabled>
            Size a system to continue
            <ArrowRight />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function BigStat({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className={cn("rounded-lg bg-muted/70 px-3 py-2", emphasize && "ring-1 ring-primary/40")}>
      <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="font-num text-lg font-semibold">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-0.5 py-2 sm:mx-auto sm:w-[75%] sm:flex-row sm:items-baseline sm:gap-2">
      <dt className="text-muted-foreground sm:shrink-0">{label}</dt>
      <span className="mb-1 hidden min-w-3 flex-1 border-b border-dotted border-primary/80 sm:block" aria-hidden />
      <dd className="font-num font-medium break-words sm:shrink-0">{value}</dd>
    </div>
  );
}
