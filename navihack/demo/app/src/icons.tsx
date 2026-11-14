import type { ReactElement } from 'react'

/*
 * Iconos pixel 16x16 de TinyVigo, dibujados en código (sin imágenes).
 * Port de web/ui/assets/iconos.js a React. Roles de color por píxel:
 *   #  principal (color de texto)      o  atenuado
 *   a  acento cálido (luz)             x  detalle de acento (hueco en mono)
 *   g  verde   r  rojo   b  azul       w  claro (hueco en mono)
 * Cada dirección de UI define las variables --i-*; con mono todo sale en un color.
 */

const N = 16
type Grid = string[][]

const blank = (): Grid => Array.from({ length: N }, () => Array(N).fill('.'))

const put = (g: Grid, x: number, y: number, c: string) => {
  x = Math.round(x); y = Math.round(y)
  if (x >= 0 && y >= 0 && x < N && y < N) g[y][x] = c
}

const line = (g: Grid, x0: number, y0: number, x1: number, y1: number, c: string) => {
  let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0)
  let sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy
  for (;;) {
    put(g, x0, y0, c)
    if (x0 === x1 && y0 === y1) break
    const e2 = 2 * e
    if (e2 >= dy) { e += dy; x0 += sx }
    if (e2 <= dx) { e += dx; y0 += sy }
  }
}

const rect = (g: Grid, x: number, y: number, w: number, h: number, c: string) => {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(g, x + i, y + j, c)
}

const box = (g: Grid, x: number, y: number, w: number, h: number, c: string) => {
  rect(g, x, y, w, 1, c); rect(g, x, y + h - 1, w, 1, c)
  rect(g, x, y, 1, h, c); rect(g, x + w - 1, y, 1, h, c)
}

const disc = (g: Grid, cx: number, cy: number, r: number, c: string) => {
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++)
    if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r) g[y][x] = c
}

const ring = (g: Grid, cx: number, cy: number, r: number, c: string, t = 0.65) => {
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy)
    if (d <= r + t / 2 && d > r - t - 0.25) g[y][x] = c
  }
}

const diamond = (g: Grid, cx: number, cy: number, hw: number, hh: number, c: string) => {
  for (let y = cy - hh; y <= cy + hh; y++) {
    const half = Math.round(hw * (1 - Math.abs(y - cy) / hh))
    for (let x = cx - half; x <= cx + half - 1; x++) put(g, x, y, c)
  }
}

// filas de texto centradas
const C = (rows: string[]): Grid => {
  const g = blank()
  rows.forEach((r, y) => {
    const off = Math.floor((N - r.length) / 2)
    ;[...r].forEach((ch, i) => { if (ch !== ' ') put(g, off + i, y, ch) })
  })
  return g
}

const ICONS = {
  tree: () => C(['', 'aa', 'aaaa', 'aa', 'gg', 'gxgg', 'gggxgg', 'gggg', 'gxgggg', 'gggggxgg', 'gggggg', 'ggxggggg', 'gggggggxgg', 'gggxgggggggg', 'oo', 'oo']),
  star: () => C(['', '', 'aa', 'aa', 'aaaa', 'aaaaaaaaaaaa', ' aaaaaaaaaa ', '  aaaaaaaa  ', '   aaaxaa   ', '  aaaaaaaa  ', ' aaaa  aaaa ', ' aaa    aaa ', ' aa      aa ']),
  wheel: () => {
    const g = blank()
    line(g, 7, 8, 3, 15, '#'); line(g, 8, 8, 12, 15, '#'); rect(g, 2, 15, 12, 1, '#')
    ring(g, 8, 7, 6, '#')
    for (let k = 0; k < 8; k += 2) {
      const a = k * Math.PI / 4 + Math.PI / 4
      line(g, 8, 7, Math.round(8 + Math.cos(a) * 5), Math.round(7 + Math.sin(a) * 5), 'o')
    }
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4 + Math.PI / 8
      put(g, 8 + Math.cos(a) * 5.7 - 0.5, 7 + Math.sin(a) * 5.7 - 0.5, k % 2 ? 'r' : 'a')
    }
    disc(g, 8, 7, 1.2, 'a')
    return g
  },
  bus: () => C(['', 'bbbbbbbbbbbb', 'baaaaaaaaaab', 'bbbbbbbbbbbb', 'bwwwwwwwwwwb', 'bwwwwwwwwwwb', 'bwwwwwwwwwwb', 'bbbbbbbbbbbb', 'bbbbbbbbbbbb', 'bxxbbbbbbxxb', 'bbbbbbbbbbbb', '############', '##        ##', '##        ##']),
  train: () => C(['', ' rrrrrr', ' rrrrrrrr', 'rrrrrrrrrr', 'rwwwwwwwwr', 'rwwwwwwwwr', 'rrrrrrrrrr', 'rxrrrrrrxr', 'rrrrrrrrrr', 'rrrrrrrrrr', '##########', ' ##    ##', 'oooooooooooooo']),
  pin: () => {
    const g = blank()
    disc(g, 8, 6, 5.2, 'r')
    for (let y = 9; y < 15; y++) {
      const h = Math.max(0, Math.round((15 - y) * 0.8))
      for (let x = 8 - h; x < 8 + h; x++) put(g, x, y, 'r')
    }
    disc(g, 8, 6, 2, 'w')
    return g
  },
  clock: () => {
    const g = blank()
    ring(g, 8, 8, 6.8, '#', 0.9)
    line(g, 8, 8, 8, 3, '#'); line(g, 8, 8, 11, 10, '#')
    disc(g, 8, 8, 1, 'a')
    put(g, 8, 1, 'o'); put(g, 8, 14, 'o'); put(g, 1, 8, 'o'); put(g, 14, 8, 'o')
    return g
  },
  sun: () => {
    const g = blank()
    disc(g, 8, 8, 3.4, 'a')
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4, cardinal = k % 2 === 0
      for (const d of cardinal ? [5.4, 6.4] : [5.2]) put(g, 8 + Math.cos(a) * d - 0.5, 8 + Math.sin(a) * d - 0.5, 'a')
    }
    return g
  },
  moon: () => {
    const g = blank()
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++)
      if (Math.hypot(x + 0.5 - 7.5, y + 0.5 - 8.5) <= 6.3 && Math.hypot(x + 0.5 - 11, y + 0.5 - 6) > 5.2) g[y][x] = 'a'
    put(g, 13, 12, 'o'); put(g, 14, 10, 'o'); put(g, 2, 2, 'o')
    return g
  },
  rain: () => {
    const g = blank()
    disc(g, 5, 7, 3, 'o'); disc(g, 9, 5.5, 3.6, 'o'); disc(g, 12, 8, 2.4, 'o')
    rect(g, 3, 8, 10, 3, 'o')
    ;[4, 8, 12].forEach((x, i) => {
      put(g, x, 12 + (i % 2), 'b'); put(g, x - 1, 13 + (i % 2), 'b'); put(g, x - 1, 14 + (i % 2), 'b')
    })
    return g
  },
  search: () => {
    const g = blank()
    ring(g, 6.5, 6.5, 5, '#', 0.95)
    line(g, 10, 10, 14, 14, 'a'); line(g, 11, 10, 14, 13, 'a'); line(g, 10, 11, 13, 14, 'a')
    return g
  },
  layers: () => {
    const g = blank()
    ;([[12, 'o'], [9, 'b'], [6, 'a']] as const).forEach(([cy, c]) => {
      diamond(g, 8, cy, 8, 4, '.'); diamond(g, 8, cy, 7, 3, c)
    })
    return g
  },
  route: () => {
    const g = blank()
    disc(g, 3, 12, 2.2, 'g'); line(g, 6, 12, 10, 12, 'o'); line(g, 10, 12, 10, 8, 'o'); line(g, 10, 8, 12, 8, 'o')
    disc(g, 12, 4, 3, 'r')
    put(g, 11, 7, 'r'); put(g, 12, 7, 'r'); put(g, 12, 8, 'r')
    put(g, 12, 4, 'w'); put(g, 11, 4, 'w'); put(g, 11, 3, 'w'); put(g, 12, 3, 'w')
    return g
  },
  postal: () => {
    const g = blank()
    box(g, 1, 3, 14, 10, '#')
    rect(g, 10, 5, 3, 3, 'r')
    rect(g, 3, 6, 5, 1, 'o'); rect(g, 3, 8, 7, 1, 'o'); rect(g, 3, 10, 4, 1, 'o')
    rect(g, 12, 10, 1, 1, 'a')
    return g
  },
  calendar: () => {
    const g = blank()
    box(g, 1, 2, 14, 13, '#')
    rect(g, 2, 3, 12, 3, 'r')
    rect(g, 4, 0, 1, 3, '#'); rect(g, 11, 0, 1, 3, '#')
    ;[3, 6, 9].forEach(x => [8, 10, 12].forEach(y => put(g, x, y, 'o')))
    rect(g, 11, 10, 2, 2, 'a')
    return g
  },
  open: () => {
    const g = blank()
    disc(g, 8, 8, 6.8, 'g')
    line(g, 4, 8, 7, 11, 'w'); line(g, 5, 8, 7, 10, 'w'); line(g, 7, 11, 12, 5, 'w'); line(g, 7, 10, 12, 4, 'w')
    return g
  },
  closed: () => {
    const g = blank()
    disc(g, 8, 8, 6.8, 'r'); rect(g, 4, 7, 8, 2, 'w')
    return g
  },
  x: () => {
    const g = blank()
    line(g, 3, 3, 12, 12, '#'); line(g, 12, 3, 3, 12, '#'); line(g, 4, 3, 12, 11, '#'); line(g, 11, 3, 3, 11, '#')
    return g
  },
  plus: () => { const g = blank(); rect(g, 7, 3, 2, 10, '#'); rect(g, 3, 7, 10, 2, '#'); return g },
  minus: () => { const g = blank(); rect(g, 3, 7, 10, 2, '#'); return g },
  check: () => {
    const g = blank()
    line(g, 3, 8, 6, 11, '#'); line(g, 3, 7, 6, 10, '#'); line(g, 6, 11, 13, 4, '#'); line(g, 6, 10, 13, 3, '#')
    return g
  },
  walk: () => {
    const g = blank()
    rect(g, 7, 1, 2, 3, '#'); rect(g, 7, 5, 2, 5, '#')
    line(g, 7, 6, 4, 9, '#'); line(g, 8, 6, 11, 8, '#'); line(g, 7, 10, 5, 14, '#'); line(g, 8, 10, 11, 14, '#')
    return g
  },
  share: () => {
    const g = blank()
    disc(g, 12, 3.5, 2.2, '#'); disc(g, 4, 8, 2.2, '#'); disc(g, 12, 12.5, 2.2, '#')
    line(g, 5, 7, 11, 4, '#'); line(g, 5, 9, 11, 12, '#')
    return g
  },
  gift: () => {
    const g = blank()
    rect(g, 2, 6, 12, 8, 'r'); rect(g, 1, 4, 14, 3, 'r')
    rect(g, 7, 4, 2, 10, 'a'); rect(g, 1, 6, 14, 1, 'o')
    line(g, 8, 4, 4, 1, 'a'); line(g, 8, 4, 12, 1, 'a')
    return g
  },
  market: () => {
    const g = blank()
    for (let i = 0; i < 12; i++) rect(g, 2 + i, 3, 1, 3, i % 2 ? 'w' : 'r')
    rect(g, 1, 6, 14, 1, 'r')
    rect(g, 3, 7, 1, 7, 'o'); rect(g, 12, 7, 1, 7, 'o')
    rect(g, 3, 10, 10, 1, '#')
    rect(g, 5, 8, 2, 2, 'a'); rect(g, 9, 8, 2, 2, 'x')
    return g
  },
  cloud: () => {
    const g = blank()
    disc(g, 5, 9, 3.2, 'o'); disc(g, 9, 7, 4, 'o'); disc(g, 12, 10, 2.6, 'o')
    rect(g, 3, 10, 10, 3, 'o'); rect(g, 2, 14, 12, 1, 'o')
    return g
  },
  camera: () => {
    const g = blank()
    rect(g, 1, 4, 14, 10, '#'); rect(g, 5, 2, 6, 2, '#')
    ring(g, 8, 9, 3, 'w', 0.9); disc(g, 8, 9, 1.4, 'a')
    put(g, 13, 6, 'r')
    return g
  },
  parking: () => {
    const g = blank()
    rect(g, 1, 1, 14, 14, 'b')
    rect(g, 5, 3, 2, 10, 'w'); rect(g, 7, 3, 4, 2, 'w'); rect(g, 7, 7, 4, 2, 'w'); rect(g, 10, 4, 2, 4, 'w')
    return g
  },
  fog: () => {
    const g = blank()
    ;[3, 6, 9, 12].forEach((y, i) => rect(g, 2 + (i % 2) * 2, y, 11 - (i % 2) * 2, 2, i % 2 ? 'o' : '#'))
    return g
  },
  ticket: () => {
    const g = blank()
    rect(g, 1, 4, 14, 8, 'a')
    put(g, 1, 7, '.'); put(g, 1, 8, '.'); put(g, 14, 7, '.'); put(g, 14, 8, '.')
    put(g, 1, 4, '.'); put(g, 14, 4, '.'); put(g, 1, 11, '.'); put(g, 14, 11, '.')
    rect(g, 10, 5, 1, 6, '.')
    rect(g, 3, 6, 5, 1, 'o'); rect(g, 3, 8, 4, 1, 'o')
    return g
  },
} as const

export type IconName = keyof typeof ICONS

const grids: Record<IconName, Grid> = Object.fromEntries(
  (Object.keys(ICONS) as IconName[]).map((n) => [n, ICONS[n]()]),
) as Record<IconName, Grid>

const CLS: Record<string, string> = {
  '#': 'p-main', o: 'p-dim', a: 'p-a', x: 'p-x', g: 'p-g', r: 'p-r', b: 'p-b', w: 'p-w',
}

export function Px({ name, size = 16, mono = false }: { name: IconName; size?: number; mono?: boolean }) {
  const g = grids[name]
  if (!g) return null
  const rects: ReactElement[] = []
  for (let y = 0; y < N; y++) {
    let x = 0
    while (x < N) {
      const c = g[y][x]
      if (c === '.') { x++; continue }
      let e = x
      while (e < N && g[y][e] === c) e++
      rects.push(<rect key={`${y}-${x}`} className={CLS[c] || 'p-main'} x={x} y={y} width={e - x} height={1} />)
      x = e
    }
  }
  return (
    <svg className={'px' + (mono ? ' mono' : '')} viewBox="0 0 16 16" width={size} height={size} shapeRendering="crispEdges" aria-hidden="true">
      {rects}
    </svg>
  )
}
