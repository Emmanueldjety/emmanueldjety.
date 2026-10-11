import { useEffect, useState, useSyncExternalStore } from 'react'
import { LIVE_URL } from './config.js'

// État partagé du temps réel : les autres visiteurs, les places prises, le chat.
// Il vit en dehors de React car les positions changent 10 fois par seconde.
export const live = {
  url: LIVE_URL,
  status: LIVE_URL ? 'connecting' : 'solo', // 'solo' | 'connecting' | 'online'
  selfId: null,
  online: 0,
  full: false,
  players: new Map(), // id -> visiteur distant
  seats: new Map(), // place -> id
  bubbles: new Map(), // id -> { text, until }
  chat: [], // { id, name, text, t }
  deniedAt: 0, // dernière place refusée
  version: 0,
}

const subs = new Set()
const bump = () => {
  live.version += 1
  subs.forEach((f) => f())
}
const subscribe = (f) => {
  subs.add(f)
  return () => subs.delete(f)
}
export const useLive = () => useSyncExternalStore(subscribe, () => live.version)

let ws = null
let wantOnline = false
let retry = 0
let retryTimer = null
let pingTimer = null
let joinInfo = null
let lastMove = 0
let lastSent = ''

const AVATAR_KEYS = ['skin', 'outfit', 'outfitColor', 'hair', 'hairColor', 'head', 'eyes', 'mouth']
const rawSend = (msg) => {
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg))
}

function addRemote(p) {
  live.players.set(p.id, { ...p, tx: p.x, tz: p.z, try: p.ry, sit: p.sit ?? null })
  if (p.sit) live.seats.set(p.sit, p.id)
}

function onMessage(m) {
  switch (m.t) {
    case 'welcome':
      live.selfId = m.id
      live.online = m.online
      live.full = false
      live.players.clear()
      live.seats.clear()
      live.bubbles.clear()
      m.players.forEach(addRemote)
      m.seats.forEach((s) => live.seats.set(s.key, s.id))
      bump()
      break
    case 'join':
      addRemote(m.player)
      bump()
      break
    case 'leave':
      live.players.delete(m.id)
      live.bubbles.delete(m.id)
      for (const [k, id] of live.seats) if (id === m.id) live.seats.delete(k)
      bump()
      break
    case 'state':
      for (const [id, x, z, ry, sp] of m.p) {
        const r = live.players.get(id)
        if (r) {
          r.tx = x
          r.tz = z
          r.try = ry
          r.sp = sp
        }
      }
      break
    case 'sit': {
      for (const [k, id] of live.seats) if (id === m.id) live.seats.delete(k)
      if (m.key) live.seats.set(m.key, m.id)
      const r = live.players.get(m.id)
      if (r) r.sit = m.key
      bump()
      break
    }
    case 'sitDenied':
      live.deniedAt = Date.now()
      bump()
      break
    case 'chat': {
      const name = m.id === live.selfId ? joinInfo?.name ?? 'Moi' : live.players.get(m.id)?.name ?? 'Visiteur'
      live.chat = [...live.chat.slice(-29), { id: m.id, name, text: m.text, t: Date.now() }]
      live.bubbles.set(m.id, { text: m.text, until: Date.now() + 6000 })
      bump()
      break
    }
    case 'online':
      live.online = m.n
      bump()
      break
    case 'full':
      live.full = true
      bump()
      break
    default:
      break
  }
}

function open() {
  if (!wantOnline || ws) return
  live.status = 'connecting'
  bump()
  try {
    ws = new WebSocket(live.url)
  } catch {
    ws = null
    return
  }
  ws.onopen = () => {
    retry = 0
    live.status = 'online'
    if (joinInfo) rawSend({ t: 'join', ...joinInfo })
    clearInterval(pingTimer)
    pingTimer = setInterval(() => rawSend({ t: 'ping' }), 25000)
    bump()
  }
  ws.onmessage = (e) => {
    try {
      onMessage(JSON.parse(e.data))
    } catch {
      /* message illisible : on l'ignore */
    }
  }
  ws.onclose = () => {
    ws = null
    clearInterval(pingTimer)
    live.players.clear()
    live.seats.clear()
    live.bubbles.clear()
    live.selfId = null
    live.status = wantOnline ? 'connecting' : 'solo'
    bump()
    if (wantOnline) {
      clearTimeout(retryTimer)
      retryTimer = setTimeout(open, Math.min(10000, 1000 * 2 ** retry++))
    }
  }
  ws.onerror = () => ws && ws.close()
}

export function connect() {
  if (!live.url) return
  wantOnline = true
  open()
}

export function disconnect() {
  wantOnline = false
  clearTimeout(retryTimer)
  if (ws) ws.close()
}

// Entre dans une salle (ou change de salle) avec son personnage.
export function joinRoom(room, avatar, pos) {
  const a = {}
  AVATAR_KEYS.forEach((k) => (a[k] = avatar[k]))
  joinInfo = { room, name: avatar.name, avatar: a, x: pos.x, z: pos.z, ry: pos.ry }
  live.players.clear()
  live.seats.clear()
  live.bubbles.clear()
  lastSent = ''
  bump()
  rawSend({ t: 'join', ...joinInfo })
}

// Envoie sa position, au plus 10 fois par seconde et seulement si elle a changé.
export function sendMove(x, z, ry, sp, force = false) {
  const now = performance.now()
  if (!force && now - lastMove < 100) return
  const key = `${x.toFixed(2)}|${z.toFixed(2)}|${ry.toFixed(2)}|${sp.toFixed(1)}`
  if (!force && key === lastSent && now - lastMove < 1500) return
  lastMove = now
  lastSent = key
  rawSend({ t: 'move', x, z, ry, sp })
}

export const sendChat = (text) => rawSend({ t: 'chat', text })
export const sendSit = (key) => rawSend({ t: 'sit', key })

// Le texte de la bulle de discussion d'un visiteur (null quand elle a disparu).
export function useBubble(id) {
  useLive()
  const [, force] = useState(0)
  const b = live.bubbles.get(id)
  useEffect(() => {
    if (!b) return undefined
    const ms = b.until - Date.now()
    if (ms <= 0) return undefined
    const t = setTimeout(() => force((n) => n + 1), ms + 30)
    return () => clearTimeout(t)
  }, [b])
  return b && b.until > Date.now() ? b.text : null
}
