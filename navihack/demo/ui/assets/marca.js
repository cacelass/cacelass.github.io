/* Marca TinyVigo — "la V encendida".
   Una V (el gesto de la Navidad de Vigo) y, en su punta, el punto de luz de
   Porta do Sol. Dos dibujos del mismo símbolo:
     · pixel  — rejilla de 16, para 16–32 px (HUD del mapa, favicon, sellos)
     · vector — trazado limpio, para 32 px en adelante (cabeceras, certificado)
     · tinta  — una sola tinta, para impresión en blanco y negro
   El nombre va SIEMPRE en Inter. Nada de fuente de píxel en el nombre.
   Uso: <span data-tv="simbolo" data-tv-size="24">, data-tv="logo", data-tv="matasellos".
   También monta el marcado antiguo <i class="marca" data-marca data-size="22">. */
(function () {
  var N = 16;
  var ROWS = [
    '................',
    '###..........###',
    '###..........###',
    '.###........###.',
    '.###........###.',
    '..###......###..',
    '..###......###..',
    '...###....###...',
    '...###....###...',
    '....###..###....',
    '....###..###....',
    '.....######.....',
    '.....######.....',
    '......aaaa......',
    '.......aa.......',
    '................'
  ];

  function pixel(attrs) {
    var out = '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true" focusable="false" ' + attrs + '>';
    for (var y = 0; y < N; y++) {
      var row = ROWS[y], x = 0;
      while (x < N) {
        var c = row[x];
        if (c === '.') { x++; continue; }
        var e = x;
        while (e < N && row[e] === c) e++;
        out += '<rect class="tv-p' + (c === 'a' ? 'l' : 'v') + '" x="' + x + '" y="' + y + '" width="' + (e - x) + '" height="1"/>';
        x = e;
      }
    }
    return out + '</svg>';
  }

  function vector(attrs) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" ' + attrs + '>' +
      '<path class="tv-pv" d="M2 2.4H6.6L12 17.2L17.4 2.4H22L13.4 22.4H10.6Z"/>' +
      '<circle class="tv-pl" cx="12" cy="20.8" r="1.6"/>' +
      '</svg>';
  }

  /* opts: { size, variante: 'pixel'|'vector'|'tinta', clase } */
  function simbolo(opts) {
    opts = opts || {};
    var s = opts.size || 24;
    var variante = opts.variante || (s <= 32 ? 'pixel' : 'vector');
    var dibujo = variante === 'tinta' ? (s <= 32 ? 'pixel' : 'vector') : variante;
    var cls = 'tv-simbolo tv-' + dibujo + (variante === 'tinta' ? ' tv-tinta' : '');
    if (opts.clase) cls += ' ' + opts.clase;
    var dim = 'width="' + s + '" height="' + s + '"';
    return '<span class="' + cls + '" style="--tv-s:' + s + 'px">' +
      (dibujo === 'pixel' ? pixel(dim) : vector(dim)) + '</span>';
  }

  /* lockup horizontal: símbolo + nombre en Inter */
  function logotipo(opts) {
    opts = opts || {};
    var s = opts.size || 28;
    return '<span class="tv-lockup" style="--tv-s:' + s + 'px">' +
      simbolo({ size: s, variante: opts.variante }) +
      '<span class="tv-nombre">TinyVigo</span></span>';
  }

  var idn = 0;
  /* matasellos circular de Vigo: aro dentado, VIGO arriba, A NAVIDEÑA abajo */
  function matasellos(opts) {
    opts = opts || {};
    var s = opts.size || 132;
    var fecha = opts.fecha || '14 · 12 · 2026';
    var id = 'tv-mat-' + (++idn);
    return '<svg class="tv-mat" viewBox="0 0 100 100" width="' + s + '" height="' + s + '" aria-hidden="true" focusable="false">' +
      '<defs>' +
      '<path id="' + id + '-a" d="M50 50 m-35 0 a35 35 0 1 1 70 0" fill="none"/>' +
      '<path id="' + id + '-b" d="M50 50 m-33 0 a33 33 0 1 0 66 0" fill="none"/>' +
      '</defs>' +
      '<circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="3.2" stroke-dasharray="2.2 2.6"/>' +
      '<circle cx="50" cy="50" r="40.5" fill="none" stroke="currentColor" stroke-width="1.1"/>' +
      '<text class="tv-mat__arco" font-size="9.4" font-weight="600" letter-spacing="1.5">' +
      '<textPath href="#' + id + '-a" startOffset="50%" text-anchor="middle">VIGO</textPath></text>' +
      '<text class="tv-mat__arco" font-size="7.4" font-weight="500" letter-spacing="1.2">' +
      '<textPath href="#' + id + '-b" startOffset="50%" text-anchor="middle">A NAVIDEÑA</textPath></text>' +
      '<g transform="translate(37.5 30) scale(.78)"><path class="tv-mat__v" d="M2 2.4H6.6L12 17.2L17.4 2.4H22L13.4 22.4H10.6Z"/><circle class="tv-mat__luz" cx="12" cy="20.8" r="1.6"/></g>' +
      '<text class="tv-mat__fecha" x="50" y="66" text-anchor="middle" font-size="6.6" font-weight="500" letter-spacing=".6">' + fecha + '</text>' +
      '</svg>';
  }

  var css = '' +
    '.tv-simbolo{display:inline-block;flex:none;line-height:0}' +
    '.tv-simbolo svg{display:block;width:var(--tv-s,24px);height:var(--tv-s,24px)}' +
    '.tv-pv{fill:currentColor}' +
    '.tv-pl{fill:var(--tv-luz,#d9a441)}' +
    '.tv-tinta .tv-pl{fill:currentColor}' +
    '.tv-lockup{display:inline-flex;align-items:center;gap:calc(var(--tv-s,28px) * .34);color:currentColor}' +
    '.tv-nombre{font:600 calc(var(--tv-s,28px) * .86)/1 var(--f-ui,"Inter",system-ui,sans-serif);letter-spacing:-.02em;color:currentColor}' +
    '.tv-mat__v{fill:currentColor}.tv-mat__luz{fill:var(--tv-luz,#d9a441)}' +
    '.tv-mat__arco,.tv-mat__fecha{fill:currentColor;font-family:var(--f-ui,"Inter",system-ui,sans-serif)}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  function mount(root) {
    var doc = root || document;
    doc.querySelectorAll('[data-tv]').forEach(function (el) {
      var v = el.getAttribute('data-tv');
      var s = +el.getAttribute('data-tv-size') || undefined;
      var marcado = v === 'logo' ? logotipo({ size: s, variante: el.getAttribute('data-tv-variante') })
        : v === 'matasellos' ? matasellos({ size: s, fecha: el.getAttribute('data-tv-fecha') })
        : simbolo({ size: s, variante: el.getAttribute('data-tv-variante') });
      el.insertAdjacentHTML('afterbegin', marcado);
      el.removeAttribute('data-tv');
    });
    /* Marcado antiguo de los HUD (<i class="marca" data-marca data-size="22">): el
       mismo símbolo, para que la cabecera del mapa y esta página no se separen. */
    doc.querySelectorAll('[data-marca]').forEach(function (el) {
      el.innerHTML = simbolo({ size: +(el.getAttribute('data-size') || 22) });
      el.removeAttribute('data-marca');
    });
  }

  window.MARCA = { simbolo: simbolo, logotipo: logotipo, matasellos: matasellos, mount: mount };
  mount();
  document.addEventListener('DOMContentLoaded', function () { mount(); });
})();
