import { createServerFn } from "@tanstack/react-start";
import type { LocationInfo } from "./types";

export type AddressHit = {
  label: string;
  city: string;
  state: string;
  zip: string;
};

export const suggestAddress = createServerFn({ method: "POST" })
  .validator((d: { q: string }) => ({ q: String(d?.q ?? "").trim().slice(0, 120) }))
  .handler(async ({ data }) => {
    const { allowRateLimit } = await import("./guard.server");
    if (!allowRateLimit("suggest", 60, 10 * 60 * 1000)) return [] as AddressHit[];
    const q = data.q.trim();
    if (q.length < 3) return [] as AddressHit[];
    const { lookupSuggestions } = await import("./places.server");
    return lookupSuggestions(q);
  });

export const resolveLocation = createServerFn({ method: "POST" })
  .validator((d: { q: string }) => ({ q: String(d?.q ?? "").trim().slice(0, 160) }))
  .handler(async ({ data }) => {
    const { allowRateLimit } = await import("./guard.server");
    if (!allowRateLimit("resolve", 40, 10 * 60 * 1000)) return null as LocationInfo | null;
    const q = data.q.trim();
    if (!q) return null;
    const { lookupLocation } = await import("./places.server");
    return lookupLocation(q);
  });
