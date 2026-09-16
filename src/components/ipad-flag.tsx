/** iPadOS 13+ reports as Macintosh. Class the document so CSS can split landscape/portrait. */
export const IPAD_FLAG_SCRIPT = `(function(){
  try {
    var ipad = (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) || /iPad/.test(navigator.userAgent);
    if (!ipad) return;
    var root = document.documentElement;
    function apply() {
      var land = window.innerWidth > window.innerHeight;
      root.classList.add("is-ipad");
      root.classList.toggle("is-ipad-landscape", land);
      root.classList.toggle("is-ipad-portrait", !land);
    }
    apply();
    window.addEventListener("resize", apply, { passive: true });
    window.addEventListener("orientationchange", apply, { passive: true });
  } catch (e) {}
})();`;
