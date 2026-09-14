import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { AddressBar } from "@/components/address-bar";
import { InstallReel } from "@/components/install-reel";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OutOfAreaDialog } from "@/components/out-of-area-dialog";
import { resolveLocation } from "@/lib/solar/places";
import { isFloridaLocation, isFloridaZip } from "@/lib/swfl";
import { cn, formatNumber, formatUsd } from "@/lib/utils";
import { useDesigner } from "@/store/designer";

function climateLabel(climate: string, lat: number) {
  if (climate === "hot" || lat < 32) return "Tropical";
  if (climate === "cold" || lat > 41) return "Cool";
  return "Mild";
}

export function LocationCard() {
  const location = useDesigner((s) => s.location);
  const setLocation = useDesigner((s) => s.setLocation);
  const [mode, setMode] = useState<"address" | "zip">("address");
  const [zip, setZip] = useState(location?.zip ?? "");
  const [busy, setBusy] = useState(false);
  const [outOfArea, setOutOfArea] = useState(false);

  useEffect(() => {
    if (location?.zip && location.zip !== zip) setZip(location.zip);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.zip]);

  useEffect(() => {
    if (mode !== "zip") return;
    const z = zip.replace(/\D/g, "").slice(0, 5);
    if (z.length !== 5 || z === location?.zip) return;
    if (isFloridaZip(z) === false) {
      setOutOfArea(true);
      return;
    }
    const t = window.setTimeout(() => {
      setBusy(true);
      resolveLocation({ data: { q: z } })
        .then((loc) => {
          if (!loc) return;
          if (isFloridaLocation(loc) === false) {
            setOutOfArea(true);
            return;
          }
          setLocation(loc);
        })
        .finally(() => setBusy(false));
    }, 400);
    return () => window.clearTimeout(t);
  }, [mode, zip, location?.zip, setLocation]);

  const strengthColor = location?.solarStrength === "Exceptional" ? "text-gold" : "text-fg";

  return (
    <>
    <Card className="flex h-full w-full flex-col">
      <CardContent className="flex h-full flex-1 flex-col gap-4 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <MapPin className="size-4 text-muted" aria-hidden />
              Location
            </span>
            <span className="text-xs font-normal text-muted">We use NASA sun hours for system accuracy.</span>
          </p>
          <div className="inline-flex rounded-lg bg-surface-2 p-0.5 ring-1 ring-border">
            <button
              type="button"
              aria-pressed={mode === "address"}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                mode === "address" ? "bg-gold text-gold-fg" : "text-muted hover:text-fg",
              )}
              onClick={() => setMode("address")}
            >
              Full Address
            </button>
            <button
              type="button"
              aria-pressed={mode === "zip"}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                mode === "zip" ? "bg-gold text-gold-fg" : "text-muted hover:text-fg",
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
            <span className="text-[10px] font-semibold tracking-wide text-muted uppercase">ZIP code</span>
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

        <InstallReel />

        {location?.zip ? (
          <div className="flex flex-col gap-3">
            <div>
              <p className="font-display text-lg font-semibold tracking-tight">{location.label}</p>
              <p className="text-xs text-muted">
                {climateLabel(location.climate, location.lat)} · {location.utilityName} ·{" "}
                <span className="font-num">{formatNumber(location.rate * 100, 1)}¢/kWh</span>
                {location.customerCharge > 0 ? (
                  <>
                    {" "}
                    + <span className="font-num">{formatUsd(location.customerCharge)}/mo</span> service
                  </>
                ) : null}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-surface-2 px-3 py-2">
                <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">
                  {mode === "address" ? "Sun Hours" : "ZIP Average"}
                </p>
                <p className="font-num text-xl font-semibold">
                  {formatNumber(location.nasa ? location.ghi : location.zipGhi, 2)}
                </p>
                <p className="text-[10px] text-muted">kWh/m²/day</p>
              </div>
              <div className="rounded-lg bg-surface-2 px-3 py-2">
                <p className="text-[10px] font-semibold tracking-wide text-muted uppercase">Solar Strength</p>
                <p className={cn("font-sans text-xl font-semibold", strengthColor)}>{location.solarStrength}</p>
                <p className="text-[10px] text-muted">for this ZIP</p>
              </div>
            </div>
            {busy ? <p className="text-xs text-muted">Looking up this location…</p> : null}
          </div>
        ) : busy ? (
          <p className="text-sm text-muted">Looking up this location…</p>
        ) : null}
      </CardContent>
    </Card>
    <OutOfAreaDialog open={outOfArea} onClose={() => setOutOfArea(false)} />
    </>
  );
}