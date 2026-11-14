// TinyVigo: cómo llegar al primer punto del tour (GO-01) — a pie, en bus o en coche.
// Bus: viaje DIRECTO del GTFS de Vitrasa (horario programado, data/transit.json).
// Coche: parking cercano al primer punto con plazas en vivo (datos.vigo.org) y tramo a pie.
// Calles: OSRM de openstreetmap.de; si no responde, línea recta × 1,3 marcada como aproximada.
(function () {
  const FOOT = "https://routing.openstreetmap.de/routed-foot/route/v1/foot/";
  const CAR = "https://routing.openstreetmap.de/routed-car/route/v1/driving/";
  const WALK_MS = 1.25, DETOUR = 1.3, CAR_KMH = 22; // ciudad, con semáforos
  const PARK_MIN = 5; // entrar, aparcar y salir a la calle
  const BOARD_M = 700, ALIGHT_M = 600, PARK_M = 2000, BUS_HORIZON = 120;
  const R = 6371000, rad = (x) => (x * Math.PI) / 180;
  const dist = (a, b) => { const p = rad(b[0] - a[0]), q = rad(b[1] - a[1]); const h = Math.sin(p / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(q / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
  const hm = (min) => String(Math.floor(min / 60) % 24).padStart(2, "0") + ":" + String(Math.round(min) % 60).padStart(2, "0");
  const ymd = (d) => d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
  const ll = (p) => p[0].toFixed(6) + "," + p[1].toFixed(6);
  const gm = (mode, a, b) => "https://www.google.com/maps/dir/?api=1&travelmode=" + mode + "&origin=" + ll(a) + "&destination=" + ll(b);

  async function osrm(base, a, b) {
    const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const url = base + a[1].toFixed(6) + "," + a[0].toFixed(6) + ";" + b[1].toFixed(6) + "," + b[0].toFixed(6) + "?overview=full&geometries=geojson";
      const j = await (await fetch(url, { signal: ctrl.signal })).json();
      if (j.code !== "Ok" || !j.routes || !j.routes[0]) return null;
      return { line: j.routes[0].geometry.coordinates, meters: j.routes[0].distance, seconds: j.routes[0].duration };
    } catch (e) { return null; } finally { clearTimeout(timer); }
  }
  const straight = (a, b) => [[a[1], a[0]], [b[1], b[0]]];

  async function walkLeg(a, b, toName) {
    const r = await osrm(FOOT, a, b);
    const meters = r ? r.meters : dist(a, b) * DETOUR;
    return { mode: "walk", from: a, to: b, toName, meters, min: Math.max(1, Math.ceil(meters / WALK_MS / 60)), line: r ? r.line : straight(a, b), approx: !r, gmaps: gm("walking", a, b) };
  }
  async function carLeg(a, b, toName) {
    const r = await osrm(CAR, a, b);
    const meters = r ? r.meters : dist(a, b) * 1.4;
    const min = r ? Math.ceil((r.seconds * 1.25) / 60) : Math.ceil(meters / 1000 / CAR_KMH * 60); // OSRM no ve el tráfico: +25 %
    return { mode: "car", from: a, to: b, toName, meters, min: Math.max(1, min), line: r ? r.line : straight(a, b), approx: !r, gmaps: gm("driving", a, b) };
  }

  // ── a pie ────────────────────────────────────────────────────────────────
  async function byWalk(start, first, firstName, now) {
    const leg = await walkLeg(start, first, firstName);
    return { mode: "walk", total: leg.min, arrive: new Date(now.getTime() + leg.min * 60000), legs: [leg], gmaps: leg.gmaps };
  }

  // ── coche: parking libre (o con previsión de estarlo) cerca del primer punto ──
  function forecast(r) {
    const free = Math.max(0, r.plazaslibres), pct = r.totalplazas ? free / r.totalplazas : 0;
    if (free < 10 || pct < 0.05) return "tight";
    return free < 40 || pct < 0.15 ? "ok" : "good";
  }
  // plazaslibres = -1 es «sin dato» en el feed del Concello: no se recomienda.
  function parkingPool(rows, start, first) {
    return rows.filter((r) => r.plazaslibres > 0).map((r) => {
      const pos = [r.lat, r.lon], walk = (dist(pos, first) * DETOUR) / WALK_MS / 60, f = forecast(r);
      return { r, pos, walk, f, cost: walk + (f === "tight" ? 25 : f === "ok" ? 5 : 0) + (dist(start, pos) / 1000 / CAR_KMH) * 60 };
    }).filter((c) => dist(c.pos, first) <= PARK_M).sort((a, b) => a.cost - b.cost);
  }
  async function carVia(start, first, firstName, now, c, stale) {
    const name = c.r.nombre.replace(/^Parking /, "");
    const [drive, walk] = await Promise.all([carLeg(start, c.pos, name), walkLeg(c.pos, first, firstName)]);
    drive.parking = { name, free: c.r.plazaslibres, total: c.r.totalplazas, forecast: c.f, updated: c.r.fechahora.slice(11, 16), stale };
    const total = drive.min + PARK_MIN + walk.min;
    return { mode: "car", total, arrive: new Date(now.getTime() + total * 60000), legs: [drive, walk], gmaps: drive.gmaps, parkMin: PARK_MIN };
  }
  async function byCar(start, first, firstName, now) {
    let rows = null;
    try { rows = (await tinyvigoData.parkings()).filter((r) => r.lat && r.lon); } catch (e) { rows = null; } // WEB-05
    const fresh = (rows || []).filter((r) => (Date.now() - new Date(r.fechahora.replace(" ", "T"))) / 60000 <= 15);
    const stale = !fresh.length;
    const pool = parkingPool(stale ? rows || [] : fresh, start, first);
    if (!pool.length) {
      // ningún parking con plazas: coche hasta el punto, avisando
      const leg = await carLeg(start, first, firstName);
      return { mode: "car", total: leg.min, arrive: new Date(now.getTime() + leg.min * 60000), legs: [leg], gmaps: leg.gmaps, warning: rows ? "go.no_parking_free" : "go.no_parking_data" };
    }
    const best = await carVia(start, first, firstName, now, pool[0], stale);
    // si el elegido va justo, ofrecemos también el más cercano con sitio holgado (o al revés)
    const other = pool[0].f === "tight" ? pool.find((c) => c.f !== "tight") : pool.find((c) => c.walk < pool[0].walk - 3);
    if (other) best.alternative = await carVia(start, first, firstName, now, other, stale);
    return best;
  }

  // ── bus: viaje directo de Vitrasa entre una parada cerca de ti y otra cerca del primer punto ──
  async function byBus(start, first, firstName, now) {
    const T = window.tinyvigoTransit;
    const data = T && (await T.load());
    if (!data || !data.trips) return { mode: "bus", unavailable: "go.no_transit_data" };
    const key = ymd(now), svc = new Set(data.services.map((d, i) => (d.includes(key) ? i : -1)).filter((i) => i >= 0));
    const S = data.all_stops, nowMin = now.getHours() * 60 + now.getMinutes();
    const board = new Map(), alight = new Map();
    S.forEach(([, , lat, lon], i) => {
      const db = dist(start, [lat, lon]), da = dist([lat, lon], first);
      if (db <= BOARD_M) board.set(i, (db * DETOUR) / WALK_MS / 60);
      if (da <= ALIGHT_M) alight.set(i, (da * DETOUR) / WALK_MS / 60);
    });
    if (!board.size) return { mode: "bus", unavailable: "go.no_stop_near_you" };
    let best = null;
    for (const [line, headsign, s, stops, mins] of data.trips) {
      if (!svc.has(s) || mins[mins.length - 1] < nowMin || mins[0] > nowMin + BUS_HORIZON) continue;
      for (let i = 0; i < stops.length - 1; i++) {
        const wb = board.get(stops[i]);
        if (wb == null || mins[i] < nowMin + wb) continue;
        for (let j = i + 1; j < stops.length; j++) {
          const wa = alight.get(stops[j]);
          if (wa == null) continue;
          const arrive = mins[j] + wa;
          if (!best || arrive < best.arrive) best = { line, headsign, i, j, stops, mins, arrive, dep: mins[i] };
          break; // la primera parada cercana al destino es la buena para este viaje
        }
      }
    }
    if (!best || best.dep > nowMin + BUS_HORIZON) return { mode: "bus", unavailable: "go.no_direct_bus" };
    const pos = (k) => [S[best.stops[k]][2], S[best.stops[k]][3]], name = (k) => S[best.stops[k]][1].replace(/\s+/g, " ");
    const [w1, w2] = await Promise.all([walkLeg(start, pos(best.i), name(best.i)), walkLeg(pos(best.j), first, firstName)]);
    const busLine = best.stops.slice(best.i, best.j + 1).map((k) => [S[k][3], S[k][2]]);
    const bus = {
      mode: "bus", line: busLine, from: pos(best.i), to: pos(best.j), fromName: name(best.i), toName: name(best.j),
      busLine: best.line, headsign: best.headsign, dep: hm(best.dep), arr: hm(best.mins[best.j]), nStops: best.j - best.i,
      min: best.mins[best.j] - best.dep, wait: Math.max(0, Math.round(best.dep - nowMin - w1.min)), gmaps: gm("transit", start, first),
    };
    const arriveMin = best.mins[best.j] + w2.min;
    const total = Math.max(1, Math.round(arriveMin - nowMin));
    return { mode: "bus", total, arrive: new Date(now.getTime() + total * 60000), legs: [w1, bus, w2], gmaps: gm("transit", start, first) };
  }

  // Las tres opciones a la vez; ninguna rompe a las demás.
  async function options(start, first, firstName, now = new Date()) {
    const safe = (p, mode) => p.catch(() => ({ mode, unavailable: "go.unavailable" }));
    const [walk, bus, car] = await Promise.all([
      safe(byWalk(start, first, firstName, now), "walk"), safe(byBus(start, first, firstName, now), "bus"), safe(byCar(start, first, firstName, now), "car")]);
    if (walk.total > 90) walk.unavailable = "go.too_far_walk";
    return { walk, bus, car };
  }

  window.tinyvigoGo = { options, walkLeg, dist };
})();
