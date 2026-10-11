import { CanvasTexture, SRGBColorSpace } from 'three'

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif'

function toTexture(canvas) {
  const t = new CanvasTexture(canvas)
  t.colorSpace = SRGBColorSpace
  t.anisotropy = 4
  return t
}

// Coupe un texte en lignes qui tiennent dans une largeur donnée.
function wrap(g, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (g.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

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
    g.font = `${l.weight ?? 600} ${l.size}px ${l.font ?? FONT}`
    g.fillStyle = l.color ?? '#2e2f2f'
    y += l.size
    g.fillText(l.text, x, y)
    y += l.gap ?? 10
  }
  return toTexture(c)
}

// Panneau de texte (biographie, compétences…) : sizeM = taille réelle en mètres.
export function makeBoardTexture({ kicker, title, lines }, sizeM, accent) {
  const PX = 280 // pixels par mètre
  const W = Math.round(sizeM[0] * PX)
  const H = Math.round(sizeM[1] * PX)
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  g.fillStyle = '#fbfbf9'
  g.fillRect(0, 0, W, H)
  g.fillStyle = accent
  g.fillRect(0, 0, 18, H)
  const pad = 64
  const maxW = W - pad * 2 - 18
  let y = 70
  g.textBaseline = 'alphabetic'
  g.textAlign = 'left'
  g.fillStyle = '#6b6b66'
  g.font = `700 34px ${FONT}`
  g.fillText(kicker.toUpperCase(), pad + 18, y)
  y += 78
  g.fillStyle = '#2e2f2f'
  g.font = `800 74px ${FONT}`
  for (const l of wrap(g, title, maxW)) {
    g.fillText(l, pad + 18, y)
    y += 84
  }
  y += 10
  for (const line of lines) {
    if (line.type === 'li') {
      g.font = `700 40px ${FONT}`
      g.fillStyle = '#2e2f2f'
      g.fillText(line.label, pad + 18, y)
      g.font = `400 40px ${FONT}`
      g.fillStyle = '#2e2f2f'
      const colX = pad + 18 + 230
      const rows = wrap(g, line.text, W - colX - pad)
      for (const r of rows) {
        g.fillText(r, colX, y)
        y += 50
      }
      y += 12
    } else {
      g.font = `400 42px ${FONT}`
      g.fillStyle = '#2e2f2f'
      for (const r of wrap(g, line.text, maxW)) {
        g.fillText(r, pad + 18, y)
        y += 54
      }
      y += 18
    }
  }
  return toTexture(c)
}

// Affiche de projet : fond de couleur + image (ou gros titre) + texte en bas.
export function makeCardTexture(cover, img) {
  const W = 640
  const H = 1600
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  g.fillStyle = cover.bg ?? '#ffffff'
  g.fillRect(0, 0, W, H)
  if (img && img.width) {
    if (cover.fit === 'contain') {
      const s = (W * 0.94) / img.width
      const w = img.width * s
      const h = img.height * s
      g.drawImage(img, (W - w) / 2, (H - 330 - h) / 2 + 20, w, h)
    } else {
      // l'image est déjà une affiche de la bonne proportion
      g.drawImage(img, 0, 0, W, H)
    }
  }
  g.textAlign = 'left'
  g.textBaseline = 'alphabetic'
  if (cover.big) {
    g.fillStyle = cover.accent ?? '#f5c115'
    g.fillRect(48, 150, 120, 14)
    g.fillStyle = cover.fg
    g.font = `800 ${cover.big.length > 3 ? 190 : 260}px ${FONT}`
    g.fillText(cover.big, 40, 470)
  }
  g.fillStyle = cover.fg
  g.font = `800 58px ${FONT}`
  let y = H - 190
  const rows = wrap(g, cover.title, W - 96)
  y -= (rows.length - 1) * 66
  for (const r of rows) {
    g.fillText(r, 48, y)
    y += 66
  }
  g.font = `500 36px ${FONT}`
  g.globalAlpha = 0.8
  g.fillText(cover.subtitle, 48, H - 60)
  g.globalAlpha = 1
  return toTexture(c)
}

// Pastille de réseau social.
export function makeTileTexture(tile) {
  const S = 800
  const c = document.createElement('canvas')
  c.width = c.height = S
  const g = c.getContext('2d')
  g.fillStyle = tile.color
  g.fillRect(0, 0, S, S)
  g.fillStyle = tile.ink
  g.textBaseline = 'alphabetic'
  g.textAlign = 'left'
  g.font = `800 ${tile.label.length > 9 ? 100 : 130}px ${FONT}`
  g.fillText(tile.label, 60, 330)
  g.font = `600 58px ${FONT}`
  g.globalAlpha = 0.9
  let y = 410
  const words = tile.handle.split(' · ')
  for (const w of words) {
    g.fillText(w, 60, y)
    y += 72
  }
  g.globalAlpha = 1
  g.font = `700 110px ${FONT}`
  g.textAlign = 'right'
  g.fillText('↗', S - 60, S - 60)
  return toTexture(c)
}

// Halo de lumière doux sur le mur, sous chaque lampe.
export function makeGlowTexture() {
  const S = 256
  const c = document.createElement('canvas')
  c.width = c.height = S
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(S / 2, S * 0.35, 0, S / 2, S / 2, S / 2)
  grad.addColorStop(0, 'rgba(255, 236, 180, 0.85)')
  grad.addColorStop(0.5, 'rgba(255, 240, 200, 0.3)')
  grad.addColorStop(1, 'rgba(255, 245, 220, 0)')
  g.fillStyle = grad
  g.fillRect(0, 0, S, S)
  return toTexture(c)
}
