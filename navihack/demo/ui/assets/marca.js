/* Marca TinyVigo — "el árbol que se gira".
   Delante es un abeto mínimo: dos trazos y la luz en la punta. Girado 180°, la
   falda es la V de Vigo y la luz cae al vértice. Un solo dibujo, dos lecturas,
   y un solo trazado vectorial para todos los tamaños (nada de rejilla de
   píxeles: el símbolo son líneas, igual a 16 px que a 200).
   Variante 'tinta': una sola tinta, sin el oro de la luz, para impresión.
   El nombre va SIEMPRE en Inter. Nada de fuente de píxel en el nombre.
   Uso: <span data-tv="simbolo" data-tv-size="24">, data-tv="logo", data-tv="matasellos".
   También monta el marcado antiguo <i class="marca" data-marca data-size="22">. */
(function () {
  function vector(attrs) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" ' + attrs + '>' +
      '<path class="tv-pv" d="M6.2 9.2L12 3.4L17.8 9.2" stroke-width="2.4" stroke-linecap="butt" stroke-linejoin="miter"/>' +
      '<path class="tv-pv" d="M1.6 19.6L12 10.8L22.4 19.6" stroke-width="2.4" stroke-linecap="butt" stroke-linejoin="miter"/>' +
      '<circle class="tv-pl" cx="12" cy="1.7" r="1.5" stroke="none"/>' +
      '</svg>';
  }

  /* opts: { size, variante: 'tinta', clase } */
  function simbolo(opts) {
    opts = opts || {};
    var s = opts.size || 24;
    var tinta = opts.variante === 'tinta';
    var cls = 'tv-simbolo' + (tinta ? ' tv-tinta' : '');
    if (opts.clase) cls += ' ' + opts.clase;
    var dim = 'width="' + s + '" height="' + s + '"';
    return '<span class="' + cls + '" style="--tv-s:' + s + 'px">' + vector(dim) + '</span>';
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
      '<g transform="translate(33.8 27.8) scale(1.35)" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="miter">' +
      '<path d="M6.2 9.2L12 3.4L17.8 9.2"/><path d="M1.6 19.6L12 10.8L22.4 19.6"/>' +
      '<circle class="tv-mat__luz" cx="12" cy="1.7" r="1.5" stroke="none"/></g>' +
      '<text class="tv-mat__fecha" x="50" y="66" text-anchor="middle" font-size="6.6" font-weight="500" letter-spacing=".6">' + fecha + '</text>' +
      '</svg>';
  }

  var css = '' +
    '.tv-simbolo{display:inline-block;flex:none;line-height:0}' +
    '.tv-simbolo svg{display:block;width:var(--tv-s,24px);height:var(--tv-s,24px)}' +
    '.tv-pv{fill:none;stroke:currentColor}' +
    '.tv-pl{fill:var(--tv-luz,#d9a441)}' +
    '.tv-tinta .tv-pl{fill:currentColor}' +
    '.tv-lockup{display:inline-flex;align-items:center;gap:calc(var(--tv-s,28px) * .34);color:currentColor}' +
    '.tv-nombre{font:600 calc(var(--tv-s,28px) * .86)/1 var(--f-ui,"Inter",system-ui,sans-serif);letter-spacing:-.02em;color:currentColor}' +
    '.tv-mat__luz{fill:var(--tv-luz,#d9a441)}' +
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
