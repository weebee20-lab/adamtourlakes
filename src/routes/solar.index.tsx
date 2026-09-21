import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BatteryCharging, PanelsTopLeft, Sun, UtilityPole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaBand } from "@/components/cta-band";
import { ExampleBill } from "@/components/example-bill";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/solar/")({
  head: () =>
    seoHead(
      "How Home Solar Systems Work | Adam Tourlakes, Southwest Florida",
      "A plain-language guide to rooftop solar: panels, inverters, batteries, Florida heat, and how to size from your electric bill.",
      "/solar",
    ),
  component: SolarPage,
});

const STEPS = [
  {
    n: "01",
    icon: Sun,
    title: "Panels catch photons",
    body: "Each module is a grid of silicon cells. Sunlight knocks electrons loose and therefore creates DC power (same kind as a battery).",
  },
  {
    n: "02",
    icon: PanelsTopLeft,
    title: "An inverter makes it usable",
    body: "The house runs on AC (alternating current). A string inverter or microinverters turn the panels' DC power into the AC power your home needs to run all the loads.",
  },
  {
    n: "03",
    icon: UtilityPole,
    title: "The house uses it first",
    body: "Loads in the home draw from the solar array, meaning your home is running on sunshine. Extra kWh go out through a bi-directional meter and is credited to your utility account by your utility company.",
  },
  {
    n: "04",
    icon: BatteryCharging,
    title: "A battery is optional — and useful",
    body: "Storage does not make more sun. It holds daytime excess production and can dispense it every day at nighttime, or more importantly, during grid outages so your home stays up and running.",
  },
];

const TERMS = [
  {
    term: "kWh",
    def: "Kilowatt-hour. The unit on your electric bill — how much energy you used, not how big the system is.",
  },
  {
    term: "Array",
    def: "The group of panels on the roof, working as one system.",
  },
  {
    term: "Inverter",
    def: "Turns the panels’ DC power into AC, which is what the house actually runs on.",
  },
  {
    term: "Bidirectional meter",
    def: "Measures power both ways: what you buy from the utility, and extra solar you send back.",
  },
  {
    term: "Offset",
    def: "How much of your annual usage the array is designed to cover. 90% offset means the system is sized to make about 90% of what the house uses in a year.",
  },
  {
    term: "Battery",
    def: "Stores extra daytime production for night or a grid outage. It does not make more sun or a bigger array.",
  },
];

const FAQS = [
  {
    q: "Will solar work through a Southwest Florida summer?",
    a: "Yes — and the heat is a real design input, not a footnote. More sun means more kilowatt-hours; hotter cells mean slightly less efficiency per module. We size for both, and we spec equipment that is rated for this climate and for wind.",
  },
  {
    q: "What happens to the system during a hurricane?",
    a: "If installed properly, the answer is...nothing. A properly permitted and installed rooftop solar array is engineered to the Florida Building Code wind loads for the area. Racking, mounts, and installation materials should all be hurricane-rated for extremely high winds. That means they're not going anywhere, even in the worst of the worst storms. A grid-tied system without a battery shuts down when the utility grid falls. If you want to keep the lights on and the home powered during a grid outage, you'll need a battery storage system.",
  },
  {
    q: "Do I need a battery?",
    a: "Only if you care about outage backup or using more of your own excess solar production after sunset. Batteries do not make the array larger or produce more power. In Southwest Florida, having a battery (or multiple) means you and your family will be safe from losing power during grid outages, storms, and hurricanes.",
  },
  {
    q: "How do you size a system?",
    a: "I base all my designs on the current electric consumption of the home and any future changes the homeowner has planned. I look at the roof — things like shade, azimuth, pitch, and orientation — then I 3D model the home and size the system to maximize output. If a homeowner doesn't want panels on a certain section of the roof, or if they know usage will change in the future, I tailor the system appropriately.",
  },
  {
    q: "What about solar pool heating?",
    a: "We do that, too! Solar pool heat is a different technology than solar electric (photovoltaic). There's no inherent electrical power with pool solar. Pool solar panels circulate water through the panels on the roof to extend the swim season without needing a standalone pool heater.",
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
    <main className="solar-edu">
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
            A Short Walkthrough
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-6xl">
            How a home solar system actually works.
          </h1>
          <p className="solar-edu-lead mt-4 max-w-2xl text-lg leading-relaxed text-fg/85 sm:text-xl">
            Solar is remarkably simple and straightforward. It's not a scam, and it doesn't take 20
            years to reach a net-zero payback. This page is what I talk about with my clients. The{" "}
            <Link to="/solar/videos" className="font-medium text-gold hover:text-fg">
              videos
            </Link>{" "}
            live on their own page.
          </p>
        </div>
        <div className="hero-cutline hero-cutline-from-left" aria-hidden />
      </section>

      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">The system</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
            Four pieces. Nothing mystical.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {STEPS.map((step) => (
              <article
                key={step.n}
                className="rounded-lg bg-surface px-4 py-3.5 shadow-[var(--shadow-border)]"
              >
                <div className="flex items-center gap-3">
                  <step.icon className="size-5 shrink-0 text-gold" />
                  <h3 className="min-w-0 flex-1 font-display text-xl font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <span className="shrink-0 text-xs font-medium tracking-[0.16em] text-blue uppercase">
                    {step.n}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.body}</p>
              </article>
            ))}
          </div>
          <article className="mt-6 rounded-lg bg-surface px-4 py-4 shadow-[var(--shadow-border)] sm:px-5">
            <p className="text-xs font-medium tracking-[0.16em] text-gold uppercase">Plain English</p>
            <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">
              Solar terms you’ll see on this page
            </h3>
            <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {TERMS.map((item) => (
                <div key={item.term}>
                  <dt className="font-display text-lg font-semibold text-gold">{item.term}</dt>
                  <dd className="mt-0.5 text-sm leading-relaxed text-muted">{item.def}</dd>
                </div>
              ))}
            </dl>
          </article>
        </div>
        <div className="hero-cutline" aria-hidden />
      </section>

      <section className="relative bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <ExampleBill />
        </div>
        <div className="hero-cutline hero-cutline-from-left" aria-hidden />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">Watch</p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          Check out some of my videos
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Who I am, the basics, cost, loan vs lease vs cash, roof types, batteries, and installer red flags — the topics people ask
          me about the most. Placeholders for now; I am filming these myself.
        </p>
        <Button asChild className="mt-6" size="lg">
          <Link to="/solar/videos">
            Solar education videos
            <ArrowRight className="size-4" />
          </Link>
        </Button>
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
          Local pages for the areas I actually work:{" "}
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
          {", "}
          <Link to="/florida/sarasota-county" className="text-gold hover:text-fg">
            Sarasota County
          </Link>
          .
        </p>
        <CtaBand
          heading="Ready for a custom quote?"
          body="Call our Cape Coral office and ask for me. I'll get to work designing a system based on what you need and want."
        />
      </section>
    </main>
  );
}
