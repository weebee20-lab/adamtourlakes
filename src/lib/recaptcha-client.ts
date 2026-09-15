type Grecaptcha = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

/** Public v3 site key (safe in the browser). Secret stays server-only. */
const SITE_KEY = String(import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? "").trim();

function siteKey() {
  return SITE_KEY.startsWith("6L") ? SITE_KEY : "";
}

let loading: Promise<void> | null = null;

export function loadRecaptcha(): Promise<void> {
  const key = siteKey();
  if (!key || typeof window === "undefined") return Promise.resolve();
  if (window.grecaptcha) return Promise.resolve();
  if (loading) return loading;
  loading = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-adam-recaptcha]");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("recaptcha")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(key)}`;
    script.async = true;
    script.defer = true;
    script.dataset.adamRecaptcha = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("recaptcha"));
    document.head.appendChild(script);
  }).then(
    () => undefined,
    () => {
      loading = null;
    },
  );
  return loading;
}

export async function getRecaptchaToken(action: string): Promise<string> {
  const key = siteKey();
  if (!key || typeof window === "undefined") return "";
  try {
    await loadRecaptcha();
    const grecaptcha = window.grecaptcha;
    if (!grecaptcha) return "";
    await new Promise<void>((resolve) => {
      grecaptcha.ready(() => resolve());
    });
    const token = await grecaptcha.execute(key, { action });
    return String(token ?? "").trim();
  } catch {
    return "";
  }
}
