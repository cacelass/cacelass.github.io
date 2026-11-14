// TinyVigo «Vista ciudad»: todo Vigo en un mapa real (Leaflet + CARTO/OSM) con las fotos de cada
// punto, los parkings en vivo y las rutas del tour o de casa al centro. El isométrico solo cubre el centro.
(function () {
  const PARKINGS = "https://datos.vigo.org/data/trafico/parkings-ocupacion.json";
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
      const html = '<div class="tv-pin" style="--c:' + (COLORS[p.type] || "#fff") + '">' +
        (src ? '<img src="' + src + '" alt="" loading="lazy" onerror="this.remove()">' : "") + "</div>";
      const m = L.marker([p.lat, p.lon], { icon: L.divIcon({ className: "", html, iconSize: [46, 54], iconAnchor: [23, 54] }), title: txt(p.name) })
        .on("click", () => P.select(p, false)).addTo(map);
      markers.set(p.id, m);
    }

    // parkings en vivo
    const parkLayer = L.layerGroup().addTo(map);
    async function loadParkings() {
      try {
        const rows = (await (await fetch(PARKINGS)).json()).filter((r) => r.lat);
        parkLayer.clearLayers();
        for (const r of rows) {
          const free = Math.max(0, r.plazaslibres), cls = free === 0 ? "full" : free < 30 ? "low" : "ok";
          const icon = L.divIcon({ className: "", html: '<div class="tv-park tv-park-' + cls + '"><b>P</b>' + (free ? free : t("go.full")) + "</div>", iconSize: [64, 26], iconAnchor: [32, 13] });
          const gm = "https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=" + r.lat + "," + r.lon;
          L.marker([r.lat, r.lon], { icon }).bindPopup(
            "<strong>" + r.nombre + "</strong><br>" + (free ? t("go.free_n", { n: free }) : t("go.full")) + " / " + r.totalplazas +
            '<br><small>' + t("common.updated", { when: r.fechahora.slice(11, 16) }) + '</small><br><a target="_blank" rel="noopener" href="' + gm + '">' + t("go.route_to") + "</a>").addTo(parkLayer);
        }
      } catch (e) { /* sin feed: la capa queda vacía */ }
    }
    loadParkings();
    setInterval(loadParkings, 120000); // el Concello publica cada 2 min (D-00)

    // rutas que calcula el tour
    const routeLayer = L.layerGroup().addTo(map);
    document.addEventListener("tv:route", (e) => {
      const { line, start, stops, mode } = e.detail;
      routeLayer.clearLayers();
      if (!line || !line.length) return;
      const ll = line.map(([lo, la]) => [la, lo]);
      L.polyline(ll, { color: "#151b2a", weight: 9, opacity: 0.8 }).addTo(routeLayer);
      L.polyline(ll, { color: mode === "driving" ? "#4ea3ff" : "#f4cd80", weight: 5, dashArray: mode === "transit" ? "8 8" : null }).addTo(routeLayer);
      L.circleMarker(start, { radius: 8, color: "#fff", weight: 3, fillColor: "#4ea3ff", fillOpacity: 1 }).addTo(routeLayer);
      (stops || []).forEach((s, i) => L.marker([s.p.lat, s.p.lon], { icon: L.divIcon({ className: "", html: '<div class="tv-stopnum">' + (i + 1) + "</div>", iconSize: [26, 26], iconAnchor: [13, 40] }) }).addTo(routeLayer));
      lastBounds = L.latLngBounds(ll).pad(0.15);
      if (e.detail.showCity) setCity(true);
      else if (document.body.classList.contains("is-city")) map.fitBounds(lastBounds);
    });
    document.addEventListener("tv:clear-route", () => { routeLayer.clearLayers(); lastBounds = null; });

    // al elegir un punto, la vista ciudad también se mueve
    document.addEventListener("tv:select", (e) => { if (document.body.classList.contains("is-city")) map.flyTo([e.detail.lat, e.detail.lon], Math.max(map.getZoom(), 16)); });

    function setCity(on) {
      document.body.classList.toggle("is-city", on);
      btn.textContent = on ? "Vigo 3D" : t("app.city_view");
      if (on) setTimeout(() => { map.invalidateSize(); if (lastBounds) map.fitBounds(lastBounds); }, 50);
    }
    btn.onclick = () => setCity(!document.body.classList.contains("is-city"));
    document.addEventListener("tv:lang", () => setCity(document.body.classList.contains("is-city")));
    setCity(false);
    window.tinyvigoCity = { map, setCity };
  }

  if (window.tinyvigoPoints) init();
  else document.addEventListener("tv:ready", init, { once: true });
})();
