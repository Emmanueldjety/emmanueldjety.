// Filtre simple pour les prénoms et les messages (insultes courantes en français et en anglais).
// Pour ajouter un mot : ajoute-le dans la liste, en minuscules et sans accents.
const WORDS = [
  'putain', 'pute', 'salope', 'connard', 'conne', 'encule', 'enculer', 'merde', 'nique', 'niquer', 'ntm', 'fdp',
  'batard', 'bouffon', 'abruti', 'debile', 'tg', 'negre', 'nigger', 'nigga', 'fuck', 'fucking', 'shit', 'bitch',
  'asshole', 'dick', 'pussy', 'cunt', 'whore', 'slut', 'retard', 'faggot', 'pd', 'pede',
]

const normalize = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/0/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4|@/g, 'a')
    .replace(/5|\$/g, 's')

// Remplace chaque mot interdit par des étoiles ; renvoie le texte nettoyé.
export function clean(text) {
  return text
    .split(/(\s+)/)
    .map((token) => {
      const bare = normalize(token).replace(/[^a-z]/g, '')
      return bare && WORDS.includes(bare) ? '*'.repeat(Math.min(token.length, 6)) : token
    })
    .join('')
}

export const isBad = (text) => clean(text) !== text
