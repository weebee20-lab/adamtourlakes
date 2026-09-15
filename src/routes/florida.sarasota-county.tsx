import { createFileRoute, Link } from "@tanstack/react-router";
import { SeoBlock, SeoCtas, SeoHubLinks, SeoShell } from "@/components/seo-hub";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/florida/sarasota-county")({
  head: () =>
    seoHead(
      "Sarasota County Solar | Sarasota, Venice & North Port",
      "Size rooftop solar from your Sarasota County bill. Sarasota, Venice, North Port, Siesta Key. FPL, Gulf sun, free calculator with Adam Tourlakes.",
      "/florida/sarasota-county",
    ),
  component: SarasotaCountyPage,
});

function SarasotaCountyPage() {
  return (
    <SeoShell
      kicker="Sarasota County, Florida"
      title="Sarasota County solar, sized from your electric bill"
      lead="Sarasota, Venice, North Port, Siesta Key, Lakewood Ranch — Gulf sun, salt air, and summer AC. I size and sell here from the Cape Coral shop. Start with the kWh on the statement, not a county-average slide."
    >
      <SeoBlock title="FPL on most of the map">
        <p>
          Florida Power & Light covers most of Sarasota County. Still read the bill. A handful of parcels and
          communities run on different accounts. Export credits follow the name on the statement. A ZIP is a weak
          stand-in. Enter the address on the{" "}
          <Link to="/calculator" className="font-medium text-gold hover:text-fg">
            calculator
          </Link>{" "}
          so sun hours and the utility guess match the parcel.
        </p>
      </SeoBlock>

      <SeoBlock title="Heat, west glass, and pool equipment">
        <p>
          These bills are air-conditioning bills with a side of pool pumps. A waterfront west wall and a shaded inland
          ranch are not the same job. Size from last year’s kilowatt-hours. Hurricane wind and corrosion on this coast
          are installer and engineer work — racking and attachments have to be specified for the exposure.
        </p>
      </SeoBlock>

      <SeoBlock title="Backup is a battery, not extra modules">
        <p>
          Grid-tied rooftop solar shuts off when the grid drops. If you want lights, fridge, and a slice of HVAC after
          a storm, that is a{" "}
          <Link to="/batteries" className="font-medium text-gold hover:text-fg">
            battery
          </Link>{" "}
          conversation, not more modules. Florida Building Code wind design on this coast is specified for the site —
          not copied from a Midwestern kit.
        </p>
      </SeoBlock>

      <SeoCtas />
      <SeoHubLinks />
    </SeoShell>
  );
}
