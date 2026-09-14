import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FLORIDA_CHILDREN, type HubFaq } from "@/lib/seo/florida";
import { cn } from "@/lib/utils";

export function SeoBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 grid gap-3 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}

export function SeoCtas() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button asChild size="lg">
        <Link to="/calculator">
          Free solar calculator
          <ArrowRight className="size-4" />
        </Link>
      </Button>
      <Button asChild size="lg" variant="outline">
        <Link to="/contact">Contact Adam</Link>
      </Button>
    </div>
  );
}

export function SeoHubLinks({ extra }: { extra?: ReactNode }) {
  return (
    <p className="text-sm leading-relaxed text-muted">
      <Link to="/florida" className="font-medium text-gold hover:text-fg">
        Florida solar
      </Link>
      {FLORIDA_CHILDREN.map((page) => (
        <span key={page.to}>
          {" · "}
          <Link to={page.to} className="font-medium text-gold hover:text-fg">
            {page.label}
          </Link>
        </span>
      ))}
      {" · "}
      <Link to="/solar" className="font-medium text-gold hover:text-fg">
        How solar works
      </Link>
      {extra}
    </p>
  );
}

export function SeoFaq({ items }: { items: HubFaq[] }) {
  return (
    <section className="grid gap-3">
      {items.map((item) => (
        <article key={item.q} className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold tracking-tight">{item.q}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
        </article>
      ))}
    </section>
  );
}

export function SeoShell({
  kicker,
  title,
  lead,
  children,
  className,
}: {
  kicker: string;
  title: string;
  lead: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6", className)}>
      <header className="max-w-2xl">
        <p className="text-xs font-medium tracking-[0.16em] text-gold uppercase">{kicker}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{lead}</p>
      </header>
      {children}
    </main>
  );
}

export function faqJsonLd(items: HubFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}