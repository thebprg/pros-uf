'use client'

import { memo } from 'react'

const ScholarCard = memo(function ScholarCard({ data, onClick, isSaved, onToggleSave }) {
  const scoreClass = data.relevance_score >= 70 ? 'score-high' :
    data.relevance_score >= 50 ? 'score-med' : 'score-low'

  const handleAddClick = (e) => {
    e.stopPropagation()
    onToggleSave()
  }

  return (
    <div className={`scholar-card ${isSaved ? 'card-saved' : ''}`} onClick={onClick}>
      <div className="card-top">
        <div>
          <h3 className="card-name">{data.name}</h3>
          <p className="card-title">{data.title}</p>
        </div>
        <div className="card-top-right">
          <button
            className={`card-add-btn ${isSaved ? 'saved' : ''}`}
            onClick={handleAddClick}
            title={isSaved ? 'Remove from list' : 'Add to list'}
          >
            {isSaved ? '✓' : '+'}
          </button>
          <span className={`score-badge ${scoreClass}`}>{data.relevance_score}</span>
        </div>
      </div>

      <div className="card-info">
        <div className="info-item">
          <span>🏛️</span>
          <span>{data.department || 'N/A'}</span>
        </div>
        <div className="info-item">
          <span>💰</span>
          <strong>{data.active_grants_count}</strong> grants
        </div>
        <div className="info-item">
          <span>📄</span>
          <strong>{data.publications_count ?? data.publications?.length ?? 0}</strong> pubs
        </div>
      </div>

      {data.requirements && data.requirements.length > 0 && (
        <div className="card-tags">
          {data.requirements.slice(0, 2).map((r, i) => (
            <span key={i} className="tag tag-req">{r}</span>
          ))}
          {data.requirements.length > 2 && <span className="tag">+{data.requirements.length - 2}</span>}
        </div>
      )}

      {data.relevance_score >= 50 && (
        <div className="card-footer">
          <div className="good-match-badge">✓ Good Match</div>
        </div>
      )}
    </div>
  )
})

export default ScholarCard
