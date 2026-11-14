#!/usr/bin/env python3
"""Genera assets/lucide.js a partir de los SVG de assets/vendor/lucide/.

Los iconos de interfaz se sirven inline (currentColor) para funcionar sin red
y sin CDN. Los originales se quedan en assets/vendor/lucide/ con su LICENSE.

    python3 tools/build-lucide.py
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "vendor" / "lucide"
OUT = ROOT / "assets" / "lucide.js"

BODY = re.compile(r"<svg[^>]*>(.*)</svg>", re.S)
COMMENT = re.compile(r"<!--.*?-->", re.S)


def inner(path):
    text = COMMENT.sub("", path.read_text()).strip()
    body = BODY.search(text).group(1)
    body = re.sub(r"\s+", " ", body).strip()
    return body


icons = {p.stem: inner(p) for p in sorted(SRC.glob("*.svg"))}

lines = [
    "/* Iconos de interfaz: Lucide v0.462.0 (ISC, ver assets/vendor/lucide/LICENSE).",
    "   Inline y en currentColor para que hereden el color del texto. Generado por",
    "   tools/build-lucide.py — no editar a mano. Los iconos de MAPA son los de",
    "   assets/iconos.js (píxel); los dos registros no se mezclan. */",
    "(function () {",
    "  var P = {",
]
for name, body in icons.items():
    js = body.replace("\\", "\\\\").replace("'", "\\'")
    lines.append("    '%s': '%s'," % (name, js))
lines += [
    "  };",
    "  function svg(name, opts) {",
    "    var d = P[name]; if (!d) return '';",
    "    opts = opts || {}; var s = opts.size || 20;",
    "    return '<svg class=\"lu\" viewBox=\"0 0 24 24\" width=\"' + s + '\" height=\"' + s + '\"'",
    "      + ' fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\"'",
    "      + ' stroke-linejoin=\"round\" aria-hidden=\"true\">' + d + '</svg>';",
    "  }",
    "  function mount(root) {",
    "    (root || document).querySelectorAll('[data-lu]').forEach(function (el) {",
    "      var s = el.getAttribute('data-size') || el.getAttribute('data-lu-size') || 20;",
    "      var html = svg(el.getAttribute('data-lu'), { size: +s });",
    "      el.insertAdjacentHTML('afterbegin', html);",
    "      el.removeAttribute('data-lu');",
    "    });",
    "  }",
    "  window.LU = { svg: svg, names: Object.keys(P), mount: mount };",
    "  mount(); document.addEventListener('DOMContentLoaded', function () { mount(); });",
    "})();",
    "",
]
OUT.write_text("\n".join(lines))
print("lucide.js:", len(icons), "iconos,", OUT.stat().st_size, "bytes")
