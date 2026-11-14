// TinyVigo: tour a pie según tu tiempo y cómo llegar al centro (bus, coche con parkings en vivo, a pie).
// Elige paradas abiertas y cercanas que caben en el tiempo, ordena por vecino más próximo,
// enruta por calles reales (OSRM a pie de openstreetmap.de) y dibuja la línea sobre el mapa isométrico.
(function () {
  const ORIGIN = [42.238072, -8.725813]; // Árbol de Porta do Sol = centro del lienzo (GEO-01)
  const CANVAS = 3072, SCALE = 2, TILT = Math.PI / 4, HEAD = (-15 * Math.PI) / 180, MLAT = 111320;
  const WALK_MS = 4.5 / 3.6; // 4,5 km/h
  const DETOUR = 1.3; // calle frente a línea recta
  const STAY = { light: 5, exhibit: 3, photo_gallery: 5, photocall: 3, santa_kings: 10, market: 20, attraction: 15 };
  const VALUE = { attraction: 3, market: 3, light: 2.5, santa_kings: 2, photocall: 1.5, exhibit: 1, photo_gallery: 1 };
  const BUDGETS = [30, 60, 90, 120];
  const FAR_KM = 2.5; // más lejos de Porta do Sol: primero hay que llegar al centro
  const ROUTER = "https://routing.openstreetmap.de/routed-foot/route/v1/foot/";
  const CAR_ROUTER = "https://routing.openstreetmap.de/routed-car/route/v1/driving/";
  const emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));
  const PARKINGS = "https://datos.vigo.org/data/trafico/parkings-ocupacion.json";

  let elev = null;
  fetch("data/elevation.json").then((r) => r.json()).then((g) => (elev = g)).catch(() => {});

  const rad = (d) => (d * Math.PI) / 180;
  const distM = (a, b) => {
    const dy = (b[0] - a[0]) * MLAT, dx = (b[1] - a[1]) * MLAT * Math.cos(rad((a[0] + b[0]) / 2));
    return Math.hypot(dx, dy);
  };
  const walkMin = (a, b) => (distM(a, b) * DETOUR) / WALK_MS / 60;
  function z(lat, lon) {
    if (!elev) return 0;
    const i = Math.round((elev.north - lat) / elev.dy), j = Math.round((lon - elev.west) / elev.dx);
    const row = elev.rows[i];
    return row && row[j] != null ? row[j] - (elev.origin_z || 0) : 0;
  }
  // (lat, lon) -> coordenadas del visor (0..1 sobre el ancho del lienzo); igual que scripts/build_web_data.py
  function project(lat, lon) {
    const x = (lon - ORIGIN[1]) * MLAT * Math.cos(rad(ORIGIN[0])), y = (lat - ORIGIN[0]) * MLAT;
    const u = Math.cos(HEAD) * x - Math.sin(HEAD) * y, d = Math.sin(HEAD) * x + Math.cos(HEAD) * y;
    const v = -Math.sin(TILT) * d - Math.cos(TILT) * z(lat, lon);
    return [CANVAS / 2 + SCALE * u, CANVAS / 2 + SCALE * v];
  }

  // ── planificador ─────────────────────────────────────────────────────────
  function plan(points, start, budget, status, now = new Date()) {
    const pool = [], later = [], closed = [];
    for (const p of points) {
      const pos = [p.lat, p.lon], reach = walkMin(start, pos);
      const st = status(p, now);
      if (reach > budget * 0.6) later.push({ p, km: distM(start, pos) / 1000, min: Math.round(reach) });
      else if (st && !st.open) closed.push({ p, st });
      else pool.push(p);
    }
    const stops = [];
    let here = start, used = 0;
    // puntos casi en el mismo sitio cuentan como una parada
    while (pool.length) {
      let best = null, bestScore = -1;
      for (const p of pool) {
        const w = walkMin(here, [p.lat, p.lon]), stay = STAY[p.type] || 5;
        if (used + w + stay > budget) continue;
        const score = (VALUE[p.type] || 1) / (w + stay);
        if (score > bestScore) { best = p; bestScore = score; }
      }
      if (!best) break;
      const w = walkMin(here, [best.lat, best.lon]), stay = STAY[best.type] || 5;
      stops.push({ p: best, arrive: used + w, stay });
      used += w + stay;
      here = [best.lat, best.lon];
      pool.splice(pool.indexOf(best), 1);
    }
    later.sort((a, b) => a.km - b.km);
    return { stops, later, closed, used };
  }

  async function route(start, stops) {
    const coords = [start, ...stops.map((s) => [s.p.lat, s.p.lon])].map(([la, lo]) => lo.toFixed(6) + "," + la.toFixed(6)).join(";");
    const r = await fetch(ROUTER + coords + "?overview=full&geometries=geojson");
    const j = await r.json();
    if (j.code !== "Ok") throw new Error(j.code);
    return j.routes[0];
  }

  // ── dibujo sobre el mapa ─────────────────────────────────────────────────
  const SVG = "http://www.w3.org/2000/svg";
  let layer = null;
  function draw(viewer, line, start, stops) {
    clear(viewer);
    layer = document.createElementNS(SVG, "svg");
    layer.setAttribute("viewBox", "0 0 " + CANVAS + " " + CANVAS);
    layer.setAttribute("class", "tv-route");
    const pts = line.map(([lo, la]) => project(la, lo).map((n) => n.toFixed(1)).join(",")).join(" ");
    for (const cls of ["tv-route-casing", "tv-route-line"]) {
      const pl = document.createElementNS(SVG, "polyline");
      pl.setAttribute("points", pts); pl.setAttribute("class", cls);
      layer.append(pl);
    }
    const s = project(start[0], start[1]);
    const me = document.createElementNS(SVG, "circle");
    me.setAttribute("cx", s[0]); me.setAttribute("cy", s[1]); me.setAttribute("r", 14); me.setAttribute("class", "tv-route-start");
    layer.append(me);
    stops.forEach((st, i) => {
      const [x, y] = project(st.p.lat, st.p.lon);
      const g = document.createElementNS(SVG, "g");
      g.setAttribute("class", "tv-route-stop");
      const c = document.createElementNS(SVG, "circle"); c.setAttribute("cx", x); c.setAttribute("cy", y - 40); c.setAttribute("r", 20);
      const tx = document.createElementNS(SVG, "text"); tx.setAttribute("x", x); tx.setAttribute("y", y - 33); tx.textContent = i + 1;
      g.append(c, tx); layer.append(g);
    });
    viewer.addOverlay({ element: layer, location: new OpenSeadragon.Rect(0, 0, 1, 1) });
    // encuadra la ruta
    const xs = line.map(([lo, la]) => project(la, lo));
    const minX = Math.min(...xs.map((p) => p[0])), maxX = Math.max(...xs.map((p) => p[0]));
    const minY = Math.min(...xs.map((p) => p[1])), maxY = Math.max(...xs.map((p) => p[1]));
    const pad = 150;
    viewer.viewport.fitBounds(new OpenSeadragon.Rect((minX - pad) / CANVAS, (minY - pad) / CANVAS, (maxX - minX + 2 * pad) / CANVAS, (maxY - minY + 2 * pad) / CANVAS));
  }
  function clear(viewer) { if (layer) { viewer.removeOverlay(layer); layer = null; } }

  // ── interfaz ─────────────────────────────────────────────────────────────
  function init() {
    const P = window.tinyvigoPoints, viewer = window.tinyvigo.viewer;
    const t = P.t, txt = P.txt;
    const btn = document.createElement("button");
    btn.className = "tv-tour-open";
    const box = document.createElement("section");
    box.className = "tv-tour";
    document.body.append(btn, box);
    let when = "now";
    const startTime = () => { if (when === "now") return new Date(); const d = new Date(); d.setHours(+when, 0, 0, 0); if (d < new Date()) d.setDate(d.getDate() + 1); return d; };
    let budget = 60, fromHere = true, result = null, startPos = ORIGIN, busy = "", far = null, parkings = null;

    const el = (tag, cls, ...kids) => { const n = document.createElement(tag); if (cls) n.className = cls; n.append(...kids.filter((k) => k != null && k !== false)); return n; };
    const hhmm = (min) => { const d = new Date(startTime().getTime() + min * 60000); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
    const gmaps = (mode, dest, way = []) => "https://www.google.com/maps/dir/?api=1&travelmode=" + mode + "&origin=" + startPos.join(",") + "&destination=" + dest.join(",") + (way.length ? "&waypoints=" + way.map((w) => w.join(",")).join("|") : "");

    function render() {
      btn.textContent = t("tour.open");
      box.replaceChildren();
      if (!box.classList.contains("is-open")) return;
      const close = el("button", "tv-close", "×"); close.onclick = () => { box.classList.remove("is-open"); render(); };
      const chips = el("div", "tv-chips", ...BUDGETS.map((b) => { const c = el("button", b === budget ? "is-on" : "", t("tour.minutes", { min: b })); c.onclick = () => { budget = b; render(); }; return c; }));
      const from = el("div", "tv-langs tv-from", ...[[true, "tour.from_here"], [false, "tour.from_centre"]].map(([v, k]) => { const c = el("button", v === fromHere ? "is-on" : "", t(k)); c.onclick = () => { fromHere = v; render(); }; return c; }));
      const whenChips = el("div", "tv-chips", ...[["now", t("tour.now")], ["18", "18:00"], ["20", "20:00"], ["22", "22:00"]].map(([v, label]) => { const c = el("button", v === when ? "is-on" : "", label); c.onclick = () => { when = v; render(); }; return c; }));
      const go = el("button", "tv-btn tv-go", t("tour.go")); go.onclick = run;
      box.append(close, el("h2", null, t("tour.title")), chips, el("p", "tv-note", t("tour.when")), whenChips, from, go);
      if (busy) box.append(el("p", "tv-note", busy));
      if (far) box.append(renderFar());
      if (result) box.append(renderResult());
    }

    function renderFar() {
      const total = parkings ? parkings.reduce((a, p) => a + Math.max(0, p.plazaslibres), 0) : 0;
      const cap = parkings ? parkings.reduce((a, p) => a + p.totalplazas, 0) : 0;
      const mode = (k, m, extra) => el("a", "tv-mode", el("strong", null, t(k)), extra || null);
      const links = el("div", "tv-modes",
        Object.assign(mode("go.bus", "transit", el("span", null, t("go.bus_tip"))), { href: gmaps("transit", ORIGIN), target: "_blank", rel: "noopener" }),
        Object.assign(mode("go.car", "driving", el("span", null, t("go.live_traffic"))), { href: gmaps("driving", ORIGIN), target: "_blank", rel: "noopener" }),
        Object.assign(mode("go.walk", "walking"), { href: gmaps("walking", ORIGIN), target: "_blank", rel: "noopener" }));
      const list = parkings ? el("ul", "tv-parkings", ...parkings.slice().sort((a, b) => b.plazaslibres - a.plazaslibres).map((p) => {
        const a = el("a", null, el("span", "tv-name", p.nombre.replace(/^Parking /, "")), el("span", "tv-badge " + (p.plazaslibres > 20 ? "is-open" : ""), p.plazaslibres > 0 ? t("go.free_n", { n: p.plazaslibres }) : t("go.full")));
        a.href = gmaps("driving", [p.lat, p.lon]); a.target = "_blank"; a.rel = "noopener"; a.title = t("go.route_to");
        return el("li", null, a);
      })) : null;
      return el("div", "tv-far",
        el("h3", null, t("tour.far_title")), el("p", null, t("tour.far_body", { km: far.toFixed(1) })), links,
        parkings ? el("h3", null, t("go.parkings")) : null,
        parkings && cap ? el("p", "tv-note", t("go.parking_chance", { pct: Math.round((100 * total) / cap) })) : null, list);
    }

    function renderResult() {
      const { stops, later, closed, line, km } = result;
      if (!stops.length) return el("p", "tv-note", t("tour.nothing"));
      const ol = el("ol", "tv-story", ...stops.map((s, i) => {
        const b = el("button", null,
          s.p.photo ? Object.assign(el("img"), { src: s.p.photo, alt: "", loading: "lazy" }) : el("span", "tv-story-ph"),
          el("span", "tv-num", String(i + 1)),
          el("span", "tv-story-name", txt(s.p.name)),
          el("span", "tv-badge", t("tour.stop_at", { time: hhmm(s.arrive), stay: s.stay })));
        b.onclick = () => startWalk(i);
        return el("li", null, b);
      }));
      const walk = el("button", "tv-btn tv-go", t("walk.start")); walk.onclick = () => startWalk(0);
      const gm = el("a", "tv-btn", t("tour.open_gmaps"));
      const dest = stops[stops.length - 1].p;
      gm.href = gmaps("walking", [dest.lat, dest.lon], stops.slice(0, -1).map((s) => [s.p.lat, s.p.lon]).slice(0, 9));
      gm.target = "_blank"; gm.rel = "noopener";
      const clr = el("button", "tv-btn tv-btn-quiet", t("tour.clear")); clr.onclick = () => { result = null; clear(viewer); emit("tv:clear-route"); render(); };
      return el("div", "tv-result",
        el("p", "tv-summary", t("tour.summary", { min: budget, n: stops.length, km })),
        el("p", "tv-note", t("walk.story")), ol, walk, el("div", "tv-actions", gm, clr),
        later.length ? el("details", "tv-later", el("summary", null, t("tour.later") + " · " + later.length),
          el("ul", null, ...later.slice(0, 12).map((l) => { const b = el("button", null, el("span", "tv-name", txt(l.p.name)), el("span", "tv-badge", t("tour.later_item", { km: l.km.toFixed(1), min: l.min }))); b.onclick = () => P.select(l.p); return el("li", null, b); }))) : null,
        closed.length ? el("details", "tv-later", el("summary", null, t("tour.closed_now") + " · " + closed.length),
          el("ul", null, ...closed.map((c) => el("li", null, el("button", null, el("span", "tv-name", txt(c.p.name)), el("span", "tv-badge", c.st.label)))))) : null);
    }

    // ── paseo paso a paso: «primero la Bola, luego la Noria…» ──────────────
    const step = document.createElement("section");
    step.className = "tv-step";
    document.body.append(step);
    let at = -1;
    function legMin(i) {
      const st = result.stops;
      return Math.max(1, Math.round(i === 0 ? st[0].arrive : st[i].arrive - st[i - 1].arrive - st[i - 1].stay));
    }
    function startWalk(i) {
      at = i;
      box.classList.remove("is-open"); render();
      showStep();
    }
    function showStep() {
      step.replaceChildren();
      step.classList.toggle("is-open", at >= 0 && !!result);
      if (at < 0 || !result) return;
      const st = result.stops, s = st[at], p = s.p;
      const from = at === 0 ? t("walk.you") : txt(st[at - 1].p.name);
      const prev = el("button", "tv-btn tv-btn-quiet", t("walk.prev")); prev.disabled = at === 0; prev.onclick = () => { at--; showStep(); };
      const last = at === st.length - 1;
      const next = el("button", "tv-btn", last ? t("common.close") : t("walk.next")); next.onclick = () => { if (last) { at = -1; } else { at++; } showStep(); };
      const close = el("button", "tv-close", "×"); close.onclick = () => { at = -1; showStep(); };
      const dots = el("div", "tv-step-dots", ...st.map((_, i) => el("span", i === at ? "is-on" : i < at ? "is-done" : "")));
      step.append(...[close,
        p.photo ? Object.assign(el("img", "tv-step-photo"), { src: p.photo, alt: txt(p.name) }) : null,
        el("p", "tv-kicker", t("walk.step", { n: at + 1, total: st.length }) + " · " + hhmm(s.arrive)),
        el("h2", null, txt(p.name)),
        el("p", "tv-step-leg", t("walk.leg", { min: legMin(at), from })),
        p.short ? el("p", "tv-short", txt(p.short)) : null,
        dots,
        last ? el("p", "tv-note", t("walk.end")) : null,
        el("div", "tv-actions", prev, next)].filter(Boolean));
      // el mapa acompaña: isométrico si el punto está dibujado, ciudad si no
      if (p.on_map && !document.body.classList.contains("is-city")) {
        viewer.viewport.panTo(new OpenSeadragon.Point(p.x, p.y));
        viewer.viewport.zoomTo(Math.max(viewer.viewport.getZoom(), viewer.viewport.getHomeZoom() * 2.2));
      }
      document.dispatchEvent(new CustomEvent("tv:select", { detail: p }));
      document.querySelectorAll(".tv-marker").forEach((m) => m.classList.toggle("is-selected", m.getAttribute("aria-label") === txt(p.name)));
    }
    document.addEventListener("tv:lang", showStep);

    function locate() {
      return new Promise((res) => {
        if (!fromHere || !navigator.geolocation) return res(null);
        navigator.geolocation.getCurrentPosition((p) => res([p.coords.latitude, p.coords.longitude]), () => res(null), { timeout: 6000, maximumAge: 60000 });
      });
    }

    async function run() {
      result = null; far = null; busy = fromHere ? t("tour.locating") : ""; render();
      const here = await locate();
      if (fromHere && !here) busy = t("tour.no_location");
      startPos = here || ORIGIN;
      const kmToCentre = distM(startPos, ORIGIN) / 1000;
      if (kmToCentre > FAR_KM) {
        far = kmToCentre;
        try { parkings = (await (await fetch(PARKINGS)).json()).filter((p) => p.lat); } catch (e) { parkings = null; }
        busy = ""; render();
        // ruta en coche hasta el parking con más plazas libres, dibujada en la vista ciudad
        const best = parkings && parkings.slice().sort((a, b) => b.plazaslibres - a.plazaslibres)[0];
        const dest = best ? [best.lat, best.lon] : ORIGIN;
        try {
          const j = await (await fetch(CAR_ROUTER + startPos[1] + "," + startPos[0] + ";" + dest[1] + "," + dest[0] + "?overview=full&geometries=geojson")).json();
          if (j.code === "Ok") emit("tv:route", { line: j.routes[0].geometry.coordinates, start: startPos, stops: [], mode: "driving", showCity: true });
        } catch (e) { /* sin router: quedan los enlaces */ }
        return;
      }
      const planned = plan(P.points, startPos, budget, P.status, startTime());
      if (!planned.stops.length) { result = { ...planned, line: [], km: "0" }; busy = ""; render(); return; }
      busy = t("tour.routing"); render();
      let line, meters;
      try {
        const r = await route(startPos, planned.stops);
        line = r.geometry.coordinates; meters = r.distance;
      } catch (e) {
        line = [startPos, ...planned.stops.map((s) => [s.p.lat, s.p.lon])].map(([la, lo]) => [lo, la]);
        meters = line.reduce((a, c, i) => (i ? a + distM([line[i - 1][1], line[i - 1][0]], [c[1], c[0]]) : 0), 0) * DETOUR;
      }
      result = { ...planned, line, km: (meters / 1000).toFixed(1).replace(".", P.lang() === "en" ? "." : ",") };
      busy = "";
      draw(viewer, line, startPos, planned.stops);
      emit("tv:route", { line, start: startPos, stops: planned.stops, mode: "walking", showCity: planned.stops.some((s) => !s.p.on_map) || distM(startPos, ORIGIN) > 900 });
      render();
    }

    btn.onclick = () => { box.classList.toggle("is-open"); render(); };
    document.addEventListener("tv:lang", render);
    render();
    window.tinyvigoTour = { plan, project, run, setWhen: (v) => { when = v; }, startWalk: (i) => startWalk(i), setStart: (p) => { fromHere = true; navigator.geolocation.getCurrentPosition = (ok) => ok({ coords: { latitude: p[0], longitude: p[1] } }); }, open: () => { box.classList.add("is-open"); render(); }, setBudget: (b) => { budget = b; }, setFromHere: (v) => { fromHere = v; } };
  }

  if (window.tinyvigoPoints) init();
  else document.addEventListener("tv:ready", init, { once: true });
})();
