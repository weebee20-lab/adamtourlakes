import { createFileRoute, Link } from "@tanstack/react-router";
import { SeoBlock, SeoCtas, SeoHubLinks, SeoShell } from "@/components/seo-hub";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/florida/charlotte-county")({
  head: () =>
    seoHead(
      "Charlotte County Solar | Punta Gorda & Port Charlotte",
      "Size rooftop solar from your Charlotte County bill. Punta Gorda, Port Charlotte, Englewood. FPL, storms, free calculator with Adam Tourlakes.",
      "/florida/charlotte-county",
    ),
  component: CharlotteCountyPage,
});

function CharlotteCountyPage() {
  return (
    <SeoShell
      kicker="Charlotte County, Florida"
      title="Charlotte County solar, sized from your electric bill"
      lead="Punta Gorda, Port Charlotte, Englewood, Rotonda — same Gulf sun, different roofs, different summer loads. Size from the bill. I work this county from Cape Coral."
    >
      <SeoBlock title="FPL on most of the map">
        <p>
          Florida Power & Light covers most of Charlotte County. Still read the bill. Netting and export follow that
          account, and a ZIP is a weak stand-in. Enter the address on the{" "}
          <Link to="/calculator" className="font-medium text-gold hover:text-fg">
            calculator
          </Link>{" "}
          so sun hours and the utility guess match the parcel.
        </p>
      </SeoBlock>

      <SeoBlock title="Storm season and roof first">
        <p>
          Charlotte took a hard hit in Ian. A lot of decks were rebuilt; some were not. A solar array on a tired roof is
          the wrong sequence. Wind design here is Florida Building Code work, not a calculator output. Grid-tied panels
          also shut off in an outage —{" "}
          <Link to="/batteries" className="font-medium text-gold hover:text-fg">
            batteries
          </Link>{" "}
          are the backup path.
        </p>
      </SeoBlock>

      <SeoBlock title="Cooling load, not a statewide average">
        <p>
          These bills are air-conditioning bills. Occupancy, pool pumps, and west glass move the kWh more than square
          footage. Bring a recent statement and we size the roof you actually have.
        </p>
      </SeoBlock>

      <SeoCtas />
      <SeoHubLinks />
    </SeoShell>
  );
}