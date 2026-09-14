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

function siteKey() {
  return String(import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? "").trim();
}

export function loadRecaptcha(): Promise<Grecaptcha | null> {
  const key = siteKey();
  if (!key) return Promise.resolve(null);
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.grecaptcha) return Promise.resolve(window.grecaptcha);

  return new Promise((resolve) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const onReady = () => {
      window.grecaptcha?.ready(() => resolve(window.grecaptcha ?? null));
    };
    if (existing) {
      existing.addEventListener("load", onReady, { once: true });
      if (window.grecaptcha) onReady();
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(key)}`;
    script.async = true;
    script.defer = true;
    script.onload = onReady;
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
}

export async function getRecaptchaToken(action: string): Promise<string> {
  const key = siteKey();
  if (!key) return "";
  const grecaptcha = await loadRecaptcha();
  if (!grecaptcha) return "";
  try {
    return (await grecaptcha.execute(key, { action })) || "";
  } catch {
    return "";
  }
}
