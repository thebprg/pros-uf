'use client'

import { useState } from 'react'
import PublicationCard from './PublicationCard'

export default function Modal({ data, onClose, loading }) {
  const [tab, setTab] = useState('grants')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-content">
            <h2>{data.name}</h2>
            <p>{data.title} • {data.department}</p>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {loading || data._loading ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <h3>Loading details...</h3>
            </div>
          ) : data._error ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <h3>⚠️ Failed to load details</h3>
            </div>
          ) : (
            <>
              <div className="modal-section">
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Email</label>
                    <span>{data.email || 'Not available'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Position</label>
                    <span>{data.position || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Relevance Score</label>
                    <span>{data.relevance_score}/100</span>
                  </div>
                  <div className="detail-item">
                    <label>Good Match</label>
                    <span>{data.relevance_score >= 50 ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              {data.requirements && data.requirements.length > 0 && (
                <div className="modal-section">
                  <h3>💻 Possible CS Requirements</h3>
                  <div className="card-tags">
                    {data.requirements.map((r, i) => (
                      <span key={i} className="tag tag-req">{r}</span>
                    ))}
                  </div>
                </div>
              )}

              {data.reasoning && data.reasoning.length > 0 && (
                <div className="modal-section">
                  <h3>📝 Analysis Reasoning <span className="count">{data.reasoning.length}</span></h3>
                  <ul className="reasoning-list">
                    {data.reasoning.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="modal-section">
                <div className="tabs">
                  <button className={`tab ${tab === 'grants' ? 'active' : ''}`} onClick={() => setTab('grants')}>
                    💰 Grants ({(data.active_grants?.length || 0) + (data.expired_grants?.length || 0)})
                  </button>
                  <button className={`tab ${tab === 'pubs' ? 'active' : ''}`} onClick={() => setTab('pubs')}>
                    📄 Publications ({data.publications?.length || 0})
                  </button>
                </div>

                {tab === 'grants' && (
                  <>
                    {data.active_grants?.length > 0 && (
                      <>
                        <h3 style={{ marginBottom: '0.75rem', color: 'var(--success)' }}>
                          🟢 Active Grants <span className="count">{data.active_grants.length}</span>
                        </h3>
                        {data.active_grants.map((g, i) => (
                          <div key={i} className="grant-card">
                            <div className="grant-title">{g.title}</div>
                            <div className="grant-meta">
                              {g.funder_name && <span>🏢 {g.funder_name}</span>}
                              {g.duration && <span> • 📅 {g.duration}</span>}
                              {g.status && <span> • {g.status}</span>}
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {data.expired_grants?.length > 0 && (
                      <>
                        <h3 style={{ margin: '1rem 0 0.75rem', color: 'var(--text-muted)' }}>
                          ⚪ Expired Grants <span className="count">{data.expired_grants.length}</span>
                        </h3>
                        {data.expired_grants.map((g, i) => (
                          <div key={i} className="grant-card" style={{ opacity: 0.7 }}>
                            <div className="grant-title">{g.title}</div>
                            <div className="grant-meta">
                              {g.funder_name && <span>🏢 {g.funder_name}</span>}
                              {g.duration && <span> • 📅 {g.duration}</span>}
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {!data.active_grants?.length && !data.expired_grants?.length && (
                      <p style={{ color: 'var(--text-muted)' }}>No grants found.</p>
                    )}
                  </>
                )}

                {tab === 'pubs' && (
                  <>
                    {data.publications?.length > 0 ? (
                      data.publications.map((p, i) => (
                        <PublicationCard key={i} pub={p} />
                      ))
                    ) : (
                      <p style={{ color: 'var(--text-muted)' }}>No publications found.</p>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
