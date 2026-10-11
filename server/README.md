# Serveur temps réel de la galerie

Ce petit serveur permet aux visiteurs de **se voir en direct** dans la galerie (positions, prénoms, messages, places assises).
Sans lui, la galerie fonctionne quand même, mais chaque visiteur est seul (« mode solo »).

> Un **serveur**, c'est un ordinateur qui reste allumé sur Internet. Ici, il fait office de standard téléphonique :
> chaque visiteur lui envoie sa position, et il la renvoie aux autres.

## Le mettre en ligne (gratuit, environ 10 minutes, sans taper de commande)

1. Va sur [render.com](https://render.com) et crée un compte avec ton compte GitHub.
2. Clique sur **New +** puis **Blueprint**.
3. Choisis le dépôt `emmanueldjety.` (autorise Render à y accéder si besoin) et la branche du projet.
   Render lit le fichier `render.yaml` et prépare tout seul le service `mda-galerie-live`.
4. Clique sur **Apply** (ou **Deploy**). Attends 2 à 3 minutes : le statut passe à **Live**.
5. Render affiche l'adresse du service, par exemple `https://mda-galerie-live.onrender.com`.
   **Envoie-moi cette adresse** : je la branche dans la galerie (en remplaçant `https` par `wss`).

Pour tester que le serveur répond, ouvre `https://TON-ADRESSE.onrender.com/health` : tu dois voir `{"ok":true,"online":0}`.

## À savoir

- **Gratuit = il s'endort** après 15 minutes sans visiteur. Le premier visiteur qui arrive attend environ une minute avant de voir les autres
  (la galerie, elle, s'ouvre tout de suite). Pour l'éviter, tu peux créer un compte gratuit sur [uptimerobot.com](https://uptimerobot.com)
  et lui demander de visiter `/health` toutes les 5 minutes.
- **Limite** : 30 visiteurs par salle en même temps.
- **Messages** : 80 caractères maximum, un message toutes les 1,2 seconde, et les insultes courantes sont masquées par des étoiles
  (liste dans `badwords.js`, que tu peux compléter).
- **Vie privée** : le serveur ne garde rien. Il ne stocke ni les prénoms ni les messages ; tout disparaît quand le visiteur part.
- **Sécurité (facultatif)** : dans Render, onglet *Environment*, ajoute `ALLOWED_ORIGINS` avec l'adresse de ton site
  (par exemple `https://emmanueldjety.vercel.app`) pour que seul ton site puisse se connecter.

## Tester sur ton ordinateur

```
cd server
npm install
npm start
```

Puis, dans un autre terminal à la racine du projet : `npm run dev`. Ouvre la galerie dans **deux onglets** : tu te verras toi-même.
