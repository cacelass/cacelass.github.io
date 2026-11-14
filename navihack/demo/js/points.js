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
    for (const tag of navigator.languages || []) { const b = tag.toLowerCase().split("-")[0]; if (LANGS.includes(b)) return b; }
    return "es";
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
    if (open) return { open: true, label: t("common.closes_at", { time: hm(open[1]) }) };
    const next = spans.concat(slots(e, addDays(today, 1))).map(([a]) => a).filter((a) => a > now).sort((a, b) => a - b)[0];
    return { open: false, label: next ? t("common.opens_at", { time: hm(next) }) : t("common.closed") };
  }
  const hm = (d) => String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");

  // ── DOM ──────────────────────────────────────────────────────────────────
  const el = (tag, cls, ...kids) => { const n = document.createElement(tag); if (cls) n.className = cls; n.append(...kids.filter((k) => k != null)); return n; };
  const panel = el("aside", "tv-panel");
  const sheet = el("section", "tv-sheet");
  document.body.append(panel, sheet);
  let filter = "all", query = "", selected = null;

  function waitViewer() {
    return new Promise((res) => { const f = () => (window.tinyvigo && window.tinyvigo.viewer.world.getItemCount() ? res(window.tinyvigo.viewer) : setTimeout(f, 100)); f(); });
  }
  const viewer = await waitViewer();

  // marcadores
  const markers = new Map();
  for (const p of points.filter((p) => p.on_map)) {
    const m = el("button", "tv-marker tv-" + p.type);
    m.setAttribute("aria-label", txt(p.name));
    m.onclick = (ev) => { ev.stopPropagation(); select(p, false); };
    viewer.addOverlay({ element: m, location: new OpenSeadragon.Point(p.x, p.y), placement: OpenSeadragon.Placement.BOTTOM });
    markers.set(p.id, m);
  }
  // los clics en el marcador no deben arrastrar el mapa
  markers.forEach((m) => new OpenSeadragon.MouseTracker({ element: m, clickHandler: (e) => { e.preventDefaultAction = true; } }));

  function select(p, fly = true) {
    selected = p;
    markers.forEach((m, id) => m.classList.toggle("is-selected", id === p.id));
    if (fly && p.on_map) viewer.viewport.panTo(new OpenSeadragon.Point(p.x, p.y));
    document.dispatchEvent(new CustomEvent("tv:select", { detail: p }));
    renderSheet();
  }

  function renderSheet() {
    sheet.replaceChildren();
    sheet.classList.toggle("is-open", !!selected);
    if (!selected) return;
    const p = selected, st = status(p);
    const close = el("button", "tv-close", "×"); close.setAttribute("aria-label", t("common.close"));
    close.onclick = () => { selected = null; markers.forEach((m) => m.classList.remove("is-selected")); renderSheet(); };
    const dir = el("a", "tv-btn", t("detail.directions"));
    dir.href = "https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=" + p.lat + "," + p.lon;
    dir.target = "_blank"; dir.rel = "noopener";
    const photo = p.image_url ? Object.assign(el("a", "tv-btn tv-btn-quiet", t("detail.real_photo")), { href: p.image_url.replace("._lgjpeg", ".jpeg"), target: "_blank", rel: "noopener" }) : null;
    const sched = txt(p.schedule_text);
    sheet.append(...[
      close,
      p.photo ? Object.assign(el("img", "tv-photo"), { src: p.photo, alt: txt(p.name), loading: "lazy", onerror() { this.remove(); } }) : null,
      el("p", "tv-kicker", t(TYPE_KEY[p.type] || "points.filter_all") + (p.address ? " · " + p.address : "")),
      el("h2", null, txt(p.name)),
      st ? el("p", "tv-state " + (st.open ? "is-open" : ""), (st.open ? t("common.open_now") : t("common.closed")) + " · " + st.label) : null,
      p.short ? el("p", "tv-short", txt(p.short)) : null,
      sched ? el("details", "tv-sched", el("summary", null, t("detail.schedule")), el("p", null, sched)) : null,
      el("div", "tv-actions", dir, photo),
      !p.on_map ? el("p", "tv-note", t("common.no_data") + " · " + t("app.map_label")) : null,
    ].filter(Boolean)
    );
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
      const b = el("button", f === filter ? "is-on" : "", f === "all" ? t("points.filter_all") : t(TYPE_KEY[f]));
      b.onclick = () => { filter = f; renderPanel(); };
      return b;
    }));
    const list = el("ul", "tv-list");
    const count = el("p", "tv-count");
    const head = el("header", null, el("h1", null, t("points.title")), langs);
    const toggle = el("button", "tv-toggle", t("points.title"));
    toggle.onclick = () => panel.classList.toggle("is-collapsed");
    panel.append(toggle, head, search, chips, count, list);
    function renderList() {
      const q = query.trim().toLowerCase();
      const shown = points.filter((p) => (filter === "all" || p.type === filter || (filter === "exhibit" && ["photo_gallery", "photocall"].includes(p.type)))
        && (!q || txt(p.name).toLowerCase().includes(q)));
      count.textContent = t("points.count", { total: points.length, shown: shown.length });
      list.replaceChildren(...shown.map((p) => {
        const st = status(p);
        const li = el("li", null, el("button", null,
          el("span", "tv-dot tv-" + p.type),
          el("span", "tv-name", txt(p.name)),
          st ? el("span", "tv-badge " + (st.open ? "is-open" : ""), st.open ? t("common.open_now") : st.label) : null));
        li.firstChild.onclick = () => select(p);
        return li;
      }));
    }
    renderList();
  }

  document.documentElement.lang = lang;
  renderPanel();
  setInterval(() => { renderPanel(); renderSheet(); }, 60_000); // «abierto ahora» al minuto
  window.tinyvigoPoints = { points, status, select, t: (k, v) => t(k, v), txt: (o) => txt(o), lang: () => lang };
  document.dispatchEvent(new Event("tv:ready"));
})();
