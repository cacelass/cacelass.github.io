/* Interacciones ligeras compartidas (maqueta). Sin datos reales ni red. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var hh = function (m) { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60) % 24).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };

  document.addEventListener("DOMContentLoaded", function () {
    // chips de capas / filtros
    $$(".chip[aria-pressed]").forEach(function (c) {
      c.addEventListener("click", function () {
        var on = c.getAttribute("aria-pressed") !== "true";
        c.setAttribute("aria-pressed", on ? "true" : "false");
        c.classList.toggle("on", on);
      });
    });
    // añadir a la ruta
    $$("[data-addroute]").forEach(function (b) {
      b.addEventListener("click", function () {
        var added = b.dataset.added !== "1"; b.dataset.added = added ? "1" : "0";
        var lb = b.querySelector(".lb"); if (lb) lb.textContent = added ? "En la ruta" : (b.dataset.label || "Añadir a la ruta");
        var bi = b.querySelector(".bi"); if (bi) bi.innerHTML = LU.svg(added ? "check" : "route", { size: 16 });
        b.classList.toggle("is-added", added);
      });
    });
    // barra de tiempo (arrastre + teclado)
    $$(".timebar").forEach(function (tb) {
      var track = $(".timebar__track", tb); if (!track) return; var dragging = false;
      var at = function (e) {
        var r = track.getBoundingClientRect(); var p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
        tb.style.setProperty("--p", p);
        var m = Math.round(p * 1439); $(".timebar__time", tb).textContent = hh(m);
      };
      track.addEventListener("pointerdown", function (e) { dragging = true; track.setPointerCapture(e.pointerId); at(e); });
      track.addEventListener("pointermove", function (e) { if (dragging) at(e); });
      track.addEventListener("pointerup", function () { dragging = false; });
      track.addEventListener("keydown", function (e) { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); var p = +(tb.style.getPropertyValue("--p") || .5); p = Math.max(0, Math.min(1, p + (e.key === "ArrowRight" ? 0.02 : -0.02))); tb.style.setProperty("--p", p); $(".timebar__time", tb).textContent = hh(Math.round(p * 1439)); } });
    });
    // buscador colapsable
    $$(".search.is-collapsed").forEach(function (s) {
      var btn = $(".search__btn", s), inp = $("input", s);
      if (btn) btn.addEventListener("click", function () { s.classList.remove("is-collapsed", "is-open"); inp.focus(); });
      if (inp) { inp.addEventListener("focus", function () { s.classList.add("is-open"); }); inp.addEventListener("blur", function () { setTimeout(function () { s.classList.remove("is-open"); if (s.classList.contains("is-collapsed") || !inp.value) s.classList.add("is-collapsed"); }, 150); }); }
    });
  });
})();
