import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, PenTool, Phone, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaBand } from "@/components/cta-band";
import { seoHead } from "@/lib/seo";
import { COMPANY, SITE_NAME } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () =>
    seoHead(
      `${SITE_NAME} | Sales Manager, Solar Energy Solutions of America`,
      "Meet Adam Tourlakes, Sales Manager at Solar Energy Solutions of America in Cape Coral. Straight answers on rooftop solar for Southwest Florida homes.",
      "/",
    ),
  component: Home,
});

const STEPS = [
  {
    icon: BarChart3,
    title: "Analyze Usage",
    body: "We start by determining your monthly and yearly usage. Knowing exactly how much your home uses, plus any changes in the future, is crucial.",
  },
  {
    icon: PenTool,
    title: "Personalized Design",
    body: "We build your system from the ground up using your usage history. We hand-model your home in our software and apply the most up-to-date irradiance information.",
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
    name: "Dave Horton",
  },
  {
    quote:
      "Great experience. Adam was very knowledgeable and helpful. The installation was quick and quality.",
    name: "Daniel DeShazo",
  },
];

function Home() {
  return (
    <main>
      <section className="hero-stage relative isolate min-h-svh overflow-hidden">
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
            <p className="mt-6 text-xs font-medium tracking-[0.2em] text-gold uppercase">
              Solar Expert · Southwest Florida
            </p>
            <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight text-fg sm:text-6xl lg:text-7xl">
              Honest solar.
              <span className="mt-1 block font-medium italic text-gold">No runaround.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              I'm Adam Tourlakes, Head of Sales at Solar Energy Solutions by Ecosmart. I help
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
        <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">How I work</p>
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
            <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">About</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">
              Local, licensed, and on the job after the handshake.
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
              <p>
                I sell solar for a Cape Coral company that actually builds what it sells.{" "}
                {COMPANY.name} was founded in 2018. It is veteran-owned. The technicians are
                employees — not a rotating list of subcontractors.
              </p>
              <p>
                That matters on this coast. Roofs here take sun, salt, and storm season. The
                equipment has to be specified for Florida, the racking has to be permitted
                correctly, and someone has to pick up the phone when a homeowner has a question
                in month fourteen.
              </p>
              <p>
                My job is the front of that process: walk the usage, size the array, explain the
                bill math in 2026 (including the fact that the federal residential tax credit
                closed at the end of 2025), and keep the timeline honest.
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
                key={item.name}
                className="rounded-lg bg-bg p-5 shadow-[var(--shadow-border)]"
              >
                <p className="font-display text-xl leading-snug text-fg italic">
                  “{item.quote}”
                </p>
                <footer className="mt-4 text-xs font-medium tracking-wide text-gold uppercase">
                  {item.name}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <CtaBand
          heading="Want a straight answer on your roof?"
          body="Call the Cape Coral office and ask for Adam. Bring a recent electric bill if you have one — that is the fastest way to see whether solar actually pays on your house."
        />
      </section>
    </main>
  );
}
