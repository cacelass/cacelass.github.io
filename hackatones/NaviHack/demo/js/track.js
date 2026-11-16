// TinyVigo seguimiento en ruta: tu posición (GPS) sobre la ruta del tour, lo andado cambia de
// color, un punto te sigue y una barra dice cuánto te queda y cuál es la próxima parada.
// Sin GPS o lejos de la ruta: «Simular paseo» la recorre sola (para enseñarla).
(function () {
  const WALK = 4.5 / 3.6, MLAT = 111320, SNAP_MAX = 120; // m/s, m por grado, máx. desvío para «en ruta»
  const lu = (name, size = 20) => { const s = document.createElement("span"); s.innerHTML = window.LU ? LU.svg(name, { size }) : ""; return s.firstChild || s; };
  const el = (tag, cls, ...kids) => { const n = document.createElement(tag); if (cls) n.className = cls; n.append(...kids.filter((k) => k != null && k !== false)); return n; };

  let route = null; // {pts:[[lat,lon]], cum:[m], total, stops:[{p, at:m, stay}]}
  let pos = null, along = 0, watch = null, sim = null, svg = null, walkedLine = null, meDot = null, cityWalked = null, cityMe = null;
  const bar = el("div", "tv-track"); bar.setAttribute("role", "status"); bar.setAttribute("aria-live", "polite");
  const go = el("button", "tv-track-go");
  document.body.append(go, bar);

  const t = (k, v) => (window.tinyvigoPoints ? window.tinyvigoPoints.t(k, v) : k);
  const txt = (o) => (window.tinyvigoPoints ? window.tinyvigoPoints.txt(o) : "");
  const dist = (a, b) => Math.hypot((b[0] - a[0]) * MLAT, (b[1] - a[1]) * MLAT * Math.cos((a[0] * Math.PI) / 180));

  function setRoute(d) {
    stop();
    if (!d || !d.line || d.line.length < 2 || d.mode !== "walking") { route = null; paint(); return; }
    const pts = d.line.map(([lo, la]) => [la, lo]), cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + dist(pts[i - 1], pts[i]));
    // cada parada, a qué distancia del inicio cae sobre la línea
    const stops = (d.stops || []).map((s) => { const k = snap([s.p.lat, s.p.lon], pts, cum); return { p: s.p, at: k.along, stay: s.stay || 0 }; });
    route = { pts, cum, total: cum[cum.length - 1], stops };
    along = 0; paint();
  }

  // proyección de un punto sobre la polilínea: distancia recorrida y desvío
  function snap(q, pts = route.pts, cum = route.cum) {
    let best = { along: 0, off: Infinity, at: pts[0] };
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], ax = 0, ay = 0;
      const k = Math.cos((a[0] * Math.PI) / 180);
      const bx = (b[1] - a[1]) * MLAT * k, by = (b[0] - a[0]) * MLAT, px = (q[1] - a[1]) * MLAT * k, py = (q[0] - a[0]) * MLAT;
      const L = bx * bx + by * by, u = L ? Math.max(0, Math.min(1, ((px - ax) * bx + (py - ay) * by) / L)) : 0;
      const off = Math.hypot(px - u * bx, py - u * by);
      if (off < best.off) best = { along: cum[i - 1] + u * Math.sqrt(L), off, at: [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u] };
    }
    return best;
  }
  const pointAt = (m) => { const { pts, cum } = route; let i = 1; while (i < cum.length - 1 && cum[i] < m) i++; const a = pts[i - 1], b = pts[i], seg = cum[i] - cum[i - 1] || 1, u = Math.max(0, Math.min(1, (m - cum[i - 1]) / seg)); return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]; };

  // ── dibujo: lo andado en gris, punto que te sigue (isométrico y vista ciudad) ─────────
  function drawWalked() {
    if (!route) return;
    const walked = route.pts.filter((_, i) => route.cum[i] <= along).concat([pointAt(along)]);
    const viewer = window.tinyvigo && window.tinyvigo.viewer, T = window.tinyvigoTour;
    if (viewer && T && T.project) {
      if (!svg) {
        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 3072 3072"); svg.setAttribute("class", "tv-walked");
        walkedLine = document.createElementNS(svg.namespaceURI, "polyline"); walkedLine.setAttribute("class", "tv-walked-line");
        meDot = document.createElementNS(svg.namespaceURI, "g"); meDot.setAttribute("class", "tv-me");
        for (const [r, c] of [[34, "tv-me-pulse"], [16, "tv-me-dot"]]) { const ci = document.createElementNS(svg.namespaceURI, "circle"); ci.setAttribute("r", r); ci.setAttribute("class", c); meDot.append(ci); }
        svg.append(walkedLine, meDot);
        viewer.addOverlay({ element: svg, location: new OpenSeadragon.Rect(0, 0, 1, 1) });
      }
      walkedLine.setAttribute("points", walked.map(([la, lo]) => T.project(la, lo).map((n) => n.toFixed(1)).join(",")).join(" "));
      const here = pos && !sim ? snap(pos).at : pointAt(along), [x, y] = T.project(here[0], here[1]);
      meDot.setAttribute("transform", "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ")");
    }
    const C = window.tinyvigoCity;
    if (C && window.L) {
      if (!cityWalked) { cityWalked = L.polyline([], { color: "#8a8f9c", weight: 6, opacity: 0.95 }).addTo(C.map); cityMe = L.circleMarker([0, 0], { radius: 9, color: "#fff", weight: 3, fillColor: "#3d8bff", fillOpacity: 1 }).addTo(C.map); }
      cityWalked.setLatLngs(walked); cityMe.setLatLng(pos && !sim ? snap(pos).at : pointAt(along));
    }
  }
  function clearDrawn() {
    const viewer = window.tinyvigo && window.tinyvigo.viewer;
    if (svg && viewer) viewer.removeOverlay(svg);
    svg = walkedLine = meDot = null;
    if (cityWalked) { cityWalked.remove(); cityMe.remove(); cityWalked = cityMe = null; }
  }

  // ── barra: tiempo restante y próxima parada ─────────────────────────────────────────
  function paint() {
    go.style.display = route && !watch && !sim ? "" : "none";
    go.replaceChildren(lu("crosshair"), t("track.follow"));
    bar.replaceChildren();
    bar.classList.toggle("is-on", !!(watch || sim));
    if (!route || !(watch || sim)) return;
    const ahead = route.stops.filter((s) => s.at > along + 15);
    const left = Math.max(0, route.total - along) / WALK / 60 + ahead.reduce((a, s) => a + s.stay, 0);
    const next = ahead[0];
    const done = along >= route.total - 20;
    const stopBtn = el("button", "tv-btn tv-btn-quiet", lu("x", 16), t("track.stop")); stopBtn.onclick = () => { stop(); paint(); };
    bar.append(
      el("div", "tv-track-main",
        el("strong", null, done ? t("track.done") : t("track.left", { min: Math.max(1, Math.round(left)) })),
        el("span", null, done ? t("walk.end") : next ? t("track.next", { name: txt(next.p.name), min: Math.max(1, Math.round((next.at - along) / WALK / 60)) }) : t("track.to_end"))),
      el("div", "tv-track-bar", Object.assign(el("span"), { style: "width:" + Math.min(100, (100 * along) / route.total).toFixed(1) + "%" })),
      el("div", "tv-track-actions", sim ? el("span", "tv-badge", t("track.simulated")) : null, stopBtn));
  }

  function update(q) {
    pos = q;
    const s = snap(q);
    if (s.off <= SNAP_MAX) along = Math.max(along, s.along); // no se retrocede por el ruido del GPS
    drawWalked(); paint();
  }
  function startSim() {
    stopWatch(); along = 0; const t0 = performance.now(), speed = 25; // 25 m/s: ruta entera en segundos, para enseñar
    sim = setInterval(() => { along = Math.min(route.total, ((performance.now() - t0) / 1000) * speed); drawWalked(); paint(); if (along >= route.total) { clearInterval(sim); sim = "done"; } }, 120);
    paint();
  }
  function start() {
    if (!route) return;
    if (!navigator.geolocation) { startSim(); return; }
    let first = true;
    watch = navigator.geolocation.watchPosition((p) => {
      const q = [p.coords.latitude, p.coords.longitude];
      if (first) { first = false; if (snap(q).off > 300) { offerSim(); return; } }
      update(q);
    }, () => offerSim(), { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 });
    paint();
  }
  function offerSim() {
    stopWatch();
    bar.classList.add("is-on");
    const simBtn = el("button", "tv-btn", lu("route", 16), t("track.simulate")); simBtn.onclick = startSim;
    const no = el("button", "tv-btn tv-btn-quiet", t("common.close")); no.onclick = () => { bar.classList.remove("is-on"); paint(); };
    bar.replaceChildren(el("div", "tv-track-main", el("strong", null, t("track.far")), el("span", null, t("track.far_body"))), el("div", "tv-track-actions", simBtn, no));
  }
  function stopWatch() { if (watch !== null && watch !== undefined && navigator.geolocation) navigator.geolocation.clearWatch(watch); watch = null; }
  function stop() { stopWatch(); if (sim && sim !== "done") clearInterval(sim); sim = null; pos = null; along = 0; clearDrawn(); }

  go.onclick = start;
  document.addEventListener("tv:route", (e) => setRoute(e.detail));
  document.addEventListener("tv:clear-route", () => { stop(); route = null; paint(); });
  document.addEventListener("tv:lang", paint);
  paint();
  window.tinyvigoTrack = { start, startSim, stop, update, state: () => ({ along, total: route && route.total }) };
})();
