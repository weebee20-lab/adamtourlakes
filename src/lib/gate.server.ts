import { createHmac, timingSafeEqual } from "node:crypto";
import { getCookie, getRequest, setCookie } from "@tanstack/react-start/server";
import { envFileValue } from "@/lib/solar/guard.server";

const COOKIE = "adam_preview";

function envStr(key: string) {
  return String(process.env[key] ?? "").trim() || envFileValue(key);
}

function gatePassword() {
  return envStr("SITE_GATE_PASSWORD");
}

function gateSecret() {
  return envStr("SITE_GATE_SECRET");
}

function sign(exp: number) {
  return createHmac("sha256", gateSecret()).update(`preview:${exp}`).digest("hex");
}

function safeEqual(a: string, b: string) {
  const max = Math.max(Buffer.byteLength(a), Buffer.byteLength(b), 1);
  const left = Buffer.alloc(max);
  const right = Buffer.alloc(max);
  left.write(a);
  right.write(b);
  return timingSafeEqual(left, right) && a.length === b.length;
}

export function isSiteOpen() {
  if (!gateSecret()) return false;
  const raw = getCookie(COOKIE) ?? "";
  const [expRaw, sig] = raw.split(".");
  const exp = Number(expRaw);
  if (!exp || !sig || exp * 1000 < Date.now()) return false;
  return safeEqual(sig, sign(exp));
}

export function unlockSite(password: string) {
  const expected = gatePassword();
  const secret = gateSecret();
  if (!expected || !secret) return false;
  if (!safeEqual(password, expected)) return false;
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  let proto = "";
  let host = "";
  try {
    const req = getRequest();
    proto = req?.headers.get("x-forwarded-proto") ?? "";
    host = (req?.headers.get("x-forwarded-host") || req?.headers.get("host") || "").toLowerCase();
  } catch {
    /* no request context */
  }
  const secure = proto === "https" || host.includes("adamtourlakes.com") || host.includes(".grok.me");
  setCookie(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
  });
  return true;
}
