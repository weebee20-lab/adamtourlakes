import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBand({
  heading,
  body,
}: {
  heading: string;
  body: string;
}) {
  return (
    <section className="rounded-xl bg-surface px-6 py-8 shadow-[var(--shadow-border)] sm:px-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-fg">{heading}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/contact">
              <Phone className="size-4" />
              Talk to Adam
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/contact">Send Adam a note</Link>
          </Button>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted">
        Ask for Adam Tourlakes at the Cape Coral office. In-house crew — sales through install.
      </p>
    </section>
  );
}
