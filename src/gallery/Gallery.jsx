import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Room from './Room.jsx'
import Player from './Player.jsx'
import RemotePlayers from './RemotePlayers.jsx'
import Joystick from './Joystick.jsx'
import Panel from './Panel.jsx'
import Chat from './Chat.jsx'
import { bindKeyboard, bindLook, input } from './input.js'
import { DOOR_Z, ROOM } from './layout.js'
import { ROOMS, doorsFor, roomById, seatByKey, seatsFor } from '../data/rooms.js'
import { preloadRoom } from './textures.js'
import { connect, disconnect, joinRoom, live, sendSit, useLive } from '../net/live.js'
import { toggleMusic, useMusic } from '../audio/music.js'

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

const Icon = ({ muted }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
    {muted ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" />}
  </svg>
)

export default function Gallery({ avatar, onEditAvatar }) {
  const wrap = useRef()
  const api = useRef({ sit: null, stand: false, pos: null })
  const [roomId, setRoomId] = useState(null)
  const [entry, setEntry] = useState(START)
  const [fading, setFading] = useState(false)
  const [panel, setPanel] = useState(null)
  const [booting, setBooting] = useState(true)
  const [hint, setHint] = useState(true)
  const [toast, setToast] = useState(null)
  const [nearSeat, setNearSeat] = useState(null)
  const [sitKey, setSitKey] = useState(null)
  const [touch, setTouch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches,
  )
  const room = roomId ? roomById(roomId) : null
  const busy = useRef(false)
  useLive()
  const music = useMusic()

  // l'aide à l'écran disparaît toute seule après quelques secondes
  useEffect(() => {
    if (booting) return undefined
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

  // connexion aux autres visiteurs
  useEffect(() => {
    connect()
    return () => disconnect()
  }, [])

  // à chaque nouvelle salle : on prévient le serveur
  useEffect(() => {
    if (!roomId) return
    joinRoom(roomId, avatar, { x: entry.spawn[0], z: entry.spawn[2], ry: entry.facing })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

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
    if (!panel) return undefined
    const onKey = (e) => e.key === 'Escape' && setPanel(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panel])

  // petit message qui disparaît
  const say = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600)
  }, [])

  // s'asseoir / se lever
  const sit = useCallback(
    (key) => {
      api.current.sit = key
    },
    [],
  )
  const stand = useCallback(() => {
    api.current.stand = true
  }, [])
  const onSit = useCallback((key) => {
    setSitKey(key)
    sendSit(key)
  }, [])

  // une place refusée par le serveur (déjà prise) : on se relève
  useEffect(() => {
    if (!live.deniedAt) return
    api.current.stand = true
    setSitKey(null)
    say('Cette place vient d’être prise.')
  }, [live.deniedAt, say])

  // touche E : s'asseoir ou se lever
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'KeyE' || e.target instanceof HTMLInputElement) return
      if (sitKey) stand()
      else if (nearSeat) sit(nearSeat)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sitKey, nearSeat, sit, stand])

  // clic sur un banc : on s'assoit sur la place libre la plus proche de ce banc
  const onBench = useCallback(
    (benchIndex) => {
      if (!room) return
      const p = api.current.pos
      if (!p || sitKey) return
      const free = seatsFor(room)
        .filter((s) => s.bench === benchIndex)
        .filter((s) => {
          const h = live.seats.get(s.key)
          return !h || h === live.selfId
        })
        .map((s) => ({ s, d: Math.hypot(p.x - s.x, p.z - s.z) }))
        .sort((a, b) => a.d - b.d)
      if (!free.length) return say('Toutes les places de ce banc sont prises.')
      if (free[0].d > 2.6) return say('Approche-toi du banc pour t’asseoir.')
      sit(free[0].s.key)
    },
    [room, sitKey, sit, say],
  )

  // Changement de salle : fondu, puis on arrive par la porte qui mène à la salle d'où l'on vient.
  const go = useCallback((targetId, fromId, viaDoor = true) => {
    if (busy.current) return
    busy.current = true
    setFading(true)
    setPanel(null)
    setSitKey(null)
    setNearSeat(null)
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
  }, [])
  // la salle est chargée : on lève le fondu
  const ready = useCallback(() => {
    setTimeout(() => {
      setFading(false)
      busy.current = false
    }, 80)
  }, [])

  const seatInfo = sitKey ? seatByKey(sitKey) : null
  const online = live.status === 'online'

  return (
    <div className="gallery" ref={wrap}>
      <Canvas flat dpr={[1, 1.75]} camera={{ fov: 58, near: 0.1, far: 80, position: [0, 3, 8] }}>
        <color attach="background" args={['#f6f5f2']} />
        <hemisphereLight args={['#ffffff', '#f0ede6', 3.1]} />
        <directionalLight position={[3, 8, 5]} intensity={1.4} />
        {room && (
          <>
            <Room key={`r-${roomId}`} room={room} onOpen={setPanel} onDoor={(t) => go(t, roomId)} onBench={onBench} />
            <Ready key={`ok-${roomId}`} onReady={ready} />
            <Player
              key={roomId}
              config={avatar}
              room={room}
              spawn={entry.spawn}
              facing0={entry.facing}
              api={api}
              sitKey={sitKey}
              onNearSeat={setNearSeat}
              onSit={onSit}
              onDoor={(t) => go(t, roomId)}
            />
            <RemotePlayers key={`rp-${roomId}`} />
          </>
        )}
      </Canvas>

      {booting && <Loader />}
      <div className={`fade ${fading ? 'on' : ''}`} />

      <header className="hud-top" data-nolook>
        <div className="brand">
          <span className="brand-dot" style={{ background: (room ?? ROOMS[0]).accent }} />
          MDA <em>· galerie virtuelle</em> <span className="beta">bêta</span>
        </div>
        <div className="hud-right">
          <span className={`status ${online ? 'on' : ''}`} title={live.url ? '' : 'Mode solo : le serveur des visiteurs en direct n’est pas branché'}>
            <i />
            {online ? `${live.online} en ligne` : live.url ? 'connexion…' : 'solo'}
          </span>
          {music.count > 0 && (
            <button className="chip chip-music" onClick={toggleMusic} aria-label={music.playing ? 'Couper la musique' : 'Lancer la musique'}>
              <Icon muted={!music.playing} />
              <span className="music-title">{music.track?.title}</span>
            </button>
          )}
          <button className="chip" onClick={onEditAvatar}>
            Mon personnage
          </button>
        </div>
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

      {(nearSeat || sitKey) && !panel && (
        <button className="sit-btn" data-nolook onClick={() => (sitKey ? stand() : sit(nearSeat))}>
          {sitKey ? 'Se lever' : 'S’asseoir'} {!touch && <kbd>E</kbd>}
        </button>
      )}

      {toast && (
        <div className="toast" data-nolook>
          {toast}
        </div>
      )}

      {online && <Chat />}

      {!touch && hint && (
        <p className="hud-help" data-nolook>
          <b>Z Q S D</b> ou flèches pour marcher · <b>Maj</b> pour courir · glisser pour regarder · <b>E</b> pour s’asseoir · <b>Entrée</b> pour discuter
        </p>
      )}
      {touch && <Joystick />}
      {touch && hint && (
        <p className="hud-help hud-help-touch" data-nolook>
          Joystick pour marcher · glisse pour regarder · touche une œuvre ou un banc
        </p>
      )}

      {panel && <Panel item={panel} onClose={() => setPanel(null)} />}
      {seatInfo && null}
    </div>
  )
}
