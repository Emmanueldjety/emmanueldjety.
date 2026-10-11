import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import Avatar from '../avatar/Avatar.jsx'
import { input } from './input.js'
import { ROOM, DOOR_Z } from './layout.js'
import { collidersFor, doorsFor, seatByKey, seatsFor } from '../data/rooms.js'
import { live, sendMove, useBubble } from '../net/live.js'

const RADIUS = 0.35
const WALK = 3.0
const RUN = 5.0
const CAM_DIST = 4.4
const CAM_DIST_PORTRAIT = 6.4 // téléphone en hauteur : on recule pour voir plus large
const SEAT_REACH = 1.7 // distance à partir de laquelle on peut s'asseoir

function angleLerp(a, b, t) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI
  if (d < -Math.PI) d += Math.PI * 2
  return a + d * t
}

// `api` : petit canal de commandes entre l'interface et le personnage (s'asseoir, se lever).
export default function Player({ config, room, spawn, facing0 = Math.PI, onDoor, api, sitKey, onNearSeat, onSit }) {
  const group = useRef()
  const speedRef = useRef(0)
  const pos = useRef(new Vector3(...spawn))
  const facing = useRef(facing0)
  const camPos = useRef(new Vector3())
  const target = useRef(new Vector3())
  const first = useRef(true)
  const doorFired = useRef(false)
  const seat = useRef(null) // place occupée
  const lastNear = useRef(null)
  const { camera, size } = useThree()
  const { circles, boxes } = useMemo(() => collidersFor(room), [room])
  const doors = useMemo(() => doorsFor(room.id, DOOR_Z), [room.id])
  const seats = useMemo(() => seatsFor(room), [room])
  const bubble = useBubble(live.selfId)
  if (import.meta.env.DEV) window.__pos = pos.current // pour les tests automatiques (absent en production)

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
    const p = pos.current
    api.current.pos = p

    // --- s'asseoir / se lever ---
    const req = api.current.sit
    if (req && !seat.current) {
      api.current.sit = null
      const s = seatByKey(req)
      const holder = s && live.seats.get(s.key)
      if (s && (!holder || holder === live.selfId)) {
        seat.current = s
        p.set(s.x, 0, s.z)
        facing.current = s.facing
        onSit(s.key)
      }
    }
    if (seat.current && (mag > 0.35 || api.current.stand)) {
      const s = seat.current
      api.current.stand = false
      seat.current = null
      p.set(s.stand.x, 0, s.stand.z)
      onSit(null)
      sendMove(p.x, p.z, facing.current, 0, true)
    }
    api.current.stand = false

    const sitting = !!seat.current
    if (!sitting) {
      const sinY = Math.sin(input.yaw)
      const cosY = Math.cos(input.yaw)
      // avant = loin de la caméra ; droite = à droite de l'écran
      const mx = ix * cosY - iy * sinY
      const mz = -ix * sinY - iy * cosY
      const run = k.has('run') || Math.hypot(input.joy.x, input.joy.y) > 0.92
      const speed = (run ? RUN : WALK) * mag
      p.x += mx * speed * dt
      p.z += mz * speed * dt

      // murs
      const hx = ROOM.w / 2 - 0.5
      const hz = ROOM.d / 2 - 0.5
      p.x = Math.max(-hx, Math.min(hx, p.x))
      p.z = Math.max(-hz, Math.min(hz, p.z))
      // socles, tables, plantes
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

      // place assise la plus proche (et libre)
      let near = null
      let best = SEAT_REACH
      for (const s of seats) {
        const holder = live.seats.get(s.key)
        if (holder && holder !== live.selfId) continue
        const d = Math.hypot(p.x - s.x, p.z - s.z)
        if (d < best) {
          best = d
          near = s.key
        }
      }
      if (near !== lastNear.current) {
        lastNear.current = near
        onNearSeat(near)
      }
    } else {
      speedRef.current += (0 - speedRef.current) * Math.min(1, dt * 10)
      if (lastNear.current) {
        lastNear.current = null
        onNearSeat(null)
      }
    }

    if (live.status === 'online') sendMove(p.x, p.z, facing.current, speedRef.current)

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

  return <Avatar ref={group} config={config} speedRef={speedRef} sitting={!!sitKey} bubble={bubble} />
}
