import { SRGBColorSpace, TextureLoader } from 'three'

// Chargement des images des salles AVANT d'y entrer (la salle s'affiche alors d'un seul coup).
const loader = new TextureLoader()
const promises = new Map()
const loaded = new Map()

export function loadTexture(url) {
  if (!promises.has(url)) {
    promises.set(
      url,
      loader.loadAsync(url).then((t) => {
        t.colorSpace = SRGBColorSpace
        t.anisotropy = 8
        loaded.set(url, t)
        return t
      }),
    )
  }
  return promises.get(url)
}

export const getTexture = (url) => (url ? loaded.get(url) ?? null : null)

export function roomImages(room) {
  return room.items.map((i) => i.image ?? i.cover?.image).filter(Boolean)
}

export const preloadRoom = (room) => Promise.all(roomImages(room).map(loadTexture))
