// TinyVigo Ajustes (UI-06): idioma, tema, vista (mapa dibujado / ciudad) e información en un
// único botón; los controles sueltos (GL/ES/EN del panel, tema, «Vista ciudad», «i») se ocultan.
(function () {
  const lu = (name, size = 20) => { const s = document.createElement("span"); s.innerHTML = window.LU ? LU.svg(name, { size }) : ""; return s.firstChild || s; };
  const el = (tag, cls, ...kids) => { const n = document.createElement(tag); if (cls) n.className = cls; n.append(...kids.filter((k) => k != null && k !== false)); return n; };

  function init() {
    const P = window.tinyvigoPoints, t = P.t;
    document.body.classList.add("tv-has-settings");
    const btn = el("button", "tv-settings-open", lu("settings"));
    const pop = el("div", "tv-settings");
    pop.id = "tv-settings"; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-labelledby", "tv-settings-title");
    btn.setAttribute("aria-controls", "tv-settings"); btn.setAttribute("aria-haspopup", "dialog");
    document.body.append(btn, pop);

    // grupo de opciones: aria-pressed para lectores de pantalla; el foco se queda en la opción elegida
    const seg = (items, current, onPick, label) => {
      const g = el("div", "tv-langs tv-seg", ...items.map(([v, text, icon]) => {
        const b = el("button", v === current ? "is-on" : "", icon ? lu(icon, 16) : null, text);
        b.setAttribute("aria-pressed", v === current ? "true" : "false");
        b.dataset.v = v;
        b.onclick = () => { onPick(v); render(); const again = pop.querySelector("[data-v='" + v + "']"); if (again) again.focus(); };
        return b;
      }));
      g.setAttribute("role", "group"); if (label) g.setAttribute("aria-label", label);
      return g;
    };
    const isCity = () => document.body.classList.contains("is-city");
    const theme = () => document.documentElement.getAttribute("data-theme") || "dark";

    function render() {
      btn.setAttribute("aria-label", t("settings.title"));
      btn.setAttribute("aria-expanded", pop.classList.contains("is-open") ? "true" : "false");
      pop.replaceChildren();
      if (!pop.classList.contains("is-open")) return;
      const close = el("button", "tv-close", lu("x")); close.setAttribute("aria-label", t("common.close"));
      close.onclick = () => { pop.classList.remove("is-open"); render(); btn.focus(); };
      const info = el("button", "tv-btn tv-btn-quiet", lu("info", 16), t("nav.about"));
      info.onclick = () => { pop.classList.remove("is-open"); render(); const d = document.getElementById("about"); if (d) d.showModal(); };
      pop.append(close, Object.assign(el("h2", null, t("settings.title")), { id: "tv-settings-title" }),
        el("p", "tv-note", t("settings.language")),
        seg([["gl", "Galego"], ["es", "Español"], ["en", "English"]], P.lang(), (l) => {
          const b = document.querySelectorAll(".tv-panel .tv-langs button")[["gl", "es", "en"].indexOf(l)];
          if (b) b.click();
        }, t("settings.language")),
        el("p", "tv-note", t("settings.view")),
        seg([["iso", "Vigo 3D", "layers"], ["city", t("app.city_view"), "map-pin"]], isCity() ? "city" : "iso", (v) => window.tinyvigoCity && window.tinyvigoCity.setCity(v === "city"), t("settings.view")),
        el("p", "tv-note", t("settings.time")),
        seg([["auto", t("tour.now"), "clock"], ["day", t("settings.light"), "sun"], ["night", t("settings.dark"), "moon"]], window.tinyvigoAmbient ? window.tinyvigoAmbient.state().time : "auto", (v) => window.tinyvigoAmbient && window.tinyvigoAmbient.set({ time: v }), t("settings.time")),
        el("p", "tv-note", t("settings.weather")),
        seg([["auto", t("settings.weather_real"), "layers"], ["clear", t("settings.weather_clear"), "sun"], ["cloudy", t("wx.cloudy"), "cloud"], ["fog", t("settings.weather_fog"), "cloud-fog"], ["rain", t("settings.weather_rain"), "cloud-rain"]], window.tinyvigoAmbient ? window.tinyvigoAmbient.state().weather : "auto", (v) => window.tinyvigoAmbient && window.tinyvigoAmbient.set({ weather: v }), t("settings.weather")),
        el("p", "tv-note", t("settings.theme")),
        seg([["dark", t("settings.dark"), "moon"], ["light", t("settings.light"), "sun"]], theme(), (v) => {
          document.documentElement.setAttribute("data-theme", v);
          try { localStorage.setItem("tinyvigo-theme", v); } catch (e) {}
        }, t("settings.theme")),
        info,
        Object.assign(el("a", "tv-btn tv-btn-quiet", lu("layers", 16), t("settings.design")), { href: "https://github.com/cacelass/NaviHack/tree/main/docs/ui-exploraciones", target: "_blank", rel: "noopener" }));
    }
    btn.onclick = () => {
      pop.classList.toggle("is-open"); render();
      if (pop.classList.contains("is-open")) { const first = pop.querySelector(".tv-seg .is-on") || pop.querySelector("button"); if (first) first.focus(); }
    };
    document.addEventListener("tv:lang", render);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && pop.classList.contains("is-open")) { e.stopImmediatePropagation(); pop.classList.remove("is-open"); render(); btn.focus(); } });
    render();
    window.tinyvigoSettings = { open: () => { pop.classList.add("is-open"); render(); } };
  }
  if (window.tinyvigoPoints) init();
  else document.addEventListener("tv:ready", () => setTimeout(init, 0), { once: true });
})();
