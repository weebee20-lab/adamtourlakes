import { createServerFn } from "@tanstack/react-start";

function text(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

export const siteGateStatus = createServerFn({ method: "POST" }).handler(async () => {
  const { isSiteOpen } = await import("@/lib/gate.server");
  return { ok: isSiteOpen() };
});

export const siteGateUnlock = createServerFn({ method: "POST" })
  .validator((d: { password: string }) => ({ password: text(d?.password, 120) }))
  .handler(async ({ data }) => {
    const { allowRateLimit } = await import("@/lib/solar/guard.server");
    if (!allowRateLimit("site-gate", 5, 15 * 60 * 1000)) {
      return { ok: false as const };
    }
    const { unlockSite } = await import("@/lib/gate.server");
    return unlockSite(data.password) ? { ok: true as const } : { ok: false as const };
  });
