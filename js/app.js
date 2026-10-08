"use strict";
// js/app.ts — Lógica principal de cacelass.github.io
// HTML · CSS · TypeScript (compilado a JS plano, sin módulos)
(function () {
    "use strict";
    // ── Scroll reveal (IntersectionObserver) ───────────────────
    function initReveal() {
        const els = document.querySelectorAll('.reveal');
        if (!('IntersectionObserver' in window)) {
            els.forEach((el) => el.classList.add('is-visible'));
            return;
        }
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        els.forEach((el) => io.observe(el));
    }
    // ── Hero canvas signal field (homepage only) ───────────────
    function initCanvas() {
        const canvasEl = document.getElementById('hero-signal-field');
        if (!canvasEl)
            return;
        const canvas = canvasEl;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const reducedMotion = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let width = 0;
        let height = 0;
        let pixelRatio = 1;
        let frameId = 0;
        /* narrowed copy for nested closures */
        const context = ctx;
        function resize() {
            pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
            width = Math.max(1, Math.floor(window.innerWidth));
            height = Math.max(1, Math.floor(window.innerHeight));
            canvas.width = Math.floor(width * pixelRatio);
            canvas.height = Math.floor(height * pixelRatio);
            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        }
        function signalY(stream, x, time) {
            const baseline = height * (0.18 + stream * 0.13);
            const waveA = Math.sin(x * 0.008 + time * (0.00032 + stream * 0.000018));
            const waveB = Math.sin(x * 0.019 - time * 0.00019 + stream * 1.6);
            return baseline + waveA * (13 + stream * 2) + waveB * 5;
        }
        function draw(time) {
            context.clearRect(0, 0, width, height);
            context.lineWidth = 1;
            for (let stream = 0; stream < 6; stream++) {
                context.beginPath();
                for (let x = 0; x <= width; x += 12) {
                    const y = signalY(stream, x, time);
                    if (x === 0)
                        context.moveTo(x, y);
                    else
                        context.lineTo(x, y);
                }
                context.strokeStyle =
                    stream === 2
                        ? 'rgba(33, 133, 95, 0.52)'
                        : 'rgba(33, 133, 95, 0.24)';
                context.stroke();
                const markerX = ((time * (0.045 + stream * 0.004) + stream * 173) % (width + 80)) -
                    40;
                const markerY = signalY(stream, markerX, time);
                context.fillStyle =
                    stream === 2
                        ? 'rgba(20, 97, 68, 0.95)'
                        : 'rgba(33, 133, 95, 0.72)';
                context.fillRect(markerX - 1.5, markerY - 1.5, 3, 3);
            }
            for (let tick = 0; tick < width; tick += 96) {
                context.fillStyle = 'rgba(23, 36, 39, 0.12)';
                context.fillRect(tick, 0, 1, height);
            }
        }
        function animate(time) {
            draw(time);
            if (!reducedMotion)
                frameId = window.requestAnimationFrame(animate);
        }
        function onVisibilityChange() {
            if (document.hidden) {
                window.cancelAnimationFrame(frameId);
            }
            else if (!reducedMotion) {
                frameId = window.requestAnimationFrame(animate);
            }
        }
        resize();
        draw(0);
        window.addEventListener('resize', resize, { passive: true });
        document.addEventListener('visibilitychange', onVisibilityChange);
        if (!reducedMotion)
            frameId = window.requestAnimationFrame(animate);
    }
    // ── GSAP hero + scroll animations (homepage only) ──────────
    function initGsap() {
        const reducedMotion = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const REVEAL_SEL = '.reveal, .hero h1, .hero-sub, .hero-term, .hero-logos svg, .hero-chips .chip, .hero-cta, .hero-eyebrow';
        function revealAll() {
            document.querySelectorAll(REVEAL_SEL).forEach(function (el) {
                const h = el;
                h.style.opacity = '1';
                h.style.transform = 'none';
            });
        }
        if (reducedMotion) {
            revealAll();
            return;
        }
        const gsap = window.gsap;
        const ScrollTrigger = window.ScrollTrigger;
        if (!gsap || !ScrollTrigger) {
            // GSAP not loaded (CDN blocked or offline): always visible
            revealAll();
            return;
        }
        gsap.registerPlugin(ScrollTrigger);
        /* Hero: fade in */
        gsap.from('.hero-eyebrow', {
            opacity: 0,
            y: 8,
            duration: 0.5,
            ease: 'power2.out',
        });
        gsap.from('.hero h1', {
            opacity: 0,
            y: 8,
            duration: 0.6,
            delay: 0.15,
            ease: 'power2.out',
        });
        gsap.from('.hero-sub', {
            opacity: 0,
            y: 8,
            duration: 0.5,
            delay: 0.3,
            ease: 'power2.out',
        });
        gsap.from('.hero-term', {
            opacity: 0,
            y: 8,
            duration: 0.5,
            delay: 0.4,
            ease: 'power2.out',
        });
        gsap.from('.hero-chips .chip', {
            opacity: 0,
            y: 6,
            stagger: 0.06,
            duration: 0.4,
            delay: 0.5,
            ease: 'power2.out',
        });
        gsap.from('.hero-cta', {
            opacity: 0,
            y: 6,
            stagger: 0.08,
            duration: 0.4,
            delay: 0.65,
            ease: 'power2.out',
        });
        /* ScrollTrigger: fade-in sutil */
        gsap.utils.toArray('.reveal').forEach(function (el) {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 90%',
                    toggleActions: 'play none none none',
                },
                opacity: 0,
                y: 10,
                duration: 0.5,
                ease: 'power2.out',
            });
        });
        /* Cards: stagger sutil al entrar en viewport */
        [
            '.about-grid .about-card',
            '.featured-grid .feat-card',
            '.stack-grid .stack-card',
            '.more-list .more-item',
        ].forEach(function (sel) {
            const els = gsap.utils.toArray(sel);
            if (els.length) {
                gsap.from(els, {
                    scrollTrigger: {
                        trigger: els[0].parentElement,
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                    },
                    opacity: 0,
                    y: 14,
                    stagger: 0.06,
                    duration: 0.45,
                    ease: 'power2.out',
                });
            }
        });
        /* Hero logos fade in */
        gsap.from('.hero-logos svg', {
            opacity: 0,
            y: 6,
            stagger: 0.1,
            duration: 0.5,
            delay: 0.45,
            ease: 'power2.out',
        });
        /* Safety net: if anything is still hidden after 2.5s, reveal it */
        setTimeout(function () {
            document
                .querySelectorAll('.hero-eyebrow, .hero h1, .hero-sub, .hero-term, .hero-logos svg, .hero-chips .chip, .hero-cta')
                .forEach(function (el) {
                const h = el;
                const currentOpacity = h.style.opacity || getComputedStyle(h).opacity;
                if (parseFloat(currentOpacity) < 0.05) {
                    h.style.opacity = '';
                    h.style.transform = 'none';
                }
            });
        }, 2500);
    }
    // ── Init on DOM ready ──────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        // Always: reveal sections
        initReveal();
        // Homepage-specific: canvas + GSAP
        const body = document.body;
        if (body && body.classList.contains('homepage')) {
            initCanvas();
            initGsap();
        }
    });
})();
