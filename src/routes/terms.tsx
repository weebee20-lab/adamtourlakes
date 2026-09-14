import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () =>
    seoHead(
      "Terms of Use | Adam Tourlakes",
      "Terms for using Adam Tourlakes’ personal solar education site and contact form. Estimates are homework — not a contract.",
      "/terms",
    ),
  component: TermsPage,
});

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 max-w-3xl space-y-3 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}

function TermsPage() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">Legal</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">Terms of Use</h1>
        <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-muted">
          <p>
            Welcome. By using{" "}
            <a href="https://adamtourlakes.com" className="text-gold hover:text-fg">
              adamtourlakes.com
            </a>
            , you agree to these terms. This is my personal site. It is{" "}
            <strong className="font-medium text-fg">not</strong> the official Solar Energy Solutions
            of America corporate website.
          </p>
        </div>

        <Section title="What you get">
          <p>
            Educational content about rooftop solar, batteries, and Southwest Florida context; a
            free calculator for homework; and a contact path to talk with me about a possible
            install through SES of America.
          </p>
        </Section>

        <Section title="What you do not get">
          <ul className="list-disc space-y-2 pl-5">
            <li>A binding price, production guarantee, or financing approval from this website alone.</li>
            <li>An official company portal, warranty portal, or employee-only tools.</li>
            <li>
              Permission to scrape, republish my portrait/brand assets, or misuse the contact form
              for spam.
            </li>
          </ul>
        </Section>

        <Section title="Estimates and advice">
          <p>
            Calculator results and educational copy are for planning conversations. They are not
            engineering stamps, utility approvals, or contracts. Roof condition, electrical panel,
            shade, permits, and utility rules can change the real job. A written proposal after a
            site survey is what counts.
          </p>
          <p>
            I am a salesperson helping homeowners understand options. I am not your attorney, tax
            advisor, or insurer.
          </p>
        </Section>

        <Section title="Contact and service area">
          <p>
            The contact form is meant for Southwest Florida homeowners I can actually help.
            Out-of-area submissions may be declined. Providing accurate contact details is on you.
            Do not submit other people’s information without permission.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p>
            Don’t break the site, flood the form, or use the site for unlawful activity. I may
            ignore or block abusive traffic.
          </p>
        </Section>

        <Section title="Third-party tools">
          <p>
            The Free Solar Calculator may load Helio tools and link out to Helio. Company pages may
            link to solarenergysolutionsofamerica.com. Those sites have their own terms. Embedded
            or linked tools are provided “as available.”
          </p>
        </Section>

        <Section title="Intellectual property">
          <p>
            Site copy, layout, portraits, and brand marks on this domain are mine (or used with
            permission). Keep personal, non-commercial viewing/sharing reasonable; don’t copy the
            site wholesale.
          </p>
        </Section>

        <Section title="Limitation">
          <p>
            To the fullest extent allowed by law, I and SES of America are not liable for decisions
            you make solely from website estimates or educational pages. The site is provided
            as-is. Some limitations may not apply where local law says otherwise.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            I may update these terms by posting a new version here. Continued use after a material
            update means you accept the new terms.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions:{" "}
            <Link to="/contact" className="text-gold hover:text-fg">
              Contact Adam
            </Link>{" "}
            or (239) 994-2100 (Cape Coral office — ask for Adam).
          </p>
        </Section>

        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-muted italic">
          Last updated: September 2026.
        </p>
      </section>
    </main>
  );
}
