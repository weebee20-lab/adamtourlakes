type Grecaptcha = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

/** Public v3 site key. VITE_ first; server RPC fills in if Publish did not bake it. */
let resolvedKey = String(import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? "").trim();

async function resolveSiteKey() {
  if (resolvedKey.startsWith("6L")) return resolvedKey;
  try {
    const { getRecaptchaSiteKey } = await import("@/lib/recaptcha-rpc");
    const fromServer = String((await getRecaptchaSiteKey()) ?? "").trim();
    if (fromServer.startsWith("6L")) resolvedKey = fromServer;
  } catch {
    /* keep empty */
  }
  return resolvedKey;
}

function siteKey() {
  return resolvedKey.startsWith("6L") ? resolvedKey : "";
}

let loading: Promise<void> | null = null;

export async function loadRecaptcha(): Promise<void> {
  if (typeof window === "undefined") return;
  await resolveSiteKey();
  const key = siteKey();
  if (!key) return;
  if (window.grecaptcha) return;
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
  if (typeof window === "undefined") return "";
  await resolveSiteKey();
  const key = siteKey();
  if (!key) return "";
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
