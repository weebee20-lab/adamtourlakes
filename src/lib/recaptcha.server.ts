import { getRequest } from "@tanstack/react-start/server";
import { envFileValue } from "@/lib/solar/guard.server";
import { bundledRecaptchaSecret } from "@/lib/solar/bundled-secrets.server";

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const MIN_SCORE = 0.3;
const FAIL = "Security check failed. Refresh and try again.";
const UNAVAILABLE = "Security check unavailable. Try again later.";

function recaptchaSecret() {
  for (const value of [
    process.env["RECAPTCHA_SECRET_KEY"],
    bundledRecaptchaSecret,
    envFileValue("RECAPTCHA_SECRET_KEY"),
  ]) {
    const key = String(value ?? "").trim();
    if (key.startsWith("6L")) return key;
  }
  return "";
}

function remoteIp() {
  try {
    const req = getRequest();
    const xf = req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const real = req?.headers.get("x-real-ip")?.trim();
    return xf || real || "";
  } catch {
    return "";
  }
}

export async function verifyRecaptchaToken(
  token: string,
  expectedAction: string,
): Promise<{ ok: true; score: number } | { ok: false; error: string }> {
  const secret = recaptchaSecret();
  if (!secret) return { ok: false, error: UNAVAILABLE };
  const response = String(token ?? "").trim();
  if (!response) return { ok: false, error: FAIL };

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", response);
    const ip = remoteIp();
    if (ip && ip !== "local") body.set("remoteip", ip);

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { ok: false, error: FAIL };

    const data = (await res.json()) as { success?: boolean; score?: number; action?: string };
    if (!data || data.success !== true) return { ok: false, error: FAIL };
    const score = Number(data.score);
    if (!Number.isFinite(score) || score < MIN_SCORE) return { ok: false, error: FAIL };
    const action = String(data.action ?? "").trim();
    if (action && action !== expectedAction) return { ok: false, error: FAIL };
    return { ok: true, score };
  } catch {
    return { ok: false, error: UNAVAILABLE };
  }
}
