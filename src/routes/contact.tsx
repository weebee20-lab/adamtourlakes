import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { AddressSuggest } from "@/components/address-suggest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OutOfAreaDialog } from "@/components/out-of-area-dialog";
import { saveContactLead } from "@/lib/leads-rpc";
import { getRecaptchaToken, loadRecaptcha } from "@/lib/recaptcha-client";
import { seoHead } from "@/lib/seo";
import { COMPANY, JOB_TITLE, SITE_NAME } from "@/lib/site";
import { isSwflZip, zipFromText } from "@/lib/swfl";
import { clearQuoteHandoff, readQuoteHandoff } from "@/lib/quote-handoff";
import { cn } from "@/lib/utils";

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
  const handoff = readQuoteHandoff();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [place, setPlace] = useState(handoff?.label || handoff?.zip || "");
  const [bill, setBill] = useState(handoff?.monthlyBill ? String(handoff.monthlyBill) : "");
  const [backup, setBackup] = useState(Boolean(handoff?.wantBackup));
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [outOfArea, setOutOfArea] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadRecaptcha();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const zip = zipFromText(place) || handoff?.zip || "";
    if (isSwflZip(zip) === false) {
      setOutOfArea(true);
      return;
    }
    if (!phone.trim()) {
      setError("Phone is required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const design = readQuoteHandoff();
      const fromCalculator = Boolean(design?.fromCalculator && design.panelCount > 0);
      const captchaToken = await getRecaptchaToken("contact_lead");
      const res = await saveContactLead({
        data: {
          name,
          email,
          phone,
          address: place,
          bill,
          backup,
          message,
          captchaToken,
          fromCalculator,
          systemKw: fromCalculator && design?.systemKw
            ? (Math.round(design.systemKw * 100) / 100).toFixed(2)
            : "",
          panelCount: fromCalculator ? String(design?.panelCount || "") : "",
          offsetPct: fromCalculator && design?.offsetPct
            ? String(Math.round(design.offsetPct * 100))
            : "",
          batteryName: fromCalculator && backup ? design?.batteryName || "" : "",
          batteryCount: fromCalculator && backup ? String(design?.batteryCount || "") : "",
        },
      });
      if (!res.ok) {
        if (res.error === "out_of_area") setOutOfArea(true);
        else setError(res.error || "Could not send. Try the office line.");
        return;
      }
      setSent(true);
      clearQuoteHandoff();
    } catch {
      setError("Could not send just now. Call the office and ask for Adam.");
    } finally {
      setBusy(false);
    }
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
            If you'd like to send me the design you created using the Free Solar Calculator on this
            website, use the contact form at the end of that page. If you don't want to use that,
            just fill out this form and send it off.
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
              <p className="text-xs text-muted">
                <span className="text-gold">*</span> Required
              </p>
              <Field label="Name" htmlFor="contact-name" required>
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
                <Field label="Email" htmlFor="contact-email" required>
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
                <Field label="Phone" htmlFor="contact-phone" required>
                  <Input
                    id="contact-phone"
                    type="tel"
                    inputMode="tel"
                    required
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="min-h-11"
                  />
                </Field>
              </div>
              <Field label="Address" htmlFor="contact-place" required>
                <AddressSuggest
                  id="contact-place"
                  value={place}
                  required
                  onChange={setPlace}
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
              <Button type="submit" size="lg" disabled={busy}>
                {busy ? "Sending…" : "Send to Adam"}
              </Button>
              {error ? <p className="text-sm text-gold">{error}</p> : null}
              <p className="text-xs text-muted">
                Or call the office {COMPANY.phoneDisplay} and ask for Adam.
              </p>
            </form>
          )}
        </div>
      </div>

      <OutOfAreaDialog open={outOfArea} onClose={() => setOutOfArea(false)} />
    </main>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5 text-sm font-medium">
      <span>
        {label}
        {required ? <span className="text-gold"> *</span> : <span className="font-normal text-muted"> (optional)</span>}
      </span>
      {children}
    </label>
  );
}
