#!/usr/bin/env bash
# Regenera projects/climasafe/ desde esta fuente, sin depender del repo ANFAIA.
# Requiere mkdocs y el theme material (pip install mkdocs mkdocs-material).
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
if ! command -v mkdocs >/dev/null 2>&1; then
    echo "mkdocs no instalado. Prueba: pip install mkdocs mkdocs-material" >&2
    exit 1
fi
mkdocs build -f mkdocs.yml -d /tmp/climasafe-docs-build
rm -rf ../climasafe
cp -R /tmp/climasafe-docs-build ../climasafe
echo "✓ Documentación regenerada en projects/climasafe/"
