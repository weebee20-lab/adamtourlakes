import { createFileRoute, Link } from "@tanstack/react-router";
import { BatteryCharging, PanelsTopLeft, Sun, UtilityPole } from "lucide-react";
import { CtaBand } from "@/components/cta-band";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/solar")({
  head: () =>
    seoHead(
      "How Home Solar Systems Work | Adam Tourlakes, Southwest Florida",
      "A plain-language guide to rooftop solar: panels, inverters, batteries, Florida heat, and what changed after the 2025 federal tax credit.",
      "/solar",
    ),
  component: SolarPage,
});

const STEPS = [
  {
    n: "01",
    icon: Sun,
    title: "Panels catch photons",
    body: "Each module is a grid of silicon cells. Light knocks electrons loose and that current is DC — the same kind as a battery. That is the raw power the roof makes.",
  },
  {
    n: "02",
    icon: PanelsTopLeft,
    title: "An inverter makes it usable",
    body: "The house runs on AC. A string inverter or microinverters (Enphase is what we install most) turn DC into the power your panel, outlets, and air conditioner already understand.",
  },
  {
    n: "03",
    icon: UtilityPole,
    title: "The house uses it first",
    body: "Loads in the home draw from the array before the grid does. Extra kilowatt-hours go out through a bi-directional meter. How those credits are valued depends on the utility.",
  },
  {
    n: "04",
    icon: BatteryCharging,
    title: "A battery is optional — and useful",
    body: "Storage does not make more sun. It holds daytime production so lights, refrigeration, and a slice of the house can run when the grid drops. On this coast, that is the hurricane case.",
  },
];

const FAQS = [
  {
    q: "Is the 30% federal tax credit still available?",
    a: "Not for a homeowner buying their own system in 2026. The Residential Clean Energy Credit (Section 25D) stopped applying to expenditures after December 31, 2025. Solar can still pencil on this coast because of the sun hours and utility rates — but I will not quote a federal credit that is gone. If you installed in 2025 and have unused carryforward, that is a different conversation with your tax person.",
  },
  {
    q: "Will solar work through a Southwest Florida summer?",
    a: "Yes — and the heat is a real design input, not a footnote. More sun means more kilowatt-hours; hotter cells mean slightly less efficiency per module. We size for both, and we spec equipment that is rated for this climate and for wind.",
  },
  {
    q: "What happens in a hurricane?",
    a: "A properly permitted rooftop array is engineered to the Florida Building Code wind loads for the site. That is racking, attachments, and inspection — not a hope. A grid-tied system without a battery still shuts down when the utility is down (anti-islanding). If you want lights during an outage, that is a battery conversation.",
  },
  {
    q: "Do I need a battery?",
    a: "Only if you care about backup or about using more of your own midday production after sunset. A battery does not make the array larger. On this coast the honest use-case is outages and, for some houses, shifting peak. We will not tack one on to dress up a quote.",
  },
  {
    q: "How do you size a system?",
    a: "From the bill and the roof. Twelve months of kilowatt-hours, the rate, shade, azimuth, and whether there is a pool or an EV in the driveway. Then we look at what the roof can physically hold. I would rather undersell a clean design than pack modules into a bad plane.",
  },
  {
    q: "What about solar pool heating?",
    a: "Different technology from photovoltaic. Pool solar circulates water through collectors on the roof to extend the swim season. SES of America is also a licensed pool contractor, so that job does not get split across two companies.",
  },
];

function SolarPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <section className="relative min-h-[22rem] overflow-hidden">
        <img
          src="/images/panel-detail.jpg"
          alt="Close-up of rooftop photovoltaic modules catching late sunlight"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/75 to-bg/30" />
        <div className="relative mx-auto flex min-h-[22rem] max-w-6xl flex-col justify-end px-4 py-12 sm:px-6">
          <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
            A short briefing
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-6xl">
            How a home solar system actually works.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-fg/85">
            Solar is remarkably simple and straightforward. It's not a scam, and it doesn't take 20
            years to reach a net-zero payback. This page is what I talk about with my clients, as
            well as some helpful videos on topics I'm asked about a lot.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">The system</p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          Four pieces. Nothing mystical.
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {STEPS.map((step) => (
            <article
              key={step.n}
              className="rounded-lg bg-surface p-5 shadow-[var(--shadow-border)]"
            >
              <div className="flex items-center justify-between">
                <step.icon className="size-5 text-gold" />
                <span className="text-xs font-medium tracking-[0.16em] text-blue uppercase">
                  {step.n}
                </span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
            Florida, 2026
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold tracking-tight">
            The credit changed. The sun did not.
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="rounded-lg bg-bg p-5 shadow-[var(--shadow-border)]">
              <h3 className="font-display text-xl font-semibold">No 25D on new buys</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                The 30% residential federal credit does not apply to systems paid for after
                December 31, 2025. Quotes on this site will not pretend otherwise.
              </p>
            </article>
            <article className="rounded-lg bg-bg p-5 shadow-[var(--shadow-border)]">
              <h3 className="font-display text-xl font-semibold">The bill is the engine</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Every kilowatt-hour the roof makes is one you do not buy from the utility. On a
                Cape Coral house with a pool and a long cooling season, that is the whole case.
              </p>
            </article>
            <article className="rounded-lg bg-bg p-5 shadow-[var(--shadow-border)]">
              <h3 className="font-display text-xl font-semibold">Storms are a spec</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Wind-rated racking, a licensed solar contractor, and a battery only if you want
                backup. Grid-tied solar without storage will not run the house during an outage.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">Watch</p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          Original videos, coming here.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          I am filming my own explainers for this page — how a system works, what heat does on a
          Cape Coral roof, and what a battery actually buys you. Nothing third-party. Check back.
        </p>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
            Questions I hear most
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">Straight answers.</h2>
          <div className="mt-8 divide-y divide-border rounded-xl bg-bg shadow-[var(--shadow-border)]">
            {FAQS.map((item) => (
              <details key={item.q} className="group px-5 py-4">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-left font-medium text-fg">
                  {item.q}
                  <span className="text-gold transition-transform duration-150 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 max-w-3xl pb-2 text-sm leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">Florida solar</p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Local pages for the roofs I actually work:{" "}
          <Link to="/florida" className="text-gold hover:text-fg">
            Florida
          </Link>
          {", "}
          <Link to="/florida/lee-county" className="text-gold hover:text-fg">
            Lee County
          </Link>
          {", "}
          <Link to="/florida/collier-county" className="text-gold hover:text-fg">
            Collier County
          </Link>
          {", "}
          <Link to="/florida/charlotte-county" className="text-gold hover:text-fg">
            Charlotte County
          </Link>
          .
        </p>
        <CtaBand
          heading="If this briefing clicked, the next step is your bill."
          body="Call the Cape Coral office, ask for Adam, and we will look at twelve months of usage before anyone talks modules."
        />
      </section>
    </main>
  );
}
