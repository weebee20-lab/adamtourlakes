import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, PenTool, Phone, Timer } from "lucide-react";
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

const STEPS = [
  {
    icon: BarChart3,
    title: "Analyze Usage",
    body: "I start by determining your monthly and yearly usage. Knowing exactly how much your home uses, plus any changes in the future, is crucial.",
  },
  {
    icon: PenTool,
    title: "Personalized Design",
    body: "I build your system from the ground up using your usage history. I hand-model your home in the design software and apply the most up-to-date irradiance information.",
  },
  {
    icon: Timer,
    title: "Keep a real timeline",
    body: "Homeowners who have worked with me mention the same thing: I answer, I explain the process, and I do not vanish after the contract.",
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

export function HomePage() {
  return (
    <main>
      <section className="hero-stage relative isolate min-h-svh overflow-hidden">
        <div className="hero-aura" aria-hidden />
        <div className="hero-portrait-wrap">
          <img
            src="/portraits/adam-user.png"
            alt="Adam Tourlakes, Sales Manager at Solar Energy Solutions of America"
            className="hero-portrait portrait-cutout portrait-glow"
            width={1483}
            height={1800}
            fetchPriority="high"
            decoding="async"
          />
          <span className="hero-cutline" aria-hidden />
        </div>
        <div className="hero-veil" aria-hidden />
        <div className="hero-copy relative z-30 mx-auto flex min-h-svh max-w-7xl flex-col justify-end gap-8 px-4 pt-28 pb-16 sm:px-6 lg:justify-between lg:pt-32 lg:pb-16">
          <div className="max-w-2xl lg:max-w-3xl">
            <img
              src="/brand/signature-gold.png?v=3"
              alt={SITE_NAME}
              className="site-signature-hero"
              width={2533}
              height={883}
            />
            <p className="relative z-10 mt-2 text-xs font-medium tracking-[0.2em] text-gold uppercase">
              Solar Expert · Southwest Florida
            </p>
            <h1 className="relative z-10 mt-4 font-display text-5xl font-semibold tracking-tight text-fg sm:text-6xl lg:text-7xl">
              Honest solar.
              <span className="helio-credit mt-1 block font-medium italic text-gold">No runaround.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              I'm <span className="text-gold">Adam Tourlakes</span>, Head of Sales at Solar Energy Solutions by Ecosmart. I help
              homeowners in Southwest Florida own their power — with a veteran-ran and operated
              crew that designs, permits, and installs in-house.
            </p>
          </div>
          <div className="max-w-2xl lg:max-w-3xl">
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={COMPANY.phoneHref}>
                  <Phone className="size-4" />
                  Talk to Adam
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/solar">
                  How a system works
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-5 text-sm text-muted">
              Office {COMPANY.phoneDisplay} · Ask for Adam · {COMPANY.cityStateZip}
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-sm font-medium tracking-[0.16em] text-gold uppercase sm:text-base">How I Work</p>
        <h2 className="mt-3 max-w-xl font-display text-4xl font-semibold tracking-tight">
          A solar conversation should be educational and fun, not pushy and rushed.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => (
            <article
              key={step.title}
              className="rounded-lg bg-surface p-5 shadow-[var(--shadow-border)]"
            >
              <step.icon className="size-5 text-gold" />
              <h3 className="mt-4 font-display text-2xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-medium tracking-[0.16em] text-gold uppercase sm:text-base">About Me</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
              I learn the house — and the people in it — before I size a solar system.
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
              <p>
                I have been designing solar systems since 2023 and have overseen hundreds of
                installations. I never run a padded sales pitch or force fake “urgency” on my
                clients. I take the time to learn each client: how they live in the house, what
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
          <div className="grid gap-4">
            {QUOTES.map((item) => (
              <blockquote
                key={item.credit}
                className="rounded-lg bg-bg p-5 shadow-[var(--shadow-border)]"
              >
                <p className="font-display text-xl leading-snug text-fg italic">
                  “{item.quote}”
                </p>
                <footer className="mt-4 text-xs font-medium tracking-wide text-gold uppercase">
                  {item.credit}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="flex flex-col justify-between rounded-xl bg-surface px-6 py-8 shadow-[var(--shadow-border)] sm:px-8">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-fg">
                Want a straight answer on your system?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Call the Cape Coral office and ask for Adam. Bring a recent electric bill if you have
                one — that is the fastest way to see whether solar actually pays on your house.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={COMPANY.phoneHref}>
                  <Phone className="size-4" />
                  Call {COMPANY.phoneDisplay}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={COMPANY.contactUrl} target="_blank" rel="noreferrer">
                  Company estimate form
                </a>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted">
              Ask for Adam Tourlakes at the Cape Coral office.
            </p>
          </article>
          <article className="flex flex-col justify-between rounded-xl bg-surface px-6 py-8 shadow-[var(--shadow-border)] sm:px-8">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-fg">
                Just here for solar information?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                How a system works, what it does to a bill, and what a battery actually buys you —
                no sales call required.
              </p>
            </div>
            <div className="mt-6">
              <Button asChild size="lg">
                <Link to="/solar">
                  Solar Education
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
