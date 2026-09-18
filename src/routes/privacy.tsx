import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    seoHead(
      "Privacy Policy | Adam Tourlakes",
      "How this personal site handles contact form details, the free calculator, and cookies. From Adam Tourlakes in Cape Coral.",
      "/privacy",
    ),
  component: PrivacyPage,
});

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 max-w-3xl space-y-3 text-sm leading-relaxed text-muted">{children}</div>
    </section>
  );
}

function PrivacyPage() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">Legal</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">Privacy Policy</h1>
        <div className="mt-4 max-w-3xl space-y-3 text-sm leading-relaxed text-muted">
          <p>
            This is my personal site — Adam Tourlakes, Sales Manager at Solar Energy Solutions
            Powered by EcoSmart in Cape Coral. It is <strong className="font-medium text-fg">not</strong> the
            official Solar Energy Solutions corporate website. This page explains what information shows up
            when you use{" "}
            <a href="https://adamtourlakes.com" className="text-gold hover:text-fg">
              adamtourlakes.com
            </a>
            , and what I do with it.
          </p>
        </div>

        <Section title="What this site is for">
          <p>
            Educational solar videos and pages, a free bill-first calculator, and a way to reach me
            for a Southwest Florida rooftop conversation. If you are outside the SWFL service area,
            the contact form will say so — I am not shopping your info nationwide.
          </p>
        </Section>

        <Section title="Information you may give me">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="font-medium text-fg">Contact form</strong> — name, email, phone,
              address or ZIP, average monthly bill, whether you want backup batteries considered,
              and any note you write. That lands in a private lead inbox I use to follow up.
            </li>
            <li>
              <strong className="font-medium text-fg">Calculator inputs</strong> — on the{" "}
              <Link to="/calculator" className="text-gold hover:text-fg">
                Free Solar Calculator
              </Link>{" "}
              page, sizing tools may use address/ZIP, bill, and design details so you can see a
              ballpark. The calculator experience is powered with Helio (
              <a
                href="https://heliosolarcalculator.com"
                className="text-gold hover:text-fg"
                rel="noreferrer"
                target="_blank"
              >
                heliosolarcalculator.com
              </a>
              ). Helio’s own privacy practices apply to what that tool processes; use Helio’s
              privacy page for calculator-specific detail.
            </li>
            <li>
              <strong className="font-medium text-fg">Office contact</strong> — if you call (239)
              994-2100 and ask for Adam, or visit the shop at 2528 Andalusia Blvd, Cape Coral, FL
              33909, the company handles that conversation under its normal business practices.
            </li>
          </ul>
          <p>You do not have to fill the form to watch videos or read the education pages.</p>
        </Section>

        <Section title="How I use it">
          <ul className="list-disc space-y-2 pl-5">
            <li>To answer you and continue a solar conversation you started.</li>
            <li>
              To size a conversation from your bill and roof notes — homework first, not a surprise
              dump to strangers.
            </li>
            <li>To operate and improve this site (bugs, spam protection, basic traffic understanding).</li>
          </ul>
          <p>
            I do <strong className="font-medium text-fg">not</strong> sell contact forms to blast
            lists. SWFL-focused outreach only. If you contacted me, I (or the Solar Energy Solutions office
            when we are working your job) may reach you by email, phone, or text about that inquiry.
          </p>
        </Section>

        <Section title="Cookies, analytics, and ads">
          <p>
            The site may use cookies or similar tech for basic function, security, and understanding
            traffic. If ads or named analytics tools are added later, this page should name them.
            Until then, assume standard web logs and whatever your browser sends on a normal visit.
          </p>
          <p>You can block cookies in the browser; some features may work less well.</p>
        </Section>

        <Section title="Estimates vs real quotes">
          <p>
            Anything the calculator or education pages show — size, savings shape, production
            sketches — is an <strong className="font-medium text-fg">estimate</strong> for homework.
            Final pricing, equipment, permits, and contracts come from a real site visit and a
            written proposal through{" "}
            <Link to="/company" className="text-gold hover:text-fg">
              Solar Energy Solutions
            </Link>
            . Educational content is not a bid.
          </p>
        </Section>

        <Section title="Questions">
          <p>
            Privacy questions: use the{" "}
            <Link to="/contact" className="text-gold hover:text-fg">
              contact form
            </Link>
            , or call the Cape Coral office at (239) 994-2100 and ask for Adam.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            If this policy changes in a material way, I will update this page. Check the date when
            the details matter to you.
          </p>
        </Section>

        <p className="mt-10 max-w-3xl text-xs leading-relaxed text-muted italic">
          Last updated: September 2026.
        </p>
      </section>
    </main>
  );
}
