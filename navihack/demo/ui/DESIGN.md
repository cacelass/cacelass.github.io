# Guía de interfaz — obligatoria

> Toda pantalla, componente o cambio visual de TinyVigo sigue esta guía y pasa su
> checklist antes de darse por bueno. Si algo de aquí choca con una instrucción
> suelta, manda esta guía. Fuentes: reglas de Jose (`~/.config/opencode/modes/ui.md`),
> elastic-ui (`packages/elastic-ui/DECISIONS.md`), Strivon (`frontend/DESIGN.md`) y NN/g.

## Base

- **Fondo blanco y gris de relleno.** La página va en blanco o en un gris cálido; lo
  que agrupa va en un gris más hundido. Nada de fondos de color para decorar.
- **Color solo para estado o acento.** El acento es el **dorado de las luces**
  (`#f4cd80`). Estados: abierto (verde), cerrado/error (rojo), aviso (ámbar). Un color
  que no signifique nada, fuera.
- **Separa con espacio y relleno gris, no con filetes.** Sin bordes en reposo; un
  filo de 1 px solo en lo que flota o donde el tono no basta.
- **Un solo nivel de tarjeta plana.** No hay tarjetas dentro de tarjetas. Si algo
  necesita agruparse, se separa con espacio.
- **Profundidad por tonos, no por sombras.** CERO `box-shadow` decorativas. Lo que
  flota (popover, hoja) se distingue por el tono elevado y, como mucho, un filo de 1 px.

## Tipografía

- **Una familia: Inter.** Sin fuentes de píxel en texto, nunca (ni wordmark ni títulos).
- **Cinco tamaños fijos:** 28 (título de página), 20 (título de panel), 16 (lectura),
  14 (línea para actuar o escanear), 12 (meta). Ninguno entre medias.
- **Tres pesos:** 400 para leer, 500 para actuar, 600 para anunciar.
- **Títulos en minúscula normal** (sentence case). Nada de mayúsculas decorativas.
- Cifras tabulares (`tabular-nums`) en horas, cuentas y columnas.

## Iconos y assets

- **Iconos de interfaz: Lucide, sueltos, de línea (trazo 1,5 px, 20–24 px), un solo
  color que hereda `currentColor`.** Sin fondo, sin círculo de color.
- **Píxel solo dentro del mapa:** marcadores, sprites de punto y matasellos. En un
  mismo componente no se mezclan los dos registros.
- **Imagen antes que texto**, icono antes que frase. Frases cortas y llanas.
- **Fotos reales** para los puntos; nunca ilustraciones genéricas de relleno.

## Controles sobre el mapa

- **Superficie sólida, no translúcida.** Nada de `backdrop-filter` ni de `rgba(...)`
  dejando ver el mapa detrás del texto. Panel, chips, zoom y hoja van en su tono
  sólido.
- **Contraste AA obligatorio** (4,5:1 en texto normal) en claro y en oscuro, medido
  sobre el fondo real del control, no sobre el mapa.
- **Objetivos táctiles de 44 px como mínimo.**

## Tarjetas

Una tarjeta plana con la misma jerarquía siempre; **la imagen se recoloca según el
ancho del contenedor** (`@container` o breakpoint, un solo componente, no dos):

- **Con sitio** (ficha en panel de escritorio, fila de lista ancha, hoja inferior en
  tableta): imagen a la izquierda con proporción fija, y a la derecha título arriba,
  estado, datos con icono y una acción.
- **Móvil o contenedor estrecho**: imagen arriba a todo el ancho, título debajo (o
  miniatura pequeña a la izquierda en una fila de lista).
- **Contextos compactos** (chips, paradas de una ruta, entradas de la agenda,
  marcadores): sin imagen o con una miniatura mínima; no fuerces una foto donde no cabe.

Lo que no cambia: el contenido y la jerarquía (título primero, estado enseguida,
acción al final). Lo que cambia es dónde cae la imagen.

## Patrones NN/g que se aplican

- **Estado del sistema visible:** qué está cargado, qué está abierto, si hay conexión.
- **Reconocer antes que recordar:** el nombre viaja con su icono; no hay códigos.
- **Deshacer** en vez de confirmar todo; lo que se puede deshacer, se deshace.
- **Errores con salida:** qué pasó y qué se puede hacer, nunca un callejón.
- **Consistencia:** lo mismo se ve y se comporta igual en todas las pantallas.
- **Divulgación progresiva:** el detalle en el panel, no encima del mapa.

## Tono del copy

Frases cortas en presente, cero adjetivos, la tecnología real por su nombre
(Open-Meteo, GTFS, teselas). Nada de "revolucionario" ni "impulsado por IA".

## Identidad de Vigo (lo que la hace suya)

- **El dorado de las luces** como único acento.
- **La V** de la marca (logotipo dibujado, no fuente).
- **A Navideña**: el certificado numerado con matasellos.
- **Fotos reales** de Porta do Sol, la noria, el mercado.
- **Textos con voz de calle:** "Encendido ya", "Te queda a 4 min", no "Actualmente
  se encuentra en funcionamiento".

## Lo que NO puede aparecer (AI slop)

- Degradados y brillos decorativos, cristal por moda.
- Emojis en la interfaz.
- Iconos dentro de un círculo de color.
- Tres tarjetas idénticas con un titular genérico ("Descubre", "Explora", "Vive").
- Hero épico centrado con titular grande y subtítulo de relleno.
- Texto de relleno que no dice nada.

## Checklist de revisión (pásalo a cada pantalla)

1. ¿Ningún texto en fuente de píxel? (ni marca, ni títulos, ni números de interfaz).
2. ¿Solo Inter y solo tamaños 28/20/16/14/12 con pesos 400/500/600?
3. ¿Cero sombras decorativas y cero degradados?
4. ¿Color solo en estado o en el acento dorado, nunca decorativo?
5. ¿Controles sobre el mapa con superficie sólida y contraste AA medido?
6. ¿Iconos de interfaz Lucide de línea, y el píxel solo dentro del mapa?
7. ¿La imagen se recoloca según el ancho (izquierda con sitio, arriba en móvil, o sin ella en compacto) sin cambiar la jerarquía?
8. ¿Objetivos táctiles de 44 px o más?
9. ¿Estado visible y divulgación progresiva (detalle en panel, no sobre el mapa)?
10. ¿Cero elementos de la lista de AI slop?
