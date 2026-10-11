import { CanvasTexture, SRGBColorSpace } from 'three'

// Dessine du texte sur un canevas 2D et en fait une image utilisable dans la scène 3D
// (plaques sous les œuvres, titres sur les murs, panneaux de portes).
export function makeTextTexture(lines, { width = 512, height = 128, bg = null, align = 'left', pad = 24 } = {}) {
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  const g = c.getContext('2d')
  if (bg) {
    g.fillStyle = bg
    g.fillRect(0, 0, width, height)
  }
  g.textBaseline = 'alphabetic'
  g.textAlign = align
  const x = align === 'center' ? width / 2 : align === 'right' ? width - pad : pad
  let y = pad
  for (const l of lines) {
    g.font = `${l.weight ?? 600} ${l.size}px ${l.font ?? 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'}`
    g.fillStyle = l.color ?? '#2e2f2f'
    y += l.size
    g.fillText(l.text, x, y)
    y += l.gap ?? 10
  }
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  t.anisotropy = 4
  return t
}
