import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import Avatar from '../avatar/Avatar.jsx'
import { live, useBubble, useLive } from '../net/live.js'
import { seatByKey } from '../data/rooms.js'

function angleLerp(a, b, t) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI
  if (d < -Math.PI) d += Math.PI * 2
  return a + d * t
}

// Les autres visiteurs de la salle : leur position arrive 10 fois par seconde, on la lisse.
export default function RemotePlayers() {
  useLive()
  return [...live.players.keys()].map((id) => <Remote key={id} id={id} />)
}

function Remote({ id }) {
  useLive()
  const r = live.players.get(id)
  const group = useRef()
  const speedRef = useRef(0)
  const cur = useRef(r ? { x: r.x, z: r.z, ry: r.ry } : { x: 0, z: 0, ry: 0 })
  const bubble = useBubble(id)

  useFrame((_, dt) => {
    const rr = live.players.get(id)
    const g = group.current
    if (!rr || !g) return
    const s = rr.sit ? seatByKey(rr.sit) : null
    const tx = s ? s.x : rr.tx
    const tz = s ? s.z : rr.tz
    const tr = s ? s.facing : rr.try
    const c = cur.current
    const k = 1 - Math.exp(-dt * 12)
    const dx = (tx - c.x) * k
    const dz = (tz - c.z) * k
    c.x += dx
    c.z += dz
    c.ry = angleLerp(c.ry, tr, k)
    const v = s ? 0 : Math.hypot(dx, dz) / Math.max(dt, 0.001)
    speedRef.current += (Math.min(1, v / 4) - speedRef.current) * Math.min(1, dt * 8)
    g.position.set(c.x, 0, c.z)
    g.rotation.y = c.ry
  })

  if (!r) return null
  return <Avatar ref={group} config={{ ...r.avatar, name: r.name }} speedRef={speedRef} sitting={!!r.sit} bubble={bubble} position={[r.x, 0, r.z]} />
}
