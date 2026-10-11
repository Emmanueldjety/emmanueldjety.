import { useSyncExternalStore } from 'react'
import { BEATS } from '../data/beats.js'

// Lecteur de musique de la galerie (un seul lecteur pour toute la page).
const m = { audio: null, index: 0, version: 0 }
const subs = new Set()
const bump = () => {
  m.version += 1
  subs.forEach((f) => f())
}
const subscribe = (f) => {
  subs.add(f)
  return () => subs.delete(f)
}

function ensure() {
  if (m.audio || !BEATS.length) return
  const a = new Audio(BEATS[0].url)
  a.volume = 0.45
  a.preload = 'auto'
  a.addEventListener('ended', () => (BEATS.length > 1 ? next() : ((a.currentTime = 0), a.play().catch(() => {}))))
  a.addEventListener('play', bump)
  a.addEventListener('pause', bump)
  m.audio = a
}

// À appeler directement dans un clic : les navigateurs refusent de lancer du son sans geste.
export function startMusic() {
  ensure()
  m.audio?.play().catch(() => bump())
}

export function toggleMusic() {
  ensure()
  if (!m.audio) return
  if (m.audio.paused) m.audio.play().catch(() => {})
  else m.audio.pause()
}

export function next() {
  if (!m.audio || BEATS.length < 2) return
  m.index = (m.index + 1) % BEATS.length
  m.audio.src = BEATS[m.index].url
  m.audio.play().catch(() => {})
  bump()
}

export function useMusic() {
  useSyncExternalStore(subscribe, () => m.version)
  const track = BEATS[m.index] ?? null
  return { track, playing: !!m.audio && !m.audio.paused, count: BEATS.length }
}
