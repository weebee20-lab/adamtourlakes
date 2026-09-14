import { getRequest } from "@tanstack/react-start/server";
import { envFileValue } from "@/lib/solar/guard.server";

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const MIN_SCORE = 0.5;

function secretKey() {
  return String(process.env["RECAPTCHA_SECRET_KEY"] ?? "").trim() || envFileValue("RECAPTCHA_SECRET_KEY");
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
  const secret = secretKey();
  if (!secret) {
    return { ok: false, error: "Security check unavailable. Try again later." };
  }
  if (!token.trim()) {
    return { ok: false, error: "Security check failed. Refresh and try again." };
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  const ip = remoteIp();
  if (ip) body.set("remoteip", ip);

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as {
      success?: boolean;
      score?: number;
      action?: string;
    };
    const score = typeof data.score === "number" ? data.score : 0;
    if (!data.success || score < MIN_SCORE) {
      return { ok: false, error: "Security check failed. Refresh and try again." };
    }
    if (data.action && data.action !== expectedAction) {
      return { ok: false, error: "Security check failed. Refresh and try again." };
    }
    return { ok: true, score };
  } catch {
    return { ok: false, error: "Security check unavailable. Try again later." };
  }
}
