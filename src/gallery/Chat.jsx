import { useEffect, useRef, useState } from 'react'
import { live, sendChat, useLive } from '../net/live.js'

const QUICK = ['Salut !', 'Bravo !', 'Superbe travail', 'Je peux m’asseoir ?', 'Merci !']

// Discussion entre visiteurs : messages rapides ou texte libre (80 caractères), filtrés par le serveur.
export default function Chat() {
  useLive()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [wait, setWait] = useState(false)
  const [now, setNow] = useState(0)
  const input = useRef()

  // le journal se vide tout seul : on ne garde que les messages des 14 dernières secondes
  useEffect(() => {
    const t = setInterval(() => setNow((n) => n + 1), 2000)
    return () => clearInterval(t)
  }, [])

  // Entrée ouvre le chat sur ordinateur
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' && !(e.target instanceof HTMLInputElement)) {
        setOpen(true)
        setTimeout(() => input.current?.focus(), 30)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const send = (msg) => {
    const t = msg.trim()
    if (!t || wait) return
    sendChat(t)
    setText('')
    setWait(true)
    setTimeout(() => setWait(false), 1300)
  }

  const recent = live.chat.filter((c) => Date.now() - c.t < 14000).slice(-5)
  void now

  return (
    <>
      {recent.length > 0 && (
        <ul className="chat-log" data-nolook aria-live="polite">
          {recent.map((c, i) => (
            <li key={`${c.t}-${i}`} className={c.id === live.selfId ? 'me' : ''}>
              <b>{c.name}</b> {c.text}
            </li>
          ))}
        </ul>
      )}
      <div className="chat" data-nolook>
        {open && (
          <div className="chat-box">
            <div className="chat-quick">
              {QUICK.map((q) => (
                <button key={q} type="button" disabled={wait} onClick={() => send(q)}>
                  {q}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(text)
              }}
            >
              <input
                ref={input}
                id="chat-input"
                value={text}
                maxLength={80}
                placeholder="Écris un message…"
                autoComplete="off"
                onChange={(e) => setText(e.target.value)}
              />
              <button type="submit" disabled={wait || !text.trim()}>
                Envoyer
              </button>
            </form>
          </div>
        )}
        <button type="button" className="chat-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? 'Fermer' : 'Discuter'}
        </button>
      </div>
    </>
  )
}
