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

function requestHost() {
  try {
    const req = getRequest();
    return (
      req?.headers.get("x-forwarded-host") ||
      req?.headers.get("host") ||
      ""
    )
      .split(",")[0]
      .trim()
      .toLowerCase()
      .split(":")[0];
  } catch {
    return "";
  }
}

/** Live custom domain keeps v3. Grok iframe previews always return browser-error. */
function recaptchaRequired() {
  const host = requestHost();
  if (!host) return true;
  if (host === "adamtourlakes.com" || host === "www.adamtourlakes.com") return true;
  if (host.endsWith(".grok.me") || host === "grok.me") return false;
  if (host === "localhost" || host.endsWith(".localhost")) return false;
  return true;
}

export async function verifyRecaptchaToken(
  token: string,
  expectedAction: string,
): Promise<{ ok: true; score: number } | { ok: false; error: string }> {
  const required = recaptchaRequired();
  const response = String(token ?? "").trim();
  if (!required) return { ok: true, score: 1 };
  const secret = recaptchaSecret();
  if (!secret) return { ok: false, error: UNAVAILABLE };
  if (!response) return { ok: false, error: FAIL };

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", response);

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "AdamTourlakesSite/1.0",
      },
      body,
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { ok: false, error: FAIL };

    const data = (await res.json()) as {
      success?: boolean;
      score?: number;
      action?: string;
      hostname?: string;
      "error-codes"?: string[];
    };
    const codes = (data["error-codes"] ?? []).filter(Boolean);
    if (!data || data.success !== true) {
      console.error("recaptcha_verify_failed", { codes, hostname: data?.hostname, action: data?.action });
      return { ok: false, error: FAIL };
    }
    if (typeof data.score === "number" && data.score < MIN_SCORE) return { ok: false, error: FAIL };
    const action = String(data.action ?? "").trim();
    if (action && action !== expectedAction) return { ok: false, error: FAIL };
    return { ok: true, score: typeof data.score === "number" ? data.score : 1 };
  } catch {
    return { ok: false, error: UNAVAILABLE };
  }
}
