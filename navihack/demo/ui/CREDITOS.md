# CREDITOS.md — TinyVigo UI v2

## Iconos

- **`assets/iconos.js`** — set propio de iconos píxel 16×16, dibujado en código para
  TinyVigo. Sin licencia externa (propio del proyecto).
- **`assets/vendor/pixelarticons/`** — [pixelarticons](https://github.com/halfmage/pixelarticons),
  licencia **MIT** (`LICENSE`). Set alternativo de UI genérica; se conserva como
  referencia, no se usa en pantalla.
- **`assets/vendor/game-icons/`** — [game-icons.net](https://game-icons.net),
  licencia **CC BY 3.0** (`license.txt`, autores Lorc, Delapouite y otros). Se
  conservan `santa-hat`, `street-light`, `alarm-clock` y `magnifying-glass` como
  referencia; los iconos de pantalla usan el set propio.
- **`assets/vendor/lucide/`** — [Lucide](https://lucide.dev) v0.462.0, licencia **ISC**
  (`LICENSE`). Iconos de línea de la interfaz (`.lu`, `data-lu="..."`); `tools/build-lucide.py`
  genera `assets/lucide.js` a partir de los SVG de esa carpeta. Los de mapa siguen siendo píxel
  (`assets/iconos.js`); los dos registros no se mezclan.
- **`assets/marca.js`** — símbolo, logotipo y matasellos de TinyVigo ("la V encendida"),
  dibujados en código. Propio del proyecto.
- **`assets/vendor/nes.css/`** — [NES.css](https://github.com/nostalgic-css/NES.css),
  licencia **MIT** (`LICENSE`). La técnica de biseles píxel **no se usa** (el píxel
  solo es recurso, no lenguaje de la UI). Se conserva la licencia por haberla evaluado.

## Tipografía

- **Inter** — SIL Open Font License 1.1 (`assets/fonts/OFL-inter.txt`).
- **Pixelify Sans** — SIL Open Font License 1.1 (`assets/fonts/OFL-pixelifysans.txt`).
  Solo en los números sobre el mapa. El nombre de la marca va en Inter, nunca en píxel.
- **Caveat** — SIL Open Font License 1.1 (`assets/fonts/OFL-caveat.txt`, Google Fonts).
  Solo para lo que va escrito a mano en la postal: mensaje y dirección del reverso.

## Imágenes

- `foto-arbol.jpg`, `foto-noria.jpg`, `foto-mercado.jpg`, `mapa-escritorio.jpg`,
  `mapa-movil.jpg` — material de trabajo del propio proyecto TinyVigo (maquetas).
- `postal-bloque-3x2.webp` — recorte 3:2 del bloque de teselas v5 (`web/tiles`,
  propio del proyecto), reescalado a la mitad con vecino más cercano. Es la escena
  provisional de la postal: se sustituye por la imagen generada cuando exista.

## Datos (para las páginas, con fuente visible)

- Concello de Vigo: luces led, calles y plazas, árboles iluminados, el árbol de
  Porta do Sol (45 m), encendido (14 nov 2026, 20:00) y horario de luces.
- Iluminaciones Ximénez (2023): presupuesto por campaña.
- INE: visitantes (~2 M) y pernoctaciones (~400.000), como estimación.
- Los arcos (~1.169) y motivos (~3.000) bailan entre fuentes: se marcan como
  aproximados. No se usan las cifras de visitantes de Caballero como dato.
