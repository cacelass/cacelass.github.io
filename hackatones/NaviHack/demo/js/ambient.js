// TinyVigo ambiente: el mapa dibujado cambia con la hora y el tiempo, sin lastrar el visor.
// - Noche gradual: 0 antes de la puesta de sol real (Open-Meteo), sube durante una hora y
//   baja antes del amanecer. Tinte oscuro y luces de Navidad con esa intensidad.
// - Ligero: un halo por punto (21 elementos en total), los destellos van dentro del halo;
//   sin mix-blend-mode ni filtros; solo se anima la opacidad (compositor).
// - Lluvia en canvas a ~30 fps con ≤ 140 gotas, en pausa si la pestaña no se ve.
// Hora y clima: automáticos o forzados desde Ajustes y el botón rápido.
(function () {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const state = { time: "auto", weather: "auto" };
  let live = null; // {kind, sunrise:[Date], sunset:[Date]}
  try { Object.assign(state, JSON.parse(localStorage.getItem("tinyvigo.ambient") || "{}")); } catch (e) {}

  const kindOf = (c) => (c === 0 || c === 1 ? "clear" : c === 45 || c === 48 ? "fog" : c <= 3 ? "cloudy" : "rain");
  function fetchLive() {
    tinyvigoData.weather().then((d) => { // WEB-05: fichero propio
      live = { kind: kindOf(d.current.weather_code), sunrise: d.daily.sunrise.map((s) => new Date(s)), sunset: d.daily.sunset.map((s) => new Date(s)) };
      apply();
    }).catch(() => {});
  }
  // 0 = día, 1 = noche cerrada; rampa de 60 min tras la puesta y antes del amanecer
  function nightLevel(now = new Date()) {
    if (state.time === "night") return 1;
    if (state.time === "day") return 0;
    const ramp = 60 * 60000;
    if (live) {
      const rise = live.sunrise[0], set = live.sunset[0], riseNext = live.sunrise[1] || rise;
      if (now < rise) return Math.min(1, Math.max(0, (rise - now) / ramp));
      if (now < set) return 0;
      return Math.min(Math.min(1, (now - set) / ramp), Math.max(0, Math.min(1, (riseNext - now) / ramp)));
    }
    const h = now.getHours() + now.getMinutes() / 60; // sin datos: noviembre en Vigo, ~18:00–08:30
    return h >= 19 || h < 7.5 ? 1 : h >= 18 ? h - 18 : h < 8.5 ? 8.5 - h : 0;
  }
  const isNight = () => nightLevel() > 0.5;
  const weather = () => (state.weather !== "auto" ? state.weather : live ? live.kind : "clear");

  // ── capas ────────────────────────────────────────────────────────────────
  let tint = null, glows = [], viewer = null, built = false;
  const rainCanvas = document.createElement("canvas");
  rainCanvas.className = "tv-rain";
  const clouds = document.createElement("div");
  clouds.className = "tv-clouds";
  for (let i = 0; i < 2; i++) clouds.append(Object.assign(document.createElement("span"), { style: "--i:" + i }));
  document.body.append(clouds, rainCanvas);

  function build() {
    if (built || !viewer || !window.tinyvigoPoints) return;
    built = true;
    // tinte fijo sobre la pantalla (no una capa pegada al mapa que se recoloca en cada fotograma)
    tint = document.createElement("div");
    tint.className = "tv-night";
    const cv = viewer.drawer && viewer.drawer.canvas; // encima del dibujo, debajo de luces y marcadores
    if (cv && cv.parentNode) cv.parentNode.insertBefore(tint, cv.nextSibling); else document.getElementById("map").after(tint);
    const pts = window.tinyvigoPoints.points.filter((p) => p.on_map && ["light", "attraction", "market", "santa_kings"].includes(p.type));
    pts.forEach((p, i) => {
      const halo = document.createElement("span");
      halo.className = "tv-glow tv-glow-" + p.type;
      halo.style.setProperty("--d", ((i * 0.37) % 3).toFixed(2) + "s");
      // el halo escala con el mapa (~40 m de radio): de lejos es pequeño, de cerca se ve
      const r = 0.0075;
      viewer.addOverlay({ element: halo, location: new OpenSeadragon.Rect(p.x - r, p.y - r * 0.8, 2 * r, 1.6 * r) });
      glows.push(halo);
    });
  }

  // lluvia: ≤ 140 gotas, ~30 fps, pausa con la pestaña oculta
  let drops = [], raf = 0, last = 0;
  function rainLoop(ts) {
    raf = requestAnimationFrame(rainLoop);
    if (document.hidden || ts - last < 50) return;
    last = ts;
    const c = rainCanvas, ctx = c.getContext("2d"), W = innerWidth, H = innerHeight;
    if (c.width !== W || c.height !== H) { c.width = W; c.height = H; drops = []; }
    if (!drops.length) drops = Array.from({ length: Math.min(90, Math.round((W * H) / 12000)) }, () => ({ x: Math.random() * W, y: Math.random() * H, v: 14 + Math.random() * 10, l: 10 + Math.random() * 12 }));
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(210, 222, 240, .5)"; ctx.lineWidth = 1.2; ctx.beginPath();
    for (const d of drops) {
      ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - d.l * 0.25, d.y + d.l);
      d.y += d.v; d.x -= d.v * 0.25;
      if (d.y > H) { d.y = -20; d.x = Math.random() * (W + 100); }
    }
    ctx.stroke();
  }

  function apply() {
    const lvl = nightLevel(), w = weather(), city = document.body.classList.contains("is-city");
    document.body.classList.toggle("tv-is-night", lvl > 0.5);
    document.documentElement.style.setProperty("--night", lvl.toFixed(2));
    if (lvl > 0 && !city) build();
    if (tint) tint.style.display = lvl > 0 ? "" : "none";
    glows.forEach((g) => (g.style.display = lvl > 0.15 && !city ? "" : "none"));
    const raining = w === "rain" && !city;
    rainCanvas.style.display = raining ? "block" : "none";
    cancelAnimationFrame(raf);
    if (raining && !reduced) raf = requestAnimationFrame(rainLoop);
    clouds.classList.toggle("is-on", (w === "cloudy" || w === "rain") && !city && !reduced);
    document.body.classList.toggle("tv-fog", w === "fog" && !city);
    document.body.classList.toggle("tv-reduced", reduced);
  }

  // botón rápido junto a Ajustes: Ahora (hora real) -> Noche -> Día
  const quick = document.createElement("button");
  quick.className = "tv-time-quick";
  const ORDER = ["auto", "night", "day"], ICON = { auto: "clock", night: "moon", day: "sun" };
  function paintQuick() {
    const t = window.tinyvigoPoints ? window.tinyvigoPoints.t : (k) => k;
    const label = { auto: t("tour.now"), night: t("settings.dark"), day: t("settings.light") }[state.time];
    quick.innerHTML = (window.LU ? LU.svg(ICON[state.time], { size: 20 }) : "") + "<span>" + label + "</span>";
    quick.setAttribute("aria-label", t("settings.time") + ": " + label);
    quick.classList.toggle("is-forced", state.time !== "auto");
  }
  function set(next) {
    Object.assign(state, next);
    try { localStorage.setItem("tinyvigo.ambient", JSON.stringify(state)); } catch (e) {}
    apply();
    paintQuick();
  }
  quick.onclick = () => set({ time: ORDER[(ORDER.indexOf(state.time) + 1) % ORDER.length] });
  document.body.append(quick);
  document.addEventListener("tv:lang", paintQuick);

  function init() {
    paintQuick();
    viewer = window.tinyvigo && window.tinyvigo.viewer;
    if (!viewer) { setTimeout(init, 200); return; }
    fetchLive(); setInterval(fetchLive, 600000); setInterval(apply, 60000);
    new MutationObserver(apply).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    apply();
  }
  window.tinyvigoAmbient = { set, state: () => ({ ...state }), isNight, nightLevel, weather };
  if (window.tinyvigoPoints) init(); else document.addEventListener("tv:ready", init, { once: true });
})();
