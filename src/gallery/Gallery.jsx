import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import Room from './Room.jsx'
import Player from './Player.jsx'
import Joystick from './Joystick.jsx'
import { bindKeyboard, bindLook, input } from './input.js'

function Loader() {
  const { active, progress } = useProgress()
  const [gone, setGone] = useState(false)
  useEffect(() => {
    if (!active && progress >= 100) {
      const t = setTimeout(() => setGone(true), 250)
      return () => clearTimeout(t)
    }
  }, [active, progress])
  if (gone) return null
  return (
    <div className="loader">
      <div className="loader-bar">
        <div style={{ width: `${Math.max(6, progress)}%` }} />
      </div>
      <p>Ouverture de la galerie…</p>
    </div>
  )
}

export default function Gallery({ avatar, onEditAvatar }) {
  const wrap = useRef()
  const [viewing, setViewing] = useState(null)
  const [toast, setToast] = useState(null)
  const [touch, setTouch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches,
  )

  useEffect(() => {
    input.yaw = 0
    input.pitch = 0.38
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
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    if (!viewing) return
    const onKey = (e) => e.key === 'Escape' && setViewing(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [viewing])

  return (
    <div className="gallery" ref={wrap}>
      <Canvas flat dpr={[1, 1.75]} camera={{ fov: 58, near: 0.1, far: 60, position: [0, 3, 8] }}>
        <color attach="background" args={['#f6f5f2']} />
        <hemisphereLight args={['#ffffff', '#f0ede6', 3.1]} />
        <directionalLight position={[3, 8, 5]} intensity={1.4} />
        <Suspense fallback={null}>
          <Room onOpenArtwork={setViewing} onToast={setToast} />
          <Player config={avatar} />
        </Suspense>
      </Canvas>

      <Loader />

      <header className="hud-top" data-nolook>
        <div className="brand">
          <span className="brand-dot" />
          MDA <em>· galerie virtuelle</em> <span className="beta">bêta</span>
        </div>
        <button className="chip" onClick={onEditAvatar}>
          Modifier mon personnage
        </button>
      </header>

      {!touch && (
        <p className="hud-help" data-nolook>
          <b>Z Q S D</b> ou flèches pour marcher · <b>Maj</b> pour courir · glisser pour regarder · cliquer sur une œuvre
        </p>
      )}
      {touch && <Joystick />}
      {touch && (
        <p className="hud-help hud-help-touch" data-nolook>
          Joystick pour marcher · glisse pour regarder · touche une œuvre
        </p>
      )}

      {toast && (
        <div className="toast" data-nolook>
          {toast}
        </div>
      )}

      {viewing && (
        <div className="viewer" data-nolook onClick={() => setViewing(null)}>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={viewing.file} alt={viewing.title} />
            <figcaption>
              <strong>{viewing.title}</strong>
              <span>{viewing.kind}</span>
              <p>{viewing.description}</p>
            </figcaption>
          </figure>
          <button className="viewer-close" onClick={() => setViewing(null)} aria-label="Fermer">
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
