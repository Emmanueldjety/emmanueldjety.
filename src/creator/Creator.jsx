import { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import Avatar from '../avatar/Avatar.jsx'
import { HAIRS, HAIR_COLORS, OUTFITS, OUTFIT_COLORS, SKIN_TONES } from '../avatar/config.js'
import { EYES, HEADS, MOUTHS } from '../avatar/face.js'
import Thumb from './Thumb.jsx'

function Turntable({ config }) {
  const g = useRef()
  useFrame((_, dt) => {
    // ?still dans l'adresse : personnage de face, immobile (utile pour les captures de test)
    if (import.meta.env.DEV && location.search.includes('still')) {
      if (g.current) g.current.rotation.y = 0.25
      return
    }
    if (g.current) g.current.rotation.y += dt * 0.7
  })
  return (
    <group ref={g} position={[0, -0.85, 0]}>
      <Avatar config={config} showName={false} />
    </group>
  )
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

function Swatches({ colors, value, onChange, label }) {
  return (
    <div className="swatches" role="radiogroup" aria-label={label}>
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          aria-label={c}
          className={`swatch ${value === c ? 'on' : ''}`}
          style={{ background: c }}
          onClick={() => onChange(c)}
        />
      ))}
    </div>
  )
}

function Pills({ options, value, onChange, label }) {
  return (
    <div className="pills" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          className={`pill ${value === o.id ? 'on' : ''}`}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function Creator({ avatar, setAvatar, onEnter }) {
  const set = (patch) => setAvatar((a) => ({ ...a, ...patch }))
  const nameOk = avatar.name.trim().length > 0
  const input = useRef()

  useEffect(() => {
    input.current?.focus({ preventScroll: true })
  }, [])

  const randomize = () =>
    set({
      skin: pick(SKIN_TONES),
      outfit: pick(OUTFITS).id,
      outfitColor: pick(OUTFIT_COLORS),
      hair: pick(HAIRS).id,
      hairColor: pick(HAIR_COLORS),
      head: pick(HEADS).id,
      eyes: pick(EYES).id,
      mouth: pick(MOUTHS).id,
    })

  return (
    <div className="creator">
      <div className="creator-preview">
        <div className="deco deco-a" />
        <div className="deco deco-b" />
        <div className="deco deco-c" />
        <Canvas flat dpr={[1, 2]} camera={{ fov: 32, position: [0, 0.35, 5.2] }}>
          <hemisphereLight args={['#ffffff', '#cfcac0', 2.0]} />
          <directionalLight position={[2, 4, 4]} intensity={1.0} />
          <Turntable config={avatar} />
        </Canvas>
        {nameOk && <div className="preview-name">{avatar.name.trim()}</div>}
      </div>

      <form
        className="creator-panel"
        onSubmit={(e) => {
          e.preventDefault()
          if (nameOk) onEnter()
        }}
      >
        <div className="panel-scroll">
        <p className="eyebrow">MDA · galerie virtuelle</p>
        <h1>Crée ton personnage</h1>
        <p className="lead">Avant d’entrer, choisis qui tu seras dans la galerie.</p>

        <label className="field">
          <span>Ton prénom</span>
          <input
            ref={input}
            value={avatar.name}
            maxLength={16}
            placeholder="ex. Emmanuel"
            autoComplete="off"
            onChange={(e) => set({ name: e.target.value })}
          />
        </label>

        <div className="field">
          <span>Teinte de peau</span>
          <Swatches colors={SKIN_TONES} value={avatar.skin} onChange={(skin) => set({ skin })} label="Teinte de peau" />
        </div>

        <div className="field">
          <span>Vêtements</span>
          <Pills options={OUTFITS} value={avatar.outfit} onChange={(outfit) => set({ outfit })} label="Vêtements" />
          <Swatches colors={OUTFIT_COLORS} value={avatar.outfitColor} onChange={(outfitColor) => set({ outfitColor })} label="Couleur des vêtements" />
        </div>

        <div className="field">
          <span>Coiffure</span>
          <Pills options={HAIRS} value={avatar.hair} onChange={(hair) => set({ hair })} label="Coiffure" />
          {avatar.hair !== 'none' && (
            <Swatches colors={HAIR_COLORS} value={avatar.hairColor} onChange={(hairColor) => set({ hairColor })} label="Couleur des cheveux" />
          )}
        </div>

        <div className="field">
          <span>Forme de tête</span>
          <div className="thumbs" role="radiogroup" aria-label="Forme de tête">
            {HEADS.map((o) => (
              <Thumb key={o.id} kind="head" id={o.id} label={o.label} skin={avatar.skin} active={avatar.head === o.id} onClick={() => set({ head: o.id })} />
            ))}
          </div>
        </div>

        <div className="field">
          <span>Yeux</span>
          <div className="thumbs" role="radiogroup" aria-label="Yeux">
            {EYES.map((o) => (
              <Thumb key={o.id} kind="eyes" id={o.id} label={o.label} skin={avatar.skin} active={avatar.eyes === o.id} onClick={() => set({ eyes: o.id })} />
            ))}
          </div>
        </div>

        <div className="field">
          <span>Bouche</span>
          <div className="thumbs" role="radiogroup" aria-label="Bouche">
            {MOUTHS.map((o) => (
              <Thumb key={o.id} kind="mouth" id={o.id} label={o.label} skin={avatar.skin} active={avatar.mouth === o.id} onClick={() => set({ mouth: o.id })} />
            ))}
          </div>
        </div>

        </div>

        <div className="actions">
          <button type="button" className="ghost" onClick={randomize} aria-label="Personnage au hasard">
            🎲<span className="ghost-label"> Au hasard</span>
          </button>
          <button type="submit" className="primary" disabled={!nameOk}>
            Entrer dans la galerie →
          </button>
        </div>
      </form>
    </div>
  )
}
