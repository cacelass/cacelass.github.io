// js/app.ts — Lógica principal de cacelass.github.io
// HTML · CSS · TypeScript (compilado a JS plano, sin módulos)

(function () {
  "use strict";

  // ── Scroll reveal (IntersectionObserver) ───────────────────
  function initReveal(): void {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el: Element) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry: IntersectionObserverEntry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    els.forEach((el: Element) => io.observe(el));
  }

  // ── Hero canvas signal field (homepage only) ───────────────
  function initCanvas(): void {
    const canvasEl = document.getElementById('hero-signal-field');
    if (!canvasEl) return;
    const canvas = canvasEl as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let frameId = 0;
    /* narrowed copy for nested closures */
    const context = ctx;

    function resize(): void {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(window.innerWidth));
      height = Math.max(1, Math.floor(window.innerHeight));
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function signalY(stream: number, x: number, time: number): number {
      const baseline = height * (0.18 + stream * 0.13);
      const waveA = Math.sin(x * 0.008 + time * (0.00032 + stream * 0.000018));
      const waveB = Math.sin(x * 0.019 - time * 0.00019 + stream * 1.6);
      return baseline + waveA * (13 + stream * 2) + waveB * 5;
    }

    function draw(time: number): void {
      context.clearRect(0, 0, width, height);
      context.lineWidth = 1;

      const dark = document.documentElement.dataset.theme === 'dark';
      const lineStrong = dark ? 'rgba(235, 237, 240, 0.38)' : 'rgba(15, 15, 15, 0.34)';
      const lineSoft = dark ? 'rgba(235, 237, 240, 0.16)' : 'rgba(15, 15, 15, 0.14)';
      const dotStrong = dark ? 'rgba(244, 245, 247, 0.9)' : 'rgba(15, 15, 15, 0.8)';
      const dotSoft = dark ? 'rgba(235, 237, 240, 0.5)' : 'rgba(15, 15, 15, 0.45)';
      const tickColor = dark ? 'rgba(235, 237, 240, 0.06)' : 'rgba(15, 15, 15, 0.05)';

      for (let stream = 0; stream < 6; stream++) {
        context.beginPath();
        for (let x = 0; x <= width; x += 12) {
          const y = signalY(stream, x, time);
          if (x === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.strokeStyle = stream === 2 ? lineStrong : lineSoft;
        context.stroke();

        const markerX =
          ((time * (0.045 + stream * 0.004) + stream * 173) % (width + 80)) -
          40;
        const markerY = signalY(stream, markerX, time);
        context.fillStyle = stream === 2 ? dotStrong : dotSoft;
        context.fillRect(markerX - 1.5, markerY - 1.5, 3, 3);
      }

      for (let tick = 0; tick < width; tick += 96) {
        context.fillStyle = tickColor;
        context.fillRect(tick, 0, 1, height);
      }
    }

    function animate(time: number): void {
      draw(time);
      if (!reducedMotion) frameId = window.requestAnimationFrame(animate);
    }

    function onVisibilityChange(): void {
      if (document.hidden) {
        window.cancelAnimationFrame(frameId);
      } else if (!reducedMotion) {
        frameId = window.requestAnimationFrame(animate);
      }
    }

    resize();
    draw(0);
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    if (!reducedMotion) frameId = window.requestAnimationFrame(animate);
  }

  // ── Init on DOM ready ──────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    // Always: reveal sections
    initReveal();

    // Homepage-specific: signal field canvas
    const body = document.body;
    if (body && body.classList.contains('homepage')) {
      initCanvas();
    }
  });
})();
