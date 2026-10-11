import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { CanvasTexture, LatheGeometry, SRGBColorSpace, Vector2 } from 'three'
import { HEADS, drawFace, shade } from './face.js'

const PANTS = '#2e2f2f'
const R = 0.32 // rayon de base de la tête

// Matière « aplat » : couleur unie, sans ombres, comme une illustration vectorielle.
function Flat({ color }) {
  return <meshBasicMaterial color={color} toneMapped={false} />
}

// Petit personnage en aplats de couleur. `speedRef.current` (0 → 1) le fait marcher.
export default function Avatar({ config, speedRef, showName = true, sitting = false, bubble = null, ...props }) {
  const legL = useRef()
  const legR = useRef()
  const armL = useRef()
  const armR = useRef()
  const body = useRef()
  const t = useRef(0)
  const sitAmt = useRef(0)
  const sitGoal = useRef(0)
  sitGoal.current = sitting ? 1 : 0

  useFrame((_, delta) => {
    const speed = speedRef?.current ?? 0
    t.current += delta * (3 + speed * 9)
    // assis : 0 = debout, 1 = assis (transition douce)
    sitAmt.current += (sitGoal.current - sitAmt.current) * Math.min(1, delta * 10)
    const sa = sitAmt.current
    const swing = Math.sin(t.current) * 0.7 * speed * (1 - sa)
    if (legL.current) legL.current.rotation.x = swing - 1.3 * sa
    if (legR.current) legR.current.rotation.x = -swing - 1.3 * sa
    if (armL.current) armL.current.rotation.x = -swing * 0.9 - 0.35 * sa
    if (armR.current) armR.current.rotation.x = swing * 0.9 - 0.35 * sa
    if (body.current) {
      // petit rebond en marchant, léger « souffle » à l'arrêt ; le corps monte sur le banc quand on s'assoit
      body.current.position.y = (Math.abs(Math.sin(t.current)) * 0.05 * speed + Math.sin(t.current * 0.4) * 0.008) * (1 - sa) + 0.2 * sa
    }
  })

  const { skin, outfit, outfitColor } = config
  const long = outfit === 'boubou'
  const skinDark = useMemo(() => shade(skin, 0.12), [skin])
  const cloth = outfitColor
  const clothDark = useMemo(() => shade(outfitColor, 0.14), [outfitColor])
  const pantsDark = useMemo(() => shade(PANTS, 0.25), [])

  return (
    <group {...props}>
      <group ref={body}>
        {/* Jambes */}
        {!long ? (
          <>
            <group ref={legL} position={[-0.11, 0.42, 0]}>
              <mesh position={[0, -0.18, 0]}>
                <capsuleGeometry args={[0.09, 0.22, 4, 10]} />
                <Flat color={PANTS} />
              </mesh>
              <mesh position={[0, -0.36, 0.04]} scale={[1, 0.8, 1.2]}>
                <sphereGeometry args={[0.1, 12, 10]} />
                <Flat color="#f4f4f1" />
              </mesh>
            </group>
            <group ref={legR} position={[0.11, 0.42, 0]}>
              <mesh position={[0, -0.18, 0]}>
                <capsuleGeometry args={[0.09, 0.22, 4, 10]} />
                <Flat color={pantsDark} />
              </mesh>
              <mesh position={[0, -0.36, 0.04]} scale={[1, 0.8, 1.2]}>
                <sphereGeometry args={[0.1, 12, 10]} />
                <Flat color="#dcdcd6" />
              </mesh>
            </group>
          </>
        ) : (
          <>
            <group ref={legL} position={[-0.11, 0.1, 0]}>
              <mesh position={[0, 0, 0.12]} scale={[1, 0.8, 1.2]}>
                <sphereGeometry args={[0.1, 12, 10]} />
                <Flat color="#f4f4f1" />
              </mesh>
            </group>
            <group ref={legR} position={[0.11, 0.1, 0]}>
              <mesh position={[0, 0, 0.12]} scale={[1, 0.8, 1.2]}>
                <sphereGeometry args={[0.1, 12, 10]} />
                <Flat color="#dcdcd6" />
              </mesh>
            </group>
          </>
        )}

        {/* Corps / vêtement */}
        <Torso outfit={outfit} color={cloth} dark={clothDark} />

        {/* Cou */}
        <mesh position={[0, 0.97, 0]}>
          <cylinderGeometry args={[0.085, 0.095, 0.14, 12]} />
          <Flat color={skinDark} />
        </mesh>

        {/* Bras */}
        <group ref={armL} position={[-0.3, 0.86, 0]}>
          <Arm color={clothDark} skin={skin} long={outfit !== 'tee'} />
        </group>
        <group ref={armR} position={[0.3, 0.86, 0]}>
          <Arm color={clothDark} skin={skin} long={outfit !== 'tee'} />
        </group>

        {/* Tête */}
        <Head config={config} />
      </group>

      {/* Ombre ronde au sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.38, 20]} />
        <meshBasicMaterial color="#000" transparent opacity={0.16} depthWrite={false} />
      </mesh>

      {showName && config.name && <NameTag name={config.name} position={[0, 1.98, 0]} />}
      {bubble && <ChatBubble text={bubble} position={[0, 2.3, 0]} />}
    </group>
  )
}

function Torso({ outfit, color, dark }) {
  if (outfit === 'boubou') {
    return (
      <group>
        <mesh position={[0, 0.44, 0]}>
          <cylinderGeometry args={[0.25, 0.46, 0.88, 20]} />
          <Flat color={color} />
        </mesh>
        {/* broderie au col et ourlet */}
        <mesh position={[0, 0.88, 0]}>
          <cylinderGeometry args={[0.255, 0.27, 0.08, 20]} />
          <Flat color={dark} />
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.462, 0.465, 0.06, 20]} />
          <Flat color={dark} />
        </mesh>
      </group>
    )
  }
  return (
    <group>
      <mesh position={[0, 0.68, 0]} scale={outfit === 'hoodie' ? [1.12, 1, 1.12] : [1, 1, 1]}>
        <capsuleGeometry args={[0.25, 0.3, 6, 14]} />
        <Flat color={color} />
      </mesh>
      {outfit === 'hoodie' && (
        <>
          <mesh position={[0, 0.93, -0.1]} rotation={[0.5, 0, 0]}>
            <torusGeometry args={[0.17, 0.07, 10, 18]} />
            <Flat color={dark} />
          </mesh>
          <mesh position={[0, 0.56, 0.29]}>
            <boxGeometry args={[0.32, 0.13, 0.04]} />
            <Flat color={dark} />
          </mesh>
        </>
      )}
      {outfit === 'jacket' && (
        <>
          <mesh position={[0, 0.68, 0.255]}>
            <boxGeometry args={[0.035, 0.55, 0.03]} />
            <Flat color="#f4f4f1" />
          </mesh>
          <mesh position={[0, 0.96, 0]}>
            <torusGeometry args={[0.15, 0.045, 8, 18]} />
            <Flat color="#f4f4f1" />
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
        <Flat color={color} />
      </mesh>
      <mesh position={[0, long ? -0.43 : -0.36, 0]}>
        <sphereGeometry args={[0.075, 10, 8]} />
        <Flat color={skin} />
      </mesh>
    </group>
  )
}

// Silhouette « poire » : étroite en haut, large à la mâchoire.
function usePearGeometry() {
  return useMemo(() => {
    const pts = []
    for (let i = 0; i <= 28; i++) {
      const a = (i / 28) * Math.PI // 0 (bas) → π (haut)
      const y = -Math.cos(a) * R
      const r = Math.sin(a) * R * (1 + 0.2 * (-y / R))
      pts.push(new Vector2(Math.max(r, 0.0001), y))
    }
    return new LatheGeometry(pts, 28)
  }, [])
}

function Head({ config }) {
  const { skin, hair, hairColor, head, eyes, mouth } = config
  const h = HEADS.find((x) => x.id === head) ?? HEADS[0]
  const pear = usePearGeometry()
  const skinDark = useMemo(() => shade(skin, 0.12), [skin])

  // Le visage est dessiné une fois sur une image, puis collé sur la tête.
  const faceTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 420
    drawFace(c, { eyes, mouth, skin })
    const t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace
    t.anisotropy = 4
    return t
  }, [eyes, mouth, skin])
  useEffect(() => () => faceTex.dispose(), [faceTex])

  const faceH = 0.42
  const arc = h.w / h.rad

  return (
    <group position={[0, 1.2, 0]}>
      {/* crâne */}
      {h.geo === 'sphere' && (
        <mesh scale={[h.sx, h.sy, h.sz]}>
          <sphereGeometry args={[R, 32, 24]} />
          <Flat color={skin} />
        </mesh>
      )}
      {h.geo === 'box' && (
        <RoundedBox args={[2 * R * h.sx, 2 * R * h.sy, 2 * R * h.sz]} radius={0.2} smoothness={4}>
          <Flat color={skin} />
        </RoundedBox>
      )}
      {h.geo === 'pear' && (
        <mesh geometry={pear} scale={[h.sx, h.sy, h.sz]}>
          <Flat color={skin} />
        </mesh>
      )}
      {h.geo === 'capsule' && (
        <mesh scale={[h.sx, 1, h.sz]}>
          <capsuleGeometry args={[R * 0.9, R * 0.5 * h.sy, 10, 24]} />
          <Flat color={skin} />
        </mesh>
      )}

      {/* oreilles */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (R * h.sx + 0.005), -0.02, -0.01]} scale={[0.6, 1, 0.8]}>
          <sphereGeometry args={[0.065, 12, 10]} />
          <Flat color={skinDark} />
        </mesh>
      ))}

      {/* visage : yeux et bouche, courbé pour épouser la tête */}
      <mesh position={[0, 0.0, h.frontZ - h.rad + 0.002]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[h.rad, h.rad, faceH, 32, 1, true, -arc / 2, arc]} />
        <meshBasicMaterial map={faceTex} transparent toneMapped={false} depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
      </mesh>

      {/* coiffure : suit les proportions de la tête */}
      <group scale={[h.sx * (h.hair ?? 1), h.sy * (h.hair ?? 1), h.sz * (h.hair ?? 1)]}>
        <Hair hair={hair} color={hairColor} />
      </group>
    </group>
  )
}

function Hair({ hair, color }) {
  const dark = useMemo(() => shade(color, 0.1), [color])
  // mèches des locks, calculées une seule fois
  const locs = useMemo(() => {
    const items = []
    const n = 16
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const len = 0.18 + (((i * 37) % 10) / 10) * 0.18
      items.push({ x: Math.sin(a) * 0.3, z: -Math.cos(a) * 0.27, len, front: Math.cos(a) < -0.6 })
    }
    // pas de mèches devant le visage
    return items.filter((l) => !l.front)
  }, [])

  switch (hair) {
    case 'none':
      return null
    case 'afro':
      return (
        <mesh position={[0, 0.21, -0.14]}>
          <sphereGeometry args={[0.38, 24, 18]} />
          <Flat color={color} />
        </mesh>
      )
    case 'puffs':
      return (
        <group>
          <Cap color={color} />
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.2, 0.3, -0.02]}>
              <sphereGeometry args={[0.14, 14, 12]} />
              <Flat color={color} />
            </mesh>
          ))}
        </group>
      )
    case 'bun':
      return (
        <group>
          <Cap color={color} />
          <mesh position={[0, 0.37, -0.06]}>
            <sphereGeometry args={[0.12, 14, 12]} />
            <Flat color={dark} />
          </mesh>
        </group>
      )
    case 'quiff':
      return (
        <group>
          <Cap color={color} />
          <mesh position={[0.02, 0.31, 0.1]} rotation={[0, 0, Math.PI / 2 - 0.25]}>
            <capsuleGeometry args={[0.11, 0.26, 6, 14]} />
            <Flat color={dark} />
          </mesh>
        </group>
      )
    case 'bob':
      return (
        <group>
          <Cap color={color} thick />
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.285, -0.08, -0.02]}>
              <capsuleGeometry args={[0.085, 0.3, 6, 12]} />
              <Flat color={color} />
            </mesh>
          ))}
          <mesh position={[0, -0.06, -0.27]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.1, 0.4, 6, 12]} />
            <Flat color={dark} />
          </mesh>
        </group>
      )
    case 'locs':
      return (
        <group>
          <Cap color={color} thick />
          {locs.map((l, i) => (
            <mesh key={i} position={[l.x, 0.02 - l.len / 2, l.z - 0.04]}>
              <capsuleGeometry args={[0.035, l.len, 4, 8]} />
              <Flat color={dark} />
            </mesh>
          ))}
          {[
            [-0.12, 0.2, 0.22, 0.2],
            [0.02, 0.23, 0.22, 0],
            [0.14, 0.2, 0.2, -0.25],
          ].map(([x, y, z, rz], i) => (
            <mesh key={i} position={[x, y, z]} rotation={[0.9, 0, rz]}>
              <capsuleGeometry args={[0.035, 0.1, 4, 8]} />
              <Flat color={dark} />
            </mesh>
          ))}
        </group>
      )
    default:
      return <Cap color={color} />
  }
}

function Cap({ color, thick = false }) {
  const r = thick ? 0.355 : 0.34
  return (
    <mesh position={[0, 0.02, -0.02]} rotation={[-0.25, 0, 0]}>
      <sphereGeometry args={[r, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      <Flat color={color} />
    </mesh>
  )
}

// Étiquette du prénom au-dessus de la tête : une petite image dessinée une fois, qui fait toujours face à la caméra.
function NameTag({ name, position }) {
  const { tex, ratio } = useMemo(() => {
    const H = 72
    const font = `700 38px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`
    const probe = document.createElement('canvas').getContext('2d')
    probe.font = font
    const W = Math.ceil(probe.measureText(name).width) + 56
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const g = c.getContext('2d')
    g.fillStyle = 'rgba(46,47,47,0.92)'
    g.beginPath()
    g.roundRect(0, 0, W, H, H / 2)
    g.fill()
    g.fillStyle = '#fff'
    g.font = font
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText(name, W / 2, H / 2 + 2)
    const t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace
    return { tex: t, ratio: W / H }
  }, [name])
  useEffect(() => () => tex.dispose(), [tex])
  const h = 0.17
  return (
    <sprite position={position} scale={[h * ratio, h, 1]} renderOrder={10}>
      <spriteMaterial map={tex} transparent depthTest={false} toneMapped={false} />
    </sprite>
  )
}

// Bulle de discussion au-dessus de la tête (disparaît toute seule).
function ChatBubble({ text, position }) {
  const { tex, w, h } = useMemo(() => {
    const font = `600 34px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`
    const probe = document.createElement('canvas').getContext('2d')
    probe.font = font
    const maxW = 520
    const lines = []
    let line = ''
    for (const word of text.split(' ')) {
      const test = line ? `${line} ${word}` : word
      if (probe.measureText(test).width > maxW && line) {
        lines.push(line)
        line = word
      } else line = test
    }
    if (line) lines.push(line)
    const shown = lines.slice(0, 3)
    const tw = Math.min(maxW, Math.max(...shown.map((l) => probe.measureText(l).width))) + 52
    const th = shown.length * 44 + 36
    const tail = 22
    const c = document.createElement('canvas')
    c.width = Math.ceil(tw)
    c.height = th + tail
    const g = c.getContext('2d')
    g.fillStyle = '#ffffff'
    g.strokeStyle = '#2e2f2f'
    g.lineWidth = 4
    g.beginPath()
    g.roundRect(3, 3, tw - 6, th - 6, 22)
    g.fill()
    g.stroke()
    g.beginPath()
    g.moveTo(tw / 2 - 12, th - 4)
    g.lineTo(tw / 2, th + tail - 3)
    g.lineTo(tw / 2 + 12, th - 4)
    g.closePath()
    g.fill()
    g.fillStyle = '#ffffff'
    g.fillRect(tw / 2 - 11, th - 8, 22, 6)
    g.fillStyle = '#2e2f2f'
    g.font = font
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    shown.forEach((l, i) => g.fillText(l, tw / 2, 18 + 22 + i * 44))
    const t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace
    return { tex: t, w: c.width, h: c.height }
  }, [text])
  useEffect(() => () => tex.dispose(), [tex])
  const k = 0.0042
  return (
    <sprite position={[position[0], position[1] + (h * k) / 2, position[2]]} scale={[w * k, h * k, 1]} renderOrder={11}>
      <spriteMaterial map={tex} transparent depthTest={false} toneMapped={false} />
    </sprite>
  )
}
