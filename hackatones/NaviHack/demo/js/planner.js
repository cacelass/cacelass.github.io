// TinyVigo: planificador de rutas a pie (PLANNER-01). Módulo puro y determinista (también corre en Node).
//
// Entrada: salida [lat, lon], paradas [{id, lat, lon, stay, window?:[desde, hasta] en min desde la salida}],
// y señales opcionales (luces encendidas, cota). Salida: TRES opciones para la misma entrada —
// «fastest» (menos tiempo andando), «after_dark» (prefiere tramos con luces de Navidad encendidas) y
// «easy_walk» (evita cuestas) — cada una con orden, tiempos, metros y explicación.
//
// - Tiempos a pie del grafo peatonal de OpenStreetMap: una sola petición a la API «table» de OSRM
//   (routing.openstreetmap.de, perfil foot). Sin red: línea recta × 1,3, marcado como «approx».
// - Orden ÓPTIMO exacto (Held-Karp, O(2^n·n²)): con 12 paradas son ~600 000 pasos, milisegundos.
//   Empates resueltos por índice → misma entrada, mismas 3 rutas.
// - Eventos = ventanas de tiempo: se espera si se llega antes; llegar tarde invalida el orden. Si
//   ningún orden cumple, se nombra la parada imposible y se sugiere cuál quitar (nunca se omite en silencio).
(function (root) {
  const WALK_MS = 1.25, DETOUR = 1.3, R = 6371000;
  const TABLE = "https://routing.openstreetmap.de/routed-foot/table/v1/foot/";
  const LIT_M = 40, UNLIT_PENALTY = 0.6, EASY = 6, STEEP = 12, SAMPLE_M = 25;
  const rad = (x) => (x * Math.PI) / 180;
  const dist = (a, b) => { const p = rad(b[0] - a[0]), q = rad(b[1] - a[1]); const h = Math.sin(p / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(q / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };

  // Matriz de metros a pie entre todos los nodos (0 = salida). Una petición; si falla, aproximada.
  async function matrix(nodes, fetchFn = root.fetch && root.fetch.bind(root)) {
    const approx = () => ({ meters: nodes.map((a) => nodes.map((b) => dist(a, b) * DETOUR)), source: "approx" });
    if (!fetchFn || nodes.length < 2) return approx();
    const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), 1500) : null; // < 2 s en total
    try {
      const coords = nodes.map(([la, lo]) => lo.toFixed(6) + "," + la.toFixed(6)).join(";");
      const j = await (await fetchFn(TABLE + coords + "?annotations=distance", ctrl ? { signal: ctrl.signal } : undefined)).json();
      if (j.code !== "Ok" || !j.distances) return approx();
      // un hueco (null) en la tabla se rellena con la aproximación para no romper el cálculo
      return { meters: j.distances.map((row, i) => row.map((m, k) => (m == null ? dist(nodes[i], nodes[k]) * DETOUR : m))), source: "osm" };
    } catch (e) { return approx(); } finally { if (timer) clearTimeout(timer); }
  }

  // Factores de coste por tramo según la opción
  function litFraction(a, b, lights) {
    if (!lights || !lights.length) return null;
    const n = Math.max(1, Math.floor(dist(a, b) / SAMPLE_M));
    let lit = 0;
    for (let i = 0; i <= n; i++) {
      const p = [a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n];
      if (lights.some((l) => dist(p, l) <= LIT_M)) lit++;
    }
    return lit / (n + 1);
  }
  function maxGrade(a, b, elev) {
    if (!elev) return null;
    const n = Math.max(1, Math.floor(dist(a, b) / SAMPLE_M));
    let worst = 0, prev = elev(a[0], a[1]);
    if (prev == null) return null;
    for (let i = 1; i <= n; i++) {
      const p = [a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n], z = elev(p[0], p[1]);
      if (z == null) return null;
      worst = Math.max(worst, (Math.abs(z - prev) / (dist(a, b) / n)) * 100);
      prev = z;
    }
    return worst;
  }
  const easyFactor = (g) => (g == null || g <= EASY ? 1 : g <= STEEP ? 1 + (g - EASY) / (STEEP - EASY) : 4);

  function costMatrix(nodes, minutes, mode, signals) {
    return nodes.map((a, i) => nodes.map((b, k) => {
      if (i === k) return 0;
      let f = 1;
      if (mode === "after_dark" && signals.dark) { const lit = litFraction(a, b, signals.lights); if (lit != null) f *= 1 + UNLIT_PENALTY * (1 - lit); }
      if (mode === "easy_walk") f *= easyFactor(maxGrade(a, b, signals.elev));
      return minutes[i][k] * f;
    }));
  }

  // Held-Karp con ventanas de tiempo: dp[mask][j] = menor coste de visitar «mask» acabando en j,
  // guardando el reloj real (minutos andando + estancias + esperas) para comprobar las ventanas.
  function solve(stops, minutes, cost) {
    const n = stops.length, FULL = 1 << n;
    if (!n) return { order: [], ok: true };
    const C = new Float64Array(FULL * n).fill(Infinity), T = new Float64Array(FULL * n), P = new Int16Array(FULL * n).fill(-1);
    const arrive = (clock, j) => { const w = stops[j].window; const t = Math.max(clock, w ? w[0] : 0); return w && t > w[1] ? null : t; };
    for (let j = 0; j < n; j++) {
      const t = arrive(minutes[0][j + 1], j);
      if (t == null) continue;
      C[(1 << j) * n + j] = cost[0][j + 1]; T[(1 << j) * n + j] = t + stops[j].stay;
    }
    for (let mask = 1; mask < FULL; mask++) {
      for (let j = 0; j < n; j++) {
        const s = mask * n + j;
        if (!(mask & (1 << j)) || C[s] === Infinity) continue;
        for (let k = 0; k < n; k++) {
          if (mask & (1 << k)) continue;
          const t = arrive(T[s] + minutes[j + 1][k + 1], k);
          if (t == null) continue;
          const nm = mask | (1 << k), d = nm * n + k, c = C[s] + cost[j + 1][k + 1];
          if (c < C[d] - 1e-9 || (Math.abs(c - C[d]) <= 1e-9 && t + stops[k].stay < T[d])) { C[d] = c; T[d] = t + stops[k].stay; P[d] = j; }
        }
      }
    }
    let best = -1;
    for (let j = 0; j < n; j++) if (C[(FULL - 1) * n + j] < (best < 0 ? Infinity : C[(FULL - 1) * n + best]) - 1e-9) best = j;
    if (best < 0) return { order: null, ok: false };
    const order = [];
    for (let mask = FULL - 1, j = best; j >= 0;) { order.unshift(j); const pj = P[mask * n + j]; mask &= ~(1 << j); j = pj; }
    return { order, ok: true };
  }

  function timeline(order, stops, minutes, meters) {
    let clock = 0, walkMin = 0, walkM = 0, prev = 0;
    const legs = order.map((j) => {
      const m = minutes[prev][j + 1], d = meters[prev][j + 1];
      walkMin += m; walkM += d;
      const w = stops[j].window, at = Math.max(clock + m, w ? w[0] : 0);
      const leg = { id: stops[j].id, walk: Math.round(m), meters: Math.round(d), arrive: Math.round(at), wait: Math.round(at - clock - m), stay: stops[j].stay };
      clock = at + stops[j].stay; prev = j + 1;
      return leg;
    });
    return { legs, total: Math.round(clock), walkMin: Math.round(walkMin), walkMeters: Math.round(walkM) };
  }

  // Cuando ningún orden cumple: paradas imposibles por sí solas y cuál quitar para que el resto quepa.
  function diagnose(stops, minutes, cost) {
    const impossible = stops.filter((s, j) => s.window && minutes[0][j + 1] > s.window[1]).map((s) => s.id);
    for (let k = stops.length - 1; k >= 0; k--) {
      const keep = stops.map((_, j) => j).filter((j) => j !== k);
      const sub = (M) => [[M[0][0], ...keep.map((j) => M[0][j + 1])], ...keep.map((i) => [M[i + 1][0], ...keep.map((j) => M[i + 1][j + 1])])];
      if (solve(keep.map((j) => stops[j]), sub(minutes), sub(cost)).ok) return { impossible, drop: stops[k].id };
    }
    return { impossible, drop: null };
  }

  async function plan(input, fetchFn) {
    const t0 = Date.now();
    const stops = input.stops.slice(0, 12); // búsqueda exacta hasta 12 paradas
    const nodes = [input.start, ...stops.map((s) => [s.lat, s.lon])];
    const { meters, source } = await matrix(nodes, fetchFn);
    const minutes = meters.map((row) => row.map((m) => m / WALK_MS / 60));
    const signals = input.signals || {};
    const options = ["fastest", "after_dark", "easy_walk"].map((mode) => {
      const cost = costMatrix(nodes, minutes, mode, signals);
      const r = solve(stops, minutes, cost);
      if (!r.ok) return { mode, ok: false, ...diagnose(stops, minutes, cost) };
      const tl = timeline(r.order, stops, minutes, meters);
      const unlit = mode === "after_dark" && signals.dark ? r.order.reduce((a, j, i) => a + (1 - (litFraction(i ? nodes[r.order[i - 1] + 1] : nodes[0], nodes[j + 1], signals.lights) ?? 1)), 0) : null;
      const steep = mode === "easy_walk" ? r.order.reduce((a, j, i) => Math.max(a, maxGrade(i ? nodes[r.order[i - 1] + 1] : nodes[0], nodes[j + 1], signals.elev) || 0), 0) : null;
      return { mode, ok: true, order: r.order.map((j) => stops[j].id), ...tl, explain: { unlitLegs: unlit == null ? null : Math.round(unlit * 10) / 10, maxGradePct: steep == null ? null : Math.round(steep) } };
    });
    return { options, source, ms: Date.now() - t0 };
  }

  const api = { plan, matrix, solve, litFraction, maxGrade };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.tinyvigoPlanner = api;
})(typeof window !== "undefined" ? window : globalThis);
