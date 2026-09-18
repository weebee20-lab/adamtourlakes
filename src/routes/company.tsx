import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Hammer,
  SunMedium,
  Waves,
  Wind,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaBand } from "@/components/cta-band";
import { ORG_JSON_LD, seoHead } from "@/lib/seo";
import { COMPANY } from "@/lib/site";
import { CompanyLockup } from "@/components/company-lockup";

export const Route = createFileRoute("/company")({
  head: () =>
    seoHead(
      `Solar Energy Solutions | Cape Coral, FL — with Adam Tourlakes`,
      "Veteran-owned, in-house solar company in Cape Coral. Photovoltaic, solar pool heating, and home batteries. Licensed CVC57062. Sales Manager Adam Tourlakes.",
      "/company",
    ),
  component: CompanyPage,
});

const SERVICES = [
  {
    icon: SunMedium,
    title: "Residential photovoltaic",
    body: "Rooftop arrays sized from the bill, not a brochure. Built for Florida sun, heat, and wind ratings.",
  },
  {
    icon: Building2,
    title: "Small commercial",
    body: "Same in-house path for shops and offices that want to cut demand charges and lock in a known power cost.",
  },
  {
    icon: Waves,
    title: "Solar pool heating",
    body: "Extend the swim season without a gas or electric heater running all afternoon. A Southwest Florida specialty.",
  },
  {
    icon: Zap,
    title: "Home batteries",
    body: "Tesla Powerwall, Enphase, and EcoFlow installs so the house can ride through outages instead of waiting on the grid.",
  },
  {
    icon: Wind,
    title: "Solar attic fans",
    body: "Move hot air out of the attic so the air conditioner does less work in August.",
  },
  {
    icon: Hammer,
    title: "Pool equipment",
    body: "Pumps, heat pumps, salt systems, and the gear that sits next to the solar loop — serviced by the same licensed shop.",
  },
];

const REASONS = [
  "Veteran owned and operated, based in Cape Coral since 2018.",
  "Turnkey: knowledge, design, permitting, installation, and service under one roof.",
  "Employees on the roof — the company does not subcontract installs.",
  "Licensed solar contractor and licensed pool contractor in the State of Florida.",
  "Equipment specified for this climate: Enphase microinverters, Powerwall storage, Florida-rated racking.",
  "Hundreds of permitted solar jobs on the books in Southwest Florida.",
];

function CompanyPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
      />
      <section className="relative min-h-[28rem] overflow-hidden">
        <img
          src="/images/waterfront-solar.jpg?v=2"
          alt="Southwest Florida waterfront home with a rooftop solar array at golden hour"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/70 to-bg/25" />
        <div className="relative mx-auto flex min-h-[28rem] max-w-6xl flex-col justify-end px-4 py-12 sm:px-6">
          <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
            The company I sell for
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-fg sm:text-6xl">
            <CompanyLockup stacked />
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-fg/85">
            Southwest Florida’s veteran-owned, in-house solar shop. Cape Coral headquarters.
            Sales through install — no handoff to a crew you have never met.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">Since 2018</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
            Built on a simple rule: do the right job.
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
            <p>
              <CompanyLockup /> was established in 2018 in Cape Coral. Founder and CEO Jordon
              Gilewski built it as a veteran-owned, fully licensed turnkey company — photovoltaic
              solar and solar pool heating, with the technicians on payroll.
            </p>
            <p>
              That structure is why I work here. When I walk a homeowner through a design, I am
              not selling a lead to a third party. The same office that quotes the job pulls the
              permit and sends the crew.
            </p>
            <p>
              The shop serves Southwest Florida: Cape Coral, Fort Myers, and the surrounding
              coast. The work is custom — roof type, usage, pool, backup power — not a one-size
              kit dropped on every house.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <a href={COMPANY.url} target="_blank" rel="noreferrer">
                Official company site
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Back to Adam</Link>
            </Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl">
          <img
            src="/images/home-battery.jpg"
            alt="Florida home with rooftop solar and a wall-mounted home battery"
            className="h-full min-h-72 w-full object-cover"
          />
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">What we install</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
            One shop. The whole system.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((item) => (
              <article
                key={item.title}
                className="rounded-lg bg-bg p-5 shadow-[var(--shadow-border)]"
              >
                <item.icon className="size-5 text-gold" />
                <h3 className="mt-4 font-display text-2xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_20rem]">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">Why this crew</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
            In-house is the whole point.
          </h2>
          <ul className="mt-8 space-y-3">
            {REASONS.map((reason) => (
              <li key={reason} className="flex gap-3 text-sm leading-relaxed text-muted">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-gold" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
        <aside className="rounded-xl bg-surface p-6 shadow-[var(--shadow-border)]">
          <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">Licenses</p>
          <ul className="mt-4 space-y-4">
            {COMPANY.licenses.map((lic) => (
              <li key={lic.id}>
                <p className="text-sm text-muted">{lic.label}</p>
                <p className="font-display text-2xl font-semibold text-fg">{lic.id}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6 h-px w-full bg-border" />
          <p className="mt-6 text-sm text-muted">Office</p>
          <p className="mt-1 text-sm text-fg">
            {COMPANY.addressLine}
            <br />
            {COMPANY.cityStateZip}
          </p>
          <a href={COMPANY.phoneHref} className="mt-3 inline-block text-gold hover:text-fg">
            {COMPANY.phoneDisplay}
          </a>
        </aside>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <CtaBand
          heading="Ready to see if this roof is a fit?"
          body="Call the office, ask for Adam, and we will look at your bill and your roof before anyone talks product."
        />
      </section>
    </main>
  );
}
