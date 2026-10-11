// Toutes les options du créateur de personnage sont ici.
// Pour ajouter une teinte, une couleur ou un style : ajoute une ligne.

export const SKIN_TONES = ['#fbd9bd', '#e8b98a', '#c68642', '#9a5f30', '#7a4527', '#59331d']

export const OUTFITS = [
  { id: 'tee', label: 'T-shirt' },
  { id: 'hoodie', label: 'Hoodie' },
  { id: 'jacket', label: 'Veste' },
  { id: 'boubou', label: 'Boubou' },
]

// Couleurs reprises de ta palette (covers "Potentiel Zero")
export const OUTFIT_COLORS = [
  '#84bd4b', // vert
  '#dd4a8e', // rose
  '#f2a52a', // orange
  '#52c2e4', // bleu
  '#d0191a', // rouge
  '#f5c115', // jaune
  '#2e2f2f', // charbon
  '#f4f4f1', // blanc
]

export const HAIRS = [
  { id: 'none', label: 'Rasé' },
  { id: 'short', label: 'Court' },
  { id: 'afro', label: 'Afro' },
  { id: 'locs', label: 'Locks' },
  { id: 'puffs', label: 'Puffs' },
  { id: 'bun', label: 'Chignon' },
  { id: 'quiff', label: 'Banane' },
  { id: 'bob', label: 'Carré' },
]

export const HAIR_COLORS = ['#1b1b1b', '#4a2c1a', '#8a4b1f', '#e8c15a', '#dd4a8e', '#52c2e4']

// Les formes de têtes, les yeux et les bouches sont dans face.js

export const DEFAULT_AVATAR = {
  name: '',
  skin: SKIN_TONES[3],
  outfit: 'hoodie',
  outfitColor: OUTFIT_COLORS[2],
  hair: 'locs',
  hairColor: HAIR_COLORS[0],
  head: 'round',
  eyes: 'dots',
  mouth: 'smile',
}

const KEY = 'galerie-avatar-v2'

export function loadAvatar() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULT_AVATAR, ...JSON.parse(raw) }
  } catch {
    /* navigation privée : on ignore */
  }
  return { ...DEFAULT_AVATAR }
}

export function saveAvatar(avatar) {
  try {
    localStorage.setItem(KEY, JSON.stringify(avatar))
  } catch {
    /* navigation privée : on ignore */
  }
}
