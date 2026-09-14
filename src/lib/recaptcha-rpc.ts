import { createServerFn } from "@tanstack/react-start";

export const getRecaptchaSiteKey = createServerFn({ method: "POST" }).handler(async () => {
  const { envFileValue } = await import("@/lib/solar/guard.server");
  return (
    String(process.env["VITE_RECAPTCHA_SITE_KEY"] ?? "").trim() ||
    envFileValue("VITE_RECAPTCHA_SITE_KEY")
  );
});
