import { createFileRoute } from "@tanstack/react-router";
import { DesignerApp } from "@/components/designer-app";
import { seoHead } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/calculator")({
  shouldReload: false,
  head: () =>
    seoHead(
      `Free Solar Calculator | ${SITE_NAME}`,
      "Free solar calculator from Helio: enter your address or ZIP, size a system to your electric bill, and see a savings card. Provided by heliosolarcalculator.com.",
      "/calculator",
    ),
  component: CalculatorPage,
});

function CalculatorPage() {
  return (
    <main>
      <DesignerApp />
    </main>
  );
}
