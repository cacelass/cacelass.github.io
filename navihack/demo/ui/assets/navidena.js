/* A Navideña — prototipo jugable. Sello = matasellos SVG (nombre + fecha curvados, sprite dentro).
   Estado en localStorage + hash. Sellar al tocar, deshacer, certificado numerado al completar. */
(function () {
  var KEY = "tinyvigo-navidena";
  var ZONAS = ["Porta do Sol", "Alameda", "Vialia", "García Barbón", "Areal-Príncipe"];
  var PTS = [
    { id: "porta", z: "Porta do Sol", t: "tree", n: "Árbol de Porta do Sol", st: "ÁRBOL" },
    { id: "policarpo", z: "Porta do Sol", t: "tree", n: "Policarpo Sanz", st: "POLICARPO" },
    { id: "principe", z: "Porta do Sol", t: "tree", n: "Rúa do Príncipe", st: "PRÍNCIPE" },
    { id: "constitucion", z: "Porta do Sol", t: "tree", n: "Praza da Constitución", st: "CONSTITUCIÓN" },
    { id: "elduayen", z: "Porta do Sol", t: "tree", n: "Elduayen", st: "ELDUAYEN" },
    { id: "velazquez", z: "Porta do Sol", t: "tree", n: "Velázquez Moreno", st: "VELÁZQUEZ" },
    { id: "bolas", z: "Porta do Sol", t: "star", n: "Bolas de luz", st: "BOLAS" },
    { id: "arcos", z: "Porta do Sol", t: "star", n: "Arcos de luz", st: "ARCOS" },
    { id: "estrellas", z: "Porta do Sol", t: "star", n: "Estrellas colgantes", st: "ESTRELLAS" },
    { id: "alameda", z: "Alameda", t: "tree", n: "Alameda", st: "ALAMEDA" },
    { id: "castrelos", z: "Alameda", t: "tree", n: "Castrelos", st: "CASTRELOS" },
    { id: "camelias", z: "Alameda", t: "tree", n: "Camelias", st: "CAMELIAS" },
    { id: "donbosco", z: "Alameda", t: "tree", n: "Ronda de Don Bosco", st: "DON BOSCO" },
    { id: "venezuela", z: "Alameda", t: "tree", n: "Venezuela", st: "VENEZUELA" },
    { id: "traviesia", z: "Alameda", t: "tree", n: "Travesía de Vigo", st: "TRAVESÍA" },
    { id: "teis", z: "Alameda", t: "tree", n: "Teis", st: "TEIS" },
    { id: "noria", z: "Vialia", t: "wheel", n: "Noria gigante", st: "NORIA" },
    { id: "carrusel", z: "Vialia", t: "wheel", n: "Carrusel", st: "CARRUSEL" },
    { id: "hielo", z: "Vialia", t: "wheel", n: "Pista de hielo", st: "HIELO" },
    { id: "trenpapa", z: "Vialia", t: "train", n: "Tren de Papá Noel", st: "TREN" },
    { id: "ciesmarket", z: "Vialia", t: "market", n: "Cíes Market", st: "CÍES MARKET" },
    { id: "bola", z: "Vialia", t: "star", n: "Bola de la Farola de Urzáiz", st: "BOLA" },
    { id: "caja", z: "Vialia", t: "gift", n: "Caja de regalo", st: "CAJA" },
    { id: "papanata", z: "Vialia", t: "gift", n: "Casa de Papá Noel", st: "PAPÁ NOEL" },
    { id: "reyes", z: "Vialia", t: "star", n: "Reyes Magos", st: "REYES" },
    { id: "photobola", z: "Vialia", t: "camera", n: "Photocall de la bola", st: "PHOTO" },
    { id: "samil", z: "Vialia", t: "wheel", n: "Samil · hielo y karts", st: "SAMIL" },
    { id: "garciabarbon", z: "García Barbón", t: "tree", n: "García Barbón", st: "GARCÍA BARBÓN" },
    { id: "disney", z: "García Barbón", t: "star", n: "Desfile Disney", st: "DISNEY" },
    { id: "photodisney", z: "García Barbón", t: "camera", n: "Photocall Disney", st: "PHOTO DISNEY" },
    { id: "regalos", z: "García Barbón", t: "gift", n: "Regalos gigantes", st: "REGALOS" },
    { id: "colon", z: "García Barbón", t: "tree", n: "Colón", st: "COLÓN" },
    { id: "urzai", z: "García Barbón", t: "tree", n: "Urzáiz", st: "URZÁIZ" },
    { id: "granvia", z: "García Barbón", t: "tree", n: "Gran Vía", st: "GRAN VÍA" },
    { id: "rosalia", z: "García Barbón", t: "tree", n: "Rosalía de Castro", st: "ROSALÍA" },
    { id: "belen", z: "García Barbón", t: "gift", n: "Belén monumental", st: "BELÉN" },
    { id: "areal", z: "Areal-Príncipe", t: "tree", n: "O Areal", st: "AREAL" },
    { id: "valladares", z: "Areal-Príncipe", t: "tree", n: "Marqués de Valladares", st: "VALLADARES" },
    { id: "compostela", z: "Areal-Príncipe", t: "tree", n: "Praza de Compostela", st: "COMPOSTELA" },
    { id: "mercadonav", z: "Areal-Príncipe", t: "market", n: "Mercado de Navidad", st: "MERCADO" },
    { id: "artesania", z: "Areal-Príncipe", t: "market", n: "Mercadillo de artesanía", st: "ARTESANÍA" },
    { id: "balaidos", z: "Areal-Príncipe", t: "tree", n: "Balaídos", st: "BALAÍDOS" }
  ];

  var state = { sellos: {}, numero: 0 };
  try { var saved = JSON.parse(localStorage.getItem(KEY) || "null"); if (saved) state = saved; } catch (e) {}
  var m = location.hash.match(/s=([\w,-]+)/);
  if (m) { state.sellos = {}; m[1].split(",").forEach(function (id) { if (id) state.sellos[id] = fechaSello(); }); }

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  function total() { return PTS.length; }
  function count() { return Object.keys(state.sellos).length; }
  function done() { return count() >= total(); }
  function fechaSello() { var d = new Date(); return String(d.getDate()).padStart(2, "0") + " " + ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"][d.getMonth()] + " " + String(d.getFullYear()).slice(2); }
  function fechaLarga() { return new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }); }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    var ids = PTS.filter(function (p) { return state.sellos[p.id]; }).map(function (p) { return p.id; });
    history.replaceState(null, "", "#s=" + (ids.join(",") || ""));
  }

  /* matasellos en SVG: anillo doble, nombre + fecha en texto curvado, sprite pixel dentro */
  var wornDefs = null;
  function stampSVG(p) {
    var id = "s" + p.id;
    var txt = (p.st + " · " + (state.sellos[p.id] || fechaSello()) + " · ").toUpperCase();
    var rep = Math.max(1, Math.ceil(120 / txt.length));
    var icon = PX.svg(p.t, { size: 32, mono: true });
    return '<svg class="sello" viewBox="0 0 100 100" aria-label="Sello de ' + p.n + '">' +
      '<defs><path id="' + id + '-ring" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"/></defs>' +
      '<g filter="url(#sello-worn)">' +
      '<circle cx="50" cy="50" r="47" fill="none" stroke-width="2.4"/>' +
      '<circle cx="50" cy="50" r="43" fill="none" stroke-width="0.8" opacity=".55"/>' +
      '<text class="stxt" font-size="8" letter-spacing="1.1"><textPath href="#' + id + '-ring" startOffset="0">' + txt.repeat(rep) + '</textPath></text>' +
      '<g class="sico" transform="translate(38,38) scale(1.5)">' + icon + '</g>' +
      '</g></svg>';
  }

  function render() {
    var c = count(), t = total();
    $(".nv__count b").textContent = c;
    $(".nv__count small").textContent = "/ " + t + " sellos";
    $(".nv__bar i").style.width = (c / t * 100) + "%";
    $(".nv__gen").disabled = !done();
    $(".nv__gen").style.display = done() ? "inline-flex" : "none";
    $(".nv__empty").style.display = c === 0 ? "block" : "none";
    // lista agrupada
    $(".nv__zones").innerHTML = "";
    ZONAS.forEach(function (z) {
      var pts = PTS.filter(function (p) { return p.z === z; });
      var grp = document.createElement("section");
      grp.className = "zone";
      var h = document.createElement("h3"); h.className = "zone__h";
      h.textContent = z;
      grp.appendChild(h);
      var ul = document.createElement("ul"); ul.className = "zone__pts";
      pts.forEach(function (p) {
        var sealed = !!state.sellos[p.id];
        var li = document.createElement("li");
        li.dataset.id = p.id; li.className = sealed ? "sealed" : "";
        li.innerHTML = '<span class="p__ic"><i class="ic"></i></span><span class="p__name">' + p.n + '</span><span class="p__stamp">' + (sealed ? stampSVG(p) : "") + '</span>';
        li.addEventListener("click", function () { stamp(p.id); });
        var ic = $(".ic", li); ic.dataset.size = 20; ic.innerHTML = PX.svg(p.t, { size: 20, mono: !sealed });
        ul.appendChild(li);
      });
      grp.appendChild(ul);
      $(".nv__zones").appendChild(grp);
    });
  }

  function stamp(id) {
    var p = PTS.filter(function (x) { return x.id === id; })[0];
    if (state.sellos[id]) { delete state.sellos[id]; save(); render(); return; }
    state.sellos[id] = fechaSello(); save();
    render();
    var li = $('.zone__pts li[data-id="' + id + '"]');
    if (li) { var sv = $(".p__stamp .sello", li); if (sv) sv.classList.add("drop"); }
    toast("Sellado: " + p.n, id);
  }

  function toast(msg, undoId) {
    var t = $(".nv__toast"); if (!t) return;
    $(".nv__toast .tx", t).textContent = msg;
    var b = $(".nv__toast .undo", t);
    b.style.display = undoId ? "inline-flex" : "none";
    b.onclick = function () { if (state.sellos[undoId]) { delete state.sellos[undoId]; save(); render(); } t.hidden = true; };
    t.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(function () { t.hidden = true; }, 2600);
  }

  function serie() {
    if (!state.numero) { state.numero = 1 + Math.floor(Math.random() * 99999); save(); }
    return String(state.numero).padStart(5, "0") + "/" + new Date().getFullYear();
  }

  function generar() {
    $(".cert__nombre").textContent = ($("#cert-nombre").value || "").trim() || "Visitante";
    $(".cert__numero").textContent = "N.º " + serie();
    $(".cert__fecha").textContent = fechaLarga();
    $(".cert").hidden = false; $("#cert-nombre").value = "";
  }
  function compartir() {
    var url = location.href.split("#")[0] + "#s=" + PTS.filter(function (p) { return state.sellos[p.id]; }).map(function (p) { return p.id; }).join(",");
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { toast("Enlace copiado", null); });
    else { window.prompt("Copia el enlace:", url); }
  }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} location.hash = ""; location.reload(); }

  document.addEventListener("DOMContentLoaded", function () {
    // filtro de desgaste global, inyectado una vez
    wornDefs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    wornDefs.setAttribute("width", "0"); wornDefs.setAttribute("height", "0"); wornDefs.style.position = "absolute";
    wornDefs.innerHTML = '<defs><filter id="sello-worn"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.3"/></filter></defs>';
    document.body.appendChild(wornDefs);

    $(".nv__gen").addEventListener("click", function () { $(".cert__form").hidden = false; });
    $("#cert-generar").addEventListener("click", generar);
    $(".cert__close").addEventListener("click", function () { $(".cert").hidden = true; });
    $(".cert__share").addEventListener("click", compartir);
    $(".nv__reset").addEventListener("click", reset);
    // conmutador mapa / lista
    $$(".nv__view button").forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".nv__view button").forEach(function (x) { x.classList.remove("on"); x.setAttribute("aria-pressed", "false"); });
        b.classList.add("on"); b.setAttribute("aria-pressed", "true");
        document.body.dataset.view = b.dataset.view;
      });
    });
    render();
  });
})();
