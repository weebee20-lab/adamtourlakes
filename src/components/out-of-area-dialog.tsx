import { Button } from "@/components/ui/button";

export function OutOfAreaDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
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
        <Button type="button" className="mt-6" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}