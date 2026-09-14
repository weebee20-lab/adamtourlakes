import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getRequest } from "@tanstack/react-start/server";

const buckets = new Map<string, number[]>();
const inflight = new Map<string, Promise<unknown>>();

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
const HELIO_UA = "HelioSolarCalculator/1.0 (https://heliosolarcalculator.com; address lookup)";

function clientIp() {
  try {
    const req = getRequest();
    const xf = req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const real = req?.headers.get("x-real-ip")?.trim();
    return xf || real || "local";
  } catch {
    return "local";
  }
}

function pruneBuckets(now: number) {
  if (buckets.size < 400) return;
  for (const [key, hits] of buckets) {
    const keep = hits.filter((t) => now - t < 15 * 60 * 1000);
    if (keep.length) buckets.set(key, keep);
    else buckets.delete(key);
  }
}

export function allowRateLimit(scope: string, max: number, windowMs: number) {
  const now = Date.now();
  pruneBuckets(now);
  const key = `${scope}:${clientIp()}`;
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

export function clampText(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 120;
}

export function parseEmails(raw: string) {
  const out: string[] = [];
  for (const part of String(raw ?? "").split(/[,;]+/)) {
    const email = part.trim().toLowerCase();
    if (isEmail(email) && !out.includes(email)) out.push(email);
  }
  return out.slice(0, 8);
}

export function isPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15 && /^[+\d().\-\s]+$/.test(value);
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => {
    if (ch === "&") return "&" + "amp;";
    if (ch === "<") return "&" + "lt;";
    if (ch === ">") return "&" + "gt;";
    if (ch === '"') return "&" + "quot;";
    return "&#39;";
  });
}

export function stripTags(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&/gi, "&")
    .replace(/&#39;|'/gi, "'")
    .replace(/"/gi, '"')
    .replace(/</gi, "<")
    .replace(/>/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function capCache<T>(cache: Map<string, T>, max: number) {
  while (cache.size > max) {
    const first = cache.keys().next().value;
    if (!first) break;
    cache.delete(first);
  }
}

export function envFileValue(key: string) {
  for (const name of [".env.local", ".env"]) {
    try {
      const match = readFileSync(join(process.cwd(), name), "utf8").match(new RegExp(`^${key}\\s*=\\s*(.*)$`, "m"));
      const value = match?.[1]?.trim().replace(/^['"]|['"]$/g, "");
      if (value) return value;
    } catch {
      /* missing is fine */
    }
  }
  return "";
}

export function coalesce<T>(key: string, run: () => Promise<T>): Promise<T> {
  const hit = inflight.get(key);
  if (hit) return hit as Promise<T>;
  const pending = run().finally(() => {
    if (inflight.get(key) === pending) inflight.delete(key);
  });
  inflight.set(key, pending);
  return pending;
}

export async function fetchText(url: string, timeoutMs: number): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return "";
    const text = await res.text();
    return text.length > 700_000 ? text.slice(0, 700_000) : text;
  } catch {
    return "";
  }
}

export async function fetchJson(url: string, timeoutMs: number): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": HELIO_UA, Accept: "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
