import { useRef, useState } from 'react'
import { input } from './input.js'

// Joystick à l'écran pour téléphone : on pose le pouce et on glisse pour avancer.
export default function Joystick() {
  const base = useRef()
  const [thumb, setThumb] = useState({ x: 0, y: 0 })
  const activeId = useRef(null)
  const R = 48

  const update = (e) => {
    const r = base.current.getBoundingClientRect()
    let dx = e.clientX - (r.left + r.width / 2)
    let dy = e.clientY - (r.top + r.height / 2)
    const len = Math.hypot(dx, dy)
    if (len > R) {
      dx = (dx / len) * R
      dy = (dy / len) * R
    }
    setThumb({ x: dx, y: dy })
    input.joy.x = dx / R
    input.joy.y = -dy / R
  }
  const end = (e) => {
    if (e.pointerId !== activeId.current) return
    activeId.current = null
    setThumb({ x: 0, y: 0 })
    input.joy.x = 0
    input.joy.y = 0
  }

  return (
    <div
      ref={base}
      className="joystick"
      data-nolook
      onPointerDown={(e) => {
        activeId.current = e.pointerId
        e.currentTarget.setPointerCapture(e.pointerId)
        update(e)
      }}
      onPointerMove={(e) => e.pointerId === activeId.current && update(e)}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div className="joystick-thumb" style={{ transform: `translate(${thumb.x}px, ${thumb.y}px)` }} />
    </div>
  )
}
