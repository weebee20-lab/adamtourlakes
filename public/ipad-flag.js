(function () {
  try {
    var ua = navigator.userAgent || "";
    var ipad =
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
      /iPad/i.test(ua) ||
      (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
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
})();
