/* Postal — estado, giro y descarga.
   La escena es el recorte del mapa en píxel; el modelo pondrá a la persona dentro.
   Marco, título, nombre, mensaje y sello los compone este fichero, nunca el modelo. */
(function () {
  var pc = document.getElementById('pc');
  var form = document.getElementById('form');
  var fotoInput = document.getElementById('foto');
  var preview = document.getElementById('preview');
  var fotoEstado = document.getElementById('foto-estado');
  var persona = document.getElementById('persona');
  var lugar = document.getElementById('lugar');
  var mensaje = document.getElementById('mensaje');
  var nombre = document.getElementById('nombre');
  var girar = document.getElementById('girar');
  var generar = document.getElementById('generar');
  var otra = document.getElementById('otra');
  var descargar = document.getElementById('descargar');
  var error = document.getElementById('error');
  var notaExport = document.getElementById('nota-export');
  var escena = document.getElementById('foto-escena');

  var fecha = new Date();
  var fechaTxt = [fecha.getDate(), fecha.getMonth() + 1, fecha.getFullYear()]
    .map(function (n, i) { return i < 2 ? String(n).padStart(2, '0') : n; }).join(' · ');
  document.getElementById('p-fecha').textContent = fechaTxt;
  document.getElementById('matasellos').innerHTML = MARCA.matasellos({ size: 104, fecha: fechaTxt });

  var usuarioFoto = null;   /* dataURL de la foto elegida */

  function estado(e) { pc.dataset.estado = e; }

  function pintar() {
    var opt = lugar.options[lugar.selectedIndex];
    document.getElementById('p-lugar').textContent = opt.dataset.lugar;
    document.getElementById('p-sub').textContent = opt.dataset.sub;
    escena.alt = opt.dataset.lugar + ', recorte del mapa en píxel';
    var texto = mensaje.value.trim();
    document.getElementById('r-msg').textContent = texto || 'Escríbeme desde Vigo.';
    document.getElementById('r-firma').textContent = '— ' + (nombre.value.trim() || 'alguien');
    document.getElementById('p-nombre').textContent = nombre.value.trim() || '—';
  }

  function ponerFoto(dataUrl, nombreArchivo) {
    usuarioFoto = dataUrl;
    preview.innerHTML = '';
    var img = document.createElement('img');
    img.src = dataUrl; img.alt = 'Tu foto';
    preview.appendChild(img);
    fotoEstado.textContent = 'Foto lista';
    if (nombreArchivo) preview.title = nombreArchivo;
  }

  function pintarPersona() {
    persona.innerHTML = '';
    if (usuarioFoto) {
      var img = document.createElement('img');
      img.src = usuarioFoto; img.alt = 'Tu persona colocada en la escena';
      persona.appendChild(img);
    } else {
      persona.innerHTML = '<span>Aquí irá tu persona</span>';
    }
  }

  /* ——— giro ——— */
  function girarAhora() {
    var girada = pc.classList.toggle('is-girada');
    girar.querySelector('span').textContent = girada ? 'Ver el anverso' : 'Ver el reverso';
    girar.setAttribute('aria-pressed', girada ? 'true' : 'false');
  }
  girar.setAttribute('aria-pressed', 'false');
  girar.addEventListener('click', girarAhora);

  /* ——— estados ——— */
  fotoInput.addEventListener('change', function () {
    var f = fotoInput.files && fotoInput.files[0];
    if (!f) return;
    var lector = new FileReader();
    lector.onload = function () { ponerFoto(lector.result, f.name); };
    lector.readAsDataURL(f);
  });

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    if (pc.dataset.estado === 'generando') return;
    error.textContent = '';
    var f = fotoInput.files && fotoInput.files[0];
    if (!usuarioFoto && f) {
      /* la foto se eligió y no dio tiempo a leerla: se lee ahora y se sigue */
      var lector = new FileReader();
      lector.onload = function () {
        ponerFoto(lector.result, f.name);
        arrancar();
      };
      lector.readAsDataURL(f);
      return;
    }
    if (!usuarioFoto) {
      error.textContent = 'Falta tu foto. Sin foto no hay postal: elige una y vuelve a intentarlo.';
      fotoInput.focus();
      return;
    }
    arrancar();
  });

  function arrancar() {
    if (pc.classList.contains('is-girada')) girarAhora();
    estado('generando');
    generar.disabled = true;

    /* El modelo real (pipeline de postal) entra aquí. Mientras no esté, se compone
       la postal con el recorte del bloque y la foto en el hueco de la persona. */
    setTimeout(function () {
      pintarPersona();
      estado('resultado');
      generar.disabled = true;
      generar.hidden = true;
      otra.hidden = false;
      descargar.hidden = false;
    }, 2200);
  }

  otra.addEventListener('click', function () {
    estado('inicial');
    generar.hidden = false;
    generar.disabled = false;
    otra.hidden = true;
    descargar.hidden = true;
    persona.innerHTML = '<span>Aquí irá tu persona</span>';
    usuarioFoto = null;
    fotoInput.value = '';
    preview.innerHTML = '';
    preview.insertAdjacentHTML('afterbegin', LU.svg('camera', { size: 20 }));
    fotoEstado.textContent = 'Sube o haz una foto';
    if (pc.classList.contains('is-girada')) girarAhora();
  });

  /* ——— descarga: el anverso en 3:2, 1200 × 800 ——— */
  function cubrir(ctx, img, x, y, w, h) {
    var r = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    var sw = w / r, sh = h / r;
    ctx.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
  }

  function cargar(src) {
    return new Promise(function (ok, mal) {
      var i = new Image();
      i.onload = function () { ok(i); };
      i.onerror = mal;
      i.src = src;
    });
  }

  function exportar() {
    var W = 1200, H = 800, m = 26, pie = 88;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var ctx = c.getContext('2d');

    ctx.fillStyle = '#fbfaf7';
    ctx.fillRect(0, 0, W, H);

    cargar('assets/postal-bloque-3x2.webp').then(function (esc) {
      ctx.imageSmoothingEnabled = false;
      cubrir(ctx, esc, m, m, W - m * 2, H - m * 2 - pie);

      var lista;
      if (usuarioFoto) {
        lista = cargar(usuarioFoto).then(function (foto) {
          /* mismo hueco que en pantalla: 15 % de ancho, 3:4, a 46 % / 13 % */
          var fw = Math.round((W - m * 2) * 0.15);
          var fh = Math.round(fw * 4 / 3);
          var fx = Math.round(m + (W - m * 2) * 0.46);
          var fy = Math.round(m + (H - m * 2 - pie) * 0.8 - fh);
          ctx.fillStyle = '#fbfaf7';
          ctx.fillRect(fx - 6, fy - 6, fw + 12, fh + 12);
          cubrir(ctx, foto, fx, fy, fw, fh);
        });
      } else { lista = Promise.resolve(); }

      lista.then(function () {
        ctx.fillStyle = '#1d1d1d';
        ctx.font = '600 26px Inter, system-ui, sans-serif';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(lugar.options[lugar.selectedIndex].dataset.lugar, m + 6, H - m - 30);
        ctx.fillStyle = '#51554c';
        ctx.font = '500 13px Inter, system-ui, sans-serif';
        ctx.fillText(lugar.options[lugar.selectedIndex].dataset.sub.toUpperCase(), m + 6, H - m - 12);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#51554c';
        ctx.font = '500 15px Inter, system-ui, sans-serif';
        ctx.fillText(nombre.value.trim() || '', W - m - 6, H - m - 30);
        ctx.font = '400 12px Inter, system-ui, sans-serif';
        ctx.fillText(fechaTxt, W - m - 6, H - m - 12);

        return new Promise(function (ok) {
          c.toBlob(function (blob) {
            if (!blob) { ok(null); return; }
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'tinyvigo-postal-' + lugar.value + '.png';
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
            ok(blob);
          }, 'image/png');
        });
      });
    }).catch(function () {
      notaExport.hidden = false;
    });
  }

  descargar.addEventListener('click', exportar);

  /* ——— en vivo ——— */
  [lugar, mensaje, nombre].forEach(function (el) {
    el.addEventListener('input', pintar);
    el.addEventListener('change', pintar);
  });

  pintar();
  document.addEventListener('font-y', function () {}, false);
})();
