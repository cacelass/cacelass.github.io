// TinyVigo compartir (SHARE-01): el estado va en el enlace y se reabre al cargar.
//   #p=<id>             un punto con su ficha
//   #tour=<min>-<hora>  un tour (hora: now, 18, 20, 22) desde Porta do Sol
// Botón «Compartir»: hoja nativa del móvil (navigator.share) o copia el enlace.
(function () {
  const lu = (name, size = 16) => { const s = document.createElement("span"); s.innerHTML = window.LU ? LU.svg(name, { size }) : ""; return s.firstChild || s; };
  const parse = () => Object.fromEntries(location.hash.replace(/^#/, "").split("&").filter(Boolean).map((kv) => kv.split("=").map(decodeURIComponent)));
  const setHash = (obj) => {
    const lang = window.tinyvigoPoints ? window.tinyvigoPoints.lang() : "";
    const h = Object.entries(obj).map(([k, v]) => k + "=" + encodeURIComponent(v)).join("&");
    history.replaceState(null, "", location.pathname + (lang ? "?lang=" + lang : "") + (h ? "#" + h : ""));
  };

  function toast(text) {
    const n = document.createElement("div");
    n.className = "tv-toast"; n.setAttribute("role", "status"); n.textContent = text;
    document.body.append(n);
    setTimeout(() => n.remove(), 2200);
  }

  async function share(title) {
    const url = location.href, t = window.tinyvigoPoints.t;
    if (navigator.share) { try { await navigator.share({ title: "TinyVigo · " + title, url }); return; } catch (e) { /* cancelado: se copia */ } }
    try { await navigator.clipboard.writeText(url); toast(t("share.copied")); } catch (e) { prompt(t("share.copy"), url); }
  }
  function button(title) {
    const b = document.createElement("button");
    b.className = "tv-btn tv-btn-quiet tv-btn-icon";
    const label = window.tinyvigoPoints.t("share.button");
    b.setAttribute("aria-label", label); b.title = label;
    b.append(lu("share-2", 20));
    b.onclick = () => share(title);
    return b;
  }

  function init() {
    const P = window.tinyvigoPoints;
    document.addEventListener("tv:select", (e) => setHash({ p: e.detail.id }));
    document.addEventListener("tv:route", (e) => { if (e.detail.mode === "walking" && window.tinyvigoTour) setHash({ tour: window.tinyvigoTour.state() }); });
    document.addEventListener("tv:clear-route", () => setHash({}));
    // abrir lo que trae el enlace
    const st = parse();
    if (st.p) { const p = P.points.find((x) => x.id === st.p); if (p) setTimeout(() => P.select(p), 400); }
    if (st.tour && window.tinyvigoTour) {
      const [min, when] = st.tour.split("-");
      setTimeout(() => { const T = window.tinyvigoTour; T.setFromHere(false); T.setBudget(+min || 60); T.setWhen(when || "now"); T.open(); T.run(); }, 500);
    }
    window.tinyvigoShare = { button, share, setHash };
  }
  if (window.tinyvigoPoints && window.tinyvigoTour) init();
  else document.addEventListener("tv:ready", () => setTimeout(init, 0), { once: true });
})();
