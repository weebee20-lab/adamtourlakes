import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { AddressBar } from "@/components/address-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { resolveLocation } from "@/lib/solar/places";
import { cn, formatNumber, formatUsd } from "@/lib/utils";
import { useDesigner } from "@/store/designer";

function climateLabel(climate: string, lat: number) {
  if (climate === "hot" || lat < 32) return "Tropical";
  if (climate === "cold" || lat > 41) return "Cool";
  return "Mild";
}

function AboutHelio() {
  return (
    <div className="mt-3 flex flex-1 flex-col">
      <div className="flex h-full flex-col rounded-lg border border-border/70 bg-muted/40 px-4 py-4">
        <p className="relative overflow-hidden py-1 text-center font-display text-xl font-semibold tracking-tight text-primary">
          <span className="helio-nameplate-flare helio-nameplate-flare-slow" aria-hidden />
          <span className="relative z-10">Why Helio Exists</span>
        </p>
        <div className="mt-1 flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <p>
            Helio is a free calculator built by working solar engineers and designers. The goal is simple: give
            everyone a clear, honest look at solar — production, savings, and cost — without the usual fluff.
          </p>
          <p>
            We don’t sell your information to calling lists, and we don’t dress up the numbers. Your design is shared
            only with the companies you choose on the last page, and you stay in control of that every step.
          </p>
          <p>
            If a company is Helio Verified, it means it passed a rigorous quality check from our team. These companies will feature a Helio Verified badge.
          </p>
        </div>
      </div>
    </div>
  );
}

export function LocationCard() {
  const location = useDesigner((s) => s.location);
  const setLocation = useDesigner((s) => s.setLocation);
  const [mode, setMode] = useState<"address" | "zip">("address");
  const [zip, setZip] = useState(location?.zip ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (location?.zip && location.zip !== zip) setZip(location.zip);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.zip]);

  useEffect(() => {
    if (mode !== "zip") return;
    const z = zip.replace(/\D/g, "").slice(0, 5);
    if (z.length !== 5 || z === location?.zip) return;
    const t = window.setTimeout(() => {
      setBusy(true);
      resolveLocation({ data: { q: z } })
        .then(setLocation)
        .finally(() => setBusy(false));
    }, 400);
    return () => window.clearTimeout(t);
  }, [mode, zip, location?.zip, setLocation]);

  const strengthColor = location?.solarStrength === "Exceptional" ? "text-primary" : "text-foreground";

  return (
    <Card className="flex h-full w-full flex-col">
      <CardContent className="flex h-full flex-1 flex-col gap-4 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <MapPin className="size-4 text-muted-foreground" aria-hidden />
            Location
          </p>
          <div className="inline-flex rounded-lg bg-muted p-0.5">
            <button
              type="button"
              aria-pressed={mode === "address"}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                mode === "address" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
              )}
              onClick={() => setMode("address")}
            >
              Full Address
            </button>
            <button
              type="button"
              aria-pressed={mode === "zip"}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                mode === "zip" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
              )}
              onClick={() => setMode("zip")}
            >
              ZIP Only
            </button>
          </div>
        </div>

        {mode === "address" ? (
          <AddressBar />
        ) : (
          <label htmlFor="helio-zip" className="flex max-w-[10rem] flex-col gap-1.5">
            <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">ZIP code</span>
            <Input
              id="helio-zip"
              inputMode="numeric"
              maxLength={5}
              value={zip}
              aria-label="ZIP / postal code"
              onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder="Type ZIP"
            />
          </label>
        )}

        {location?.zip ? (
          <div className="flex flex-1 flex-col">
            <p className="font-display text-lg font-semibold tracking-tight">{location.label}</p>
            <p className="text-xs text-muted-foreground">
              {climateLabel(location.climate, location.lat)} · {location.utilityName} · {formatNumber(location.rate * 100, 1)}¢/kWh
              {location.customerCharge > 0 ? ` + ${formatUsd(location.customerCharge)}/mo service` : ""}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-muted px-3 py-2">
                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                  {mode === "address" ? "Sun Hours" : "ZIP Average"}
                </p>
                <p className="font-display text-xl font-semibold tabular-nums">
                  {formatNumber(location.nasa ? location.ghi : location.zipGhi, 2)}
                </p>
                <p className="text-[10px] text-muted-foreground">kWh/m²/day</p>
              </div>
              <div className="rounded-lg bg-muted px-3 py-2">
                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Solar Strength</p>
                <p className={cn("font-display text-xl font-semibold", strengthColor)}>{location.solarStrength}</p>
                <p className="text-[10px] text-muted-foreground">for this ZIP</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {location.nasa
                ? `NASA POWER at this point: ${formatNumber(location.ghi, 2)} kWh/m²/day.${mode === "zip" ? " Switch to Full Address for the exact lat/long of the home." : ""}`
                : busy
                  ? "Looking up this ZIP…"
                  : mode === "address"
                    ? "Type a street address and Helio will use NASA sun calculations for that home."
                    : "Type a ZIP and Helio will use NASA sun calculations for that area."}
            </p>
            <AboutHelio />
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {busy
                ? "Looking up this location…"
                : mode === "address"
                  ? "Type a street address and Helio will use NASA sun calculations for that home."
                  : "Type a ZIP and Helio will use NASA sun calculations for that area."}
            </p>
            <AboutHelio />
          </>
        )}
      </CardContent>
    </Card>
  );
}
