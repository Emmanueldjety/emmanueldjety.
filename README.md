# MDA — Galerie virtuelle 3D (version bêta)

Portfolio sous forme de galerie d'art en 3D, visitable depuis un navigateur (ordinateur et mobile).

**Étape 2 (actuelle)** : créateur de personnage + une pièce (Graphisme) + déplacement.
**Étape 3 (à venir)** : pièces Portfolio / Réseaux sociaux / À propos + visiteurs en temps réel.

## Tester sur ton ordinateur

1. Installe [Node.js](https://nodejs.org) (version « LTS »).
2. Dans un terminal, dans ce dossier : `npm install` puis `npm run dev`.
3. Ouvre l'adresse affichée (souvent http://localhost:5173).
4. Pour tester sur ton téléphone (même Wi-Fi) : `npm run dev -- --host`, puis ouvre l'adresse « Network » sur le téléphone.

## Commandes

- **Ordinateur** : Z Q S D (ou flèches) pour marcher · Maj pour courir · glisser la souris pour tourner la caméra · cliquer sur une œuvre pour l'agrandir (Échap pour fermer).
- **Mobile** : joystick à l'écran pour marcher · glisser le doigt pour tourner la caméra · toucher une œuvre pour l'agrandir.

## Modifier le contenu

- **Œuvres** : `src/data/artworks.js` (titres, descriptions) et images dans `public/art/`.
- **Options du personnage** (couleurs, coiffures…) : `src/avatar/config.js`.
- **Taille de la pièce, décor** : `src/gallery/Room.jsx`.
