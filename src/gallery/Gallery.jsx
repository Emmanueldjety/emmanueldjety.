import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Room from './Room.jsx'
import Player from './Player.jsx'
import Joystick from './Joystick.jsx'
import Panel from './Panel.jsx'
import { bindKeyboard, bindLook, input } from './input.js'
import { DOOR_Z, ROOM } from './layout.js'
import { ROOMS, doorsFor, roomById } from '../data/rooms.js'
import { preloadRoom } from './textures.js'

function Loader() {
  return (
    <div className="loader">
      <div className="loader-bar">
        <div className="loader-bar-run" />
      </div>
      <p>Ouverture de la galerie…</p>
    </div>
  )
}

// Se déclenche quand la salle est entièrement chargée.
function Ready({ onReady }) {
  useEffect(() => {
    onReady()
  }, [onReady])
  return null
}

const START = { spawn: [0, 0, 3.2], facing: Math.PI, yaw: 0 }

export default function Gallery({ avatar, onEditAvatar }) {
  const wrap = useRef()
  const [roomId, setRoomId] = useState(null)
  const [entry, setEntry] = useState(START)
  const [fading, setFading] = useState(false)
  const [panel, setPanel] = useState(null)
  const [booting, setBooting] = useState(true)
  const [hint, setHint] = useState(true)
  const [touch, setTouch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches,
  )
  const room = roomId ? roomById(roomId) : null
  const busy = useRef(false)

  // l'aide à l'écran disparaît toute seule après quelques secondes
  useEffect(() => {
    if (booting) return
    const t = setTimeout(() => setHint(false), 10000)
    return () => clearTimeout(t)
  }, [booting])

  // première salle : on charge ses images, puis on ouvre
  useEffect(() => {
    preloadRoom(roomById('graphisme')).then(() => {
      setRoomId('graphisme')
      setBooting(false)
    })
  }, [])

  useEffect(() => {
    input.yaw = 0
    input.pitch = 0.3
    const offKeys = bindKeyboard()
    const offLook = bindLook(wrap.current)
    const onTouch = () => setTouch(true)
    window.addEventListener('touchstart', onTouch, { once: true, passive: true })
    return () => {
      offKeys()
      offLook()
      window.removeEventListener('touchstart', onTouch)
    }
  }, [])

  useEffect(() => {
    if (!panel) return
    const onKey = (e) => e.key === 'Escape' && setPanel(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panel])

  // Changement de salle : fondu, puis on arrive par la porte qui mène à la salle d'où l'on vient.
  const go = useCallback(
    (targetId, fromId, viaDoor = true) => {
      if (busy.current) return
      busy.current = true
      setFading(true)
      setPanel(null)
      setTimeout(() => {
        input.joy.x = 0
        input.joy.y = 0
        if (viaDoor) {
          const door = doorsFor(targetId, DOOR_Z).find((d) => d.target === fromId)
          input.yaw = Math.PI / 2 // on regarde vers le fond, côté gauche
          setEntry({ spawn: [ROOM.w / 2 - 3.2, 0, door ? door.z : 0], facing: -Math.PI / 2, yaw: Math.PI / 2 })
        } else {
          input.yaw = 0
          setEntry(START)
        }
        // on charge les images de la nouvelle salle avant d'y entrer
        preloadRoom(roomById(targetId)).then(() => setRoomId(targetId))
      }, 320)
    },
    [],
  )
  // la salle est chargée : on lève le fondu
  const ready = useCallback(() => {
    setTimeout(() => {
      setFading(false)
      busy.current = false
    }, 80)
  }, [])

  return (
    <div className="gallery" ref={wrap}>
      <Canvas flat dpr={[1, 1.75]} camera={{ fov: 58, near: 0.1, far: 80, position: [0, 3, 8] }}>
        <color attach="background" args={['#f6f5f2']} />
        <hemisphereLight args={['#ffffff', '#f0ede6', 3.1]} />
        <directionalLight position={[3, 8, 5]} intensity={1.4} />
        {/* chaque salle a sa propre zone de chargement : l'ancienne est retirée proprement */}
        {room && (
          <>
            <Room key={`r-${roomId}`} room={room} onOpen={setPanel} onDoor={(t) => go(t, roomId)} />
            <Ready key={`ok-${roomId}`} onReady={ready} />
          </>
        )}
        {room && (
          <Player
            key={roomId}
            config={avatar}
            room={room}
            spawn={entry.spawn}
            facing0={entry.facing}
            onDoor={(t) => go(t, roomId)}
          />
        )}
      </Canvas>

      {booting && <Loader />}
      <div className={`fade ${fading ? 'on' : ''}`} />

      <header className="hud-top" data-nolook>
        <div className="brand">
          <span className="brand-dot" style={{ background: (room ?? ROOMS[0]).accent }} />
          MDA <em>· galerie virtuelle</em> <span className="beta">bêta</span>
        </div>
        <button className="chip" onClick={onEditAvatar}>
          Mon personnage
        </button>
      </header>

      <nav className="rooms-nav" data-nolook aria-label="Salles">
        {ROOMS.map((r) => (
          <button
            key={r.id}
            className={`room-chip ${r.id === roomId ? 'on' : ''}`}
            style={r.id === roomId ? { background: r.accent, borderColor: r.accent } : undefined}
            onClick={() => r.id !== roomId && go(r.id, roomId, false)}
          >
            <b>{r.number}</b> {r.short ?? r.title}
          </button>
        ))}
      </nav>

      {!touch && hint && (
        <p className="hud-help" data-nolook>
          <b>Z Q S D</b> ou flèches pour marcher · <b>Maj</b> pour courir · glisser pour regarder · cliquer sur une œuvre · entrer dans une porte pour changer de salle
        </p>
      )}
      {touch && <Joystick />}
      {touch && hint && (
        <p className="hud-help hud-help-touch" data-nolook>
          Joystick pour marcher · glisse pour regarder · touche une œuvre
        </p>
      )}

      {panel && <Panel item={panel} onClose={() => setPanel(null)} />}
    </div>
  )
}
