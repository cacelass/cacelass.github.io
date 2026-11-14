// TinyVigo: datos en vivo desde ficheros propios (WEB-05). Nada de APIs de terceros desde el navegador:
// web/data/live/<feed>.json lo publica scripts/build_web_live.py a partir de los snapshots validados (D-01).
// Si un fichero falta o viene vacío, la promesa falla con un error claro y se avisa una vez (tv:data-error).
(function () {
  const cache = new Map();
  const warned = new Set();
  const TTL = { parkings: 60000, weather: 600000, agenda: 3600000, centros: 86400000 };

  function fail(name, why) {
    const err = new Error("data:" + name + ":" + why);
    err.feed = name; err.reason = why;
    if (!warned.has(name)) { warned.add(name); document.dispatchEvent(new CustomEvent("tv:data-error", { detail: { feed: name, reason: why } })); }
    throw err;
  }

  async function get(name) {
    const hit = cache.get(name);
    if (hit && Date.now() - hit.at < (TTL[name] || 60000)) return hit.doc;
    let r;
    try { r = await fetch("data/live/" + name + ".json", { cache: "no-cache" }); } catch (e) { fail(name, "network"); }
    if (!r.ok) fail(name, "missing");
    let doc;
    try { doc = await r.json(); } catch (e) { fail(name, "invalid"); }
    if (!doc || doc.data == null || (Array.isArray(doc.data) && !doc.data.length)) fail(name, "empty");
    warned.delete(name);
    cache.set(name, { at: Date.now(), doc });
    return doc;
  }

  // Previsión desde la hora actual (lo que antes pedía events.js con forecast_hours=8)
  function fromNow(w, hours = 8) {
    const h = w.hourly || {}, now = new Date();
    const key = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0") + "T" + String(now.getHours()).padStart(2, "0") + ":00";
    const i = Math.max(0, (h.time || []).findIndex((t) => t >= key));
    const cut = {};
    for (const [k, v] of Object.entries(h)) cut[k] = Array.isArray(v) ? v.slice(i, i + hours) : v;
    return { ...w, hourly: cut };
  }

  // aviso visible (role=status) la primera vez que falla un fichero
  document.addEventListener("tv:data-error", (e) => {
    const P = window.tinyvigoPoints, t = P ? P.t : (k) => k;
    const n = document.createElement("div");
    n.className = "tv-toast tv-data-toast"; n.setAttribute("role", "status");
    n.textContent = t("data.error", { what: t("data." + e.detail.feed) });
    document.body.append(n);
    setTimeout(() => n.remove(), 6000);
  });

  window.tinyvigoData = {
    get,
    parkings: () => get("parkings").then((d) => d.data),
    agenda: () => get("agenda").then((d) => d.data),
    centros: () => get("centros").then((d) => d.data),
    weather: () => get("weather").then((d) => fromNow(d.data)),
    fetchedAt: (name) => (cache.get(name) ? cache.get(name).doc.fetched_at : null),
  };
})();
