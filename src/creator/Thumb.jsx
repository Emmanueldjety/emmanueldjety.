import { useEffect, useRef } from 'react'
import { drawEyes, drawHeadShape, drawMouth } from '../avatar/face.js'

// Vignette dessinée : la forme de tête, les yeux ou la bouche, avec la teinte de peau choisie.
export default function Thumb({ kind, id, label, skin, active, onClick }) {
  const ref = useRef()
  useEffect(() => {
    const c = ref.current
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const W = 84
    const H = 64
    c.width = W * dpr
    c.height = H * dpr
    const g = c.getContext('2d')
    g.scale(dpr, dpr)
    g.clearRect(0, 0, W, H)
    if (kind === 'head') {
      drawHeadShape(g, id, W, H, skin)
    } else {
      // une tête neutre en fond, avec seulement la partie à choisir
      drawHeadShape(g, 'wide', W, H, skin)
      if (kind === 'eyes') drawEyes(g, id, W / 2, H * 0.5, 0.25, skin)
      else drawMouth(g, id, W / 2, H * 0.55, 0.3)
    }
  }, [kind, id, skin])

  return (
    <button type="button" role="radio" aria-checked={active} className={`thumb ${active ? 'on' : ''}`} onClick={onClick}>
      <canvas ref={ref} style={{ width: 84, height: 64 }} aria-hidden="true" />
      <span>{label}</span>
    </button>
  )
}
