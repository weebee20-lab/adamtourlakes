import { createServerFn } from "@tanstack/react-start";

export const getRecaptchaSiteKey = createServerFn({ method: "POST" }).handler(async () => {
  const { envFileValue } = await import("@/lib/solar/guard.server");
  const { bundledRecaptchaSiteKey } = await import("@/lib/solar/bundled-secrets.server");
  for (const value of [
    process.env["VITE_RECAPTCHA_SITE_KEY"],
    envFileValue("VITE_RECAPTCHA_SITE_KEY"),
    bundledRecaptchaSiteKey,
  ]) {
    const key = String(value ?? "").trim();
    if (key.startsWith("6L")) return key;
  }
  return "";
});
