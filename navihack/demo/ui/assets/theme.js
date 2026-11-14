/* Tema claro/oscuro con persistencia. Prioridad: #light/#dark (capturas) > localStorage > sistema. */
(function () {
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem("tinyvigo-theme"); } catch (e) {}
  var hash = location.hash.indexOf("dark") > -1 ? "dark" : location.hash.indexOf("light") > -1 ? "light" : null;
  var theme = hash || stored || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  function apply(t) { root.setAttribute("data-theme", t); }
  apply(theme);
  function toggle() {
    theme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    apply(theme);
    try { localStorage.setItem("tinyvigo-theme", theme); } catch (e) {}
    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
      b.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      b.setAttribute("aria-label", theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
      var ic = b.querySelector(".lu");
      if (ic) { ic.innerHTML = LU.svg(theme === "dark" ? "moon" : "sun", { size: 20 }); ic.dataset.cur = theme === "dark" ? "moon" : "sun"; }
    });
  }
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
      var ic = b.querySelector(".lu");
      if (ic) { ic.dataset.size = 20; ic.innerHTML = LU.svg(theme === "dark" ? "moon" : "sun", { size: 20 }); ic.dataset.cur = theme === "dark" ? "moon" : "sun"; }
      b.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      b.addEventListener("click", toggle);
    });
  });
})();
