import { lazy, Suspense, useEffect, useState } from "react";
import { LocationCard } from "@/components/location-card";
import { SavingsCard } from "@/components/savings-card";

const RoofCanvas = lazy(() =>
  import("@/components/roof-canvas").then((m) => ({ default: m.RoofCanvas })),
);

export function DesignerApp() {
  const [live, setLive] = useState(false);
  useEffect(() => setLive(true), []);
  if (!live) {
    return <div className="min-h-[70vh]" aria-hidden />;
  }
  return (
    <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-4 px-4 py-5 sm:px-6">
      <p className="text-center text-xs font-medium tracking-[0.16em] text-gold uppercase">
        Solar Calculator Provided by{" "}
        <a
          href="https://heliosolarcalculator.com"
          className="underline decoration-gold/50 underline-offset-4 hover:text-fg"
        >
          heliosolarcalculator.com
        </a>
      </p>
      <div className="grid min-w-0 items-stretch gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <Suspense fallback={<div className="min-h-[22rem] rounded-xl bg-surface" />}>
          <RoofCanvas />
        </Suspense>
        <div className="relative z-10 flex min-h-0 min-w-0 lg:col-start-2 lg:row-start-1">
          <LocationCard />
        </div>
        <div className="lg:col-span-2">
          <SavingsCard />
        </div>
      </div>
    </div>
  );
}
