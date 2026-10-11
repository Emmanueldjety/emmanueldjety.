import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

const DARK = '#1b1b1b'
const PANTS = '#2e2f2f'

// Petit personnage construit uniquement avec des formes simples (capsules, sphères).
// `speedRef.current` (0 → 1) fait marcher le personnage ; `showName` affiche le prénom.
export default function Avatar({ config, speedRef, showName = true, ...props }) {
  const legL = useRef()
  const legR = useRef()
  const armL = useRef()
  const armR = useRef()
  const body = useRef()
  const t = useRef(0)

  useFrame((_, delta) => {
    const speed = speedRef?.current ?? 0
    t.current += delta * (3 + speed * 9)
    const swing = Math.sin(t.current) * 0.7 * speed
    if (legL.current) legL.current.rotation.x = swing
    if (legR.current) legR.current.rotation.x = -swing
    if (armL.current) armL.current.rotation.x = -swing * 0.9
    if (armR.current) armR.current.rotation.x = swing * 0.9
    if (body.current) {
      // petit rebond en marchant, léger "souffle" à l'arrêt
      body.current.position.y = Math.abs(Math.sin(t.current)) * 0.05 * speed + Math.sin(t.current * 0.4) * 0.008
    }
  })

  const { skin, outfit, outfitColor, hair, hairColor, face } = config
  const long = outfit === 'boubou'

  return (
    <group {...props}>
      <group ref={body}>
        {/* Jambes */}
        {!long && (
          <>
            <group ref={legL} position={[-0.11, 0.42, 0]}>
              <mesh position={[0, -0.18, 0]}>
                <capsuleGeometry args={[0.09, 0.22, 4, 10]} />
                <meshStandardMaterial color={PANTS} />
              </mesh>
              <mesh position={[0, -0.36, 0.04]}>
                <sphereGeometry args={[0.1, 12, 10]} />
                <meshStandardMaterial color="#f4f4f1" />
              </mesh>
            </group>
            <group ref={legR} position={[0.11, 0.42, 0]}>
              <mesh position={[0, -0.18, 0]}>
                <capsuleGeometry args={[0.09, 0.22, 4, 10]} />
                <meshStandardMaterial color={PANTS} />
              </mesh>
              <mesh position={[0, -0.36, 0.04]}>
                <sphereGeometry args={[0.1, 12, 10]} />
                <meshStandardMaterial color="#f4f4f1" />
              </mesh>
            </group>
          </>
        )}
        {long && (
          <>
            {/* pieds qui dépassent du boubou */}
            <group ref={legL} position={[-0.11, 0.1, 0]}>
              <mesh position={[0, 0, 0.12]}>
                <sphereGeometry args={[0.1, 12, 10]} />
                <meshStandardMaterial color="#f4f4f1" />
              </mesh>
            </group>
            <group ref={legR} position={[0.11, 0.1, 0]}>
              <mesh position={[0, 0, 0.12]}>
                <sphereGeometry args={[0.1, 12, 10]} />
                <meshStandardMaterial color="#f4f4f1" />
              </mesh>
            </group>
          </>
        )}

        {/* Corps / vêtement */}
        <Torso outfit={outfit} color={outfitColor} />

        {/* Bras */}
        <group ref={armL} position={[-0.3, 0.86, 0]}>
          <Arm color={outfitColor} skin={skin} long={outfit !== 'tee'} />
        </group>
        <group ref={armR} position={[0.3, 0.86, 0]}>
          <Arm color={outfitColor} skin={skin} long={outfit !== 'tee'} />
        </group>

        {/* Tête */}
        <group position={[0, 1.2, 0]}>
          <mesh scale={[1, 0.95, 0.97]}>
            <sphereGeometry args={[0.32, 28, 20]} />
            <meshStandardMaterial color={skin} />
          </mesh>
          {/* oreilles */}
          <mesh position={[-0.31, -0.01, 0]}>
            <sphereGeometry args={[0.06, 10, 8]} />
            <meshStandardMaterial color={skin} />
          </mesh>
          <mesh position={[0.31, -0.01, 0]}>
            <sphereGeometry args={[0.06, 10, 8]} />
            <meshStandardMaterial color={skin} />
          </mesh>
          <Face face={face} />
          <Hair hair={hair} color={hairColor} />
        </group>
      </group>

      {/* Ombre ronde au sol (plus légère que de vraies ombres calculées) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.38, 20]} />
        <meshBasicMaterial color="#000" transparent opacity={0.16} depthWrite={false} />
      </mesh>

      {showName && config.name && (
        <Html position={[0, 1.95, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
          <div className="name-tag">{config.name}</div>
        </Html>
      )}
    </group>
  )
}

function Torso({ outfit, color }) {
  if (outfit === 'boubou') {
    return (
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.25, 0.46, 0.88, 20]} />
        <meshStandardMaterial color={color} />
      </mesh>
    )
  }
  return (
    <group>
      <mesh position={[0, 0.68, 0]} scale={outfit === 'hoodie' ? [1.12, 1, 1.12] : [1, 1, 1]}>
        <capsuleGeometry args={[0.25, 0.3, 6, 14]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {outfit === 'hoodie' && (
        <>
          {/* capuche */}
          <mesh position={[0, 0.93, -0.1]} rotation={[0.5, 0, 0]}>
            <torusGeometry args={[0.17, 0.07, 10, 18]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {/* poche */}
          <mesh position={[0, 0.58, 0.29]}>
            <boxGeometry args={[0.3, 0.12, 0.04]} />
            <meshStandardMaterial color={color} roughness={1} />
          </mesh>
        </>
      )}
      {outfit === 'jacket' && (
        <>
          {/* fermeture + col */}
          <mesh position={[0, 0.68, 0.25]}>
            <boxGeometry args={[0.03, 0.55, 0.03]} />
            <meshStandardMaterial color="#f4f4f1" />
          </mesh>
          <mesh position={[0, 0.96, 0]}>
            <torusGeometry args={[0.15, 0.04, 8, 18]} />
            <meshStandardMaterial color="#f4f4f1" />
          </mesh>
        </>
      )}
    </group>
  )
}

function Arm({ color, skin, long }) {
  return (
    <group>
      <mesh position={[0, -0.2, 0]}>
        <capsuleGeometry args={[0.07, long ? 0.24 : 0.12, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, long ? -0.43 : -0.36, 0]}>
        <sphereGeometry args={[0.075, 10, 8]} />
        <meshStandardMaterial color={skin} />
      </mesh>
    </group>
  )
}

// Un demi-cercle : ∩ tel quel, ∪ une fois tourné de 180°
function Arc({ position, radius = 0.05, tube = 0.014, flip = false }) {
  return (
    <mesh position={position} rotation={[0, 0, flip ? Math.PI : 0]}>
      <torusGeometry args={[radius, tube, 8, 14, Math.PI]} />
      <meshStandardMaterial color={DARK} />
    </mesh>
  )
}

function Dot({ position, r = 0.04 }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[r, 12, 10]} />
        <meshStandardMaterial color={DARK} />
      </mesh>
      <mesh position={[r * 0.35, r * 0.4, r * 0.8]}>
        <sphereGeometry args={[r * 0.3, 8, 6]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
    </group>
  )
}

function Face({ face }) {
  const z = 0.3
  const blush = (
    <>
      <mesh position={[-0.19, -0.07, z - 0.07]} rotation={[0, -0.5, 0]}>
        <circleGeometry args={[0.05, 14]} />
        <meshBasicMaterial color="#ff7a8a" transparent opacity={0.35} />
      </mesh>
      <mesh position={[0.19, -0.07, z - 0.07]} rotation={[0, 0.5, 0]}>
        <circleGeometry args={[0.05, 14]} />
        <meshBasicMaterial color="#ff7a8a" transparent opacity={0.35} />
      </mesh>
    </>
  )

  return (
    <group>
      {face === 'smile' && (
        <>
          <Dot position={[-0.11, 0.03, z]} />
          <Dot position={[0.11, 0.03, z]} />
          <Arc position={[0, -0.1, z]} radius={0.06} flip />
          {blush}
        </>
      )}
      {face === 'joy' && (
        <>
          <Arc position={[-0.11, 0.02, z]} radius={0.045} />
          <Arc position={[0.11, 0.02, z]} radius={0.045} />
          <mesh position={[0, -0.1, z - 0.005]} rotation={[0, 0, Math.PI]}>
            <circleGeometry args={[0.07, 14, 0, Math.PI]} />
            <meshStandardMaterial color="#7a1f2b" side={2} />
          </mesh>
          {blush}
        </>
      )}
      {face === 'cool' && (
        <>
          <mesh position={[-0.11, 0.03, z + 0.01]}>
            <boxGeometry args={[0.14, 0.09, 0.03]} />
            <meshStandardMaterial color={DARK} roughness={0.2} />
          </mesh>
          <mesh position={[0.11, 0.03, z + 0.01]}>
            <boxGeometry args={[0.14, 0.09, 0.03]} />
            <meshStandardMaterial color={DARK} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.045, z + 0.01]}>
            <boxGeometry args={[0.06, 0.015, 0.02]} />
            <meshStandardMaterial color={DARK} />
          </mesh>
          <mesh position={[0, -0.11, z - 0.005]}>
            <boxGeometry args={[0.1, 0.015, 0.02]} />
            <meshStandardMaterial color={DARK} />
          </mesh>
        </>
      )}
      {face === 'wink' && (
        <>
          <Arc position={[-0.11, 0.02, z]} radius={0.045} />
          <Dot position={[0.11, 0.03, z]} />
          <Arc position={[0, -0.1, z]} radius={0.06} flip />
          {blush}
        </>
      )}
      {face === 'wow' && (
        <>
          <Dot position={[-0.11, 0.04, z]} r={0.055} />
          <Dot position={[0.11, 0.04, z]} r={0.055} />
          <mesh position={[0, -0.1, z - 0.01]}>
            <circleGeometry args={[0.035, 14]} />
            <meshStandardMaterial color="#7a1f2b" />
          </mesh>
        </>
      )}
    </group>
  )
}

function Hair({ hair, color }) {
  // plusieurs mèches pour les locks, calculées une seule fois
  const locs = useMemo(() => {
    const items = []
    const n = 16
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const len = 0.18 + ((i * 37) % 10) / 10 * 0.18
      items.push({ x: Math.sin(a) * 0.3, z: -Math.cos(a) * 0.27, len, a, front: Math.cos(a) < -0.6 })
    }
    // pas de mèches devant le visage
    return items.filter((l) => !l.front)
  }, [])

  const mat = <meshStandardMaterial color={color} roughness={0.9} />

  if (hair === 'none') return null
  if (hair === 'afro') {
    return (
      <mesh position={[0, 0.21, -0.14]}>
        <sphereGeometry args={[0.38, 24, 18]} />
        {mat}
      </mesh>
    )
  }
  if (hair === 'puffs') {
    return (
      <group>
        <Cap color={color} />
        <mesh position={[-0.2, 0.3, -0.02]}>
          <sphereGeometry args={[0.14, 14, 12]} />
          {mat}
        </mesh>
        <mesh position={[0.2, 0.3, -0.02]}>
          <sphereGeometry args={[0.14, 14, 12]} />
          {mat}
        </mesh>
      </group>
    )
  }
  if (hair === 'locs') {
    return (
      <group>
        <Cap color={color} thick />
        {locs.map((l, i) => (
          <mesh key={i} position={[l.x, 0.02 - l.len / 2, l.z - 0.04]}>
            <capsuleGeometry args={[0.035, l.len, 4, 8]} />
            {mat}
          </mesh>
        ))}
        {/* petites mèches sur le front */}
        <mesh position={[-0.12, 0.2, 0.22]} rotation={[0.9, 0, 0.2]}>
          <capsuleGeometry args={[0.035, 0.1, 4, 8]} />
          {mat}
        </mesh>
        <mesh position={[0.02, 0.23, 0.22]} rotation={[0.9, 0, 0]}>
          <capsuleGeometry args={[0.035, 0.1, 4, 8]} />
          {mat}
        </mesh>
        <mesh position={[0.14, 0.2, 0.2]} rotation={[0.9, 0, -0.25]}>
          <capsuleGeometry args={[0.035, 0.1, 4, 8]} />
          {mat}
        </mesh>
      </group>
    )
  }
  return <Cap color={color} />
}

function Cap({ color, thick = false }) {
  const r = thick ? 0.355 : 0.34
  return (
    <mesh position={[0, 0.02, -0.02]} rotation={[-0.25, 0, 0]}>
      <sphereGeometry args={[r, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  )
}
