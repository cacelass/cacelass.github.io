/* shader.js — WebGL animated background for cacelass.github.io (WEB-019).
 *
 * Viability analysis (shaders.com):
 *   - shaders.com uses WebGPU, not WebGL. WebGPU has limited browser support:
 *     Chrome/Edge stable, Firefox/Safari experimental (behind flags).
 *   - Requires npm install + build system (React/Vue/Svelte/vanilla JS module).
 *   - For a static HTML portfolio without build tools, WebGPU dependency
 *     creates unacceptable compatibility risk.
 *   - This implementation uses WebGL 1.0 instead (99%+ browser support),
 *     achieving the same visual intent: a subtle animated gradient background.
 *
 * Design decisions:
 *   - Subtle animated gradient using site accent colors (#4f8ef7, #a78bfa, #3ecf8e).
 *   - Fragment shader computes animated noise pattern, blended with gradients.
 *   - Canvas positioned fixed behind content (z-index: -1, pointer-events: none).
 *   - Graceful fallback: if WebGL unavailable, CSS background shows through.
 *   - Pause button for users who prefer reduced motion or want to save battery.
 *   - Respects prefers-reduced-motion: auto-pauses animation.
 *   - Performance: requestAnimationFrame, auto-pauses when tab hidden.
 *
 * Files modified: index.html, projects/climasafe.html (script tag + canvas).
 * No content, links, or structure changed — only additive shader layer.
 */
(function () {
  "use strict";

  // ── Config ──
  var COLORS = [
    [0.31, 0.556, 0.969],  // #4f8ef7 (accent)
    [0.655, 0.545, 0.980], // #a78bfa (purple)
    [0.243, 0.812, 0.557], // #3ecf8e (green)
  ];
  var SPEED = 0.15;   // animation speed multiplier
  var INTENSITY = 0.4; // opacity of the shader layer

  // ── WebGL detection ──
  function getWebGLContext(canvas) {
    try {
      return canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    } catch (e) {
      return null;
    }
  }

  // ── Shader sources ──
  var VERT = [
    "attribute vec2 a_position;",
    "void main() {",
    "  gl_Position = vec4(a_position, 0.0, 1.0);",
    "}",
  ].join("\n");

  var FRAG = [
    "precision mediump float;",
    "uniform float u_time;",
    "uniform vec2 u_resolution;",
    "uniform vec3 u_color1;",
    "uniform vec3 u_color2;",
    "uniform vec3 u_color3;",

    // Simplex-style noise (2D)
    "vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }",
    "vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }",
    "vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }",

    "float snoise(vec2 v) {",
    "  const vec4 C = vec4(0.211324865405187, 0.366025403784439,",
    "                      -0.577350269189626, 0.024390243902439);",
    "  vec2 i  = floor(v + dot(v, C.yy));",
    "  vec2 x0 = v - i + dot(i, C.xx);",
    "  vec2 i1;",
    "  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);",
    "  vec4 x12 = x0.xyxy + C.xxzz;",
    "  x12.xy -= i1;",
    "  i = mod289(i);",
    "  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))",
    "                    + i.x + vec3(0.0, i1.x, 1.0));",
    "  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),",
    "                           dot(x12.zw,x12.zw)), 0.0);",
    "  m = m*m; m = m*m;",
    "  vec3 x = 2.0 * fract(p * C.www) - 1.0;",
    "  vec3 h = abs(x) - 0.5;",
    "  vec3 ox = floor(x + 0.5);",
    "  vec3 a0 = x - ox;",
    "  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);",
    "  vec3 g;",
    "  g.x = a0.x * x0.x + h.x * x0.y;",
    "  g.yz = a0.yz * x12.xz + h.yz * x12.yw;",
    "  return 130.0 * dot(m, g);",
    "}",

    "void main() {",
    "  vec2 uv = gl_FragCoord.xy / u_resolution;",
    "  float t = u_time * " + SPEED.toFixed(3) + ";",

    // Layered noise for depth
    "  float n1 = snoise(uv * 2.0 + vec2(t * 0.3, t * 0.1));",
    "  float n2 = snoise(uv * 4.0 + vec2(-t * 0.2, t * 0.15));",
    "  float n = n1 * 0.6 + n2 * 0.4;",

    // Map noise to gradient position
    "  float g = uv.y + n * 0.3;",

    // Three-color gradient
    "  vec3 col;",
    "  if (g < 0.5) {",
    "    col = mix(u_color1, u_color2, g * 2.0);",
    "  } else {",
    "    col = mix(u_color2, u_color3, (g - 0.5) * 2.0);",
    "  }",

    // Vignette for subtlety
    "  float vignette = 1.0 - length((uv - 0.5) * 1.2);",
    "  vignette = smoothstep(0.0, 0.7, vignette);",

    "  gl_FragColor = vec4(col, vignette * " + INTENSITY.toFixed(2) + ");",
    "}",
  ].join("\n");

  // ── Compile shader ──
  function compileShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn("Shader compile error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  // ── Init WebGL ──
  function initGL(canvas) {
    var gl = getWebGLContext(canvas);
    if (!gl) return null;

    var vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
    var fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { gl = null; return null; }

    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("Program link error:", gl.getProgramInfoLog(prog));
      return null;
    }

    // Full-screen quad
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);

    var pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    return {
      gl: gl,
      prog: prog,
      uTime: gl.getUniformLocation(prog, "u_time"),
      uRes: gl.getUniformLocation(prog, "u_resolution"),
      uC1: gl.getUniformLocation(prog, "u_color1"),
      uC2: gl.getUniformLocation(prog, "u_color2"),
      uC3: gl.getUniformLocation(prog, "u_color3"),
    };
  }

  // ── Resize canvas ──
  function resize(canvas, gl) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth;
    var h = window.innerHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
  }

  // ── Main ──
  function main() {
    // Check if user prefers reduced motion
    var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Create canvas
    var canvas = document.createElement("canvas");
    canvas.id = "shader-bg";
    canvas.setAttribute("aria-hidden", "true");
    canvas.setAttribute("role", "presentation");
    canvas.style.cssText = [
      "position:fixed",
      "top:0;left:0",
      "width:100vw;height:100vh",
      "z-index:-1",
      "pointer-events:none",
      "opacity:0",
      "transition:opacity 0.8s ease",
    ].join(";");
    document.body.prepend(canvas);

    // Init WebGL
    var state = initGL(canvas);
    if (!state) {
      // Fallback: remove canvas, CSS background shows through
      canvas.remove();
      return;
    }

    var gl = state.gl;
    var paused = prefersReduced;
    var startTime = performance.now();
    var rafId = null;

    // Fade in
    requestAnimationFrame(function () {
      canvas.style.opacity = "1";
    });

    // Render loop
    function frame() {
      if (paused) {
        rafId = null;
        return;
      }

      resize(canvas, gl);
      gl.useProgram(state.prog);

      var t = (performance.now() - startTime) / 1000;
      gl.uniform1f(state.uTime, t);
      gl.uniform2f(state.uRes, canvas.width, canvas.height);
      gl.uniform3fv(state.uC1, COLORS[0]);
      gl.uniform3fv(state.uC2, COLORS[1]);
      gl.uniform3fv(state.uC3, COLORS[2]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(frame);
    }

    // Start
    rafId = requestAnimationFrame(frame);

    // Pause when tab hidden
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      } else if (!paused && !rafId) {
        rafId = requestAnimationFrame(frame);
      }
    });

    // ── Pause button ──
    var btn = document.createElement("button");
    btn.id = "shader-toggle";
    btn.type = "button";
    btn.setAttribute("aria-label", "Pause background animation");
    btn.title = "Pause animation";
    btn.textContent = "⏸";
    btn.style.cssText = [
      "position:fixed",
      "bottom:20px;left:20px",
      "z-index:100",
      "width:36px;height:36px",
      "border-radius:50%",
      "border:1px solid rgba(79,142,247,0.3)",
      "background:rgba(15,20,32,0.85)",
      "color:#7a8eaa",
      "font-size:14px",
      "cursor:pointer",
      "backdrop-filter:blur(8px)",
      "transition:border-color 0.2s,color 0.2s",
      "display:flex;align-items:center;justify-content:center",
    ].join(";");
    btn.addEventListener("mouseenter", function () {
      btn.style.borderColor = "rgba(79,142,247,0.6)";
      btn.style.color = "#e2e8f4";
    });
    btn.addEventListener("mouseleave", function () {
      btn.style.borderColor = "rgba(79,142,247,0.3)";
      btn.style.color = "#7a8eaa";
    });

    btn.addEventListener("click", function () {
      paused = !paused;
      if (paused) {
        btn.textContent = "▶";
        btn.setAttribute("aria-label", "Resume background animation");
        btn.title = "Resume animation";
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      } else {
        btn.textContent = "⏸";
        btn.setAttribute("aria-label", "Pause background animation");
        btn.title = "Pause animation";
        startTime = performance.now() - (gl.getUniform(state.uTime) / SPEED * 1000 || 0);
        rafId = requestAnimationFrame(frame);
      }
    });

    document.body.appendChild(btn);
  }

  // Run when DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", main);
  } else {
    main();
  }
})();
