import { useEffect } from "react";

function flagIpad() {
  const ua = navigator.userAgent || "";
  return (
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
    /iPad/i.test(ua) ||
    (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
  );
}

function applyIpadClasses() {
  const root = document.documentElement;
  const body = document.body;
  let portrait = false;
  try {
    portrait = window.matchMedia("(orientation: portrait)").matches;
  } catch {
    portrait = window.innerHeight >= window.innerWidth;
  }
  for (const el of [root, body]) {
    if (!el) continue;
    el.classList.add("is-ipad");
    el.classList.toggle("is-ipad-portrait", portrait);
    el.classList.toggle("is-ipad-landscape", !portrait);
  }
}

/** iPadOS 13+ reports as Macintosh. Class html AND body so React hydrate cannot wipe both. */
export const IPAD_FLAG_SCRIPT = `(function(){
  try {
    var ua = navigator.userAgent || "";
    var ipad = (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) || /iPad/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
    if (!ipad) return;
    function apply() {
      var portrait = false;
      try { portrait = window.matchMedia("(orientation: portrait)").matches; }
      catch (e) { portrait = window.innerHeight >= window.innerWidth; }
      var nodes = [document.documentElement, document.body];
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (!el) continue;
        el.classList.add("is-ipad");
        el.classList.toggle("is-ipad-portrait", portrait);
        el.classList.toggle("is-ipad-landscape", !portrait);
      }
    }
    apply();
    window.addEventListener("resize", apply, { passive: true });
    window.addEventListener("orientationchange", apply, { passive: true });
    try { window.matchMedia("(orientation: portrait)").addEventListener("change", apply); } catch (e) {}
  } catch (e) {}
})();`;

export function IpadFlag() {
  useEffect(() => {
    if (!flagIpad()) return;
    applyIpadClasses();
    window.addEventListener("resize", applyIpadClasses);
    window.addEventListener("orientationchange", applyIpadClasses);
    let mq: MediaQueryList | null = null;
    try {
      mq = window.matchMedia("(orientation: portrait)");
      mq.addEventListener("change", applyIpadClasses);
    } catch {
      mq = null;
    }
    return () => {
      window.removeEventListener("resize", applyIpadClasses);
      window.removeEventListener("orientationchange", applyIpadClasses);
      mq?.removeEventListener("change", applyIpadClasses);
    };
  }, []);
  return null;
}
