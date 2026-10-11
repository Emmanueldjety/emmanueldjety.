// Tout le contenu de la galerie est ici : les 4 salles, leurs œuvres, leurs textes et leurs liens.
// Pour modifier un texte, un titre ou un lien : change simplement le texte entre guillemets.
// Pour ajouter une image : mets-la dans src/assets/, importe-la ci-dessous, puis ajoute un objet dans `items`.

import masque from '../assets/art/masque.webp'
import mdaAndFriend from '../assets/art/mda-and-friend.webp'
import potentielZero from '../assets/art/potentiel-zero.webp'
import dahigbolo from '../assets/art/dahigbolo.webp'
import vide from '../assets/art/vide.webp'
import portrait from '../assets/work/portrait.webp'
import postIndependance from '../assets/work/post-independance.webp'
import postFer from '../assets/work/post-fer.webp'
import postHk from '../assets/work/post-hk.webp'
import postPasp from '../assets/work/post-pasp.webp'
import postPathe from '../assets/work/post-pathe.webp'
import postAtlantique from '../assets/work/post-atlantique.webp'
import paspIdentite from '../assets/work/pasp-identite.webp'
import trcAffiches from '../assets/work/trc-affiches.webp'
import trcGoodies from '../assets/work/trc-goodies.webp'
import trcTshirts from '../assets/work/trc-tshirts.webp'
import transComInter from '../assets/work/trans-com-inter.webp'
import cardMtn from '../assets/work/card-mtn.webp'
import cardAos from '../assets/work/card-aos.webp'
import cardTrc from '../assets/work/card-trc.webp'

const C = { pink: '#dd4a8e', blue: '#52c2e4', orange: '#f2a52a', green: '#84bd4b', ink: '#2e2f2f' }

export const CONTACT = {
  email: 'emmanueldjety@gmail.com',
  phone: '+225 01 43 51 41 18',
}

// ---------- Collaborateurs (table haute de la salle Portfolio) ----------
// Pour ajouter le portfolio d'un ami : renseigne son adresse dans `url` (Behance, site, Drive...).
export const COLLABORATORS = [
  { name: 'Harris Agueh', note: 'MTN MoMo · AIDA · Ouidah 92', url: null },
  { name: 'Sullyvan Atchahoue', note: 'MTN MoMo · AIDA · Ouidah 92', url: null },
  { name: 'Resnick Tometin', note: 'MTN MoMo · TRC · AIDA', url: null },
  { name: 'Oneal Homeky', note: 'Modélisation du trophée · TRC', url: null },
  { name: 'Esdras Godjo', note: 'AIDA · Ouidah 92', url: null },
  { name: 'Olmert Hontonnou', note: 'AIDA · Ouidah 92', url: null },
]

// ---------- Salle 1 : Graphisme ----------
const covers = [
  { image: masque, title: 'Sans titre — Masque', kind: 'Cover art', description: 'Collage photo et masque en métal : le visage se reconstruit par morceaux.' },
  { image: mdaAndFriend, title: 'MDA and Friend', kind: 'Cover art', description: 'Un lecteur audio rétro, façon années 90, pour un morceau de studio entre amis.' },
  { image: potentielZero, title: 'Potentiel Zero', kind: 'Cover art', description: 'Un sablier à huit bras : toutes les casquettes d’un créateur, en même temps.' },
  { image: dahigbolo, title: 'Dahigbôlô', kind: 'Cover art — lekm x MDA', description: 'Typographie gothique rouge, trame de demi-teintes bleue et regard laser.' },
  { image: vide, title: 'ViDe', kind: 'Cover art', description: 'Un grand vide blanc, quelques fleurs colorées dessinées à la main.' },
]

const post = (image, size, title, description) => ({
  type: 'frame', wall: 'front', size, image,
  panel: { title, kind: 'Post réseaux sociaux · AOS Africa', description },
})

const graphisme = {
  id: 'graphisme',
  number: '01',
  title: 'Graphisme',
  subtitle: 'Covers, identités visuelles et posts',
  accent: C.pink,
  items: [
    // mur du fond : les covers
    ...covers.map((c, i) => ({
      type: 'frame', wall: 'back', at: [-9, -4.5, 0, 4.5, 9][i], size: [2.2, 2.2], image: c.image,
      panel: { title: c.title, kind: c.kind, description: c.description },
    })),
    // mur de gauche : identités et déclinaisons
    {
      type: 'frame', wall: 'left', at: -6.45, size: [3.0, 2.12], image: paspIdentite,
      panel: { title: 'PASP — identité visuelle', kind: 'Branding · AOS Africa', description: 'Déclinaisons de l’identité du Port Autonome de San Pedro : véhicule, carton, papeterie et badges.' },
    },
    {
      type: 'frame', wall: 'left', at: -2.15, size: [3.0, 1.92], image: trcAffiches,
      panel: { title: 'TRC — affiches', kind: 'Branding · Tekbot Robotics Challenge 2025', description: 'Affiches « Are you ready ? », « Résilience urbaine 2025 » et « Je participe ! ».' },
    },
    {
      type: 'frame', wall: 'left', at: 2.15, size: [3.0, 1.93], image: trcGoodies,
      panel: { title: 'TRC — papeterie et goodies', kind: 'Branding · Tekbot Robotics Challenge 2025', description: 'Cartes de visite, casquette et bracelet aux couleurs du TRC.' },
    },
    {
      type: 'frame', wall: 'left', at: 6.45, size: [3.0, 1.68], image: trcTshirts,
      panel: { title: 'TRC — T-shirts', kind: 'Branding · Tekbot Robotics Challenge 2025', description: 'T-shirts des participants et du staff.' },
    },
    // mur de devant : posts réseaux sociaux
    { ...post(postIndependance, [1.7, 1.69], 'Fête de l’indépendance — PASP', 'Post pour la fête de l’indépendance, pour le Port Autonome de San Pedro.'), at: -9 },
    { ...post(postFer, [1.7, 1.7], 'Fête de l’indépendance — FER', 'Post pour le Fonds d’entretien routier.'), at: -5.4 },
    { ...post(postHk, [1.7, 1.7], 'Eid-al-Adha Mubarak — HK', 'Post de vœux pour la fête de l’Aïd el-Kébir.'), at: -1.8 },
    { ...post(postPasp, [1.9, 1.54], 'Classement des ports — PASP', 'Post sur le classement de performance des ports à conteneurs.'), at: 1.8 },
    { ...post(postPathe, [1.7, 1.69], 'À l’affiche — Pathé', 'Post de programmation pour Pathé.'), at: 5.4 },
    { ...post(postAtlantique, [1.4, 1.68], 'Transfert en devise — Banque Atlantique', 'Post de communication pour Banque Atlantique.'), at: 9 },
  ],
  decor: [
    { type: 'rug', x: 0, z: -6.4, w: 4.4, d: 2.4, color: C.pink },
    { type: 'bench', x: 0, z: -6.4, along: 'x', len: 3 },
    { type: 'rug', x: -9.2, z: 0, w: 2.4, d: 4.4, color: C.pink },
    { type: 'bench', x: -9.2, z: 0, along: 'z', len: 3 },
    { type: 'plinth', x: 6, z: -2.5, color: C.green },
    { type: 'plinth', x: 6, z: 2.5, color: C.orange },
    { type: 'plant', x: -11.8, z: -7.8 },
    { type: 'plant', x: 11.8, z: -7.8 },
    { type: 'plant', x: -11.8, z: 7.8 },
  ],
}

// ---------- Salle 2 : Portfolio ----------
const strip = (bg, fg, image, title, subtitle) => ({ bg, fg, image, title, subtitle })

const projects = [
  {
    id: 'mtn',
    cover: { ...strip('#ffcc00', '#2e2f2f', cardMtn, 'Refonte MTN MoMo', 'UX/UI · 2024'), fit: 'cover' },
    panel: {
      title: 'Refonte du parcours MTN MoMo',
      kind: 'UX/UI · Workshop Algorithmique · Bénin',
      description:
        'Revisiter le parcours de l’application MTN MoMo (envoi d’argent, achat de forfaits, onboarding) pour repérer les points de friction. Sondage auprès de 96 utilisateurs : 97 % envoient de l’argent et 80 % achètent du crédit ou des forfaits.',
      details: [
        ['Date', 'Septembre 2024'],
        ['Rôle', 'UX/UI Designer'],
        ['Outils', 'Figma, Miro'],
        ['Équipe', 'Harris Agueh, Sullyvan Atchahoue, Resnick Tometin'],
        ['Processus', 'Avis utilisateurs → sondage (96 réponses) → matrice de priorisation 4x4 → user flows et journey maps → wireframes'],
      ],
      links: [
        { label: 'Présentation complète', url: 'https://drive.google.com/file/d/1KPUVF7sZX4hoLTca9xyIlQ4ZKktM_eqS/view?usp=sharing' },
        { label: 'User flow (Miro)', url: 'https://miro.com/app/board/uXjVKjovcNs=/?moveToWidget=3458764598900198196&cot=14' },
        { label: 'Formulaire du sondage', url: 'https://tally.so/r/mRYG4v' },
      ],
    },
  },
  {
    id: 'trc',
    cover: { ...strip('#005f4b', '#ffffff', cardTrc, 'Tekbot Robotics Challenge', 'Branding · 2024'), fit: 'cover' },
    panel: {
      title: 'Tekbot Robotics Challenge 2025',
      kind: 'Identité visuelle · Motion',
      description:
        'Workshop intensif de 5 jours à Africa Design School pour l’édition 2025 de la plus grande compétition de robotique d’Afrique de l’Ouest. J’ai contribué à la recherche (mind mapping), aux mockups, au design du trophée et à l’animation du logo et de plusieurs icônes.',
      details: [
        ['Date', 'Décembre 2024'],
        ['Rôles', 'Brand Designer, Motion Designer'],
        ['Outils', 'Figma, Illustrator, After Effects'],
        ['Équipe', 'Resnick Tometin, Roxanne Afangbedji, Carol Gnimadi, Oneal Homeky'],
      ],
      links: [
        { label: 'Présentation complète', url: 'https://drive.google.com/file/d/12SX7e2n-6BY2yB84Yv-Fx7bqctLJV8R-/view?usp=sharing' },
        { label: 'Animation du logo', url: 'https://drive.google.com/drive/folders/19N4UulTB1Sld6ACYuCai396eoUt7FkBq?usp=sharing' },
        { label: 'Animation des icônes', url: 'https://drive.google.com/drive/folders/1zA-xRyRePQVSPQxqgmf7cZjRrAQcLCNM?usp=sharing' },
        { label: 'Site du TRC', url: 'https://trc.tekbot.io' },
      ],
    },
  },
  {
    id: 'aida',
    cover: { bg: '#2e2f2f', fg: '#ffffff', accent: '#f5c115', big: 'AIDA', title: 'African International Design Awards', subtitle: 'UX/UI · 2025' },
    panel: {
      title: 'AIDA — African International Design Awards',
      kind: 'UX/UI · Plateforme web',
      description:
        'Le site web des AIDA Awards, concours qui célèbre le design africain et de la diaspora, a été conçu par les étudiants du programme de design numérique de l’Africa Design School. Inscription, soumission de projets et exploration simplifiées : hero immersive, catégories, jury, galerie dynamique et navigation mobile optimisée.',
      details: [
        ['Date', 'Mai 2025'],
        ['Rôle', 'UX/UI : recherche, wireframes, sitemap, parcours, hiérarchie visuelle'],
        ['Équipe', 'Les étudiants de l’Africa Design School : Gloria Sogbedji, Olmelt Hontonnou, Rihanath Imelda Hounkponou, Lionel Exauce Djokoui, Sullivan Senou Atchahoue, Harris Agueh, Marie Stella Tifania Dossou, Freude Jouvince Nouatin, Astrid Hyacinthia Bassaley, Resnick Tometin, Keren Apphia Dantondji, Malick Azmi, Shekina Nadjo, Esdras Guillaume Godjo, Haniyath Abibou, Emmanuel Djety, Roxanne Afangbedji, Gilihiest Adossou, Jorden N. Gbekounou Dah'],
      ],
      links: [{ label: 'Voir la plateforme', url: 'https://africainternationaldesignawards.com/about-aida-awards/' }],
    },
  },
  {
    id: 'ouidah',
    cover: { bg: '#0a0a0a', fg: '#ffffff', accent: '#d62828', big: '92', title: 'Ouidah 92 — Beyond The Gate', subtitle: 'Expérience interactive · 2026' },
    panel: {
      title: 'Ouidah 92 — Beyond The Gate',
      kind: 'Expérience interactive · Galerie Borna Soglo',
      description:
        'Exposition virtuelle immersive sur le parcours mémoriel de Ouidah 92 (Biennale de São Paulo) : une carte isométrique interactive de la Route des Esclaves en 7 étapes, de la Place des enchères à la Porte du Non-Retour.',
      details: [
        ['Date', 'Janvier 2026'],
        ['Rôles', 'UX/UI Design, Brand Design'],
        ['Direction artistique', 'Concept « Beyond The Gate », typographie ATIBA, rouge profond, bleu sombre, noir'],
        ['Équipe', 'Harris Agueh, Sullivan Atchahoue, Kéren Dantondji, Esdras Godjo, Olmert Hontonnou'],
      ],
      links: [],
    },
  },
  {
    id: 'aos',
    cover: { ...strip('#3b2012', '#ffffff', cardAos, 'AOS Africa', 'Agence · 2024'), fit: 'cover' },
    panel: {
      title: 'AOS Africa — stage en agence',
      kind: 'Design graphique · Agence de communication',
      description:
        'Stage de trois mois dans une agence africaine de communication et de marketing intégrée. J’ai travaillé dans plusieurs pôles, sur la création et le digital, pour Banque Atlantique, le Port Autonome de San Pedro, Trans Com Inter, Pathé, le Fonds d’entretien routier et HK.',
      details: [
        ['Période', 'Juin à août 2024'],
        ['Visuels', 'Dans la salle Graphisme (identité PASP, posts réseaux sociaux)'],
      ],
      links: [],
    },
  },
  {
    id: 'tci',
    cover: { bg: '#0b5d7a', fg: '#ffffff', image: transComInter, fit: 'contain', title: 'Trans Com Inter', subtitle: 'Maquette web · AOS Africa' },
    panel: {
      title: 'Trans Com Inter — site web',
      kind: 'UX/UI · Maquette · AOS Africa',
      description: 'Maquette du site web de Trans Com Inter, client d’AOS Africa.',
      details: [['Outil', 'Figma']],
      links: [
        { label: 'Présentation (Figma)', url: 'https://www.figma.com/proto/mr42TkFFjyvE0Hgu5qyO9N/TRANS-COM-INTER?page-id=5%3A13&node-id=265-140&viewport=1086%2C502%2C0.09&t=994YLoMR56Ktjne3-1&scaling=min-zoom&content-scaling=fixed' },
        { label: 'Maquette (Figma)', url: 'https://www.figma.com/proto/mr42TkFFjyvE0Hgu5qyO9N/TRANS-COM-INTER?page-id=196%3A106&node-id=196-107&viewport=226%2C337%2C0.04&t=oHHgQR5aI6nJySNi-1&scaling=contain&content-scaling=fixed' },
      ],
    },
  },
]

const portfolio = {
  id: 'portfolio',
  number: '02',
  title: 'Portfolio',
  subtitle: 'Projets web et présentations',
  accent: C.blue,
  items: [
    ...projects.map((p, i) => ({
      type: 'frame', wall: 'back', at: [-10.75, -6.45, -2.15, 2.15, 6.45, 10.75][i], y: 2.1, size: [1.2, 3.0],
      cover: p.cover, panel: p.panel,
    })),
    {
      type: 'board', wall: 'left', at: 0, size: [5.2, 3.2],
      board: {
        kicker: 'Sélection 2024 – 2026',
        title: 'Mes projets',
        lines: [
          { type: 'p', text: 'Une sélection parmi les projets sur lesquels j’ai travaillé, seul ou en équipe.' },
          { type: 'p', text: 'Touche une affiche pour voir le détail, l’équipe et les fichiers d’origine.' },
        ],
      },
    },
  ],
  decor: [
    { type: 'rug', x: 0, z: -5.4, w: 5.4, d: 2.4, color: C.blue },
    { type: 'bench', x: 0, z: -5.4, along: 'x', len: 4 },
    { type: 'plinth', x: 6, z: -2.5, color: C.blue },
    { type: 'plinth', x: 6, z: 2.5, color: C.pink },
    {
      type: 'table', x: -8.5, z: 4,
      cards: COLLABORATORS.slice(0, 3).map((c) => c.name),
      panel: {
        title: 'Collaborateurs',
        kind: 'Ils ont travaillé avec moi',
        description: 'Les personnes avec qui j’ai monté ces projets. Les portfolios arrivent bientôt.',
        people: COLLABORATORS,
        details: [],
        links: [],
      },
    },
    { type: 'plant', x: -11.8, z: -7.8 },
    { type: 'plant', x: 11.8, z: -7.8 },
  ],
}

// ---------- Salle 3 : Réseaux sociaux ----------
const social = (id, label, handle, color, url, ink = '#ffffff') => ({
  type: 'tile', size: [2.4, 2.4], tile: { label, handle, color, ink },
  panel: { title: label, kind: handle, description: '', details: [], links: [{ label: `Ouvrir ${label}`, url }] },
})

const reseaux = {
  id: 'reseaux',
  number: '03',
  title: 'Réseaux sociaux',
  short: 'Réseaux',
  subtitle: 'Liens et contact',
  accent: C.orange,
  items: [
    { ...social('ig-pro', 'Instagram', '@emmanuel_djety · pro', C.pink, 'https://www.instagram.com/emmanuel_djety'), wall: 'back', at: -9 },
    { ...social('ig-perso', 'Instagram', '@manou5795 · perso', C.orange, 'https://www.instagram.com/manou5795', C.ink), wall: 'back', at: -3 },
    { ...social('ig-beats', 'Instagram', '@nouchiartbeats · beats', C.green, 'https://www.instagram.com/nouchiartbeats', C.ink), wall: 'back', at: 3 },
    { ...social('linkedin', 'LinkedIn', 'Emmanuel Djety', C.blue, 'https://www.linkedin.com/in/allico-emmanuel-djety-64a2322a7/', C.ink), wall: 'back', at: 9 },
    { ...social('x', 'X', '@emmanueldjety', C.ink, 'https://x.com/emmanueldjety'), wall: 'left', at: -6.45 },
    { ...social('behance', 'Behance', 'allicodjety', '#1769ff', 'https://www.behance.net/allicodjety'), wall: 'left', at: -2.15 },
    {
      type: 'tile', wall: 'left', at: 2.15, size: [2.4, 2.4],
      tile: { label: 'Email', handle: CONTACT.email, color: '#f5c115', ink: C.ink },
      panel: { title: 'Email', kind: CONTACT.email, description: 'Écris-moi pour un projet, une idée ou une collaboration.', details: [], links: [{ label: 'Écrire un email', url: `mailto:${CONTACT.email}` }], copy: CONTACT.email },
    },
    {
      type: 'tile', wall: 'left', at: 6.45, size: [2.4, 2.4],
      tile: { label: 'Téléphone', handle: CONTACT.phone, color: '#d0191a', ink: '#ffffff' },
      panel: { title: 'Téléphone', kind: CONTACT.phone, description: 'Appel ou WhatsApp.', details: [], links: [{ label: 'Appeler', url: `tel:${CONTACT.phone.replace(/\s/g, '')}` }], copy: CONTACT.phone },
    },
  ],
  decor: [
    { type: 'rug', x: 0, z: -5.4, w: 4.4, d: 2.4, color: C.orange },
    { type: 'bench', x: 0, z: -5.4, along: 'x', len: 3 },
    { type: 'plinth', x: 6, z: -2.5, color: C.orange },
    { type: 'plinth', x: 6, z: 2.5, color: C.green },
    { type: 'plant', x: -11.8, z: -7.8 },
    { type: 'plant', x: 11.8, z: -7.8 },
    { type: 'plant', x: -11.8, z: 7.8 },
  ],
}

// ---------- Salle 4 : À propos ----------
const apropos = {
  id: 'apropos',
  number: '04',
  title: 'À propos',
  subtitle: 'Qui je suis',
  accent: C.green,
  items: [
    {
      type: 'board', wall: 'back', at: -9, size: [5.2, 3.5],
      board: {
        kicker: 'Qui suis-je',
        title: 'Emmanuel DJETY',
        lines: [
          { type: 'p', text: 'Designer numérique, titulaire du DN MADE Numérique. Beatmaker autodidacte.' },
          { type: 'p', text: 'Ivoirien, basé à Abidjan, je me spécialise dans le design UX/UI : proposer des expériences intuitives et des solutions numériques efficaces.' },
          { type: 'p', text: 'Passionné par le design et la musique, j’intègre ma créativité pour offrir des projets innovants.' },
        ],
      },
    },
    {
      type: 'frame', wall: 'back', at: 0, y: 2.3, size: [4.2, 2.63], image: portrait,
      panel: { title: 'Emmanuel DJETY', kind: 'Designer numérique · Beatmaker', description: 'Designer UX/UI et branding, passionné par le design, la culture et la musique.', details: [], links: [] },
    },
    {
      type: 'board', wall: 'back', at: 9, size: [5.2, 3.5],
      board: {
        kicker: 'Compétences',
        title: 'Ce que je fais',
        lines: [
          { type: 'li', label: 'UX/UI', text: 'Recherche, user flows, wireframes, prototypes' },
          { type: 'li', label: 'Branding', text: 'Identité visuelle, logo, déclinaisons' },
          { type: 'li', label: 'Graphisme', text: 'Covers, posts réseaux, éditorial' },
          { type: 'li', label: 'Motion', text: 'Animation de logo et d’icônes' },
          { type: 'li', label: 'Musique', text: 'Beatmaking sous le nom MDA' },
          { type: 'li', label: 'Outils', text: 'Figma, Miro, Illustrator, After Effects' },
        ],
      },
    },
    {
      type: 'board', wall: 'left', at: -4.5, size: [6.4, 3.5],
      board: {
        kicker: 'Parcours',
        title: 'Expériences',
        lines: [
          { type: 'li', label: '2024', text: 'Design graphique — AOS Africa' },
          { type: 'li', label: '2025', text: 'Design UX/UI — WIM' },
          { type: 'li', label: '2025', text: 'Design graphique (éditorial) — École Le Petit Poucet' },
          { type: 'li', label: '2025–26', text: 'Design graphique — 999 Club Abidjan' },
          { type: 'li', label: 'Diplôme', text: 'DN MADE Numérique — Africa Design School' },
        ],
      },
    },
    {
      type: 'board', wall: 'left', at: 4.5, size: [4.6, 3.0],
      board: {
        kicker: 'Musique',
        title: 'MDA, beatmaker',
        lines: [
          { type: 'p', text: 'Je produis des beats sous le nom MDA.' },
          { type: 'p', text: 'Touche le tourne-disque pour lancer ou couper la musique de la galerie.' },
        ],
      },
    },
  ],
  decor: [
    { type: 'rug', x: 0, z: -5.4, w: 4.4, d: 2.4, color: C.green },
    { type: 'bench', x: 0, z: -5.4, along: 'x', len: 3 },
    { type: 'plinth', x: 6, z: -2.5, color: C.green },
    { type: 'plinth', x: 6, z: 2.5, color: C.pink },
    { type: 'turntable', x: -10.6, z: 4.5 },
    { type: 'plant', x: -11.8, z: -7.8 },
    { type: 'plant', x: 11.8, z: -7.8 },
  ],
}

export const ROOMS = [graphisme, portfolio, reseaux, apropos]
export const roomById = (id) => ROOMS.find((r) => r.id === id) ?? ROOMS[0]

// Les 3 portes d'une salle mènent aux 3 autres salles, dans l'ordre.
export function doorsFor(roomId, zs) {
  return ROOMS.filter((r) => r.id !== roomId).map((r, i) => ({ target: r.id, z: zs[i], color: r.accent, label: `${r.number} · ${r.title}`, sub: r.subtitle }))
}

// Obstacles (cercles pour les socles, boîtes pour les bancs) utilisés par le déplacement.
export function collidersFor(room) {
  const circles = []
  const boxes = []
  for (const d of room.decor) {
    if (d.type === 'plinth') circles.push({ x: d.x, z: d.z, r: 0.55 })
    if (d.type === 'table') circles.push({ x: d.x, z: d.z, r: 0.62 })
    if (d.type === 'plant') circles.push({ x: d.x, z: d.z, r: 0.4 })
    if (d.type === 'turntable') circles.push({ x: d.x, z: d.z, r: 0.7 })
    if (d.type === 'bench') {
      const half = d.len / 2
      boxes.push(d.along === 'x' ? { x: d.x, z: d.z, hw: half, hd: 0.45 } : { x: d.x, z: d.z, hw: 0.45, hd: half })
    }
  }
  return { circles, boxes }
}

// Places assises : chaque banc a plusieurs places. `key` identifie la place pour tous les visiteurs.
export function seatsFor(room) {
  const seats = []
  room.decor.forEach((d, bi) => {
    if (d.type !== 'bench') return
    const n = Math.max(1, Math.round(d.len / 1.4))
    for (let k = 0; k < n; k++) {
      const off = (k - (n - 1) / 2) * (d.len / n)
      const key = `${room.id}:${bi}:${k}`
      if (d.along === 'x') seats.push({ key, bench: bi, x: d.x + off, z: d.z, facing: Math.PI, stand: { x: d.x + off, z: d.z - 1.05 } })
      else seats.push({ key, bench: bi, x: d.x, z: d.z + off, facing: -Math.PI / 2, stand: { x: d.x - 1.05, z: d.z + off } })
    }
  })
  return seats
}

const SEATS = new Map(ROOMS.flatMap((r) => seatsFor(r)).map((s) => [s.key, s]))
export const seatByKey = (key) => SEATS.get(key) ?? null
