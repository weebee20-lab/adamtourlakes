import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { HelioCredit } from "@/components/helio-credit";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  APPLIANCES,
  BATTERIES,
  DEFAULT_APPLIANCES,
  DUTY_MINUTES,
  avgWatts,
  batteryById,
  formatRuntime,
  minutesFor,
  peakWatts,
  simulateBackup,
} from "@/lib/solar/batteries";
import { NIGHT_SHARE } from "@/lib/solar/panels";
import { seoHead } from "@/lib/seo";
import { cn, formatNumber } from "@/lib/utils";
import { useDesigner, useSavings } from "@/store/designer";

export const Route = createFileRoute("/batteries")({
  ssr: false,
  head: () =>
    seoHead("Add Backup Power | Adam Tourlakes", "See how batteries keep this home running after sunset.", "/batteries"),
  component: BatteriesPage,
});

const DAY_HOURS = 12;

function BatteriesPage() {
  const wantBackup = useDesigner((s) => s.wantBackup);
  const batteryId = useDesigner((s) => s.batteryId);
  const setBatteryId = useDesigner((s) => s.setBatteryId);
  const batteryCount = useDesigner((s) => s.batteryCount);
  const setBatteryCount = useDesigner((s) => s.setBatteryCount);
  const monthlyBill = useDesigner((s) => s.monthlyBill);
  const location = useDesigner((s) => s.location);
  const s = useSavings();
  const [on, setOn] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(DEFAULT_APPLIANCES.map((id) => [id, true])),
  );
  const [duty, setDuty] = useState<Record<string, number>>(() =>
    Object.fromEntries(APPLIANCES.filter((a) => a.minutesPerHour != null).map((a) => [a.id, a.minutesPerHour!])),
  );
  if (!wantBackup) return <Navigate to="/calculator" />;

  const batt = batteryById(batteryId);
  const rate = location?.rate ?? 0.15;
  const dailyKwh = (monthlyBill / rate) * (12 / 365);
  const nightKwh = dailyKwh * NIGHT_SHARE;
  const storage = batt.usableKwh * batteryCount;
  const solarDay = s.annualKwh / 365;
  const continuousKw = batt.continuousKw * batteryCount;
  const selected = APPLIANCES.filter((a) => on[a.id]);
  const peakWdraw = selected.reduce((sum, a) => sum + a.watts, 0);
  const avgW = selected.reduce((sum, a) => sum + avgWatts(a, duty), 0);
  const drawKw = avgW / 1000;
  const startW = selected.reduce((max, a) => Math.max(max, a.surgeWatts + (peakWdraw - a.watts)), 0);
  const canTogether =
    selected.length > 0 && peakWdraw <= continuousKw * 1000 && startW <= peakWatts(continuousKw);
  const usingLoads = canTogether && drawKw > 0;
  const solarKw = solarDay > 0 ? solarDay / DAY_HOURS : 0;
  const nightHours = usingLoads ? storage / drawKw : nightKwh > 0 ? (storage / nightKwh) * DAY_HOURS : Infinity;
  const roll = usingLoads ? simulateBackup(storage, drawKw, solarDay) : { hours: 0, sustainable: false };
  const nightInfinite = usingLoads
    ? roll.sustainable
    : solarDay + storage >= dailyKwh && storage >= nightKwh * 0.98;
  const dayHours = roll.hours;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
      <HelioCredit />
      <header>
        <h2 className="font-display text-2xl font-semibold tracking-tight">Add Backup Power</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          In a full outage, solar and batteries work together as a microgrid. Daytime production charges the bank;
          after sunset the battery covers the share of use that happens at night — about {Math.round(NIGHT_SHARE * 100)}% of this
          home’s average day.
        </p>
      </header>

      <label className="flex flex-col gap-2 text-sm font-medium">
        Battery
        <select
          className="h-11 rounded-md border border-input bg-card px-3"
          value={batteryId}
          onChange={(e) => setBatteryId(e.target.value)}
        >
          {BATTERIES.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <span className="font-normal text-muted-foreground">{batt.blurb}</span>
      </label>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-medium">How many batteries?</p>
        <Slider className="mt-4" min={1} max={6} step={1} value={[batteryCount]} onValueChange={(v) => setBatteryCount(v[0] ?? 1)} />
        <p className="mt-2 text-sm font-num">{batteryCount} × {batt.name}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-surface-2 px-3 py-3">
            <p className="text-[10px] font-medium tracking-wide text-muted uppercase">Usable storage</p>
            <p className="font-num text-xl font-semibold">{formatNumber(storage, 1)} kWh</p>
          </div>
          <div className="rounded-lg bg-surface-2 px-3 py-3">
            <p className="text-[10px] font-medium tracking-wide text-muted uppercase">Continuous power</p>
            <p className="font-num text-xl font-semibold">{formatNumber(batt.continuousKw * batteryCount, 1)} kW</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-gold/40 bg-blue-deep/30 px-3 py-3">
          <p className="text-[10px] font-medium tracking-wide text-muted uppercase">
            {usingLoads ? "Night Runtime On These Loads" : "Night Runtime On This Bill"}
          </p>
          <p className="font-num text-3xl font-semibold text-gold">
            {nightInfinite ? "∞" : `${formatNumber(nightHours, 1)} hrs`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {nightInfinite
              ? usingLoads
                ? "Solar plus this battery covers these loads through the night, so the house can keep running after sunset."
                : "The ∞ means solar plus this battery covers a typical day’s use, including the hours after sunset, so the house can keep running without drawing from the grid."
              : usingLoads
                ? `At night these loads need ${formatNumber(drawKw, 2)} kW and the sun isn’t helping. This battery lasts about ${formatNumber(nightHours, 1)} hours.`
                : `Sized to ${formatNumber(nightKwh, 1)} kWh of after-sunset use on this bill — how much this home typically pulls overnight, when the panels are dark.`}
          </p>
        </div>
      </div>

      <ApplianceCard
        continuousKw={continuousKw}
        solarDay={solarDay}
        solarKw={solarKw}
        on={on}
        setOn={setOn}
        duty={duty}
        setDuty={setDuty}
        dayHours={dayHours}
        nightHours={nightHours}
        nightInfinite={nightInfinite}
        usingLoads={usingLoads}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild size="lg" variant="outline">
          <Link to="/calculator">
            <ArrowLeft />
            Back to sizing
          </Link>
        </Button>
        <Button asChild size="lg">
          <Link to="/contact">
            Contact Adam
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </main>
  );
}

function ApplianceCard({
  continuousKw,
  solarDay,
  solarKw,
  on,
  setOn,
  duty,
  setDuty,
  dayHours,
  nightHours,
  nightInfinite,
  usingLoads,
}: {
  continuousKw: number;
  solarDay: number;
  solarKw: number;
  on: Record<string, boolean>;
  setOn: Dispatch<SetStateAction<Record<string, boolean>>>;
  duty: Record<string, number>;
  setDuty: Dispatch<SetStateAction<Record<string, number>>>;
  dayHours: number;
  nightHours: number;
  nightInfinite: boolean;
  usingLoads: boolean;
}) {
  const contW = continuousKw * 1000;
  const peakW = peakWatts(continuousKw);

  const selected = useMemo(() => APPLIANCES.filter((a) => on[a.id]), [on]);
  const peakDraw = selected.reduce((sum, a) => sum + a.watts, 0);
  const avgDraw = selected.reduce((sum, a) => sum + avgWatts(a, duty), 0);
  const startW = selected.reduce((max, a) => Math.max(max, a.surgeWatts + (peakDraw - a.watts)), 0);
  const canTogether = peakDraw <= contW && startW <= peakW;

  const toggle = (id: string, next: boolean) => setOn((prev) => ({ ...prev, [id]: next }));

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="font-display text-lg font-semibold tracking-tight">What This Backup Can Run</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        Toggle everyday loads. This checks the bank’s continuous power, then estimates runtime after sunset (battery
        only) and during daylight (solar plus battery).
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {APPLIANCES.map((a) => {
          const active = Boolean(on[a.id]);
          const fitsPower = a.watts <= contW && a.surgeWatts <= peakW;
          const mins = minutesFor(a, duty);
          return (
            <li
              key={a.id}
              className={cn(
                "flex flex-col gap-2 rounded-lg border px-3 py-2.5",
                active && !fitsPower ? "border-red-400/40 bg-red-950/20" : "border-border bg-surface-2",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <label htmlFor={`app-${a.id}`} className="min-w-0 cursor-pointer">
                  <span className="block text-sm font-medium">{a.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {a.watts >= 1000 ? `${formatNumber(a.watts / 1000, 1)} kW` : `${a.watts} W`}
                    {a.surgeWatts > a.watts * 1.2 ? ` · starts at ${formatNumber(a.surgeWatts / 1000, 1)} kW` : ""}
                    {a.minutesPerHour != null && active
                      ? ` · averages ${formatNumber(avgWatts(a, duty) / 1000, 2)} kW`
                      : ""}
                  </span>
                </label>
                <Switch id={`app-${a.id}`} checked={active} onCheckedChange={(v) => toggle(a.id, v)} />
              </div>
              {active && a.minutesPerHour != null ? (
                <label className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>Minutes it runs each hour</span>
                  <select
                    className="h-8 rounded-md border border-input bg-card px-2 text-foreground"
                    value={mins}
                    onChange={(e) => setDuty((prev) => ({ ...prev, [a.id]: Number(e.target.value) }))}
                  >
                    {DUTY_MINUTES.map((m) => (
                      <option key={m} value={m}>
                        {m} min
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-surface-2 px-3 py-3">
          <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">Combined Draw</p>
          <p className="font-num text-xl font-semibold">{formatNumber(avgDraw / 1000, 2)} kW</p>
          {peakDraw > avgDraw + 50 ? (
            <p className="mt-0.5 text-[10px] text-muted-foreground">Peaks at {formatNumber(peakDraw / 1000, 2)} kW when they kick on</p>
          ) : null}
        </div>
        <div className="rounded-lg bg-surface-2 px-3 py-3">
          <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">Together</p>
          <p className={cn("font-sans text-xl font-semibold", canTogether ? "text-gold" : "text-red-400")}>
            {selected.length === 0 ? "—" : canTogether ? "Can Run" : "Won’t Run"}
          </p>
        </div>
        <div className="rounded-lg border border-gold/40 bg-blue-deep/30 px-3 py-3">
          <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">Combined With Solar</p>
          <p className="font-num text-xl font-semibold text-gold">
            {usingLoads ? formatRuntime(dayHours) : "—"}
          </p>
          <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
            {solarDay > 0
              ? `Panels average ${formatNumber(solarKw, 2)} kW per hour by day, then the battery covers night`
              : "Add panels on page 1 to include solar"}
          </p>
        </div>
        <div className="rounded-lg border border-gold/40 bg-blue-deep/30 px-3 py-3">
          <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">After Sunset</p>
          <p className="font-num text-xl font-semibold text-gold">
            {usingLoads ? (nightInfinite ? "∞" : formatRuntime(nightHours)) : "—"}
          </p>
          <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">How long the battery keeps these loads on at night</p>
        </div>
      </div>

      {selected.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Turn on the loads you want to keep in an outage.</p>
      ) : canTogether ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {solarDay > 0
            ? nightInfinite
              ? `Hour by hour: the panels average ${formatNumber(solarKw, 2)} kW per hour while the sun is up, run these ${formatNumber(avgDraw / 1000, 2)} kW loads, and put leftover power into the battery. At night the battery takes over. Next morning the panels start again and put back what the night used, so this keeps going.`
              : `Hour by hour: the panels average ${formatNumber(solarKw, 2)} kW per hour by day and the battery covers nights and any shortfall. They don’t fully refill every morning, so together they last about ${formatRuntime(dayHours)}.`
            : `These loads average ${formatNumber(avgDraw / 1000, 2)} kW. Place panels on the first page so daytime solar can run the house and recharge the battery each morning. After dark this battery lasts ${formatRuntime(nightHours)}.`}
        </p>
      ) : (
        <div className="mt-3 text-sm text-muted-foreground">
          <p>
            Together these peak at {formatNumber(peakDraw / 1000, 2)} kW
            {startW > peakW ? ` and a ${formatNumber(startW / 1000, 1)} kW start` : ""}. This bank can deliver{" "}
            {formatNumber(continuousKw, 1)} kW continuous. Turn a few loads off to fit.
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {selected
              .filter((a) => a.watts > contW || a.surgeWatts > peakW)
              .map((a) => (
                <li key={a.id} className="text-red-400">
                  {a.name} won’t start on this bank
                  {a.watts > contW
                    ? ` (${formatNumber(a.watts / 1000, 1)} kW running vs ${formatNumber(continuousKw, 1)} kW available)`
                    : ` (needs a ${formatNumber(a.surgeWatts / 1000, 1)} kW surge to start)`}
                  .
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

