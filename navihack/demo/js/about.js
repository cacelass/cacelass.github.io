// TinyVigo «Acerca de» (D-17): créditos y licencias de cada fuente, en el idioma activo (WEB-04).
// Textos de data/i18n (about.*); fuentes de vault/01_PROYECTO/licencias.md (LIC-01).
(function () {
  const SOURCES = [
    { what: "about.src_city", who: "Concello de Vigo · datos.vigo.org", licence: "ODC-BY 1.0", url: "https://datos.vigo.org/condiciones-de-uso-de-los-datos/" },
    { what: "about.src_christmas", who: "Concello de Vigo · «Puntos de interés de Navidad 2026-27»", licence: "about.portal_terms", url: "https://www.arcgis.com/home/item.html?id=41caae2067564a92a79d91f5a08c00f6" },
    { what: "about.src_buildings", who: "Concello de Vigo · «Edificios 3D»", licence: "about.portal_terms", url: "https://www.arcgis.com/home/item.html?id=1196c4f7cdfa478eb9ac09b1fffc2576" },
    { what: "about.src_bus", who: "Vitrasa · GTFS, datos.vigo.org", licence: "ODC-BY 1.0", url: "https://datos.vigo.org/" },
    { what: "about.src_train", who: "Renfe Operadora", licence: "CC BY 4.0", url: "https://data.renfe.com/" },
    { what: "about.src_weather", who: "Weather data by Open-Meteo.com", licence: "CC BY 4.0", url: "https://open-meteo.com/" },
    { what: "about.src_terrain", who: "PNOA · MDT05 © Instituto Geográfico Nacional", licence: "CC BY 4.0", url: "https://www.ign.es/" },
    { what: "about.src_streets", who: "© OpenStreetMap contributors", licence: "ODbL 1.0", url: "https://www.openstreetmap.org/copyright" },
  ];
  const el = (tag, attrs, ...kids) => {
    const n = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, v));
    kids.forEach((k) => n.append(k));
    return n;
  };
  // hasta que lleguen los textos, castellano
  const FALLBACK = { "about.title": "TinyVigo", "about.intro": "", "about.sources": "Datos y licencias", "about.note": "", "common.close": "Cerrar", "nav.about": "Créditos y licencias", "about.portal_terms": "Condiciones del portal de datos abiertos" };
  const t = (k) => (window.tinyvigoPoints ? window.tinyvigoPoints.t(k) : FALLBACK[k] || k);

  const dialog = el("dialog", { id: "about", "aria-labelledby": "about-title" });
  const close = el("button", { class: "about-close" });
  close.innerHTML = window.LU ? LU.svg("x", { size: 20 }) : "×";
  const button = el("button", { id: "about-open" });
  button.innerHTML = window.LU ? LU.svg("info", { size: 20 }) : "i";

  function render() {
    close.setAttribute("aria-label", t("common.close"));
    button.setAttribute("aria-label", t("nav.about"));
    const list = el("ul", { class: "about-sources" });
    SOURCES.forEach((s) => {
      const link = el("a", { href: s.url, target: "_blank", rel: "noopener" }, s.who);
      list.append(el("li", {}, el("strong", {}, t(s.what)), el("span", {}, link), el("em", {}, s.licence.startsWith("about.") ? t(s.licence) : s.licence)));
    });
    dialog.replaceChildren(close, el("h2", { id: "about-title" }, t("about.title")), el("p", {}, t("about.intro")),
      el("h3", {}, t("about.sources")), list, el("p", { class: "about-note" }, t("about.note")));
  }

  button.onclick = () => dialog.showModal();
  close.onclick = () => dialog.close();
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  document.body.append(button, dialog);
  render();
  document.addEventListener("tv:ready", render);
  document.addEventListener("tv:lang", render);
  if (location.hash === "#about") dialog.showModal();
  window.tinyvigoAbout = { sources: SOURCES };
})();
