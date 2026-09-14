import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { savingsAtOffset } from "@/lib/solar/calc";
import { UTILITY_INFLATION } from "@/lib/solar/panels";
import type { LocationInfo } from "@/lib/solar/types";
import { utilityFor } from "@/lib/solar/utility";
import { lookupZip } from "@/lib/solar/zip";
import { formatNumber, formatUsd, cn } from "@/lib/utils";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const ZIP = "33919";
const BILL = 250;
const OFFSET = 0.9;

function exampleLocation(): LocationInfo {
  const row = lookupZip(ZIP)!;
  const u = utilityFor(ZIP, "FL", "Lee");
  return {
    label: `${row.city}, ${row.state} ${row.zip}`,
    address: "",
    city: row.city,
    state: row.state,
    zip: row.zip,
    county: row.county,
    lat: row.lat,
    lng: row.lng,
    ghi: row.ghi,
    zipGhi: row.ghi,
    nasa: false,
    climate: row.climate,
    rate: u.rate,
    customerCharge: u.customerCharge,
    utilityName: u.utility,
    solarStrength: "Exceptional",
  };
}

const LOCATION = exampleLocation();
const SAVINGS = savingsAtOffset({ location: LOCATION, monthlyBill: BILL, offsetPct: OFFSET });

export function ExampleBill() {
  const [hover, setHover] = useState(7);
  const rate = LOCATION.rate;
  const charge = LOCATION.customerCharge;
  const year = new Date().getFullYear();

  const bars = useMemo(
    () =>
      SHORT.map((label, i) => {
        const use = rate > 0 ? Math.max(0, (SAVINGS.currentBills[i] ?? 0) - charge) / rate : 0;
        const prod = SAVINGS.monthlyKwh[i] ?? 0;
        return { label, use, grid: Math.max(0, use - prod), prod };
      }),
    [rate, charge],
  );
  const maxUse = Math.max(...bars.map((b) => b.use), 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">Fort Myers · ZIP {ZIP}</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
            A <span className="font-num">$250</span> average current bill, with and without solar.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            Same home, same FPL rate, sized to a {Math.round(OFFSET * 100)}% offset. This is an example from the same
            math as the calculator — not a quote. Hover over each bar on the graph to see the savings and bill change.
          </p>
        </div>
        <Button asChild>
          <Link to="/calculator">
            Size your own system
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-bg p-4">
          <p className="text-[10px] font-medium tracking-wide text-muted uppercase">
            25-Year Electric Cost Without Solar
          </p>
          <p className="font-num text-3xl font-semibold tabular-nums">{formatUsd(SAVINGS.withoutSolar25)}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            What this home would pay FPL over 25 years at ${BILL}/mo, with bills rising{" "}
            {Math.round(UTILITY_INFLATION * 100)}% each year.
          </p>
        </div>
        <div className="helio-with-solar-glow rounded-xl border border-gold/40 bg-bg p-4">
          <p className="text-[10px] font-medium tracking-wide text-gold uppercase">25-Year Lifetime Savings</p>
          <p className="font-num text-3xl font-semibold tabular-nums text-gold">{formatUsd(SAVINGS.lifetimeNet)}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Energy value over 25 years minus the midpoint installed price ({formatUsd(SAVINGS.costMid)}), with 0.4%
            degradation and {Math.round(UTILITY_INFLATION * 100)}% utility inflation.
          </p>
        </div>
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        <Statement
          solar={false}
          hover={hover}
          onHover={setHover}
          bars={bars}
          maxUse={maxUse}
          year={year}
          rate={rate}
          charge={charge}
        />
        <Statement
          solar
          hover={hover}
          onHover={setHover}
          bars={bars}
          maxUse={maxUse}
          year={year}
          rate={rate}
          charge={charge}
        />
      </div>

      <p className="text-sm text-muted">
        Want numbers for your roof?{" "}
        <Link to="/calculator" className="font-medium text-gold underline decoration-gold/50 underline-offset-4 hover:text-fg">
          Open the Free Solar Calculator
        </Link>
        .
      </p>
    </div>
  );
}

function Statement({
  solar,
  hover,
  onHover,
  bars,
  maxUse,
  year,
  rate,
  charge,
}: {
  solar: boolean;
  hover: number;
  onHover: (i: number) => void;
  bars: Array<{ label: string; use: number; grid: number; prod: number }>;
  maxUse: number;
  year: number;
  rate: number;
  charge: number;
}) {
  const month = MONTHS[hover] ?? "August";
  const today = SAVINGS.currentBills[hover] ?? 0;
  const solarBill = SAVINGS.solarBills[hover] ?? 0;
  const due = solar ? solarBill : today;
  const save = Math.max(0, today - solarBill);
  const usageKwh = rate > 0 ? Math.max(0, today - charge) / rate : 0;
  const prodKwh = SAVINGS.monthlyKwh[hover] ?? 0;
  const gridKwh = Math.max(0, usageKwh - prodKwh);
  const billedKwh = solar ? gridKwh : usageKwh;
  const energy = billedKwh * rate;
  const dueDay = Math.min(22, DAYS[hover] ?? 30);
  const nextMonth = MONTHS[(hover + 1) % 12];
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(maxUse * t));
  const shown = solar ? "grid" : "use";

  return (
    <article
      className={cn(
        "rounded-xl border bg-bg",
        solar ? "helio-with-solar-glow border-gold/40" : "overflow-hidden border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3 px-5 py-4">
        <div>
          <p className="font-display text-lg font-semibold tracking-tight">{LOCATION.utilityName}</p>
          <p className="text-[10px] font-semibold tracking-[0.16em] text-muted uppercase">
            {solar ? "With Solar" : "No Solar"} · Electric Service Statement
          </p>
        </div>
        <div className="text-right text-xs text-muted">
          <p>
            Account · {String(97520000 + Number(LOCATION.zip)).slice(0, 4)}-{LOCATION.zip.slice(-4)}
          </p>
          <p>
            Statement {SHORT[hover]} {dueDay}, {year}
          </p>
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">Amount Due · {month}</p>
            <p className="font-num text-4xl font-semibold tabular-nums">
              {formatUsd(due)}
              {solar ? (
                <span className="ml-2 text-lg font-medium text-gold">(Savings of {formatUsd(save)})</span>
              ) : null}
            </p>
          </div>
          <div className="text-right">
            {solar ? (
              <span className="rounded-full bg-gold/15 px-2 py-1 text-[10px] font-bold tracking-wide text-gold uppercase">
                Solar Credit Applied
              </span>
            ) : null}
            <p className="mt-1 text-xs text-muted">
              Due {nextMonth} {dueDay}, {year}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          Service address {LOCATION.city}, {LOCATION.state} {LOCATION.zip} · Billing period {SHORT[hover]} 1, {year} –{" "}
          {SHORT[hover]} {DAYS[hover]}, {year}
        </p>

        <div className="mt-4 grid items-start gap-6">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
              {solar ? "Grid kWh after solar, last 12 months" : "Grid kWh used, last 12 months"}
            </p>
            <div className="mt-2 flex gap-2">
              <div className="flex w-8 shrink-0 flex-col justify-between pb-5 text-right text-[9px] tabular-nums text-muted">
                {[...ticks].reverse().map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <div className="relative h-40">
                  {ticks.map((t) => (
                    <span
                      key={t}
                      className="absolute right-0 left-0 border-t border-border/80"
                      style={{ bottom: `${(t / maxUse) * 100}%` }}
                    />
                  ))}
                  <div className="absolute inset-0 flex items-end gap-1">
                    {bars.map((b, i) => {
                      const value = shown === "grid" ? b.grid : b.use;
                      return (
                        <button
                          key={b.label}
                          type="button"
                          className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                          onMouseEnter={() => onHover(i)}
                          onClick={() => onHover(i)}
                        >
                          <span
                            className={`w-full rounded-t-sm ${solar ? "bg-gold" : "bg-fg/70"}`}
                            style={{
                              height: `${Math.max(value > 0 ? 4 : 0, (value / maxUse) * 100)}%`,
                              opacity: i === hover ? 1 : 0.72,
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-1 flex gap-1">
                  {bars.map((b) => (
                    <span key={b.label} className="min-w-0 flex-1 text-center text-[8px] text-muted">
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">Charges this period</p>
            <dl className="mt-2 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Monthly service charge</dt>
                <dd className="font-num tabular-nums">{formatUsd(charge)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="min-w-0 text-muted">
                  Energy ({formatNumber(billedKwh, 0)} kWh @ {formatNumber(rate * 100, 1)}¢)
                </dt>
                <dd className="font-num shrink-0 tabular-nums">{formatUsd(energy)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-border pt-2 font-semibold">
                <dt>Amount due · {month}</dt>
                <dd className="font-num tabular-nums">{formatUsd(due)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-muted">
              {solar
                ? `${formatNumber(usageKwh, 0)} kWh used − ${formatNumber(prodKwh, 0)} kWh solar = ${formatNumber(gridKwh, 0)} kWh billed.`
                : `${formatNumber(billedKwh, 0)} kWh billed this period at ${LOCATION.utilityName}’s energy rate of ${formatNumber(rate * 100, 1)}¢/kWh, plus the monthly service charge.`}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}