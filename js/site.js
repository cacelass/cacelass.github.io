"use strict";
// js/site.js — Tema (claro/oscuro), cursor custom y typewriter.
// Se carga en todas las páginas del sitio con <script defer>.
(function () {
    "use strict";
    var root = document.documentElement;
    var THEME_KEY = "site-theme";
    var THEME_COLORS = { light: "#e6e6e6", dark: "#181a1d" };
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    // ── Tema claro / oscuro ─────────────────────────────────────
    function currentTheme() {
        return root.dataset.theme === "dark" ? "dark" : "light";
    }
    function applyTheme(theme, persist) {
        root.dataset.theme = theme;
        if (metaTheme)
            metaTheme.setAttribute("content", THEME_COLORS[theme]);
        if (persist) {
            try {
                localStorage.setItem(THEME_KEY, theme);
            }
            catch (e) {
                /* almacenamiento no disponible */
            }
        }
        document.querySelectorAll(".theme-toggle").forEach(function (btn) {
            btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
        });
    }
    applyTheme(currentTheme(), false);
    document.addEventListener("click", function (event) {
        var target = event.target;
        var btn = target && target.closest ? target.closest(".theme-toggle") : null;
        if (!btn)
            return;
        applyTheme(currentTheme() === "dark" ? "light" : "dark", true);
    });
    // ── Cursor custom (solo puntero fino) ───────────────────────
    var finePointer = window.matchMedia &&
        window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (finePointer && document.body) {
        var glow = document.createElement("div");
        glow.className = "cursor-glow";
        glow.setAttribute("aria-hidden", "true");
        var mark = document.createElement("div");
        mark.className = "cursor-mark";
        mark.setAttribute("aria-hidden", "true");
        document.body.appendChild(glow);
        document.body.appendChild(mark);
        root.classList.add("has-cursor");
        var targetX = 0, targetY = 0, glowX = 0, glowY = 0, started = false;
        var HOVER_SEL = 'a, button, select, summary, label, [role="button"]';
        document.addEventListener("mousemove", function (event) {
            targetX = event.clientX;
            targetY = event.clientY;
            if (!started) {
                glowX = targetX;
                glowY = targetY;
                started = true;
                glow.style.opacity = "1";
            }
            mark.style.transform = "translate(" + targetX + "px," + targetY + "px)";
            var target = event.target;
            var interactive = target && target.closest ? target.closest(HOVER_SEL) : null;
            mark.classList.toggle("is-hover", !!interactive);
        }, { passive: true });
        (function follow() {
            glowX += (targetX - glowX) * 0.12;
            glowY += (targetY - glowY) * 0.12;
            glow.style.transform = "translate(" + glowX + "px," + glowY + "px)";
            window.requestAnimationFrame(follow);
        })();
        document.addEventListener("mousedown", function () {
            root.classList.add("is-down");
        });
        document.addEventListener("mouseup", function () {
            root.classList.remove("is-down");
        });
        document.addEventListener("mouseleave", function () {
            glow.style.opacity = "0";
            mark.style.opacity = "0";
        });
        document.addEventListener("mouseenter", function () {
            glow.style.opacity = "1";
            mark.style.opacity = "1";
        });
    }
    // ── Typewriter del terminal del hero ────────────────────────
    function initTypewriter() {
        var el = document.querySelector(".hero-term .term-cmd");
        if (!el || el.hasAttribute("data-i18n"))
            return;
        var phrases = [
            "./build_ml_system --from data to production",
            "python train.py --credit-risk --calibrated",
            "uv run backtest.py --temporal --no-leakage",
            "docker compose up -d api worker",
        ];
        var reduced = window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) {
            el.textContent = phrases[0];
            return;
        }
        var phrase = 0, char = 0, deleting = false;
        function tick() {
            var text = phrases[phrase];
            if (!deleting) {
                char++;
                el.textContent = text.slice(0, char);
                if (char === text.length) {
                    deleting = true;
                    window.setTimeout(tick, 2200);
                    return;
                }
                window.setTimeout(tick, 42 + Math.random() * 46);
                return;
            }
            char--;
            el.textContent = text.slice(0, char);
            if (char === 0) {
                deleting = false;
                phrase = (phrase + 1) % phrases.length;
                window.setTimeout(tick, 320);
                return;
            }
            window.setTimeout(tick, 18);
        }
        el.textContent = "";
        window.setTimeout(tick, 700);
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initTypewriter);
    }
    else {
        initTypewriter();
    }
})();
