(function () {
  try {
    var ua = navigator.userAgent || "";
    var ipad =
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
      /iPad/i.test(ua) ||
      (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
    if (!ipad) return;
    function apply() {
      var portrait = false;
      try {
        portrait = window.matchMedia("(orientation: portrait)").matches;
      } catch (e) {
        portrait = window.innerHeight >= window.innerWidth;
      }
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
    try {
      window.matchMedia("(orientation: portrait)").addEventListener("change", apply);
    } catch (e) {}
  } catch (e) {}
})();
