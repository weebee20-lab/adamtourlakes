import { createFileRoute, Link } from "@tanstack/react-router";
import { SeoBlock, SeoCtas, SeoHubLinks, SeoShell } from "@/components/seo-hub";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/florida/lee-county")({
  head: () =>
    seoHead(
      "Lee County Solar | LCEC & FPL | Cape Coral & Fort Myers",
      "Size rooftop solar from your Lee County bill. LCEC vs FPL, hurricane battery basics, Cape Coral office. Free calculator with Adam Tourlakes.",
      "/florida/lee-county",
    ),
  component: LeeCountyPage,
});

function LeeCountyPage() {
  return (
    <SeoShell
      kicker="Lee County, Florida"
      title="Lee County solar, sized from your electric bill"
      lead="Fort Myers, Cape Coral, Bonita Springs, Estero, Lehigh Acres — same county, not the same utility, not the same bill. Enter the address, size from kilowatt-hours, then talk to me if you want a site survey from the Cape Coral shop."
    >
      <SeoBlock title="LCEC or FPL — check the bill, not the ZIP">
        <p>
          Lee County is a split. Lee County Electric Cooperative (LCEC) serves much of Cape Coral and a wide co-op
          territory. Florida Power & Light (FPL) covers pockets of Fort Myers and other parcels. Neighbors can be on
          different utilities. A ZIP code is not a utility map.
        </p>
        <p>
          Net metering, credits for extra production, and the rate you actually pay live on the bill. If the bill says
          LCEC, you are in co-op rules. If it says FPL, you are in investor-owned rules. Do not assume Cape Coral is
          always LCEC or Fort Myers is always FPL — the parcel is what matters.
        </p>
      </SeoBlock>

      <SeoBlock title="Size for summer cooling load, not an average Florida home">
        <p>
          Lee County bills are air-conditioning bills. A generic “average Florida home” undersizes the array you need in
          August. A pool pump, a two-story west wall of glass, or a house that sat empty last summer will all change the
          kWh story. The bill already knows.
        </p>
        <p>
          <Link to="/calculator" className="font-medium text-gold hover:text-fg">
            Enter the bill
          </Link>{" "}
          and see a system sized for this house.
        </p>
      </SeoBlock>

      <SeoBlock title="Hurricanes, outages, and wind design">
        <p>
          Grid-tied rooftop solar shuts off when the grid drops. If you want lights, fridge, and a slice of HVAC after
          the wires come down, that is a{" "}
          <Link to="/batteries" className="font-medium text-gold hover:text-fg">
            battery
          </Link>{" "}
          conversation, not more modules. Florida Building Code wind speeds in Lee County typically land around 150–170
          mph depending on location and exposure. After Ian, a lot of roofs were rebuilt — a new system on a tired deck
          is the wrong sequence.
        </p>
      </SeoBlock>

      <SeoCtas />
      <SeoHubLinks />
    </SeoShell>
  );
}