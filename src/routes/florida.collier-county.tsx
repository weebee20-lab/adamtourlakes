import { createFileRoute, Link } from "@tanstack/react-router";
import { SeoBlock, SeoCtas, SeoHubLinks, SeoShell } from "@/components/seo-hub";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/florida/collier-county")({
  head: () =>
    seoHead(
      "Collier County Solar | Naples & Marco Island | Adam Tourlakes",
      "Size rooftop solar from your Collier County bill. Naples, Marco Island, Immokalee. FPL, hurricane wind design, free calculator. Cape Coral office.",
      "/florida/collier-county",
    ),
  component: CollierCountyPage,
});

function CollierCountyPage() {
  return (
    <SeoShell
      kicker="Collier County, Florida"
      title="Collier County solar, sized from your electric bill"
      lead="Naples, Marco Island, Immokalee, Golden Gate — Gulf sun, salt air, and summer AC. I size and sell here from the Cape Coral shop. Start with the kWh on the statement, not a Naples-average slide."
    >
      <SeoBlock title="FPL country, with a few exceptions">
        <p>
          Most Collier roofs sit on Florida Power & Light. That still isn’t a reason to skip the letterhead. A handful of
          parcels and communities run on different accounts. Export credits follow the utility on the bill. The{" "}
          <Link to="/calculator" className="font-medium text-gold hover:text-fg">
            calculator
          </Link>{" "}
          uses the address when it can; we confirm the account before anyone treats an estimate as a bid.
        </p>
      </SeoBlock>

      <SeoBlock title="Heat, humidity, and west glass">
        <p>
          Collier bills are cooling bills with a side of pool equipment. A waterfront west wall and a shaded inland ranch
          are not the same job. Size from last year’s kilowatt-hours. Hurricane wind and corrosion on this coast are
          installer and engineer work — racking and attachments have to be specified for the exposure, not copied from a
          Midwestern kit.
        </p>
      </SeoBlock>

      <SeoBlock title="Backup is a battery, not extra modules">
        <p>
          Grid-tied arrays shut down when the grid drops. If the point of solar is keeping a slice of the house on after
          a storm, that’s the{" "}
          <Link to="/batteries" className="font-medium text-gold hover:text-fg">
            battery sizer
          </Link>
          , then a conversation with me.
        </p>
      </SeoBlock>

      <SeoCtas />
      <SeoHubLinks />
    </SeoShell>
  );
}