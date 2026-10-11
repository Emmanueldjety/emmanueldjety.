// Les œuvres de la pièce Graphisme.
// Pour changer un titre ou une description, modifie simplement le texte ci-dessous.
// Pour ajouter une image : mets le fichier dans src/assets/art/, importe-le en haut, puis ajoute une ligne ici.
import masque from '../assets/art/masque.webp'
import mdaAndFriend from '../assets/art/mda-and-friend.webp'
import potentielZero from '../assets/art/potentiel-zero.webp'
import dahigbolo from '../assets/art/dahigbolo.webp'
import vide from '../assets/art/vide.webp'

export const ARTWORKS = [
  {
    id: 'masque',
    file: masque,
    title: 'Sans titre — Masque',
    kind: 'Cover art',
    description: 'Collage photo et masque en métal : le visage se reconstruit par morceaux.',
  },
  {
    id: 'mda-and-friend',
    file: mdaAndFriend,
    title: 'MDA and Friend',
    kind: 'Cover art',
    description: 'Un lecteur audio rétro, façon années 90, pour un morceau de studio entre amis.',
  },
  {
    id: 'potentiel-zero',
    file: potentielZero,
    title: 'Potentiel Zero',
    kind: 'Cover art',
    description: 'Un sablier à huit bras : toutes les casquettes d’un créateur, en même temps.',
  },
  {
    id: 'dahigbolo',
    file: dahigbolo,
    title: 'Dahigbôlô',
    kind: 'Cover art — lekm x MDA',
    description: 'Typographie gothique rouge, trame de demi-teintes bleue et regard laser.',
  },
  {
    id: 'vide',
    file: vide,
    title: 'ViDe',
    kind: 'Cover art',
    description: 'Un grand vide blanc, quelques fleurs colorées dessinées à la main.',
  },
]
