// TinyVigo: puntos de Navidad sobre el mapa, lista con filtros, ficha y estado «abierto ahora».
// Datos de data/points.json (scripts/build_web_data.py) y textos de data/i18n/ (I18N-01).
(async function () {
  const LANGS = ["gl", "es", "en"];
  const TYPE_KEY = {
    light: "points.filter_lights", market: "points.filter_markets", attraction: "points.filter_attractions",
    santa_kings: "points.filter_santa", exhibit: "points.filter_exhibits", photo_gallery: "points.filter_exhibits",
    photocall: "points.filter_exhibits",
  };
  const FILTERS = ["all", "light", "attraction", "market", "santa_kings", "exhibit"];
  const ICON = { light: "lightbulb", attraction: "ferris-wheel", market: "store", santa_kings: "gift", exhibit: "camera", photo_gallery: "camera", photocall: "camera", all: "layers" };
  // forma del icono map-pin de Lucide, rellena: el relleno y el trazo salen del CSS (--pin-fill / --pin-line)
  const PIN = '<svg class="tv-pin-shape" viewBox="3.8 1.8 16.4 20.4" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/></svg>';
  const lu = (name, size = 20) => { const s = document.createElement("span"); s.innerHTML = window.LU ? LU.svg(name, { size }) : ""; return s.firstChild || s; };
  const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  const [{ points }, ...cats] = await Promise.all([
    fetch("data/points.json").then((r) => r.json()),
    ...LANGS.map((l) => fetch("data/i18n/" + l + ".json").then((r) => r.json())),
  ]);
  const CAT = Object.fromEntries(LANGS.map((l, i) => [l, cats[i]]));

  const pickLang = () => {
    const q = new URLSearchParams(location.search).get("lang");
    if (LANGS.includes(q)) return q;
    try { const s = localStorage.getItem("tinyvigo.lang"); if (LANGS.includes(s)) return s; } catch (e) {}
    for (const tag of navigator.languages || [navigator.language || ""]) { const b = tag.toLowerCase().split("-")[0]; if (LANGS.includes(b)) return b; }
    return "en"; // WEB-04: si el navegador no está en gl/es/en, inglés
  };
  let lang = pickLang();
  const t = (key, vars = {}) => (CAT[lang][key] ?? CAT.es[key] ?? key).replace(/\{(\w+)\}/g, (h, n) => (n in vars ? vars[n] : h));
  const txt = (obj) => (obj ? obj[lang] || obj.es || obj.gl || "" : "");

  // ── horario: puerto de scripts/programme.py (is_open) ─────────────────────
  const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
  const at = (day, hhmm) => { const [h, m] = hhmm.split(":").map(Number); const r = new Date(day); r.setHours(h, m, 0, 0); return r; };
  function classes(day, holidays) {
    const c = new Set([DAYS[day.getDay()]]);
    if (holidays.includes(iso(day))) c.add("holiday");
    if (holidays.includes(iso(addDays(day, 1)))) c.add("eve");
    return c;
  }
  function slots(e, day) {
    const d = iso(day), s = e.season || {};
    if ((s.from && d < s.from) || (s.to && d > s.to)) return [];
    const span = (a, b) => { const x = at(day, a); let y = at(day, b); if (y <= x) y = addDays(y, 1); return [x, y]; };
    if (e.dates && e.dates[d]) return e.dates[d].map(([a, b]) => span(a, b));
    const cls = classes(day, e.holidays || []);
    for (const r of e.rules || []) {
      if (!r.days.some((x) => cls.has(x))) continue;
      if ((r.from && d < r.from) || (r.to && d > r.to)) continue;
      let spans = (r.slots || [[r.open, r.close]]).map(([a, b]) => span(a, b));
      if ((e.all_night || []).includes(d)) spans = [[spans[0][0], at(addDays(day, 1), "08:00")]];
      return spans;
    }
    return [];
  }
  function status(p, now = new Date()) {
    const e = p.programme;
    if (!e || e.hours_unknown || (e.departures && !e.rules)) return null;
    const today = new Date(now); today.setHours(0, 0, 0, 0);
    const spans = slots(e, addDays(today, -1)).concat(slots(e, today));
    const open = spans.find(([a, b]) => a <= now && now < b);
    const lit = p.type === "light"; // las luces «se encienden», no «abren» (voz de calle, DESIGN.md)
    if (open) return { open: true, word: lit ? t("common.lit_now") : t("common.open_now"), label: t(lit ? "common.lights_off_at" : "common.closes_at", { time: hm(open[1]) }) };
    const next = spans.concat(slots(e, addDays(today, 1))).map(([a]) => a).filter((a) => a > now).sort((a, b) => a - b)[0];
    return { open: false, word: lit ? t("common.lights_off") : t("common.closed"), label: next ? t(lit ? "common.lights_on_at" : "common.opens_at", { time: hm(next) }) : t("common.closed") };
  }
  const hm = (d) => String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");

  // ── DOM ──────────────────────────────────────────────────────────────────
  const el = (tag, cls, ...kids) => { const n = document.createElement(tag); if (cls) n.className = cls; n.append(...kids.filter((k) => k != null)); return n; };
  const panel = el("aside", "tv-panel" + (matchMedia("(max-width: 700px)").matches ? " is-collapsed" : ""));
  const sheet = el("section", "tv-sheet");
  document.body.append(panel, sheet);
  let filter = "all", query = "", selected = null;
  // ancho del panel: se arrastra el borde derecho (o flechas con el foco) y se recuerda
  const MINW = 300, maxW = () => Math.min(720, innerWidth - 120);
  const setW = (w) => { w = Math.max(MINW, Math.min(maxW(), Math.round(w))); panel.style.setProperty("--panel-w", w + "px"); return w; };
  try { const w = +localStorage.getItem("tinyvigo.panelw"); if (w) setW(w); } catch (e) {}
  const grip = el("div", "tv-grip"); grip.setAttribute("role", "separator"); grip.setAttribute("aria-orientation", "vertical"); grip.tabIndex = 0;
  grip.onpointerdown = (e) => {
    e.preventDefault(); grip.setPointerCapture(e.pointerId); panel.classList.add("is-resizing");
    const move = (m) => setW(m.clientX - panel.getBoundingClientRect().left);
    const up = () => { grip.removeEventListener("pointermove", move); grip.removeEventListener("pointerup", up); panel.classList.remove("is-resizing"); try { localStorage.setItem("tinyvigo.panelw", panel.offsetWidth); } catch (e) {} };
    grip.addEventListener("pointermove", move); grip.addEventListener("pointerup", up);
  };
  grip.onkeydown = (e) => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); const w = setW(panel.offsetWidth + (e.key === "ArrowRight" ? 24 : -24)); try { localStorage.setItem("tinyvigo.panelw", w); } catch (x) {} } };
  grip.ondblclick = () => { panel.style.removeProperty("--panel-w"); try { localStorage.removeItem("tinyvigo.panelw"); } catch (e) {} };

  function waitViewer() {
    return new Promise((res) => { const f = () => (window.tinyvigo && window.tinyvigo.viewer.world.getItemCount() ? res(window.tinyvigo.viewer) : setTimeout(f, 100)); f(); });
  }
  const viewer = await waitViewer();

  // marcadores
  const markers = new Map();
  const PAINTED = new Set(["concello-2552", "concello-3494"]); // árbol y noria ya están pintados en el bloque (ASSETS-03)
  for (const p of points.filter((p) => p.on_map && !PAINTED.has(p.id))) {
    const m = el("button", "tv-marker" + (status(p) && status(p).open ? " is-open" : ""));
    m.setAttribute("aria-label", txt(p.name));
    m.title = txt(p.name);
    if (window.LU) m.innerHTML = PIN + LU.svg(ICON[p.type] || "map-pin", { size: 14 }); // pin Lucide + icono del tipo
    m.dataset.id = p.id;
    m.onclick = (ev) => { ev.stopPropagation(); const c = +(m.dataset.count || 0); if (c > 1) { viewer.viewport.zoomBy(2.2, new OpenSeadragon.Point(p.x, p.y)); viewer.viewport.applyConstraints(); } else select(p, false); };
    viewer.addOverlay({ element: m, location: new OpenSeadragon.Point(p.x, p.y), placement: OpenSeadragon.Placement.BOTTOM });
    markers.set(p.id, m);
  }
  // WEB-02: los que se solapan en pantalla se agrupan en uno con el número; al pulsarlo se acerca
  const byId = new Map(points.map((p) => [p.id, p]));
  function cluster() {
    const R = 22, list = [...markers.entries()].map(([id, m]) => {
      const p = byId.get(id), px = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(p.x, p.y), true);
      return { m, x: px.x, y: px.y, done: false };
    });
    for (const a of list) {
      if (a.done) continue;
      a.done = true; let n = 1;
      for (const b of list) if (!b.done && Math.hypot(a.x - b.x, a.y - b.y) < R) { b.done = true; b.m.style.visibility = "hidden"; n++; }
      a.m.style.visibility = "";
      a.m.dataset.count = n;
      a.m.classList.toggle("is-group", n > 1);
      let g = a.m.querySelector(".tv-grp"); if (!g) { g = document.createElement("span"); g.className = "tv-grp"; a.m.append(g); }
      g.textContent = n;
    }
  }
  viewer.addHandler("animation-finish", cluster);
  viewer.addHandler("resize", cluster);
  setTimeout(cluster, 300);
  // los clics en el marcador no deben arrastrar el mapa
  markers.forEach((m) => new OpenSeadragon.MouseTracker({ element: m, clickHandler: (e) => { e.preventDefaultAction = true; } }));

  function select(p, fly = true) {
    selected = p;
    markers.forEach((m, id) => m.classList.toggle("is-selected", id === p.id));
    if (fly && p.on_map) viewer.viewport.panTo(new OpenSeadragon.Point(p.x, p.y));
    document.dispatchEvent(new CustomEvent("tv:select", { detail: p }));
    renderSheet();
  }

  // D-18: de cuándo es el dato y quién lo respalda; >7 días sin verificar = caducado (R-05).
  const STALE_DAYS = 7;
  function freshness(p) {
    const note = p.status === "not_confirmed" ? t("common.not_confirmed") : t("common.source") + ": Concello de Vigo";
    if (!p.last_verified) return el("p", "tv-fresh is-stale", note + " · " + t("common.no_data"));
    const days = (Date.now() - new Date(p.last_verified + "T00:00:00")) / 86400000;
    const stale = days > STALE_DAYS || p.status === "not_confirmed";
    const when = days > STALE_DAYS ? t("common.stale_since", { date: p.last_verified }) : t("common.verified", { date: p.last_verified });
    return el("p", "tv-fresh" + (stale ? " is-stale" : ""), note + " · " + when);
  }

  // PREVIEW-01: parking más cercano a la ficha, con plazas en vivo (datos.vigo.org, cada 2 min)
  let parkings = null, parkingsAt = 0;
  async function loadParkings() {
    if (parkings && Date.now() - parkingsAt < 120000) return parkings;
    try { parkings = (await tinyvigoData.parkings()).filter((r) => r.lat); /* WEB-05 */ parkingsAt = Date.now(); } catch (e) { /* sin feed: no se enseña */ }
    return parkings;
  }
  const metres = (a, b) => Math.hypot((b.lat - a.lat) * 111320, (b.lon - a.lon) * 111320 * Math.cos(a.lat * Math.PI / 180));
  function parkingBlock(p) {
    const box = el("div", "tv-parking");
    loadParkings().then((rows) => {
      if (!rows || !rows.length || selected !== p) return;
      const near = rows.map((r) => ({ r, d: metres(p, r) })).sort((a, b) => a.d - b.d)[0];
      if (near.d > 2500) return;
      const free = Math.max(0, near.r.plazaslibres), walk = Math.max(1, Math.round((near.d * 1.3) / 75));
      const go = el("a", null, el("span", "tv-name", near.r.nombre.replace(/^Parking /, "")), el("span", "tv-badge " + (free > 20 ? "is-open" : ""), free ? t(free === 1 ? "go.free_1" : "go.free_n", { n: free }) : t("go.full")));
      go.href = "https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=" + near.r.lat + "," + near.r.lon; go.target = "_blank"; go.rel = "noopener";
      box.append(el("p", "tv-kicker", t("detail.nearest_parking") + " · " + t("common.walk_min", { min: walk }) + " · " + t("common.updated", { when: near.r.fechahora.slice(11, 16) })), go);
    });
    return box;
  }

  // mini-mapa de la dirección: 3x3 teselas de OpenStreetMap con el punto en el centro (UI-05)
  function miniMap(p) {
    const Z = 17, n = 2 ** Z, x = ((p.lon + 180) / 360) * n;
    const lat = (p.lat * Math.PI) / 180, y = ((1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2) * n;
    const tx = Math.floor(x), ty = Math.floor(y), fx = (x - tx) * 256, fy = (y - ty) * 256;
    const tiles = el("div", "tv-mini-tiles");
    tiles.style.left = "calc(50% - " + Math.round(256 + fx) + "px)"; tiles.style.top = Math.round(60 - 256 - fy) + "px";
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      const im = el("img"); im.alt = ""; im.loading = "lazy"; im.src = "https://tile.openstreetmap.org/" + Z + "/" + (tx + i) + "/" + (ty + j) + ".png";
      tiles.append(im);
    }
    const box = el("button", "tv-mini", tiles, Object.assign(el("span", "tv-mini-pin"), { innerHTML: PIN }));
    box.setAttribute("aria-label", t("detail.off_map"));
    box.onclick = () => { if (window.tinyvigoCity) { window.tinyvigoCity.setCity(true); setTimeout(() => window.tinyvigoCity.map.flyTo([p.lat, p.lon], 18), 120); } };
    return box;
  }
  // la foto en grande al tocarla
  function zoomPhoto(p) {
    const d = el("dialog", "tv-lightbox", Object.assign(el("img"), { src: p.image_url ? p.image_url.replace("._lgjpeg", ".jpeg") : p.photo, alt: txt(p.name) }));
    const x = el("button", "tv-close", lu("x")); x.setAttribute("aria-label", t("common.close")); x.onclick = () => d.close();
    d.prepend(x);
    d.addEventListener("click", (e) => { if (e.target === d || e.target.tagName === "IMG") d.close(); });
    d.addEventListener("close", () => d.remove());
    document.body.append(d); d.showModal();
  }

  sheet.setAttribute("role", "dialog"); sheet.setAttribute("aria-labelledby", "tv-sheet-title");
  let sheetOpener = null;
  function renderSheet() {
    const wasOpen = sheet.classList.contains("is-open");
    sheet.replaceChildren();
    sheet.classList.toggle("is-open", !!selected);
    sheet.setAttribute("aria-hidden", selected ? "false" : "true");
    if (!selected) { if (wasOpen && sheetOpener && document.body.contains(sheetOpener)) sheetOpener.focus(); return; }
    if (!wasOpen) sheetOpener = document.activeElement;
    const p = selected, st = status(p);
    const close = el("button", "tv-close tv-close-float", lu("x")); close.setAttribute("aria-label", t("common.close"));
    close.onclick = () => { selected = null; markers.forEach((m) => m.classList.remove("is-selected")); renderSheet(); };
    const dir = el("a", "tv-btn", lu("footprints"), t("detail.directions"));
    dir.href = "https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=" + p.lat + "," + p.lon;
    dir.target = "_blank"; dir.rel = "noopener";
    const sched = txt(p.schedule_text);
    // la imagen manda: chip del tipo arriba a la izquierda, estado abajo a la izquierda, cerrar arriba a la derecha
    const hero = el("div", "tv-hero" + (p.photo ? "" : " is-ph"));
    const typeChip = el("span", "tv-chip tv-chip-type is-" + p.type, lu(ICON[p.type] || "map-pin", 16), t(TYPE_KEY[p.type] || "points.filter_all"));
    const stateChip = st ? el("span", "tv-chip tv-chip-state " + (st.open ? "is-open" : "is-closed"), lu(st.open ? "circle-check" : "ban", 16), st.word + " · " + st.label) : null;
    if (p.photo) {
      hero.style.setProperty("--photo", "url(" + new URL(p.photo, location.href).href + ")");
      const img = Object.assign(el("img", "tv-photo"), { src: p.photo, alt: txt(p.name), width: 480, height: 320, decoding: "async", onerror() { hero.classList.add("is-ph"); this.remove(); } });
      // el marco toma la proporción real de la foto (entre 1,3 y 2,2): sin franjas alrededor
      const fit = () => { if (img.naturalWidth) hero.style.aspectRatio = String(Math.min(2.2, Math.max(1.3, img.naturalWidth / img.naturalHeight)).toFixed(3)); };
      img.addEventListener("load", fit); if (img.complete) fit();
      const zoom = el("button", "tv-hero-zoom", img); zoom.setAttribute("aria-label", t("detail.real_photo")); zoom.onclick = () => zoomPhoto(p);
      hero.append(zoom);
    } else hero.append(el("span", "tv-hero-ic", lu(ICON[p.type] || "map-pin", 40)));
    hero.append(typeChip, stateChip);
    sheet.append(...[
      close, // MOB-01: primer hijo de la ficha y «sticky»: sigue a la vista al hacer scroll
      hero,
      Object.assign(el("h2", null, txt(p.name)), { id: "tv-sheet-title", tabIndex: -1 }),
      p.short ? el("p", "tv-short", txt(p.short)) : null,
      el("div", "tv-actions", dir, window.tinyvigoShare ? window.tinyvigoShare.button(txt(p.name)) : null),
      sched ? el("details", "tv-sched", el("summary", null, lu("clock", 16), t("detail.schedule")), el("p", null, sched)) : null,
      p.long && txt(p.long) ? el("details", "tv-sched tv-story-card", el("summary", null, lu("star", 16), t("detail.story")), el("p", null, txt(p.long)), el("p", "tv-note", t("detail.story_source"))) : null,
      p.address ? el("div", "tv-addr", el("p", "tv-addr-line", lu("map-pin", 16), p.address), miniMap(p)) : null,
      parkingBlock(p),
      !p.on_map ? (() => { const b = el("button", "tv-btn tv-btn-quiet", lu("map-pin"), t("detail.off_map")); b.onclick = () => { if (window.tinyvigoCity) { window.tinyvigoCity.setCity(true); setTimeout(() => window.tinyvigoCity.map.flyTo([p.lat, p.lon], 17), 120); } }; return el("div", "tv-offmap", el("p", "tv-note", t("detail.off_map_note")), b); })() : null,
      freshness(p),
    ].filter(Boolean));
    // el foco entra en la ficha al abrirla (teclado y lectores de pantalla)
    if (!wasOpen) setTimeout(() => { const h = document.getElementById("tv-sheet-title"); if (h) h.focus({ preventScroll: true }); }, 60);
  }

  function renderPanel() {
    panel.replaceChildren();
    const langs = el("div", "tv-langs", ...LANGS.map((l) => {
      const b = el("button", l === lang ? "is-on" : "", l.toUpperCase());
      b.onclick = () => { lang = l; try { localStorage.setItem("tinyvigo.lang", l); } catch (e) {} document.documentElement.lang = l; renderPanel(); renderSheet(); document.dispatchEvent(new Event("tv:lang")); };
      return b;
    }));
    const search = el("input", "tv-search"); search.type = "search"; search.placeholder = t("points.search"); search.value = query;
    search.oninput = () => { query = search.value; renderList(); };
    const chips = el("div", "tv-chips", ...FILTERS.map((f) => {
      const b = el("button", f === filter ? "is-on" : "", lu(ICON[f] || "layers", 16), f === "all" ? t("points.filter_all") : t(TYPE_KEY[f]));
      b.onclick = () => { filter = f; renderPanel(); };
      return b;
    }));
    const list = el("ul", "tv-list");
    const count = el("p", "tv-count");
    const min = el("button", "tv-min", lu("minus")); min.setAttribute("aria-label", t("points.minimize")); min.title = t("points.minimize");
    min.onclick = () => panel.classList.add("is-collapsed");
    const head = el("header", null, el("h1", null, t("points.title")), langs, min);
    const toggle = el("button", "tv-toggle", lu("tree-pine"), el("span", "tv-toggle-t", t("points.title")), lu("plus", 16));
    toggle.setAttribute("aria-label", t("points.expand"));
    toggle.onclick = () => panel.classList.remove("is-collapsed");
    panel.append(toggle, head, search, chips, count, list, grip);
    function renderList() {
      const q = query.trim().toLowerCase();
      const shown = points.filter((p) => (filter === "all" || p.type === filter || (filter === "exhibit" && ["photo_gallery", "photocall"].includes(p.type)))
        && (!q || txt(p.name).toLowerCase().includes(q)));
      count.textContent = t("points.count", { total: points.length, shown: shown.length });
      list.replaceChildren(...shown.map((p) => {
        const st = status(p);
        const li = el("li", null, el("button", null,
          p.photo ? Object.assign(el("img", "tv-thumb"), { src: p.photo, alt: "", loading: "lazy", decoding: "async", width: 84, height: 56 }) : el("span", "tv-thumb", lu(ICON[p.type] || "map-pin")),
          el("span", "tv-row", el("span", "tv-name", txt(p.name)),
            el("span", "tv-sub", lu(ICON[p.type] || "map-pin", 14), t(TYPE_KEY[p.type] || "points.filter_all")),
            st ? el("span", "tv-badge " + (st.open ? "is-open" : "is-closed"), lu(st.open ? "circle-check" : "ban", 14), st.open ? st.word + " · " + st.label : st.label) : null)));
        li.firstChild.onclick = () => select(p);
        return li;
      }));
    }
    renderList();
  }

  // Esc cierra lo último abierto: paseo, Tour/Hoy, ficha (accesible con teclado)
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || document.querySelector("dialog[open]")) return;
    const step = document.querySelector(".tv-step.is-open .tv-close"), tour = document.querySelector(".tv-tour.is-open .tv-close");
    if (step) step.click(); else if (tour) tour.click(); else if (selected) { selected = null; markers.forEach((m) => m.classList.remove("is-selected")); renderSheet(); }
  });
  // etiquetas de los botones de zoom en el idioma activo
  const zoomLabels = () => { const a = document.getElementById("zoom-in"), b = document.getElementById("zoom-out"); if (a) a.setAttribute("aria-label", t("common.zoom_in")); if (b) b.setAttribute("aria-label", t("common.zoom_out")); };
  document.addEventListener("tv:lang", zoomLabels); zoomLabels();
  document.documentElement.lang = lang;
  renderPanel();
  setInterval(() => { renderPanel(); renderSheet(); }, 60_000); // «abierto ahora» al minuto
  window.tinyvigoPoints = { points, status, select, t: (k, v) => t(k, v), txt: (o) => txt(o), lang: () => lang };
  document.dispatchEvent(new Event("tv:ready"));
})();
