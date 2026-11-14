#!/bin/sh
# Capturas de la v2: una instancia de navegador a la vez.
# uso: sh tools/shots.sh [pagina ...]   (sin args, todas)
cd "$(dirname "$0")/.."
pages="${*:-inicio mapa ficha rutas eventos transporte postal lista-puntos estados ajustes navidena components}"
shot(){ brave-browser --headless=new --disable-gpu --no-sandbox --hide-scrollbars --window-size=$1 --virtual-time-budget=6000 --screenshot=$2 "file://$PWD/$3" >/dev/null 2>&1; }
for p in $pages; do
  echo "== $p"
  shot 1400,900 "capturas/${p}-esc-dia.png"    "${p}.html#light"
  shot 1400,900 "capturas/${p}-esc-noche.png"  "${p}.html#dark"
  shot 390,844  "capturas/${p}-mov-dia.png"    "${p}.html#light"
  shot 390,844  "capturas/${p}-mov-noche.png"  "${p}.html#dark"
done
echo DONE
