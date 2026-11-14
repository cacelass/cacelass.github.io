// TinyVigo «Vista ciudad»: todo Vigo en un mapa real (Leaflet + CARTO/OSM) con las fotos de cada
// punto, los parkings en vivo y las rutas del tour o de casa al centro. El isométrico solo cubre el centro.
(function () {
  const COLORS = { light: "#f4cd80", attraction: "#e7836a", market: "#8fcf7a", santa_kings: "#d9534f", exhibit: "#9cc4ff", photo_gallery: "#9cc4ff", photocall: "#9cc4ff" };

  async function init() {
    if (!window.L) await window.tinyvigo.need(() => window.L, "vendor/leaflet/leaflet.js");
    const P = window.tinyvigoPoints, t = P.t, txt = P.txt;
    const wrap = document.createElement("div");
    wrap.id = "city";
    const btn = document.createElement("button");
    btn.className = "tv-view";
    document.body.append(wrap, btn);

    const map = L.map(wrap, { zoomControl: false, attributionControl: true }).setView([42.2375, -8.7215], 15);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, className: "tv-osm",
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    }).addTo(map);
    let lastBounds = null;
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // puntos: la foto real del Concello como marcador
    const photo = (p) => p.photo || "";
    const markers = new Map();
    for (const p of P.points) {
      const src = photo(p);
      const st = P.status(p); const html = '<div class="tv-pin' + (st && st.open ? " is-open" : "") + '">' +
        (src ? '<img src="' + src + '" alt="" loading="lazy" onerror="this.remove()">' : "") + "</div>";
      const m = L.marker([p.lat, p.lon], { icon: L.divIcon({ className: "", html, iconSize: [84, 67], iconAnchor: [42, 67] }), title: txt(p.name) })
        .on("click", () => P.select(p, false)).addTo(map);
      markers.set(p.id, m);
    }

    // parkings en vivo
    const parkLayer = L.layerGroup().addTo(map);
    async function loadParkings() {
      try {
        const rows = (await tinyvigoData.parkings()).filter((r) => r.lat); // WEB-05
        parkLayer.clearLayers();
        for (const r of rows) {
          // D-18: fechahora es hora local de Madrid; >10 min sin publicar = «sin datos» (D-00).
          const age = (Date.now() - new Date(r.fechahora.replace(" ", "T"))) / 60000;
          const stale = !(age <= 10);
          const free = Math.max(0, r.plazaslibres), cls = stale ? "stale" : free === 0 ? "full" : free < 30 ? "low" : "ok";
          const label = stale ? t("common.no_data") : free ? free : t("go.full");
          const icon = L.divIcon({ className: "", html: '<div class="tv-park tv-park-' + cls + '"><b>P</b>' + label + "</div>", iconSize: [64, 26], iconAnchor: [32, 13] });
          const gm = "https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=" + r.lat + "," + r.lon;
          L.marker([r.lat, r.lon], { icon }).bindPopup(
            "<strong>" + r.nombre + "</strong><br>" + (stale ? t("common.no_data") : free ? t(free === 1 ? "go.free_1" : "go.free_n", { n: free }) : t("go.full")) + " / " + r.totalplazas +
            '<br><small>' + t("common.updated", { when: r.fechahora.slice(11, 16) }) + '</small><br><a target="_blank" rel="noopener" href="' + gm + '">' + t("go.route_to") + "</a>").addTo(parkLayer);
        }
      } catch (e) { /* sin feed: la capa queda vacía */ }
    }
    loadParkings();
    setInterval(loadParkings, 120000); // el Concello publica cada 2 min (D-00)

    // MOB-02: en móvil la hoja tapa ~60 % de abajo; la ruta se encuadra en la parte visible
    const fitRoute = (b) => {
      if (!b) return;
      const m = matchMedia("(max-width: 700px)").matches;
      map.fitBounds(b, m ? { paddingTopLeft: [24, 90], paddingBottomRight: [24, Math.round(innerHeight * 0.62)] } : { padding: [40, 40] });
    };
    // con zoom lejano las fotos se amontonan: pines tipo gota; de cerca, la foto entera
    const zoomClass = () => map.getContainer().classList.toggle("tv-z-far", map.getZoom() < 16);
    map.on("zoomend", zoomClass);
    zoomClass();

    // rutas que calcula el tour
    const routeLayer = L.layerGroup().addTo(map);
    document.addEventListener("tv:route", (e) => {
      const { start, stops } = e.detail;
      routeLayer.clearLayers();
      // GO-01: varios tramos (coche/bus/a pie hasta el inicio + tour), cada uno con su estilo
      const legs = e.detail.legs || (e.detail.line ? [{ line: e.detail.line, mode: e.detail.mode === "driving" ? "car" : "tour" }] : []);
      const STYLE = {
        car: { color: "#4ea3ff", weight: 6 },
        bus: { color: "#34c38f", weight: 6 },
        walk: { color: "#f4cd80", weight: 4, dashArray: "2 9", lineCap: "round" },
        tour: { color: "#f4cd80", weight: 5 },
      };
      const all = [];
      for (const leg of legs) {
        if (!leg.line || !leg.line.length) continue;
        const ll = leg.line.map(([lo, la]) => [la, lo]);
        all.push(...ll);
        L.polyline(ll, { color: "#151b2a", weight: (STYLE[leg.mode] || STYLE.tour).weight + 4, opacity: 0.75 }).addTo(routeLayer);
        L.polyline(ll, STYLE[leg.mode] || STYLE.tour).addTo(routeLayer);
        const badge = (pos, cls, label) => L.marker(pos, { zIndexOffset: 900, icon: L.divIcon({ className: "", html: '<div class="tv-legpin ' + cls + '">' + label + "</div>", iconSize: [26, 26], iconAnchor: [13, 13] }) }).addTo(routeLayer);
        if (leg.parking) badge(leg.parking, "is-park", "P");
        if (leg.board) badge(leg.board, "is-bus", window.LU ? LU.svg("bus", { size: 14 }) : "B");
        if (leg.alight) badge(leg.alight, "is-bus", window.LU ? LU.svg("bus", { size: 14 }) : "B");
      }
      if (!all.length) return;
      L.circleMarker(start, { radius: 8, color: "#fff", weight: 3, fillColor: "#4ea3ff", fillOpacity: 1 }).addTo(routeLayer);
      (stops || []).forEach((s, i) => L.marker([s.p.lat, s.p.lon], { zIndexOffset: 1000, title: (i + 1) + ". " + txt(s.p.name), icon: L.divIcon({ className: "", html: '<div class="tv-stopnum">' + (i + 1) + "</div>", iconSize: [28, 28], iconAnchor: [14, 82] }) })
        .on("click", () => (window.tinyvigoTour ? tinyvigoTour.startWalk(i) : P.select(s.p, false))).addTo(routeLayer));
      lastBounds = L.latLngBounds(all).pad(0.15);
      if (e.detail.showCity) setCity(true);
      else if (document.body.classList.contains("is-city")) fitRoute(lastBounds);
    });
    document.addEventListener("tv:clear-route", () => { routeLayer.clearLayers(); lastBounds = null; });

    // al elegir un punto, la vista ciudad también se mueve
    document.addEventListener("tv:select", (e) => { if (document.body.classList.contains("is-city")) map.flyTo([e.detail.lat, e.detail.lon], Math.max(map.getZoom(), 16)); });

    function setCity(on) {
      document.body.classList.toggle("is-city", on);
      btn.innerHTML = (window.LU ? LU.svg(on ? "layers" : "map-pin", { size: 20 }) : "") + "<span>" + (on ? "Vigo 3D" : t("app.city_view")) + "</span>";
      if (on) setTimeout(() => { map.invalidateSize(); if (lastBounds) fitRoute(lastBounds); }, 50);
    }
    btn.onclick = () => setCity(!document.body.classList.contains("is-city"));
    document.addEventListener("tv:lang", () => setCity(document.body.classList.contains("is-city")));
    setCity(false);
    window.tinyvigoCity = { map, setCity };
  }

  if (window.tinyvigoPoints) init();
  else document.addEventListener("tv:ready", init, { once: true });
})();
