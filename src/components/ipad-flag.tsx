import { useEffect } from "react";

/** iPadOS 13+ reports as Macintosh. Class the document so CSS can split landscape/portrait. */
export const IPAD_FLAG_SCRIPT = `(function(){
  try {
    var ua = navigator.userAgent || "";
    var ipad = (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) || /iPad/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
    if (!ipad) return;
    var root = document.documentElement;
    function apply() {
      var portrait = false;
      try { portrait = window.matchMedia("(orientation: portrait)").matches; }
      catch (e) { portrait = window.innerHeight >= window.innerWidth; }
      root.classList.add("is-ipad");
      root.classList.toggle("is-ipad-portrait", portrait);
      root.classList.toggle("is-ipad-landscape", !portrait);
    }
    apply();
    window.addEventListener("resize", apply, { passive: true });
    window.addEventListener("orientationchange", apply, { passive: true });
    try { window.matchMedia("(orientation: portrait)").addEventListener("change", apply); } catch (e) {}
  } catch (e) {}
})();`;

export function IpadFlag() {
  useEffect(() => {
    const ua = navigator.userAgent || "";
    const ipad =
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
      /iPad/i.test(ua) ||
      (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
    if (!ipad) return;
    const root = document.documentElement;
    const apply = () => {
      let portrait = false;
      try {
        portrait = window.matchMedia("(orientation: portrait)").matches;
      } catch {
        portrait = window.innerHeight >= window.innerWidth;
      }
      root.classList.add("is-ipad");
      root.classList.toggle("is-ipad-portrait", portrait);
      root.classList.toggle("is-ipad-landscape", !portrait);
    };
    apply();
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    let mq: MediaQueryList | null = null;
    try {
      mq = window.matchMedia("(orientation: portrait)");
      mq.addEventListener("change", apply);
    } catch {
      mq = null;
    }
    return () => {
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
      mq?.removeEventListener("change", apply);
    };
  }, []);
  return null;
}
