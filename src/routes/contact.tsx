import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { seoHead } from "@/lib/seo";
import { COMPANY, JOB_TITLE, SITE_NAME } from "@/lib/site";
import { isSwflZip, zipFromText } from "@/lib/swfl";
import { cn } from "@/lib/utils";
import { useDesigner } from "@/store/designer";

export const Route = createFileRoute("/contact")({
  ssr: false,
  head: () =>
    seoHead(
      `Contact ${SITE_NAME} | Solar Quote, Cape Coral`,
      "Ask Adam Tourlakes for a rooftop solar conversation. Cape Coral office, Solar Energy Solutions of America.",
      "/contact",
    ),
  component: ContactPage,
});

function ContactPage() {
  const location = useDesigner((s) => s.location);
  const monthlyBill = useDesigner((s) => s.monthlyBill);
  const wantBackup = useDesigner((s) => s.wantBackup);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [place, setPlace] = useState(location?.zip ? location.label || location.zip : "");
  const [bill, setBill] = useState(monthlyBill ? String(monthlyBill) : "");
  const [backup, setBackup] = useState(wantBackup);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [outOfArea, setOutOfArea] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const zip = zipFromText(place) || location?.zip || "";
    if (isSwflZip(zip) === false) {
      setOutOfArea(true);
      return;
    }
    setSent(true);
  }

  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-end gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:pt-6">
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <img
            src="/portraits/adam-user.png"
            alt={`${SITE_NAME}, ${JOB_TITLE} at ${COMPANY.name}`}
            className="portrait-cutout portrait-glow mx-auto block h-auto max-h-[58vh] w-auto object-contain object-bottom lg:max-h-[78vh]"
            width={1483}
            height={1800}
          />
        </div>

        <div className="relative z-10 pb-10 lg:pb-16">
          <p className="text-xs font-medium tracking-[0.2em] text-gold uppercase">Cape Coral office</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Contact Adam
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Send the roof you just sized — or just a name and a bill. I will follow up from the{" "}
            {COMPANY.short} shop in Cape Coral.
          </p>

          {sent ? (
            <div className="mt-8 rounded-xl border border-gold/40 bg-surface p-6">
              <p className="font-display text-2xl font-semibold tracking-tight text-gold">Got it.</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Thanks, {name.split(" ")[0] || "neighbor"}. I will be in touch. The fastest path is still the office
                line — ask for Adam.
              </p>
              <Button asChild className="mt-5">
                <a href={COMPANY.phoneHref}>Call {COMPANY.phoneDisplay}</a>
              </Button>
            </div>
          ) : (
            <form className="mt-8 flex flex-col gap-4" onSubmit={onSubmit}>
              <Field label="Name" htmlFor="contact-name">
                <Input
                  id="contact-name"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="min-h-11"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" htmlFor="contact-email">
                  <Input
                    id="contact-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="min-h-11"
                  />
                </Field>
                <Field label="Phone" htmlFor="contact-phone">
                  <Input
                    id="contact-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="min-h-11"
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Address or ZIP" htmlFor="contact-place">
                  <Input
                    id="contact-place"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    className="min-h-11"
                  />
                </Field>
                <Field label="Average monthly bill" htmlFor="contact-bill">
                  <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted">
                      $
                    </span>
                    <Input
                      id="contact-bill"
                      inputMode="decimal"
                      value={bill}
                      onChange={(e) => setBill(e.target.value.replace(/[^\d.]/g, ""))}
                      className="font-num min-h-11 pl-7"
                    />
                  </div>
                </Field>
              </div>
              <label className="flex min-h-11 items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-[#c9a44a]"
                  checked={backup}
                  onChange={(e) => setBackup(e.target.checked)}
                />
                I want backup batteries considered
              </label>
              <Field label="Anything else" htmlFor="contact-note">
                <textarea
                  id="contact-note"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={cn(
                    "w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-gold",
                  )}
                />
              </Field>
              <Button type="submit" size="lg">
                Send to Adam
              </Button>
              <p className="text-xs text-muted">
                Or call the office {COMPANY.phoneDisplay} and ask for Adam.
              </p>
            </form>
          )}
        </div>
      </div>

      {outOfArea ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="out-of-area-title"
        >
          <div className="w-full max-w-md rounded-xl border border-gold/40 bg-surface p-6 shadow-[var(--shadow-border)]">
            <p id="out-of-area-title" className="font-display text-2xl font-semibold tracking-tight">
              Outside the service area
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              You are outside of Adam's service area. Visit{" "}
              <a
                href="https://heliosolarcalculator.com"
                className="font-medium text-gold underline decoration-gold/50 underline-offset-4 hover:text-fg"
                rel="noreferrer"
                target="_blank"
              >
                HelioSolarCalculator.com
              </a>{" "}
              to see installers in your area.
            </p>
            <Button type="button" className="mt-6" onClick={() => setOutOfArea(false)}>
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}
