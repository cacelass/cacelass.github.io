// TinyVigo «Acerca de» (D-17): créditos y licencias de cada fuente.
// Texto de vault/01_PROYECTO/licencias.md (LIC-01). Botón «i» siempre visible.
(function () {
  const SOURCES = [
    { what: "Aparcamientos, agenda y avisos", who: "Concello de Vigo · datos.vigo.org", licence: "ODC-BY 1.0", url: "https://datos.vigo.org/condiciones-de-uso-de-los-datos/" },
    { what: "Puntos de Navidad 2026-27", who: "Concello de Vigo · capa «Puntos de interés de Navidad 2026-27»", licence: "Condiciones del portal de datos abiertos", url: "https://www.arcgis.com/home/item.html?id=41caae2067564a92a79d91f5a08c00f6" },
    { what: "Edificios", who: "Concello de Vigo · «Edificios 3D»", licence: "Condiciones del portal de datos abiertos", url: "https://www.arcgis.com/home/item.html?id=1196c4f7cdfa478eb9ac09b1fffc2576" },
    { what: "Autobuses (horario programado)", who: "Vitrasa · GTFS vía datos.vigo.org", licence: "ODC-BY 1.0", url: "https://datos.vigo.org/" },
    { what: "Trenes (horario programado)", who: "Renfe Operadora", licence: "CC BY 4.0", url: "https://data.renfe.com/" },
    { what: "Tiempo", who: "Weather data by Open-Meteo.com", licence: "CC BY 4.0", url: "https://open-meteo.com/" },
    { what: "Ortofoto y relieve", who: "PNOA y MDT05 cedidos por © Instituto Geográfico Nacional", licence: "CC BY 4.0", url: "https://www.ign.es/" },
    { what: "Calles", who: "© OpenStreetMap contributors", licence: "ODbL 1.0", url: "https://www.openstreetmap.org/copyright" },
  ];

  const el = (tag, attrs, ...kids) => {
    const n = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, v));
    kids.forEach((k) => n.append(k));
    return n;
  };

  const dialog = el("dialog", { id: "about", "aria-labelledby": "about-title" });
  const list = el("ul", { class: "about-sources" });
  SOURCES.forEach((s) => {
    const link = el("a", { href: s.url, target: "_blank", rel: "noopener" }, s.who);
    list.append(el("li", {}, el("strong", {}, s.what), el("span", {}, link), el("em", {}, s.licence)));
  });
  const close = el("button", { class: "about-close", "aria-label": "Cerrar" }, "×");
  dialog.append(
    close,
    el("h2", { id: "about-title" }, "TinyVigo"),
    el("p", {}, "Mapa ilustrado de la Navidad en el centro de Vigo. Qué hay, si está abierto ahora y cómo llegar andando."),
    el("h3", {}, "Datos y licencias"),
    list,
    el("p", { class: "about-note" }, "Cada capa de la ciudad muestra su fecha de actualización. Autobuses y trenes: horario programado."),
  );

  const button = el("button", { id: "about-open", "aria-label": "Acerca de y créditos" }, "i");
  button.onclick = () => dialog.showModal();
  close.onclick = () => dialog.close();
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  document.body.append(button, dialog);
  if (location.hash === "#about") dialog.showModal();
  window.tinyvigoAbout = { sources: SOURCES };
})();
