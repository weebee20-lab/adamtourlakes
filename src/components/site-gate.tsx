import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteGateStatus, siteGateUnlock } from "@/lib/gate-rpc";
import { SITE_NAME } from "@/lib/site";

export function SiteGate({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void siteGateStatus().then((s) => {
      setOpen(s.ok);
      setReady(true);
    });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await siteGateUnlock({ data: { password } });
    setBusy(false);
    if (!res.ok) {
      setError("Could not unlock.");
      return;
    }
    setPassword("");
    setOpen(true);
  }

  if (open) return <>{children}</>;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg px-4">
      <form
        onSubmit={(e) => void onSubmit(e)}
        className="w-full max-w-md rounded-xl bg-surface px-6 py-8 shadow-[var(--shadow-border)]"
      >
        <p className="text-sm font-medium tracking-[0.16em] text-gold uppercase">Private preview</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">{SITE_NAME}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          This site isn’t public yet. Enter the preview password to continue.
        </p>
        <label className="mt-6 block text-sm font-medium" htmlFor="site-gate-password">
          Password
        </label>
        <Input
          id="site-gate-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2"
          disabled={!ready || busy}
        />
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
        <Button type="submit" size="lg" className="mt-6 w-full" disabled={!ready || busy || !password}>
          {busy ? "Unlocking…" : "Unlock"}
        </Button>
      </form>
    </div>
  );
}
