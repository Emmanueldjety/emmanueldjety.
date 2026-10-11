// Dessin des visages (yeux, bouches, formes de têtes) en 2D, inspiré de tes planches de référence.
// Les mêmes fonctions servent à dessiner le visage du personnage ET les petites vignettes du créateur.
import { Color } from 'three'

const INK = '#1b1b1b'

export const EYES = [
  { id: 'dots', label: 'Points' },
  { id: 'oval', label: 'Ovales' },
  { id: 'sleepy', label: 'Endormis' },
  { id: 'happy', label: 'Joyeux' },
  { id: 'dreamy', label: 'Rêveurs' },
  { id: 'sharp', label: 'Sévères' },
  { id: 'wink', label: 'Clin d’œil' },
  { id: 'wide', label: 'Ronds' },
  { id: 'side', label: 'De côté' },
  { id: 'shades', label: 'Lunettes' },
]

export const MOUTHS = [
  { id: 'smile', label: 'Sourire' },
  { id: 'grin', label: 'Grand sourire' },
  { id: 'laugh', label: 'Rire' },
  { id: 'smirk', label: 'En coin' },
  { id: 'flat', label: 'Neutre' },
  { id: 'open', label: 'Petit o' },
  { id: 'tongue', label: 'Langue' },
  { id: 'teeth', label: 'Dents' },
  { id: 'sad', label: 'Triste' },
  { id: 'cat', label: 'Chat' },
]

// Forme de la tête : proportions (sx, sy, sz) et position du visage à sa surface.
export const HEADS = [
  { id: 'round', label: 'Ronde', geo: 'sphere', sx: 1, sy: 1, sz: 1, frontZ: 0.318, rad: 0.318, w: 0.5 },
  { id: 'egg', label: 'Œuf', geo: 'sphere', sx: 0.9, sy: 1.16, sz: 0.95, frontZ: 0.303, rad: 0.303, w: 0.46 },
  { id: 'wide', label: 'Large', geo: 'sphere', sx: 1.16, sy: 0.88, sz: 1, frontZ: 0.318, rad: 0.4, w: 0.58 },
  { id: 'square', label: 'Carrée', geo: 'box', sx: 0.94, sy: 0.9, sz: 0.92, frontZ: 0.295, rad: 1.4, w: 0.5, hair: 1.22 },
  { id: 'pear', label: 'Poire', geo: 'pear', sx: 1, sy: 1.05, sz: 1, frontZ: 0.316, rad: 0.34, w: 0.5 },
  { id: 'tall', label: 'Haute', geo: 'capsule', sx: 0.84, sy: 1.22, sz: 0.9, frontZ: 0.288, rad: 0.288, w: 0.44 },
]

export const shade = (hex, k) => new Color(hex).lerp(new Color('#000000'), k)

const stroke = (g, w = 9) => {
  g.lineWidth = w
  g.lineCap = 'round'
  g.lineJoin = 'round'
  g.strokeStyle = INK
}

function ellipse(g, x, y, rx, ry, fill, line) {
  g.beginPath()
  g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
  if (fill) {
    g.fillStyle = fill
    g.fill()
  }
  if (line) {
    stroke(g, line)
    g.stroke()
  }
}

const highlight = (g, x, y, r) => ellipse(g, x, y, r, r, '#fff')

// Une paire d'yeux centrée en (cx, cy). `s` = échelle (1 = taille du visage, 0.5 = vignette).
export function drawEyes(g, style, cx, cy, s, skin = '#c68642') {
  g.save()
  g.translate(cx, cy)
  g.scale(s, s)
  const dx = 98
  const eye = (side) => {
    const x = side * dx
    switch (style) {
      case 'dots':
        ellipse(g, x, 0, 21, 28, INK)
        highlight(g, x + 7, -9, 6.5)
        break
      case 'oval':
        ellipse(g, x, 0, 32, 44, '#fff', 6)
        ellipse(g, x + 4, 10, 15, 19, INK)
        highlight(g, x + 9, 3, 5)
        // sourcil
        stroke(g, 8)
        g.beginPath()
        g.arc(x, -66, 34, Math.PI * 1.15, Math.PI * 1.85)
        g.stroke()
        break
      case 'sleepy': {
        ellipse(g, x, 0, 32, 40, '#fff', 6)
        ellipse(g, x + 2, 14, 15, 17, INK)
        // paupière : le haut de l'œil est recouvert
        g.save()
        g.beginPath()
        g.ellipse(x, 0, 32, 40, 0, 0, Math.PI * 2)
        g.clip()
        g.fillStyle = shade(skin, 0.1).getStyle()
        g.fillRect(x - 40, -50, 80, 52)
        g.restore()
        stroke(g, 8)
        g.beginPath()
        g.moveTo(x - 33, 2)
        g.lineTo(x + 33, 2)
        g.stroke()
        break
      }
      case 'happy':
        stroke(g, 10)
        g.beginPath()
        g.arc(x, 14, 28, Math.PI * 1.08, Math.PI * 1.92)
        g.stroke()
        break
      case 'dreamy':
        stroke(g, 10)
        g.beginPath()
        g.arc(x, -10, 28, Math.PI * 0.1, Math.PI * 0.9)
        g.stroke()
        stroke(g, 6)
        for (const a of [-0.1, 0.5, 1.1]) {
          const px = x + side * 30
          g.beginPath()
          g.moveTo(px - side * 4, 12 + a * 4)
          g.lineTo(px + side * 18, 14 + a * 26)
          g.stroke()
        }
        break
      case 'sharp':
        g.beginPath()
        g.moveTo(x - 32, side < 0 ? -12 : 4)
        g.lineTo(x + 32, side < 0 ? 4 : -12)
        g.lineTo(x + 26, 38)
        g.quadraticCurveTo(x, 46, x - 26, 36)
        g.closePath()
        g.fillStyle = '#fff'
        g.fill()
        stroke(g, 6)
        g.stroke()
        ellipse(g, x - side * 4, 22, 13, 15, INK)
        // sourcil en colère : le bout intérieur est plus bas
        stroke(g, 14)
        g.beginPath()
        g.moveTo(x - 40, side < 0 ? -36 : -6)
        g.lineTo(x + 40, side < 0 ? -6 : -36)
        g.stroke()
        break
      case 'wink':
        if (side < 0) {
          stroke(g, 10)
          g.beginPath()
          g.arc(x, 14, 28, Math.PI * 1.08, Math.PI * 1.92)
          g.stroke()
        } else {
          ellipse(g, x, 0, 21, 28, INK)
          highlight(g, x + 7, -9, 6.5)
        }
        break
      case 'wide':
        ellipse(g, x, 0, 38, 38, '#fff', 6)
        ellipse(g, x, 2, 13, 13, INK)
        highlight(g, x + 4, -3, 4.5)
        break
      case 'side':
        ellipse(g, x, 0, 32, 42, '#fff', 6)
        ellipse(g, x + 14, 6, 15, 20, INK)
        highlight(g, x + 19, -1, 5)
        break
      case 'shades':
        g.beginPath()
        g.roundRect(x - 44, -28, 88, 62, 20)
        g.fillStyle = INK
        g.fill()
        g.beginPath()
        g.moveTo(x - 28, -14)
        g.lineTo(x - 8, -14)
        g.lineTo(x - 22, 6)
        g.lineTo(x - 36, 6)
        g.closePath()
        g.fillStyle = 'rgba(255,255,255,.35)'
        g.fill()
        break
      default:
        break
    }
  }
  eye(-1)
  eye(1)
  if (style === 'shades') {
    stroke(g, 8)
    g.beginPath()
    g.moveTo(-54, -4)
    g.lineTo(54, -4)
    g.stroke()
  }
  g.restore()
}

// Une bouche centrée en (cx, cy).
export function drawMouth(g, style, cx, cy, s) {
  g.save()
  g.translate(cx, cy)
  g.scale(s, s)
  switch (style) {
    case 'smile':
      stroke(g, 10)
      g.beginPath()
      g.arc(0, -18, 46, Math.PI * 0.18, Math.PI * 0.82)
      g.stroke()
      break
    case 'grin':
      g.beginPath()
      g.moveTo(-58, -14)
      g.quadraticCurveTo(0, -4, 58, -14)
      g.quadraticCurveTo(44, 46, 0, 46)
      g.quadraticCurveTo(-44, 46, -58, -14)
      g.closePath()
      g.fillStyle = '#4a1620'
      g.fill()
      g.save()
      g.clip()
      g.fillStyle = '#fff'
      g.fillRect(-60, -14, 120, 22)
      g.restore()
      stroke(g, 8)
      g.beginPath()
      g.moveTo(-58, -14)
      g.quadraticCurveTo(0, -4, 58, -14)
      g.quadraticCurveTo(44, 46, 0, 46)
      g.quadraticCurveTo(-44, 46, -58, -14)
      g.stroke()
      break
    case 'laugh':
      g.beginPath()
      g.moveTo(-62, -18)
      g.lineTo(62, -18)
      g.quadraticCurveTo(52, 62, 0, 62)
      g.quadraticCurveTo(-52, 62, -62, -18)
      g.closePath()
      g.fillStyle = '#4a1620'
      g.fill()
      g.save()
      g.clip()
      g.fillStyle = '#fff'
      g.fillRect(-64, -20, 128, 22)
      ellipse(g, 0, 62, 34, 26, '#ee6b7a')
      g.restore()
      stroke(g, 8)
      g.beginPath()
      g.moveTo(-62, -18)
      g.lineTo(62, -18)
      g.quadraticCurveTo(52, 62, 0, 62)
      g.quadraticCurveTo(-52, 62, -62, -18)
      g.closePath()
      g.stroke()
      break
    case 'smirk':
      stroke(g, 10)
      g.beginPath()
      g.moveTo(-40, 6)
      g.quadraticCurveTo(10, 24, 50, -14)
      g.stroke()
      stroke(g, 6)
      g.beginPath()
      g.moveTo(54, -6)
      g.lineTo(60, -22)
      g.stroke()
      break
    case 'flat':
      stroke(g, 10)
      g.beginPath()
      g.moveTo(-36, 0)
      g.lineTo(36, 0)
      g.stroke()
      break
    case 'open':
      ellipse(g, 0, 4, 17, 22, '#4a1620')
      stroke(g, 6)
      g.beginPath()
      g.ellipse(0, 4, 17, 22, 0, 0, Math.PI * 2)
      g.stroke()
      break
    case 'tongue':
      g.beginPath()
      g.roundRect(-16, -8, 34, 52, 17)
      g.fillStyle = '#ee6b7a'
      g.fill()
      stroke(g, 6)
      g.stroke()
      stroke(g, 10)
      g.beginPath()
      g.arc(0, -22, 50, Math.PI * 0.16, Math.PI * 0.84)
      g.stroke()
      break
    case 'teeth':
      g.beginPath()
      g.roundRect(-52, -16, 104, 40, 12)
      g.fillStyle = '#fff'
      g.fill()
      stroke(g, 7)
      g.stroke()
      g.beginPath()
      g.moveTo(-52, 4)
      g.lineTo(52, 4)
      for (const x of [-26, 0, 26]) {
        g.moveTo(x, -16)
        g.lineTo(x, 24)
      }
      g.stroke()
      break
    case 'sad':
      stroke(g, 10)
      g.beginPath()
      g.arc(0, 40, 40, Math.PI * 1.2, Math.PI * 1.8)
      g.stroke()
      break
    case 'cat':
      stroke(g, 9)
      g.beginPath()
      g.arc(-24, -4, 24, Math.PI * 0.05, Math.PI * 0.95)
      g.stroke()
      g.beginPath()
      g.arc(24, -4, 24, Math.PI * 0.05, Math.PI * 0.95)
      g.stroke()
      break
    default:
      break
  }
  g.restore()
}

const BLUSH_MOUTHS = ['smile', 'grin', 'laugh', 'cat', 'tongue']

// Le visage complet, sur un canevas transparent.
export function drawFace(canvas, { eyes, mouth, skin }) {
  const W = canvas.width
  const H = canvas.height
  const g = canvas.getContext('2d')
  g.clearRect(0, 0, W, H)
  const s = (W / 512) * 1.4 // les traits sont dessinés assez grands pour se lire de loin
  if (BLUSH_MOUTHS.includes(mouth) && eyes !== 'shades') {
    for (const side of [-1, 1]) ellipse(g, W / 2 + side * 128 * s, H * 0.68, 30 * s, 17 * s, 'rgba(255,80,110,0.3)')
  }
  drawEyes(g, eyes, W / 2, H * 0.45, s, skin)
  drawMouth(g, mouth, W / 2, H * 0.8, s * 0.95)
}

// Silhouette d'une forme de tête (pour les vignettes du créateur).
export function drawHeadShape(g, id, w, h, fill) {
  g.fillStyle = fill
  g.beginPath()
  const cx = w / 2
  const cy = h / 2
  switch (id) {
    case 'egg':
      g.ellipse(cx, cy, w * 0.3, h * 0.42, 0, 0, Math.PI * 2)
      break
    case 'wide':
      g.ellipse(cx, cy, w * 0.43, h * 0.33, 0, 0, Math.PI * 2)
      break
    case 'square':
      g.roundRect(cx - w * 0.34, cy - h * 0.34, w * 0.68, h * 0.68, w * 0.16)
      break
    case 'pear':
      g.moveTo(cx - w * 0.2, cy - h * 0.34)
      g.quadraticCurveTo(cx, cy - h * 0.46, cx + w * 0.2, cy - h * 0.34)
      g.quadraticCurveTo(cx + w * 0.26, cy - h * 0.1, cx + w * 0.4, cy + h * 0.2)
      g.quadraticCurveTo(cx + w * 0.4, cy + h * 0.44, cx, cy + h * 0.44)
      g.quadraticCurveTo(cx - w * 0.4, cy + h * 0.44, cx - w * 0.4, cy + h * 0.2)
      g.quadraticCurveTo(cx - w * 0.26, cy - h * 0.1, cx - w * 0.2, cy - h * 0.34)
      break
    case 'tall':
      g.roundRect(cx - w * 0.25, cy - h * 0.45, w * 0.5, h * 0.9, w * 0.24)
      break
    default:
      g.ellipse(cx, cy, w * 0.36, h * 0.36, 0, 0, Math.PI * 2)
  }
  g.fill()
}
