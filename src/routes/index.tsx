import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Building2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { seoHead } from "@/lib/seo";
import { COMPANY, SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/")({
  shouldReload: false,
  head: () =>
    seoHead(
      `${SITE_NAME} | Sales Manager, Solar Energy Solutions of America`,
      "Meet Adam Tourlakes, Sales Manager at Solar Energy Solutions of America in Cape Coral. Straight answers on rooftop solar for Southwest Florida homes.",
      "/",
    ),
  component: HomePage,
});

const PURPOSES = [
  {
    icon: Building2,
    title: "Southwest Florida Homeowners",
    body: "This site showcases the company I'm proud to work for — Solar Energy Solutions by EcoSmart — and the installs our crew make happen. If you’re a homeowner here, you can learn a bit about me and reach me easily right through this site. Keep in mind, I only work in Southwest Florida right now." as ReactNode,
    links: [
      { to: "/company" as const, label: "Meet the company" },
      { to: "/contact" as const, label: "Contact Adam" },
    ],
  },
  {
    icon: BookOpen,
    title: "Anyone Looking for Solar Answers",
    body: (
      <>
        I also use this site to answer the questions people actually ask about solar, anywhere in
        the country. I've got educational pages and videos so anyone can understand how a system
        works, what it does to a bill, and exactly what system size you'll need through the built-in{" "}
        <Link to="/calculator" className="font-medium text-gold hover:text-fg">
          Solar Calculator
        </Link>
        . All for free, for everyone, forever.
      </>
    ),
    links: [
      { to: "/solar" as const, label: "Solar Education" },
      { to: "/calculator" as const, label: "Free Solar Calculator" },
    ],
  },
];

const QUOTES = [
  {
    quote:
      "Adam is a great salesman to work with, always there to answer any questions, and very timely. He did a great job explaining the process and laying out a well kept timeline for us.",
    credit: "Dave H., Cape Coral, FL",
  },
  {
    quote:
      "Great experience. Adam was very knowledgeable and helpful. The installation was quick and quality.",
    credit: "Daniel D., Cape Coral, FL",
  },
];

function PurposeCard({ item }: { item: (typeof PURPOSES)[number] }) {
  return (
    <article className="flex h-full flex-col rounded-lg bg-surface p-5 shadow-[var(--shadow-border)]">
      <item.icon className="size-5 text-gold" />
      <h3 className="mt-4 font-display text-2xl font-semibold">{item.title}</h3>
      <p className="mt-2 flex-1 text-base leading-relaxed text-muted sm:text-lg">{item.body}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        {item.links.map((link) => (
          <Button key={link.to} asChild variant="outline">
            <Link to={link.to}>
              {link.label}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        ))}
      </div>
    </article>
  );
}

export function HomePage() {
  return (
    <main>
      <section className="hero-stage relative isolate min-h-svh overflow-hidden lg:min-h-0">
        <div className="hero-veil" aria-hidden />
        <div className="hero-dither" aria-hidden />
        <div className="hero-lock">
        <div className="hero-portrait-wrap">
          <div className="hero-aura" aria-hidden />
          <img
            src="/portraits/adam-user.png"
            alt="Adam Tourlakes, Sales Manager at Solar Energy Solutions of America"
            className="hero-portrait portrait-cutout portrait-glow"
            width={1483}
            height={1800}
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <div className="hero-copy relative z-30 mx-auto flex min-h-0 max-w-7xl flex-col justify-end gap-8 px-4 pt-28 pb-16 sm:px-6 lg:min-h-[800px] lg:justify-start lg:gap-6 lg:pt-32 lg:pb-12">
          <div className="max-w-2xl lg:max-w-3xl">
            <img
              src="/brand/signature-gold.png?v=3"
              alt={SITE_NAME}
              className="site-signature-hero"
              width={2533}
              height={883}
            />
            <p className="relative z-10 mt-2 text-xs font-medium tracking-[0.2em] text-gold uppercase lg:text-[0.975rem]">
              Solar Expert · Southwest Florida
            </p>
            <h1 className="relative z-10 mt-4 font-display text-5xl font-semibold tracking-tight text-fg sm:text-6xl lg:text-7xl">
              Honest solar.{" "}
              <span className="helio-credit mt-1 block font-medium italic text-gold lg:mt-0 lg:inline">
                No runaround.
              </span>
            </h1>
            <div className="hero-copy-panel mt-6">
            <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              I'm <span className="text-gold">Adam Tourlakes</span>, Head of Sales at Solar Energy Solutions by Ecosmart. I help
              homeowners in Southwest Florida own their power — with a veteran-run and operated
              crew that designs, permits, and installs in-house.
            </p>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              Like any trade, solar needs professionals as the face of it — not a script-reciting
              salesman or a door knocker saying he’s there to give you a “free energy audit.” My team
              and I are the solar professionals you’ve been hoping for. We’re trained, experienced,
              and we put honesty, integrity, fair pricing, and transparency first. No door knockers.
              Strict pricing. Our reviews speak for themselves.
            </p>
            </div>
          </div>
          <div className="max-w-2xl lg:max-w-3xl">
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/contact">Contact Adam</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/solar">
                  How a system works
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/calculator">
                  Size your system for free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        </div>
        <div className="hero-cutline" aria-hidden />
      </section>

      <section className="relative z-20 mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="max-w-xl font-display text-4xl font-semibold tracking-tight">
          Who is this website for?
        </h2>
        <div className="mt-10 grid items-stretch gap-8 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-10 lg:gap-12">
          <PurposeCard item={PURPOSES[0]!} />
          <p
            className="flex items-center justify-center font-display text-7xl font-semibold leading-none text-gold md:text-8xl lg:text-[7.5rem]"
            style={{ textShadow: "0 0 28px color-mix(in oklab, var(--color-gold) 45%, transparent)" }}
            aria-hidden
          >
            &
          </p>
          <PurposeCard item={PURPOSES[1]!} />
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium tracking-[0.16em] text-gold uppercase sm:text-base">How I Work</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
              I learn the house — and the people in it — before I size a solar system.
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted sm:text-lg">
              <p>
                I have been designing solar systems since 2023 and have overseen hundreds of
                installations. I never run a padded sales pitch or force fake “urgency” on my
                clients. I take the time to learn about each client: how they live in the house, what
                the bill actually looks like, and what they want solar to do for them.
              </p>
              <p>
                Current usage always comes first for the design. I get monthly and yearly
                kilowatt-hours for every home I design — summer AC, pool equipment, whatever is
                driving the statement — so the array is sized appropriately. Then I determine
                future usage: an EV, a new heat pump, someone moving in, a pool you might have
                been putting off. A system built only on last year's bill is already wrong if
                next year's load is different.
              </p>
              <p>
                My clients' priorities matter just as much. Some people want the electric bill as
                close to zero as possible. Some want substantial backup for storm season. Some
                want a clean layout on the roof planes that face the street or to leave all
                panels off street-side roofs. I always design systems based on exactly what my
                clients need and want.
              </p>
              <p>
                I pride myself on being the main point of contact for all of my clients, from the
                very first phone call to months after the installation.
              </p>
            </div>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/company">
                Meet the company
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid content-start gap-4">
            {QUOTES.map((item) => (
              <blockquote
                key={item.credit}
                className="h-fit rounded-lg bg-bg p-5 shadow-[var(--shadow-border)]"
              >
                <p className="font-display text-xl leading-snug text-fg italic">
                  “{item.quote}”
                </p>
                <footer className="mt-4 text-xs font-medium tracking-wide text-gold uppercase">
                  {item.credit}
                </footer>
              </blockquote>
            ))}
            <article className="flex h-fit flex-col rounded-lg bg-bg p-5 shadow-[var(--shadow-border)]">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
                Want real answers about a system for your home?
              </h2>
              <p className="mt-2 text-base leading-relaxed text-muted sm:text-lg">
                Call the Cape Coral office and ask for Adam. Have a recent electric bill handy if you can.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <a href={COMPANY.phoneHref}>Call {COMPANY.phoneDisplay}</a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/contact">Contact Adam</Link>
                </Button>
              </div>
            </article>
            <article className="flex h-fit flex-col rounded-lg bg-bg p-5 shadow-[var(--shadow-border)]">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-fg">
                Just here for solar information?
              </h2>
              <p className="mt-2 text-base leading-relaxed text-muted sm:text-lg">
                How a system works, what it does to a bill, and what a battery actually buys you —
                no sales call required.
              </p>
              <div className="mt-4">
                <Button asChild size="lg">
                  <Link to="/solar">
                    Solar Education
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
