// TinyVigo viewer: tiles come from tiles/<version>/ (version in tiles/current.json).
(async function () {
  // Si vendor/openseadragon no llegó a ejecutarse (primera carga con caché vacía), se reintenta.
  const need = (ok, src) => ok() ? null : new Promise((res, rej) => { const s = document.createElement("script"); s.src = src + "?r=" + Date.now(); s.onload = res; s.onerror = rej; document.head.append(s); });
  await need(() => window.OpenSeadragon, "vendor/openseadragon.min.js");
  const current = await (await fetch("tiles/current.json")).json();
  const base = "tiles/" + current.version + "/";
  const m = await (await fetch(base + "manifest.json")).json();

  const viewer = OpenSeadragon({
    id: "map",
    showNavigationControl: false,
    showRotationControl: false,
    gestureSettingsMouse: { clickToZoom: false },
    animationTime: 0.6,
    maxZoomPixelRatio: 6,
    homeFillsViewer: true,
    visibilityRatio: 1,
    constrainDuringPan: true,
    immediateRender: true,
    imageSmoothingEnabled: false,
    tileSources: (() => {
      const source = {
        width: m.width,
        height: m.height,
        tileSize: m.tile_size,
        minLevel: m.min_level,
        maxLevel: m.max_level,
        getTileUrl: (level, x, y) => base + level + "/" + x + "_" + y + "." + m.format,
      };
      // An image that covers only part of the georeferenced canvas is placed at its real position.
      if (!m.canvas) return source;
      return { tileSource: new OpenSeadragon.TileSource(source), x: m.offset.x / m.canvas.width, y: m.offset.y / m.canvas.width, width: m.width / m.canvas.width };
    })(),
  });
  // The home view covers the whole screen; it is also the farthest you can zoom out.
  const fit = (goHome) => {
    const vp = viewer.viewport;
    vp.minZoomLevel = vp.getHomeZoom();
    if (goHome) vp.goHome(true);
    vp.applyConstraints(true);
  };
  viewer.addHandler("open", () => fit(true));
  viewer.addHandler("resize", () => fit(false));
  viewer.addHandler("tile-load-failed", (e) => console.warn("tile failed", e.tile && e.tile.url, e.message));
  const zoomBy = (f) => { viewer.viewport.zoomBy(f); viewer.viewport.applyConstraints(); };
  document.getElementById("zoom-in").onclick = () => zoomBy(1.6);
  document.getElementById("zoom-out").onclick = () => zoomBy(1 / 1.6);
  window.tinyvigo = { viewer, manifest: m, need };
})();
