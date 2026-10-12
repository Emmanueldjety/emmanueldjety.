// Adresse du serveur temps réel (les visiteurs qui se voient en direct).
// - Vide : mode solo (la galerie marche, mais sans les autres visiteurs).
// - Sur ton ordinateur (npm run dev), on se connecte automatiquement au serveur local.
// - En ligne : colle ici l'adresse donnée par Render, sous la forme 'wss://mda-galerie-live.onrender.com'
const ONLINE_URL = 'wss://emmanueldjety.onrender.com'

export const LIVE_URL = import.meta.env.VITE_LIVE_URL ?? (import.meta.env.DEV ? 'ws://localhost:8787' : ONLINE_URL)
