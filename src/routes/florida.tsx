import { createFileRoute, Link } from "@tanstack/react-router";
import { SeoBlock, SeoCtas, SeoFaq, SeoHubLinks, SeoShell, faqJsonLd } from "@/components/seo-hub";
import { FLORIDA_FAQ } from "@/lib/seo/florida";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/florida")({
  head: () =>
    seoHead(
      "Florida Solar | AC Bills, FPL & LCEC | Adam Tourlakes",
      "Size rooftop solar from your Florida electric bill — summer AC, FPL and LCEC, storm vs backup. Free calculator. Southwest Florida homeowners can talk to Adam in Cape Coral.",
      "/florida",
    ),
  component: FloridaPage,
});

function FloridaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FLORIDA_FAQ)) }}
      />
      <SeoShell
        kicker="Florida"
        title="Florida solar, sized from your electric bill"
        lead="In Florida, summer air-conditioning usually runs the bill — not a mild January week. A Cape Coral house and a Miami condo don’t use power the same way. Start with the kWh on your statement. I sell and size in Southwest Florida; the calculator works for any Florida bill."
      >
        <SeoBlock title="Summer AC drives most Florida bills">
          <p>
            Pool pumps, west-facing glass, and how hard the compressor ran last August move the number more than a
            statewide square-footage chart. A house that sat empty half the summer wants a different array than one that
            ran AC all day.
          </p>
          <p>
            Paste a recent bill (or enter kWh) on the{" "}
            <Link to="/calculator" className="font-medium text-gold hover:text-fg">
              free solar calculator
            </Link>
            . You get a size ballpark and cash-flow sketch — not an “average Florida home” slide.
          </p>
        </SeoBlock>

        <SeoBlock title="FPL, munis, and co-ops — Lee County shows the split">
          <p>
            Investor-owned utilities, municipal systems, and co-ops sit on neighboring streets. Lee County is the clean
            example: LCEC covers much of Cape Coral; FPL covers pockets of Fort Myers. A ZIP code is not a utility map.
            Export credits and interconnection follow the name on your bill.
          </p>
        </SeoBlock>

        <SeoBlock title="Hurricane season isn’t fixed with more panels">
          <p>
            Grid-tied rooftop solar shuts off when the grid drops — that’s islanding protection, not a defect. Extra
            modules won’t keep the fridge on through a storm. Wind design is a separate seriousness: Florida Building
            Code wind speeds often land in a high band depending on location and exposure. Size from usage first; treat
            storage as its own decision on the{" "}
            <Link to="/batteries" className="font-medium text-gold hover:text-fg">
              battery page
            </Link>
            .
          </p>
        </SeoBlock>

        <SeoBlock title="Southwest Florida vs the rest of the state">
          <p>
            I work Lee, Collier, Charlotte, and Sarasota counties from the Cape Coral shop — Solar Energy Solutions Powered by EcoSmart.
            If your roof is in that territory, size it here and{" "}
            <Link to="/contact" className="font-medium text-gold hover:text-fg">
              contact Adam
            </Link>
            . If you’re elsewhere in Florida, the calculator still runs the numbers; use{" "}
            <a
              href="https://heliosolarcalculator.com"
              className="font-medium text-gold hover:text-fg"
              rel="noreferrer"
              target="_blank"
            >
              HelioSolarCalculator.com
            </a>{" "}
            to find installers in your area.
          </p>
        </SeoBlock>

        <SeoCtas />
        <SeoHubLinks />
        <SeoFaq items={FLORIDA_FAQ} />
      </SeoShell>
    </>
  );
}