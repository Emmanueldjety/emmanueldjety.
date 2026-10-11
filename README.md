# MDA — Galerie virtuelle 3D (version bêta)

Portfolio d'Emmanuel Djety sous forme de galerie d'art en 3D, visitable depuis un navigateur (ordinateur et mobile).

## Les salles

1. **Graphisme** : covers, identités visuelles (PASP, TRC) et posts réseaux sociaux
2. **Portfolio** : MTN MoMo, Tekbot Robotics Challenge, AIDA, Ouidah 92, AOS Africa, Trans Com Inter
3. **Réseaux sociaux** : Instagram (×3), LinkedIn, X, Behance, email, téléphone
4. **À propos** : bio, compétences, expériences, musique

On passe d'une salle à l'autre en marchant dans une porte, ou avec les boutons en bas de l'écran.

## Tester sur ton ordinateur

1. Installe [Node.js](https://nodejs.org) (version « LTS »).
2. Dans un terminal, dans ce dossier : `npm install` puis `npm run dev`.
3. Ouvre l'adresse affichée (souvent http://localhost:5173).
4. Pour tester sur ton téléphone (même Wi-Fi) : `npm run dev -- --host`, puis ouvre l'adresse « Network ».

## Commandes

- **Ordinateur** : Z Q S D (ou flèches) pour marcher · Maj pour courir · glisser la souris pour tourner la caméra · cliquer sur une œuvre pour ouvrir sa fiche (Échap pour fermer).
- **Mobile** : joystick à l'écran pour marcher · glisser le doigt pour tourner la caméra · toucher une œuvre pour ouvrir sa fiche.

## Modifier le contenu

- **Tous les textes, œuvres et liens** : `src/data/rooms.js` (un fichier, un bloc par salle).
- **Images** : dans `src/assets/` (art/ pour les covers, work/ pour le reste).
- **Options du personnage** (couleurs, coiffures…) : `src/avatar/config.js`.
- **Taille des salles, position des portes** : `src/gallery/layout.js`.
