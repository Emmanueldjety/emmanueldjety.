import { Suspense, lazy, useEffect, useState } from 'react'
import Creator from './creator/Creator.jsx'
import { loadAvatar, saveAvatar } from './avatar/config.js'

// La galerie (la partie la plus lourde) ne se télécharge qu'au moment d'entrer.
const Gallery = lazy(() => import('./gallery/Gallery.jsx'))

export default function App() {
  const [stage, setStage] = useState('creator')
  const [avatar, setAvatar] = useState(loadAvatar)

  useEffect(() => saveAvatar(avatar), [avatar])

  const finalAvatar = { ...avatar, name: avatar.name.trim() }

  return stage === 'creator' ? (
    <Creator avatar={avatar} setAvatar={setAvatar} onEnter={() => setStage('gallery')} />
  ) : (
    <Suspense fallback={<div className="loader"><p>Chargement…</p></div>}>
      <Gallery avatar={finalAvatar} onEditAvatar={() => setStage('creator')} />
    </Suspense>
  )
}
