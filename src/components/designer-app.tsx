import { HelioCredit } from "@/components/helio-credit";
import { LocationCard } from "@/components/location-card";
import { RoofCanvas } from "@/components/roof-canvas";
import { SavingsCard } from "@/components/savings-card";

export function DesignerApp() {
  return (
    <div className="solar-calc mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-4 px-4 py-5 sm:px-6">
      <HelioCredit />
      <div className="grid min-w-0 items-stretch gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <RoofCanvas />
        <div className="relative z-10 flex min-h-0 min-w-0 xl:col-start-2 xl:row-start-1">
          <LocationCard />
        </div>
        <div className="xl:col-span-2">
          <SavingsCard />
        </div>
      </div>
    </div>
  );
}