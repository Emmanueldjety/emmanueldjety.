// Serveur temps réel de la galerie MDA.
// Chaque visiteur garde une connexion ouverte (WebSocket) ; le serveur fait circuler
// les positions, les messages et les places assises entre les visiteurs d'une même salle.
import http from 'node:http'
import { randomUUID } from 'node:crypto'
import { WebSocketServer } from 'ws'
import { clean } from './badwords.js'

const PORT = Number(process.env.PORT) || 8787
const MAX_PER_ROOM = Number(process.env.MAX_PER_ROOM) || 30
// Domaines autorisés à se connecter, séparés par des virgules (vide = tout le monde).
const ALLOWED = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean)

const ROOMS = ['graphisme', 'portfolio', 'reseaux', 'apropos']
const OUTFITS = ['tee', 'hoodie', 'jacket', 'boubou']
const HAIRS = ['none', 'short', 'afro', 'locs', 'puffs', 'bun', 'quiff', 'bob']
const HEADS = ['round', 'egg', 'wide', 'square', 'pear', 'tall']
const EYES = ['dots', 'oval', 'sleepy', 'happy', 'dreamy', 'sharp', 'wink', 'wide', 'side', 'shades']
const MOUTHS = ['smile', 'grin', 'laugh', 'smirk', 'flat', 'open', 'tongue', 'teeth', 'sad', 'cat']
const HEX = /^#[0-9a-f]{6}$/i

const players = new Map() // id -> joueur
const rooms = new Map(ROOMS.map((r) => [r, new Set()]))
const seats = new Map() // place -> id du joueur

const num = (v, lo, hi) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : 0)
const pick = (v, list, fallback) => (list.includes(v) ? v : fallback)

function cleanName(raw) {
  const s = String(raw ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 16)
  const c = clean(s)
  return c === s && s ? s : 'Visiteur'
}

function cleanAvatar(a = {}) {
  const hex = (v, d) => (typeof v === 'string' && HEX.test(v) ? v : d)
  return {
    skin: hex(a.skin, '#9a5f30'),
    outfit: pick(a.outfit, OUTFITS, 'hoodie'),
    outfitColor: hex(a.outfitColor, '#f2a52a'),
    hair: pick(a.hair, HAIRS, 'short'),
    hairColor: hex(a.hairColor, '#1b1b1b'),
    head: pick(a.head, HEADS, 'round'),
    eyes: pick(a.eyes, EYES, 'dots'),
    mouth: pick(a.mouth, MOUTHS, 'smile'),
  }
}

const send = (ws, msg) => {
  if (ws.readyState === 1) ws.send(JSON.stringify(msg))
}
const toRoom = (roomId, msg, exceptId) => {
  const set = rooms.get(roomId)
  if (!set) return
  const data = JSON.stringify(msg)
  for (const id of set) {
    if (id === exceptId) continue
    const p = players.get(id)
    if (p && p.ws.readyState === 1) p.ws.send(data)
  }
}
const toAll = (msg) => {
  const data = JSON.stringify(msg)
  for (const p of players.values()) if (p.ws.readyState === 1) p.ws.send(data)
}
const publicView = (p) => ({ id: p.id, name: p.name, avatar: p.avatar, x: p.x, z: p.z, ry: p.ry, sp: p.sp, sit: p.sit })

function freeSeat(p) {
  if (p.sit && seats.get(p.sit) === p.id) seats.delete(p.sit)
  p.sit = null
}

function leaveRoom(p) {
  if (!p.room) return
  freeSeat(p)
  rooms.get(p.room)?.delete(p.id)
  toRoom(p.room, { t: 'leave', id: p.id })
  p.room = null
}

function joinRoom(p, roomId) {
  const set = rooms.get(roomId)
  if (!set) return
  if (set.size >= MAX_PER_ROOM && !set.has(p.id)) {
    send(p.ws, { t: 'full', room: roomId })
    return
  }
  leaveRoom(p)
  p.room = roomId
  set.add(p.id)
  const others = [...set].filter((id) => id !== p.id).map((id) => publicView(players.get(id)))
  const taken = [...seats.entries()].filter(([k]) => k.startsWith(`${roomId}:`)).map(([key, id]) => ({ key, id }))
  send(p.ws, { t: 'welcome', id: p.id, room: roomId, players: others, seats: taken, online: players.size })
  toRoom(roomId, { t: 'join', player: publicView(p) }, p.id)
}

function handle(p, msg) {
  switch (msg.t) {
    case 'join': {
      p.name = cleanName(msg.name)
      p.avatar = cleanAvatar(msg.avatar)
      p.x = num(msg.x, -14, 14)
      p.z = num(msg.z, -10, 10)
      p.ry = num(msg.ry, -7, 7)
      joinRoom(p, pick(msg.room, ROOMS, 'graphisme'))
      toAll({ t: 'online', n: players.size })
      break
    }
    case 'move': {
      if (!p.room || p.sit) return
      p.x = num(msg.x, -14, 14)
      p.z = num(msg.z, -10, 10)
      p.ry = num(msg.ry, -7, 7)
      p.sp = num(msg.sp, 0, 1)
      p.dirty = true
      break
    }
    case 'chat': {
      if (!p.room) return
      const now = Date.now()
      if (now - p.lastChat < 1200) return
      let text = String(msg.text ?? '').replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80)
      if (!text) return
      p.lastChat = now
      text = clean(text)
      toRoom(p.room, { t: 'chat', id: p.id, text })
      break
    }
    case 'sit': {
      if (!p.room) return
      if (msg.key === null) {
        freeSeat(p)
        toRoom(p.room, { t: 'sit', id: p.id, key: null })
        return
      }
      const key = String(msg.key ?? '')
      if (!key.startsWith(`${p.room}:`) || key.length > 24) return
      const holder = seats.get(key)
      if (holder && holder !== p.id) {
        send(p.ws, { t: 'sitDenied', key })
        return
      }
      freeSeat(p)
      seats.set(key, p.id)
      p.sit = key
      toRoom(p.room, { t: 'sit', id: p.id, key })
      break
    }
    case 'ping':
      send(p.ws, { t: 'pong' })
      break
    default:
      break
  }
}

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json', 'access-control-allow-origin': '*' })
    res.end(JSON.stringify({ ok: true, online: players.size }))
    return
  }
  res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' })
  res.end('Serveur temps réel de la galerie MDA : en ligne.')
})

const wss = new WebSocketServer({
  server,
  maxPayload: 2048,
  verifyClient: ({ origin }) => {
    if (!ALLOWED.length) return true
    return !origin || ALLOWED.includes(origin) || /^https?:\/\/localhost(:\d+)?$/.test(origin)
  },
})

wss.on('connection', (ws) => {
  const p = {
    id: randomUUID().slice(0, 8),
    ws,
    name: 'Visiteur',
    avatar: cleanAvatar(),
    room: null,
    x: 0,
    z: 3,
    ry: Math.PI,
    sp: 0,
    sit: null,
    dirty: false,
    lastChat: 0,
    alive: true,
    budget: 40, // limite de messages par seconde
  }
  players.set(p.id, p)

  ws.on('pong', () => {
    p.alive = true
  })
  ws.on('message', (raw) => {
    if (p.budget <= 0) return
    p.budget -= 1
    let msg
    try {
      msg = JSON.parse(raw.toString())
    } catch {
      return
    }
    if (msg && typeof msg === 'object') handle(p, msg)
  })
  ws.on('close', () => {
    leaveRoom(p)
    players.delete(p.id)
    toAll({ t: 'online', n: players.size })
  })
  ws.on('error', () => ws.terminate())
})

// 10 fois par seconde : on envoie les positions de ceux qui ont bougé.
setInterval(() => {
  for (const [roomId, set] of rooms) {
    const moved = []
    for (const id of set) {
      const p = players.get(id)
      if (p?.dirty) {
        moved.push([p.id, +p.x.toFixed(2), +p.z.toFixed(2), +p.ry.toFixed(2), +p.sp.toFixed(2)])
        p.dirty = false
      }
    }
    if (moved.length) toRoom(roomId, { t: 'state', p: moved })
  }
  for (const p of players.values()) p.budget = 40
}, 100)

// Toutes les 30 secondes : on débranche ceux qui ne répondent plus.
setInterval(() => {
  for (const p of players.values()) {
    if (!p.alive) {
      p.ws.terminate()
      continue
    }
    p.alive = false
    p.ws.ping()
  }
}, 30000)

server.listen(PORT, () => console.log(`Galerie live : port ${PORT}`))
