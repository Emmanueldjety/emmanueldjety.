import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import { DOOR_Z, ROOM, wallPose } from './layout.js'
import { doorsFor } from '../data/rooms.js'
import { getTexture } from './textures.js'
import { toggleMusic, useMusic } from '../audio/music.js'
import {
  makeBoardTexture,
  makeCardTexture,
  makeGlowTexture,
  makeTextTexture,
  makeTileTexture,
} from './textTexture.js'

const CHARCOAL = '#2e2f2f'
const WALL = '#f6f5f2'

export default function Room({ room, onOpen, onDoor, onBench }) {
  const { w, d, h } = ROOM

  const floorTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const g = c.getContext('2d')
    g.fillStyle = '#ebe9e4'
    g.fillRect(0, 0, 256, 256)
    g.strokeStyle = '#d4d1ca'
    g.lineWidth = 3
    g.strokeRect(0, 0, 256, 256)
    const t = new CanvasTexture(c)
    t.wrapS = t.wrapT = RepeatWrapping
    t.repeat.set(w / 2, d / 2)
    t.colorSpace = SRGBColorSpace
    t.anisotropy = 8
    return t
  }, [w, d])

  const titleTex = useMemo(
    () =>
      makeTextTexture(
        [
          { text: `PIÈCE ${room.number} · ${room.subtitle.toUpperCase()}`, size: 34, weight: 700, color: '#6b6b66', gap: 8 },
          { text: room.title, size: 130, weight: 800, color: CHARCOAL },
        ],
        { width: 1900, height: 260, pad: 10 },
      ),
    [room],
  )
  useEffect(() => () => {
    floorTex.dispose()
    titleTex.dispose()
  }, [floorTex, titleTex])

  const doors = useMemo(() => doorsFor(room.id, DOOR_Z), [room.id])

  return (
    <group>
      {/* Sol, plafond, murs */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial map={floorTex} roughness={0.5} />
      </mesh>
      <mesh position={[0, h, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#fbfbf9" />
      </mesh>
      <mesh position={[0, h / 2, -d / 2]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={WALL} />
      </mesh>
      <mesh position={[0, h / 2, d / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={WALL} />
      </mesh>
      <mesh position={[-w / 2, h / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[d, h]} />
        <meshStandardMaterial color={WALL} />
      </mesh>
      <mesh position={[w / 2, h / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[d, h]} />
        <meshStandardMaterial color={WALL} />
      </mesh>
      <Skirting w={w} d={d} accent={room.accent} />

      {/* Dalles lumineuses au plafond */}
      {[-8, 0, 8].flatMap((x) =>
        [-4.5, 4.5].map((z) => (
          <mesh key={`${x}${z}`} position={[x, h - 0.01, z]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3.2, 1.2]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        )),
      )}

      {/* Titre de la salle */}
      <mesh position={[0, 4.45, -d / 2 + 0.01]}>
        <planeGeometry args={[7.6, 1.04]} />
        <meshBasicMaterial map={titleTex} transparent toneMapped={false} />
      </mesh>

      {/* Œuvres, panneaux, pastilles */}
      {room.items.map((item, i) => {
        const pose = wallPose(item.wall, item.at, item.y ?? 2.25)
        if (item.type === 'board') return <Board key={`${room.id}-${i}`} item={item} pose={pose} accent={room.accent} />
        if (item.type === 'tile') return <Tile key={`${room.id}-${i}`} item={item} pose={pose} onOpen={onOpen} />
        return <Frame key={`${room.id}-${i}`} item={item} pose={pose} onOpen={onOpen} />
      })}

      {/* Portes vers les autres salles */}
      {doors.map((door) => (
        <Door key={door.target} door={door} onDoor={onDoor} />
      ))}

      {/* Décor et meubles */}
      {room.decor.map((dec, i) => {
        switch (dec.type) {
          case 'bench':
            return <Bench key={i} {...dec} onClick={() => onBench(i)} />
          case 'rug':
            return <Rug key={i} {...dec} />
          case 'plant':
            return <Plant key={i} position={[dec.x, 0, dec.z]} />
          case 'table':
            return <StandingTable key={i} {...dec} onOpen={onOpen} />
          case 'turntable':
            return <Turntable key={i} {...dec} />
          default:
            return <Plinth key={i} position={[dec.x, 0, dec.z]} color={dec.color} />
        }
      })}
    </group>
  )
}

function Skirting({ w, d, accent }) {
  const t = 0.14
  const strips = [
    [[0, -d / 2 + 0.02], [w, 0.04]],
    [[0, d / 2 - 0.02], [w, 0.04]],
    [[-w / 2 + 0.02, 0], [0.04, d]],
    [[w / 2 - 0.02, 0], [0.04, d]],
  ]
  return (
    <group>
      {strips.map(([[x, z], [sx, sz]], i) => (
        <group key={i}>
          <mesh position={[x, t / 2, z]}>
            <boxGeometry args={[sx, t, sz]} />
            <meshStandardMaterial color={CHARCOAL} />
          </mesh>
          <mesh position={[x, t + 0.02, z]}>
            <boxGeometry args={[sx + 0.005, 0.03, sz + 0.005]} />
            <meshBasicMaterial color={accent} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Bench({ x, z, along, len, onClick }) {
  const rot = along === 'x' ? Math.PI / 2 : 0
  const { handlers } = useHover()
  return (
    <group
      position={[x, 0, z]}
      rotation={[0, rot, 0]}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        if (e.delta > 8) return
        onClick()
      }}
    >
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.8, 0.12, len]} />
        <meshStandardMaterial color={CHARCOAL} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0.2, s * (len / 2 - 0.3)]}>
          <boxGeometry args={[0.7, 0.4, 0.12]} />
          <meshStandardMaterial color={CHARCOAL} />
        </mesh>
      ))}
    </group>
  )
}

function Plinth({ position, color }) {
  const cube = useRef()
  useFrame((_, dt) => {
    if (cube.current) {
      cube.current.rotation.y += dt * 0.6
      cube.current.rotation.x += dt * 0.25
    }
  })
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial color="#fbfbf9" />
      </mesh>
      <mesh ref={cube} position={[0, 1.4, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  )
}

// Petite lampe au-dessus d'un cadre, avec son halo de lumière sur le mur.
function Lamp({ w, h }) {
  const glow = useMemo(() => makeGlowTexture(), [])
  useEffect(() => () => glow.dispose(), [glow])
  const top = h / 2 + 0.3
  return (
    <group>
      <mesh position={[0, -0.2, 0.004]}>
        <planeGeometry args={[w + 3.4, h + 3.2]} />
        <meshBasicMaterial map={glow} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, top + 0.12, 0.05]}>
        <boxGeometry args={[0.07, 0.3, 0.07]} />
        <meshStandardMaterial color={CHARCOAL} />
      </mesh>
      <mesh position={[0, top, 0.24]}>
        <boxGeometry args={[0.55, 0.08, 0.16]} />
        <meshStandardMaterial color={CHARCOAL} />
      </mesh>
      <mesh position={[0, top - 0.05, 0.24]}>
        <boxGeometry args={[0.45, 0.02, 0.1]} />
        <meshBasicMaterial color="#fff6d6" toneMapped={false} />
      </mesh>
    </group>
  )
}

function useHover() {
  const [hover, setHover] = useState(false)
  useEffect(() => () => {
    document.body.style.cursor = ''
  }, [])
  return {
    hover,
    handlers: {
      onPointerOver: (e) => {
        e.stopPropagation()
        setHover(true)
        document.body.style.cursor = 'pointer'
      },
      onPointerOut: () => {
        setHover(false)
        document.body.style.cursor = ''
      },
    },
  }
}

function useGrow(ref, hover) {
  useFrame((_, dt) => {
    if (!ref.current) return
    const target = hover ? 1.035 : 1
    const s = ref.current.scale.x
    const n = s + (target - s) * Math.min(1, dt * 12)
    ref.current.scale.set(n, n, 1)
  })
}

// Un cadre : image (ou affiche de projet), bord charbon, lampe, plaque dessous.
function Frame({ item, pose, onOpen }) {
  const [w, h] = item.size
  const pad = Math.min(0.16, Math.max(0.1, w * 0.07))
  const src = getTexture(item.image ?? item.cover?.image)
  const map = useMemo(() => (item.cover ? makeCardTexture(item.cover, src?.image) : src), [item, src])
  useEffect(
    () => () => {
      // libère la mémoire graphique ; l'image reste en cache pour un prochain passage
      map?.dispose()
      if (map !== src) src?.dispose()
    },
    [map, src],
  )

  const group = useRef()
  const { hover, handlers } = useHover()
  useGrow(group, hover)

  const plaqueTex = useMemo(
    () =>
      makeTextTexture(
        [
          { text: item.panel.title, size: 54, weight: 700 },
          { text: item.panel.kind, size: 38, weight: 400, color: '#6b6b66' },
        ],
        { width: 1100, height: 170, pad: 14 },
      ),
    [item],
  )
  useEffect(() => () => plaqueTex.dispose(), [plaqueTex])
  const pw = Math.min(2.6, Math.max(1.6, w + 0.4))

  return (
    <group position={pose.position} rotation={pose.rotation}>
      <Lamp w={w} h={h} />
      <group
        ref={group}
        {...handlers}
        onClick={(e) => {
          e.stopPropagation()
          if (e.delta > 8) return // un glisser pour tourner la caméra ne doit pas ouvrir l'œuvre
          onOpen({ ...item.panel, image: item.image ?? null, cover: item.cover ?? null })
        }}
      >
        <mesh position={[0, 0, 0.04]}>
          <boxGeometry args={[w + pad * 2 + 0.1, h + pad * 2 + 0.1, 0.08]} />
          <meshStandardMaterial color={CHARCOAL} />
        </mesh>
        <mesh position={[0, 0, 0.085]}>
          <planeGeometry args={[w + pad * 2, h + pad * 2]} />
          <meshBasicMaterial color="#fbfbf9" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.09]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={map} toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[-(w + pad * 2) / 2 + pw / 2 + 0.05, -(h / 2 + pad + 0.34), 0.01]}>
        <planeGeometry args={[pw, pw * (170 / 1100)]} />
        <meshBasicMaterial map={plaqueTex} transparent toneMapped={false} />
      </mesh>
    </group>
  )
}

// Pastille de réseau social (cliquable).
function Tile({ item, pose, onOpen }) {
  const [w, h] = item.size
  const tex = useMemo(() => makeTileTexture(item.tile), [item])
  useEffect(() => () => tex.dispose(), [tex])
  const group = useRef()
  const { hover, handlers } = useHover()
  useGrow(group, hover)
  return (
    <group position={pose.position} rotation={pose.rotation}>
      <Lamp w={w} h={h} />
      <group
        ref={group}
        {...handlers}
        onClick={(e) => {
          e.stopPropagation()
          if (e.delta > 8) return
          onOpen({ ...item.panel, image: null, accent: item.tile.color, accentInk: item.tile.ink })
        }}
      >
        <mesh position={[0, 0, 0.04]}>
          <boxGeometry args={[w + 0.22, h + 0.22, 0.08]} />
          <meshStandardMaterial color={CHARCOAL} />
        </mesh>
        <mesh position={[0, 0, 0.09]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

// Panneau de texte accroché au mur (non cliquable).
function Board({ item, pose, accent }) {
  const [w, h] = item.size
  const tex = useMemo(() => makeBoardTexture(item.board, item.size, accent), [item, accent])
  useEffect(() => () => tex.dispose(), [tex])
  return (
    <group position={pose.position} rotation={pose.rotation}>
      <Lamp w={w} h={h} />
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[w + 0.14, h + 0.14, 0.08]} />
        <meshStandardMaterial color={CHARCOAL} />
      </mesh>
      <mesh position={[0, 0, 0.085]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Door({ door, onDoor }) {
  const tex = useMemo(
    () =>
      makeTextTexture(
        [
          { text: door.label, size: 60, weight: 800 },
          { text: door.sub, size: 34, weight: 400, color: '#6b6b66' },
        ],
        { width: 900, height: 170, pad: 14, align: 'center' },
      ),
    [door],
  )
  useEffect(() => () => tex.dispose(), [tex])
  const [hover, setHover] = useState(false)
  const pose = wallPose('right', door.z, 0)
  return (
    <group position={pose.position} rotation={pose.rotation}>
      <mesh position={[0, 1.6, 0.03]}>
        <boxGeometry args={[1.9, 3.2, 0.06]} />
        <meshStandardMaterial color={CHARCOAL} />
      </mesh>
      <mesh
        position={[0, 1.5, 0.07]}
        onPointerOver={() => {
          setHover(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHover(false)
          document.body.style.cursor = ''
        }}
        onClick={(e) => {
          e.stopPropagation()
          if (e.delta > 8) return
          document.body.style.cursor = ''
          onDoor(door.target)
        }}
      >
        <planeGeometry args={[1.6, 3.0]} />
        <meshBasicMaterial color={door.color} toneMapped={false} opacity={hover ? 0.85 : 1} transparent />
      </mesh>
      <mesh position={[0.55, 1.4, 0.09]}>
        <sphereGeometry args={[0.05, 10, 8]} />
        <meshStandardMaterial color="#fbfbf9" />
      </mesh>
      <mesh position={[0, 3.62, 0.01]}>
        <planeGeometry args={[3.6, 0.68]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </group>
  )
}

// Tapis sous un banc.
function Rug({ x, z, w, d, color }) {
  return (
    <group position={[x, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <planeGeometry args={[w, d]} />
        <meshBasicMaterial color="#2e2f2f" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[w - 0.2, d - 0.2]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <planeGeometry args={[w - 0.6, d - 0.6]} />
        <meshBasicMaterial color="#fbfbf9" toneMapped={false} />
      </mesh>
    </group>
  )
}

function Plant({ position }) {
  const leaves = [
    [0, 0.75, 0, 0.26, '#6fa83a'],
    [0.14, 0.55, 0.06, 0.2, '#84bd4b'],
    [-0.14, 0.58, -0.05, 0.21, '#84bd4b'],
    [0.04, 1.0, 0.04, 0.17, '#9bd05a'],
    [-0.1, 0.9, 0.1, 0.15, '#6fa83a'],
  ]
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.25, 0.19, 0.4, 16]} />
        <meshStandardMaterial color="#dd4a8e" />
      </mesh>
      <mesh position={[0, 0.41, 0]}>
        <cylinderGeometry args={[0.23, 0.23, 0.03, 16]} />
        <meshStandardMaterial color="#2e2f2f" />
      </mesh>
      {leaves.map(([x, y, z, r, c], i) => (
        <mesh key={i} position={[x, y, z]} scale={[1, 1.25, 1]}>
          <sphereGeometry args={[r, 14, 12]} />
          <meshStandardMaterial color={c} />
        </mesh>
      ))}
    </group>
  )
}

// Table haute : des cartes avec le nom des collaborateurs. Un clic ouvre la liste.
function StandingTable({ x, z, cards, panel, onOpen }) {
  const { hover, handlers } = useHover()
  const textures = useMemo(
    () =>
      cards.map((name) =>
        makeTextTexture([{ text: name, size: 58, weight: 800 }], { width: 420, height: 240, bg: '#fbfbf9', pad: 26 }),
      ),
    [cards],
  )
  const label = useMemo(
    () => makeTextTexture([{ text: 'Collaborateurs', size: 92, weight: 800, color: '#ffffff' }], { width: 900, height: 150, bg: '#2e2f2f', pad: 24, align: 'center' }),
    [],
  )
  useEffect(
    () => () => {
      textures.forEach((t) => t.dispose())
      label.dispose()
    },
    [textures, label],
  )
  const top = 1.06
  return (
    <group
      position={[x, 0, z]}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        if (e.delta > 8) return
        onOpen({ ...panel, image: null, cover: null })
      }}
    >
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.32, 0.34, 0.06, 20]} />
        <meshStandardMaterial color="#2e2f2f" />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 1.0, 12]} />
        <meshStandardMaterial color="#2e2f2f" />
      </mesh>
      <mesh position={[0, top, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.05, 28]} />
        <meshStandardMaterial color={hover ? '#f5c115' : '#fbfbf9'} />
      </mesh>
      <mesh position={[0, top - 0.04, 0]}>
        <cylinderGeometry args={[0.53, 0.53, 0.03, 28]} />
        <meshStandardMaterial color="#2e2f2f" />
      </mesh>
      {textures.map((tex, i) => {
        const a = (i - (textures.length - 1) / 2) * 1.05
        return (
          <group key={i} position={[Math.sin(a) * 0.3, top + 0.17, Math.cos(a) * 0.3]} rotation={[0, a, 0]}>
            <mesh rotation={[-0.25, 0, 0]}>
              <planeGeometry args={[0.46, 0.263]} />
              <meshBasicMaterial map={tex} toneMapped={false} />
            </mesh>
          </group>
        )
      })}
      <Billboard position={[0, 1.78, 0]}>
        <mesh>
          <planeGeometry args={[1.2, 0.2]} />
          <meshBasicMaterial map={label} toneMapped={false} />
        </mesh>
      </Billboard>
    </group>
  )
}

// Tourne-disque : un clic lance ou coupe la musique de la galerie.
function Turntable({ x, z }) {
  const disc = useRef()
  const { playing, track } = useMusic()
  const { hover, handlers } = useHover()
  const label = useMemo(
    () =>
      makeTextTexture(
        [
          { text: 'Beats · MDA', size: 90, weight: 800, color: '#ffffff' },
        ],
        { width: 800, height: 150, bg: '#2e2f2f', pad: 24, align: 'center' },
      ),
    [],
  )
  const now = useMemo(
    () =>
      makeTextTexture([{ text: track ? `${track.title} · prod. ${track.artist}` : '', size: 50, weight: 600, color: '#2e2f2f' }], {
        width: 1000,
        height: 100,
        bg: '#f5c115',
        pad: 22,
        align: 'center',
      }),
    [track],
  )
  useEffect(
    () => () => {
      label.dispose()
      now.dispose()
    },
    [label, now],
  )
  useFrame((_, dt) => {
    if (disc.current && playing) disc.current.rotation.y += dt * 2.4
  })
  return (
    <group
      position={[x, 0, z]}
      rotation={[0, Math.PI / 2, 0]}
      {...handlers}
      onClick={(e) => {
        e.stopPropagation()
        if (e.delta > 8) return
        toggleMusic()
      }}
    >
      <mesh position={[0, 0.36, 0]}>
        <boxGeometry args={[1.1, 0.72, 0.8]} />
        <meshStandardMaterial color={hover ? '#4a4b4b' : '#2e2f2f'} />
      </mesh>
      <mesh position={[0, 0.73, 0]}>
        <boxGeometry args={[1.0, 0.06, 0.7]} />
        <meshStandardMaterial color="#fbfbf9" />
      </mesh>
      <group ref={disc} position={[-0.12, 0.78, 0]}>
        <mesh>
          <cylinderGeometry args={[0.31, 0.31, 0.02, 32]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
        <mesh position={[0, 0.012, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.01, 24]} />
          <meshBasicMaterial color="#dd4a8e" toneMapped={false} />
        </mesh>
        <mesh position={[0.2, 0.012, 0]}>
          <boxGeometry args={[0.03, 0.005, 0.03]} />
          <meshBasicMaterial color="#ffffff" toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[0.3, 0.8, -0.2]} rotation={[0, 0.5, 0]}>
        <boxGeometry args={[0.36, 0.02, 0.025]} />
        <meshStandardMaterial color="#cfcfca" />
      </mesh>
      {[-0.78, 0.78].map((dx) => (
        <mesh key={dx} position={[dx, 0.42, 0]}>
          <boxGeometry args={[0.34, 0.84, 0.4]} />
          <meshStandardMaterial color="#2e2f2f" />
        </mesh>
      ))}
      {[-0.78, 0.78].map((dx) => (
        <mesh key={`c${dx}`} position={[dx, 0.3, 0.205]}>
          <circleGeometry args={[0.12, 20]} />
          <meshBasicMaterial color="#f5c115" toneMapped={false} />
        </mesh>
      ))}
      <Billboard position={[0, 1.55, 0]}>
        <mesh>
          <planeGeometry args={[1.1, 0.2]} />
          <meshBasicMaterial map={label} toneMapped={false} />
        </mesh>
        {track && (
          <mesh position={[0, -0.22, 0]}>
            <planeGeometry args={[1.5, 0.15]} />
            <meshBasicMaterial map={now} toneMapped={false} />
          </mesh>
        )}
      </Billboard>
    </group>
  )
}
