type Grecaptcha = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

const SCRIPT_ID = "recaptcha-v3";

function bakedSiteKey() {
  return String(import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? "").trim();
}

async function resolveSiteKey() {
  if (bakedSiteKey()) return bakedSiteKey();
  try {
    const { getRecaptchaSiteKey } = await import("@/lib/recaptcha-rpc");
    return String((await getRecaptchaSiteKey()) ?? "").trim();
  } catch {
    return "";
  }
}

function waitForGrecaptcha(ms = 8000): Promise<Grecaptcha | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.grecaptcha) {
    return new Promise((resolve) => {
      window.grecaptcha?.ready(() => resolve(window.grecaptcha ?? null));
    });
  }
  return new Promise((resolve) => {
    const start = Date.now();
    const tick = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => resolve(window.grecaptcha ?? null));
        return;
      }
      if (Date.now() - start > ms) {
        resolve(null);
        return;
      }
      window.setTimeout(tick, 50);
    };
    tick();
  });
}

export async function loadRecaptcha(): Promise<Grecaptcha | null> {
  const key = await resolveSiteKey();
  if (!key || typeof window === "undefined") return null;
  if (window.grecaptcha) return waitForGrecaptcha();

  if (!document.getElementById(SCRIPT_ID)) {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(key)}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
  return waitForGrecaptcha();
}

export async function getRecaptchaToken(action: string): Promise<string> {
  const key = await resolveSiteKey();
  if (!key) return "";
  const grecaptcha = await loadRecaptcha();
  if (!grecaptcha) return "";
  try {
    return (await grecaptcha.execute(key, { action })) || "";
  } catch {
    return "";
  }
}
