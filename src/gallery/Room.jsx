import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import { ARTWORKS } from '../data/artworks.js'
import { makeTextTexture } from './textTexture.js'

// Dimensions de la pièce (en mètres)
export const ROOM = { w: 22, d: 16, h: 5 }

// Obstacles pour le personnage : cercles (socles) et boîtes (banc)
export const CIRCLES = [
  { x: 5.5, z: -5, r: 0.55 },
  { x: 5.5, z: 0, r: 0.55 },
  { x: 5.5, z: 5, r: 0.55 },
]
export const BOXES = [{ x: -5.5, z: 0, hw: 0.45, hd: 1.5 }]

const CHARCOAL = '#2e2f2f'
const WALL = '#f6f5f2'

const DOORS = [
  { id: 'portfolio', label: 'Portfolio', sub: 'Projets web & présentations', color: '#52c2e4', z: -4.5 },
  { id: 'reseaux', label: 'Réseaux sociaux', sub: 'Liens & contenu', color: '#dd4a8e', z: 0 },
  { id: 'apropos', label: 'À propos', sub: 'Qui je suis', color: '#f2a52a', z: 4.5 },
]

export default function Room({ onOpenArtwork, onToast }) {
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
          { text: 'PIÈCE 01', size: 44, weight: 600, color: '#8a8a85', gap: 18 },
          { text: 'Graphisme', size: 190, weight: 800, color: CHARCOAL, gap: 14 },
          { text: 'Covers, identités & collages', size: 54, weight: 400, color: '#5c5c58' },
        ],
        { width: 1600, height: 520, pad: 30 },
      ),
    [],
  )

  const left = ARTWORKS.slice(0, 3)
  const back = ARTWORKS.slice(3)
  const leftZ = [-4.5, 0, 4.5]
  const backX = [-6, 6]

  return (
    <group>
      {/* Sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial map={floorTex} roughness={0.5} />
      </mesh>
      {/* Plafond */}
      <mesh position={[0, h, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#fbfbf9" />
      </mesh>
      {/* Murs */}
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
      {/* Plinthes */}
      <Skirting w={w} d={d} />

      {/* Dalles lumineuses au plafond */}
      {[-6, 0, 6].flatMap((x) =>
        [-4, 4].map((z) => (
          <mesh key={`${x}${z}`} position={[x, h - 0.01, z]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3.2, 1.2]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        )),
      )}

      {/* Titre de la pièce, mur du fond */}
      <mesh position={[0, 2.5, -d / 2 + 0.01]}>
        <planeGeometry args={[8, 2.6]} />
        <meshBasicMaterial map={titleTex} transparent toneMapped={false} />
      </mesh>

      {/* Œuvres */}
      {left.map((art, i) => (
        <Artwork key={art.id} art={art} position={[-w / 2 + 0.02, 2.3, leftZ[i]]} rotation={[0, Math.PI / 2, 0]} onOpen={onOpenArtwork} />
      ))}
      {back.map((art, i) => (
        <Artwork key={art.id} art={art} position={[backX[i], 2.3, -d / 2 + 0.02]} rotation={[0, 0, 0]} onOpen={onOpenArtwork} />
      ))}

      {/* Portes vers les autres pièces (bientôt) */}
      {DOORS.map((door) => (
        <Door key={door.id} door={door} onToast={onToast} />
      ))}

      {/* Banc */}
      <group position={[-5.5, 0, 0]}>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.8, 0.12, 2.8]} />
          <meshStandardMaterial color={CHARCOAL} />
        </mesh>
        {[-1.2, 1.2].map((z) => (
          <mesh key={z} position={[0, 0.2, z]}>
            <boxGeometry args={[0.7, 0.4, 0.12]} />
            <meshStandardMaterial color={CHARCOAL} />
          </mesh>
        ))}
      </group>

      {/* Socles avec carrés de couleur (clin d'œil à "Potentiel Zero") */}
      <Plinth position={[5.5, 0, -5]} color="#84bd4b" />
      <Plinth position={[5.5, 0, 5]} color="#dd4a8e" />
      <Plinth position={[5.5, 0, 0]} color="#f2a52a" />
    </group>
  )
}

function Skirting({ w, d }) {
  const t = 0.14
  return (
    <group>
      <mesh position={[0, t / 2, -d / 2 + 0.02]}>
        <boxGeometry args={[w, t, 0.04]} />
        <meshStandardMaterial color={CHARCOAL} />
      </mesh>
      <mesh position={[0, t / 2, d / 2 - 0.02]}>
        <boxGeometry args={[w, t, 0.04]} />
        <meshStandardMaterial color={CHARCOAL} />
      </mesh>
      <mesh position={[-w / 2 + 0.02, t / 2, 0]}>
        <boxGeometry args={[0.04, t, d]} />
        <meshStandardMaterial color={CHARCOAL} />
      </mesh>
      <mesh position={[w / 2 - 0.02, t / 2, 0]}>
        <boxGeometry args={[0.04, t, d]} />
        <meshStandardMaterial color={CHARCOAL} />
      </mesh>
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

// Un cadre : bord charbon, passe-partout blanc, image, et petite plaque dessous.
function Artwork({ art, position, rotation, onOpen }) {
  const S = 2.0
  const tex = useTexture(art.file)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 8
  const group = useRef()
  const [hover, setHover] = useState(false)

  const plaque = useMemo(
    () =>
      makeTextTexture(
        [
          { text: art.title, size: 54, weight: 700 },
          { text: art.kind, size: 38, weight: 400, color: '#6b6b66' },
        ],
        { width: 900, height: 170, pad: 14 },
      ),
    [art],
  )

  useFrame((_, dt) => {
    if (!group.current) return
    const target = hover ? 1.035 : 1
    const s = group.current.scale.x
    const n = s + (target - s) * Math.min(1, dt * 12)
    group.current.scale.set(n, n, 1)
  })

  useEffect(() => () => {
    document.body.style.cursor = ''
  }, [])

  return (
    <group position={position} rotation={rotation}>
      <group
        ref={group}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHover(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHover(false)
          document.body.style.cursor = ''
        }}
        onClick={(e) => {
          e.stopPropagation()
          // un glisser pour tourner la caméra ne doit pas ouvrir l'œuvre
          if (e.delta > 8) return
          onOpen(art)
        }}
      >
        <mesh position={[0, 0, 0.04]}>
          <boxGeometry args={[S + 0.5, S + 0.5, 0.08]} />
          <meshStandardMaterial color={CHARCOAL} />
        </mesh>
        <mesh position={[0, 0, 0.085]}>
          <planeGeometry args={[S + 0.36, S + 0.36]} />
          <meshBasicMaterial color="#fbfbf9" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.09]}>
          <planeGeometry args={[S, S]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </group>
      <mesh position={[-S / 2 + 0.55, -S / 2 - 0.58, 0.01]}>
        <planeGeometry args={[1.8, 0.34]} />
        <meshBasicMaterial map={plaque} transparent toneMapped={false} />
      </mesh>
    </group>
  )
}

function Door({ door, onToast }) {
  const tex = useMemo(
    () =>
      makeTextTexture(
        [
          { text: door.label, size: 56, weight: 800 },
          { text: `${door.sub} · bientôt`, size: 32, weight: 400, color: '#6b6b66' },
        ],
        { width: 800, height: 170, pad: 14, align: 'center' },
      ),
    [door],
  )
  const [hover, setHover] = useState(false)
  return (
    <group position={[ROOM.w / 2 - 0.02, 0, door.z]} rotation={[0, -Math.PI / 2, 0]}>
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
          onToast(`${door.label} — cette pièce ouvre bientôt.`)
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
        <planeGeometry args={[3.2, 0.68]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </group>
  )
}
