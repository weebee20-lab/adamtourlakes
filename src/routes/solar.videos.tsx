import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaBand } from "@/components/cta-band";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/solar/videos")({
  head: () =>
    seoHead(
      "Solar Education Videos | Adam Tourlakes",
      "Original solar explainers from Adam Tourlakes — how a system works, cost, roof types, batteries, and installer red flags.",
      "/solar/videos",
    ),
  component: SolarVideosPage,
});

const VIDEOS = [
  { n: "01", title: "Who am I, and why should you care?" },
  { n: "02", title: "The Basics of Solar" },
  { n: "03", title: "The Cost of Solar" },
  { n: "04", title: "Loan, Lease, or Cash?" },
  { n: "05", title: "Solar on Different Roof Types" },
  { n: "06", title: "Solar is a Scam?" },
  { n: "07", title: "Solar With Batteries" },
  { n: "08", title: "Solar Installer Red Flags" },
];

function SolarVideosPage() {
  return (
    <main className="solar-edu">
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">Watch</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-6xl">
          Solar education videos.
        </h1>
        <p className="solar-edu-lead mt-4 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
          I am filming my own explainers — how a system works, what heat does on a Cape Coral roof,
          and what a battery actually buys you. Nothing third-party. Check back as these go up.
        </p>
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link to="/solar">
              <ArrowLeft className="size-4" />
              Back to Solar Education
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VIDEOS.map((item) => (
            <article
              key={item.n}
              className="overflow-hidden rounded-lg bg-surface shadow-[var(--shadow-border)]"
            >
              <div className="relative flex aspect-video items-center justify-center bg-bg">
                <Play className="size-10 text-gold" strokeWidth={1.5} aria-hidden />
                <span className="absolute top-3 left-3 text-[10px] font-semibold tracking-[0.16em] text-gold uppercase">
                  {item.n}
                </span>
                <span className="absolute right-3 bottom-3 text-[10px] font-medium tracking-wide text-muted uppercase">
                  Coming soon
                </span>
              </div>
              <div className="px-4 py-3">
                <h2 className="font-display text-xl font-semibold tracking-tight">{item.title}</h2>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-12">
          <CtaBand
            heading="The next step is your electric bill."
            body="Call the Cape Coral office, ask for Adam, and we will look at twelve months of usage before anyone talks modules."
          />
        </div>
      </section>
    </main>
  );
}
