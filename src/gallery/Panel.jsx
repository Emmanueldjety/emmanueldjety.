import { useState } from 'react'

// Fiche détaillée d'une œuvre, d'un projet ou d'un lien (s'ouvre au clic).
export default function Panel({ item, onClose }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(item.copy)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* le texte reste affiché pour être copié à la main */
    }
  }
  const cover = item.cover
  const showCardHeader = !item.image && (cover || item.accent)
  const headBg = cover?.bg ?? item.accent
  const headInk = cover?.fg ?? item.accentInk ?? '#fff'

  return (
    <div className="viewer" data-nolook onClick={onClose}>
      <article className="panel" onClick={(e) => e.stopPropagation()}>
        {item.image && <img className="panel-img" src={item.image} alt={item.title} />}
        {showCardHeader && (
          <div className={`panel-head ${cover?.fit === 'contain' ? 'contain' : ''}`} style={{ background: headBg, color: headInk }}>
            {cover?.image && <img src={cover.image} alt="" />}
            {cover?.big && <span className="panel-big">{cover.big}</span>}
          </div>
        )}
        <div className="panel-body">
          <h2>{item.title}</h2>
          <p className="panel-kind">{item.kind}</p>
          {item.description && <p className="panel-desc">{item.description}</p>}
          {item.details?.length > 0 && (
            <dl className="panel-details">
              {item.details.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {item.people?.length > 0 && (
            <ul className="people">
              {item.people.map((pp) => (
                <li key={pp.name}>
                  <div>
                    <strong>{pp.name}</strong>
                    <span>{pp.note}</span>
                  </div>
                  {pp.url ? (
                    <a href={pp.url} target="_blank" rel="noopener noreferrer">
                      Portfolio ↗
                    </a>
                  ) : (
                    <em>portfolio bientôt</em>
                  )}
                </li>
              ))}
            </ul>
          )}
          {(item.links?.length > 0 || item.copy) && (
            <div className="panel-links">
              {item.links.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">
                  {l.label} ↗
                </a>
              ))}
              {item.copy && (
                <button type="button" onClick={copy}>
                  {copied ? 'Copié ✓' : 'Copier'}
                </button>
              )}
            </div>
          )}
        </div>
      </article>
      <button className="viewer-close" onClick={onClose} aria-label="Fermer">
        ✕
      </button>
    </div>
  )
}
