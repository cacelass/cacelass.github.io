// TinyVigo: una sola hoja abierta a la vez (MOB-01).
// Lista, ficha, tour, «Hoy», paseo y ajustes se abren cada uno por su cuenta; aquí, al abrirse
// uno, los demás se cierran con SU PROPIO botón × (así cada componente reinicia su estado y no
// queda nada a medias debajo). Marca <body> con .tv-has-sheet para que la barra inferior se aparte.
(function () {
  const SHEETS = [".tv-sheet", ".tv-tour", ".tv-step", ".tv-settings", ".tv-panel"];
  const mobile = () => matchMedia("(max-width: 700px)").matches;
  const isPanel = (n) => n.classList.contains("tv-panel");
  const isOpen = (n) => (isPanel(n) ? mobile() && !n.classList.contains("is-collapsed") : n.classList.contains("is-open"));
  const wasOpen = (n, old) => {
    const had = (c) => (" " + (old || "") + " ").includes(" " + c + " ");
    return isPanel(n) ? mobile() && !had("is-collapsed") : had("is-open");
  };
  const all = () => [...document.querySelectorAll(SHEETS.join(","))];

  function close(n) {
    if (isPanel(n)) { n.classList.add("is-collapsed"); return; }
    const x = [...n.children].find((c) => c.classList && c.classList.contains("tv-close")) || n.querySelector(".tv-close");
    if (x) x.click();
    if (n.classList.contains("is-open")) n.classList.remove("is-open"); // por si su × no lo hace
  }

  let closing = false;
  function update() {
    const open = all().filter(isOpen);
    document.body.classList.toggle("tv-has-sheet", open.some((n) => !isPanel(n)));
    document.body.classList.toggle("tv-has-list", open.some(isPanel));
  }

  const mo = new MutationObserver((records) => {
    if (closing) return;
    for (const r of records) {
      const n = r.target;
      if (!(n instanceof Element) || !SHEETS.some((s) => n.matches(s))) continue;
      if (isOpen(n) && !wasOpen(n, r.oldValue)) {
        closing = true;
        try { all().forEach((o) => { if (o !== n && isOpen(o)) close(o); }); } finally { closing = false; }
      }
    }
    update();
  });

  function start() {
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["class"], attributeOldValue: true });
    update();
  }
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start, { once: true });
  window.tinyvigoSheets = { open: () => all().filter(isOpen).map((n) => n.className), closeAll: () => all().filter(isOpen).forEach(close) };
})();
