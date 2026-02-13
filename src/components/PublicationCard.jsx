'use client'

import { useState } from 'react'

export default function PublicationCard({ pub }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`pub-card ${expanded ? 'expanded' : ''}`} onClick={() => setExpanded(!expanded)}>
      <div className="pub-header">
        <div className="pub-title">{pub.title}</div>
        <span className="pub-expand-icon">{expanded ? '▲' : '▼'}</span>
      </div>
      <div className="pub-meta">{pub.date}</div>
      {pub.abstract && (
        <div className={`pub-abstract ${expanded ? 'full' : ''}`}>
          {expanded ? pub.abstract : (pub.abstract.length > 150 ? pub.abstract.substring(0, 150) + '...' : pub.abstract)}
        </div>
      )}
      {expanded && !pub.abstract && (
        <div className="pub-abstract" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
          No abstract available
        </div>
      )}
    </div>
  )
}
