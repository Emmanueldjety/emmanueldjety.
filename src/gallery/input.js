// État partagé des contrôles (clavier, joystick, caméra).
// Volontairement en dehors de React : il change 60 fois par seconde.
export const input = {
  keys: new Set(),
  joy: { x: 0, y: 0 },
  yaw: 0,
  pitch: 0.38,
}

const MAP = {
  KeyW: 'up', KeyZ: 'up', ArrowUp: 'up',
  KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', KeyQ: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
  ShiftLeft: 'run', ShiftRight: 'run',
}

export function bindKeyboard() {
  const down = (e) => {
    if (e.target instanceof HTMLInputElement) return
    const k = MAP[e.code]
    if (k) {
      input.keys.add(k)
      e.preventDefault()
    }
  }
  const up = (e) => {
    const k = MAP[e.code]
    if (k) input.keys.delete(k)
  }
  const blur = () => input.keys.clear()
  window.addEventListener('keydown', down)
  window.addEventListener('keyup', up)
  window.addEventListener('blur', blur)
  return () => {
    window.removeEventListener('keydown', down)
    window.removeEventListener('keyup', up)
    window.removeEventListener('blur', blur)
    input.keys.clear()
  }
}

// Glisser (souris ou doigt) sur la scène pour tourner la caméra.
// `ignore` : éléments sur lesquels on ne tourne pas (ex. joystick).
export function bindLook(el) {
  let active = null
  let last = { x: 0, y: 0 }
  const down = (e) => {
    if (e.target.closest?.('[data-nolook]')) return
    if (active !== null) return
    active = e.pointerId
    last = { x: e.clientX, y: e.clientY }
  }
  const move = (e) => {
    if (e.pointerId !== active) return
    const dx = e.clientX - last.x
    const dy = e.clientY - last.y
    last = { x: e.clientX, y: e.clientY }
    input.yaw -= dx * 0.006
    input.pitch = Math.min(1.1, Math.max(0.08, input.pitch + dy * 0.004))
  }
  const up = (e) => {
    if (e.pointerId === active) active = null
  }
  el.addEventListener('pointerdown', down)
  window.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
  window.addEventListener('pointercancel', up)
  return () => {
    el.removeEventListener('pointerdown', down)
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerup', up)
    window.removeEventListener('pointercancel', up)
  }
}
