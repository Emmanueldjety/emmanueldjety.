import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import Avatar from '../avatar/Avatar.jsx'
import { input } from './input.js'
import { ROOM } from './layout.js'
import { DOOR_Z } from './layout.js'
import { collidersFor, doorsFor } from '../data/rooms.js'

const RADIUS = 0.35
const WALK = 3.0
const RUN = 5.0
const CAM_DIST = 4.4
const CAM_DIST_PORTRAIT = 6.4 // téléphone en hauteur : on recule pour voir plus large

function angleLerp(a, b, t) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI
  if (d < -Math.PI) d += Math.PI * 2
  return a + d * t
}

export default function Player({ config, room, spawn, facing0 = Math.PI, onDoor }) {
  const group = useRef()
  const speedRef = useRef(0)
  const pos = useRef(new Vector3(...spawn))
  const facing = useRef(facing0)
  const camPos = useRef(new Vector3())
  const target = useRef(new Vector3())
  const first = useRef(true)
  const doorFired = useRef(false)
  const { camera, size } = useThree()
  if (import.meta.env.DEV) window.__pos = pos.current // pour les tests automatiques (absent en production)
  const { circles, boxes } = useMemo(() => collidersFor(room), [room])
  const doors = useMemo(() => doorsFor(room.id, DOOR_Z), [room.id])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const k = input.keys
    // lecture des commandes (clavier + joystick)
    let ix = (k.has('right') ? 1 : 0) - (k.has('left') ? 1 : 0) + input.joy.x
    let iy = (k.has('up') ? 1 : 0) - (k.has('down') ? 1 : 0) + input.joy.y
    const len = Math.hypot(ix, iy)
    if (len > 1) {
      ix /= len
      iy /= len
    }
    const mag = Math.min(1, len)

    const sinY = Math.sin(input.yaw)
    const cosY = Math.cos(input.yaw)
    // avant = loin de la caméra ; droite = à droite de l'écran
    const mx = ix * cosY - iy * sinY
    const mz = -ix * sinY - iy * cosY

    const run = k.has('run') || Math.hypot(input.joy.x, input.joy.y) > 0.92
    const speed = (run ? RUN : WALK) * mag
    const p = pos.current
    p.x += mx * speed * dt
    p.z += mz * speed * dt

    // murs
    const hx = ROOM.w / 2 - 0.5
    const hz = ROOM.d / 2 - 0.5
    p.x = Math.max(-hx, Math.min(hx, p.x))
    p.z = Math.max(-hz, Math.min(hz, p.z))
    // socles
    for (const c of circles) {
      const dx = p.x - c.x
      const dz = p.z - c.z
      const dist = Math.hypot(dx, dz)
      const min = c.r + RADIUS
      if (dist < min) {
        const f = dist === 0 ? 1 : min / dist
        p.x = dist === 0 ? c.x + min : c.x + dx * f
        p.z = c.z + dz * f
      }
    }
    // bancs
    for (const b of boxes) {
      const dx = p.x - b.x
      const dz = p.z - b.z
      const ox = b.hw + RADIUS - Math.abs(dx)
      const oz = b.hd + RADIUS - Math.abs(dz)
      if (ox > 0 && oz > 0) {
        if (ox < oz) p.x += Math.sign(dx || 1) * ox
        else p.z += Math.sign(dz || 1) * oz
      }
    }

    // portes : on y entre en marchant dedans
    if (!doorFired.current && p.x > ROOM.w / 2 - 1.1) {
      const d = doors.find((dd) => Math.abs(p.z - dd.z) < 0.95)
      if (d) {
        doorFired.current = true
        onDoor(d.target)
      }
    }

    if (mag > 0.05) facing.current = angleLerp(facing.current, Math.atan2(mx, mz), Math.min(1, dt * 12))
    speedRef.current += (mag * (run ? 1 : 0.7) - speedRef.current) * Math.min(1, dt * 10)

    if (group.current) {
      group.current.position.copy(p)
      group.current.rotation.y = facing.current
    }

    // caméra à la troisième personne
    const pitch = input.pitch
    const cp = Math.cos(pitch)
    const want = camPos.current
    const CAM = size.width < size.height ? CAM_DIST_PORTRAIT : CAM_DIST
    const tx = p.x + Math.sin(input.yaw) * cp * CAM
    const ty = p.y + 1.15 + Math.sin(pitch) * CAM
    const tz = p.z + Math.cos(input.yaw) * cp * CAM
    const cx = Math.max(-ROOM.w / 2 + 0.3, Math.min(ROOM.w / 2 - 0.3, tx))
    const cz = Math.max(-ROOM.d / 2 + 0.3, Math.min(ROOM.d / 2 - 0.3, tz))
    const cy = Math.max(0.5, Math.min(ROOM.h - 0.4, ty))
    if (first.current) {
      want.set(cx, cy, cz)
      first.current = false
    } else {
      const s = Math.min(1, dt * 10)
      want.x += (cx - want.x) * s
      want.y += (cy - want.y) * s
      want.z += (cz - want.z) * s
    }
    camera.position.copy(want)
    target.current.set(p.x, p.y + 1.5, p.z)
    camera.lookAt(target.current)
  })

  return <Avatar ref={group} config={config} speedRef={speedRef} />
}
