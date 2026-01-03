import { useState, useMemo, useCallback, memo, useEffect } from 'react'
import './App.css'
import allData from './data.json'

const ITEMS_PER_PAGE = 25

const DEPT_MAPPINGS = {
  'AG': 'College of Agricultural and Life Sciences',
  'BA': 'Warrington College of Business',
  'CJC': 'College of Journalism and Communications',
  'COTA': 'College of the Arts',
  'DCP': 'College of Design, Construction and Planning',
  'DN': 'College of Dentistry',
  'ED': 'College of Education',
  'EG': 'Herbert Wertheim College of Engineering',
  'HH': 'College of Health and Human Performance',
  'JAX': 'College of Medicine – Jacksonville',
  'JX': 'College of Medicine – Jacksonville',
  'LB': 'George A. Smathers Libraries',
  'LS': 'College of Liberal Arts and Sciences',
  'LW': 'Levin College of Law',
  'MD': 'College of Medicine',
  'NH': 'Florida Museum of Natural History',
  'NR': 'College of Nursing',
  'PH': 'College of Pharmacy',
  'PHHP': 'College of Public Health and Health Professions',
  'VM': 'College of Veterinary Medicine',
  'SR': 'College of Veterinary Medicine',
  'HA': 'Health Affairs',
  'HP': 'Health Professions',
  'HS': 'Health Science Center',
  'RE': 'Office of Research',
  'SH': 'Student Health Care Center',
  'SL': 'Student Life',
  'PR': 'Office of the President',
  'PV': 'Office of the Provost',
  'TT': 'Treasurer\'s Office',
  'GR': 'Graduate School',
  'IP': 'UF Innovate',
  'IT': 'Information Technology'
}

function App() {
  // Theme
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  // Filters
  const [search, setSearch] = useState('')
  const [minScore, setMinScore] = useState('')
  const [maxScore, setMaxScore] = useState('')
  const [minGrants, setMinGrants] = useState('')
  const [reqSearch, setReqSearch] = useState('')
  const [emailOnly, setEmailOnly] = useState(false)

  // Department filters
  const [selectedDepts, setSelectedDepts] = useState(new Set())
  const [deptMode, setDeptMode] = useState('include')
  const [selectedSubDepts, setSelectedSubDepts] = useState(new Set())
  const [subDeptMode, setSubDeptMode] = useState('include')

  // Position filter
  const [selectedPositions, setSelectedPositions] = useState(new Set())
  const [posMode, setPosMode] = useState('include')

  // UI state
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [showListModal, setShowListModal] = useState(false)

  // Saved list (cart-like feature)
  const [savedList, setSavedList] = useState(new Set())

  // Pagination
  const [page, setPage] = useState(1)

  // Modal
  const [selected, setSelected] = useState(null)

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearch('')
    setMinScore('')
    setMaxScore('')
    setMinGrants('')
    setReqSearch('')
    setEmailOnly(false)
    setSelectedDepts(new Set())
    setSelectedSubDepts(new Set())
    setSelectedPositions(new Set())
    setDeptMode('include')
    setSubDeptMode('include')
    setPosMode('include')
    setPage(1)
  }, [])

  // List functions
  const toggleSaved = useCallback((id) => {
    setSavedList(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }, [])

  const addAllFiltered = useCallback((filteredItems) => {
    setSavedList(prev => {
      const newSet = new Set(prev)
      filteredItems.forEach(item => newSet.add(item.id))
      return newSet
    })
  }, [])

  const removeFromList = useCallback((id) => {
    setSavedList(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }, [])

  const clearList = useCallback(() => {
    setSavedList(new Set())
  }, [])

  const downloadCSV = useCallback(() => {
    const savedItems = allData.filter(item => savedList.has(item.id))
    if (savedItems.length === 0) return

    // CSV headers - includes all fields with nested data as JSON strings
    const headers = [
      'name', 'email', 'department', 'position', 'title',
      'relevance_score', 'should_email', 'active_grants_count',
      'active_grants_json', 'expired_grants_json', 'publications_json',
      'possible_requirements', 'reasoning'
    ]

    // Build CSV content
    const csvRows = [headers.join(',')]
    savedItems.forEach(item => {
      const row = [
        `"${(item.name || '').replace(/"/g, '""')}"`,
        `"${(item.email || '').replace(/"/g, '""')}"`,
        `"${(item.department || '').replace(/"/g, '""')}"`,
        `"${(item.position || '').replace(/"/g, '""')}"`,
        `"${(item.title || '').replace(/"/g, '""')}"`,
        item.relevance_score || 0,
        `"${(item.should_email || '').replace(/"/g, '""')}"`,
        item.active_grants_count || 0,
        `"${JSON.stringify(item.active_grants || []).replace(/"/g, '""')}"`,
        `"${JSON.stringify(item.expired_grants || []).replace(/"/g, '""')}"`,
        `"${JSON.stringify(item.publications || []).replace(/"/g, '""')}"`,
        `"${(item.requirements || []).join('; ').replace(/"/g, '""')}"`,
        `"${(item.reasoning || []).join('; ').replace(/"/g, '""')}"`
      ]
      csvRows.push(row.join(','))
    })

    // Download
    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `scholars_list_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [savedList])

  const downloadJSON = useCallback(() => {
    const savedItems = allData.filter(item => savedList.has(item.id))
    if (savedItems.length === 0) return

    // Transform data to move possible_requirements and reasoning to end
    const transformedItems = savedItems.map(item => {
      const { requirements, reasoning, ...rest } = item
      return {
        ...rest,
        possible_requirements: requirements,
        reasoning: reasoning
      }
    })

    // Export complete data as JSON
    const jsonContent = JSON.stringify(transformedItems, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `scholars_list_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [savedList])

  // Parse departments and positions
  const { departments, positions, deptToSubDepts } = useMemo(() => {
    const depts = new Set()
    const pos = new Set()
    const mapping = {} // mainDept (Display Name) -> Set of "MainDept-SubDept" strings

    allData.forEach(item => {
      if (item.department) {
        const parts = item.department.split('-')
        const mainDeptCode = parts[0].trim()
        const subDept = parts.length > 1 ? parts.slice(1).join('-').trim() : null

        if (mainDeptCode) {
          // Create nice display name: "CODE - College Name"
          const mappedName = DEPT_MAPPINGS[mainDeptCode]
          const displayName = mappedName ? `${mainDeptCode} - ${mappedName}` : mainDeptCode

          depts.add(displayName)
          if (!mapping[displayName]) mapping[displayName] = new Set()
          // Store full "MainDept-SubDept" string for display
          if (subDept) mapping[displayName].add(`${mainDeptCode}-${subDept}`)
        }
      }
      if (item.position) pos.add(item.position)
    })

    return {
      departments: Array.from(depts).sort(),
      positions: Array.from(pos).sort(),
      deptToSubDepts: mapping
    }
  }, [])

  const availableSubDepts = useMemo(() => {
    if (selectedDepts.size === 0) {
      const all = new Set()
      Object.values(deptToSubDepts).forEach(subs => subs.forEach(s => all.add(s)))
      return Array.from(all).sort()
    }
    const subs = new Set()
    selectedDepts.forEach(d => {
      if (deptToSubDepts[d]) deptToSubDepts[d].forEach(s => subs.add(s))
    })
    return Array.from(subs).sort()
  }, [selectedDepts, deptToSubDepts])

  // Filtering logic with parsed values
  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase()
    const reqLower = reqSearch.toLowerCase()
    const minScoreVal = minScore === '' ? 0 : parseInt(minScore, 10) || 0
    const maxScoreVal = maxScore === '' ? 100 : parseInt(maxScore, 10) || 100
    const minGrantsVal = minGrants === '' ? 0 : parseInt(minGrants, 10) || 0

    return allData.filter(item => {
      if (search && !item.name.toLowerCase().includes(searchLower) &&
        !(item.title || '').toLowerCase().includes(searchLower)) return false

      if (item.relevance_score < minScoreVal || item.relevance_score > maxScoreVal) return false
      if (item.active_grants_count < minGrantsVal) return false
      if (emailOnly && (item.should_email || '').toLowerCase() !== 'yes') return false

      if (reqSearch) {
        const hasMatch = item.requirements?.some(r => r.toLowerCase().includes(reqLower))
        if (!hasMatch) return false
      }

      if (selectedDepts.size > 0) {
        const parts = (item.department || '').split('-')
        const mainDeptCode = parts[0].trim()
        const mappedName = DEPT_MAPPINGS[mainDeptCode]
        const displayName = mappedName ? `${mainDeptCode} - ${mappedName}` : mainDeptCode

        const isSelected = selectedDepts.has(displayName)
        if (deptMode === 'include' && !isSelected) return false
        if (deptMode === 'exclude' && isSelected) return false
      }

      if (selectedSubDepts.size > 0) {
        // Sub-depts are now stored as "MainDept-SubDept", so compare directly
        const fullDept = (item.department || '').trim()
        const isSelected = selectedSubDepts.has(fullDept)
        if (subDeptMode === 'include' && !isSelected) return false
        if (subDeptMode === 'exclude' && isSelected) return false
      }

      if (selectedPositions.size > 0) {
        const isSelected = selectedPositions.has(item.position)
        if (posMode === 'include' && !isSelected) return false
        if (posMode === 'exclude' && isSelected) return false
      }

      return true
    })
  }, [search, minScore, maxScore, minGrants, emailOnly, reqSearch,
    selectedDepts, deptMode, selectedSubDepts, subDeptMode, selectedPositions, posMode])

  // Reset page when filters change
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const currentPage = Math.min(page, totalPages || 1)

  // Paginated results
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  const toggleSet = useCallback((set, setFn, value) => {
    const newSet = new Set(set)
    if (newSet.has(value)) newSet.delete(value)
    else newSet.add(value)
    setFn(newSet)
    setPage(1)
  }, [])

  // Special handler for department toggle - clears orphaned sub-departments when unchecking
  const toggleDept = useCallback((value) => {
    const newDepts = new Set(selectedDepts)
    const isRemoving = newDepts.has(value)

    if (isRemoving) {
      newDepts.delete(value)

      // When unchecking a department, clear any sub-departments that belonged to it
      // (and don't belong to any remaining selected departments)
      if (selectedSubDepts.size > 0) {
        // Get sub-depts that belong to the removed department
        const removedDeptSubs = deptToSubDepts[value] || new Set()

        // Get sub-depts that still belong to remaining selected departments
        const stillValidSubs = new Set()
        newDepts.forEach(d => {
          if (deptToSubDepts[d]) {
            deptToSubDepts[d].forEach(s => stillValidSubs.add(s))
          }
        })

        // Keep only sub-depts that are still valid (belong to a remaining dept)
        // OR if no depts are selected, all become valid
        if (newDepts.size > 0) {
          const newSubDepts = new Set()
          selectedSubDepts.forEach(s => {
            if (stillValidSubs.has(s)) {
              newSubDepts.add(s)
            }
          })
          setSelectedSubDepts(newSubDepts)
        }
        // If newDepts.size === 0, all subs are valid, keep current selections
      }
    } else {
      newDepts.add(value)
    }

    setSelectedDepts(newDepts)
    setPage(1)
  }, [selectedDepts, selectedSubDepts, deptToSubDepts])

  const handleFilterChange = useCallback((setter) => (e) => {
    setter(e.target.value)
    setPage(1)
  }, [])

  return (
    <div className="app">
      <header className="header">
        <h1>Gator Scholars</h1>
        <div className="header-right">
          <div className="header-stats">
            Showing <strong>{paginatedResults.length}</strong> of {filtered.length} matches ({allData.length} total)
          </div>
          <button className="list-badge" onClick={() => setShowListModal(true)}>
            📋 View List {savedList.size > 0 && <span className="list-count">{savedList.size}</span>}
          </button>
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <div className="main">
        <aside className="sidebar">
          <div className="filter-section">
            <label className="filter-label">🔍 Search by Name or Title</label>
            <input
              type="text"
              className="filter-input"
              placeholder="e.g. John Smith..."
              value={search}
              onChange={handleFilterChange(setSearch)}
            />
          </div>

          <div className="filter-section">
            <label className="filter-label">Relevance Score Range</label>
            <div className="range-inputs">
              <div className="range-input-group">
                <span>Min:</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="0"
                  value={minScore}
                  onChange={handleFilterChange(setMinScore)}
                />
              </div>
              <div className="range-input-group">
                <span>Max:</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="100"
                  value={maxScore}
                  onChange={handleFilterChange(setMaxScore)}
                />
              </div>
            </div>
          </div>

          <div className="filter-section">
            <label className="filter-label">Minimum Active Grants</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="filter-input"
              placeholder="0"
              value={minGrants}
              onChange={handleFilterChange(setMinGrants)}
            />
          </div>

          <div className="filter-section">
            <label className="filter-label">CS Requirement Keywords</label>
            <input
              type="text"
              className="filter-input"
              placeholder="e.g. Machine Learning..."
              value={reqSearch}
              onChange={handleFilterChange(setReqSearch)}
            />
          </div>

          <div className="filter-section">
            <label className="filter-checkbox">
              <input type="checkbox" checked={emailOnly} onChange={e => { setEmailOnly(e.target.checked); setPage(1) }} />
              Show Only "Good Match" Scholars
            </label>
          </div>

          <MultiSelectFilter
            label="🏛️ Department (Primary)"
            items={departments}
            selected={selectedDepts}
            onToggle={toggleDept}
            mode={deptMode}
            onModeChange={setDeptMode}
            onClear={() => { setSelectedDepts(new Set()); setSelectedSubDepts(new Set()); setPage(1) }}
          />

          <MultiSelectFilter
            label="📁 Sub-Department"
            items={availableSubDepts}
            selected={selectedSubDepts}
            onToggle={(val) => toggleSet(selectedSubDepts, setSelectedSubDepts, val)}
            mode={subDeptMode}
            onModeChange={setSubDeptMode}
            onClear={() => { setSelectedSubDepts(new Set()); setPage(1) }}
          />

          <button className="more-filters-btn" onClick={() => setShowMoreFilters(!showMoreFilters)}>
            {showMoreFilters ? '▲ Less Filters' : '▼ More Filters...'}
          </button>

          {showMoreFilters && (
            <MultiSelectFilter
              label="👔 Position / Role"
              items={positions}
              selected={selectedPositions}
              onToggle={(val) => toggleSet(selectedPositions, setSelectedPositions, val)}
              mode={posMode}
              onModeChange={setPosMode}
              onClear={() => { setSelectedPositions(new Set()); setPage(1) }}
            />
          )}

          <button className="clear-all-btn" onClick={clearAllFilters}>
            🗑️ Clear All Filters
          </button>
        </aside>

        <main className="results">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <h3>No matches found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="results-header">
                <button className="select-all-btn" onClick={() => addAllFiltered(filtered)}>
                  ➕ Add All Filtered ({filtered.length}) to List
                </button>
              </div>
              <div className="results-grid">
                {paginatedResults.map(scholar => (
                  <ScholarCard
                    key={scholar.id}
                    data={scholar}
                    onClick={() => setSelected(scholar)}
                    isSaved={savedList.has(scholar.id)}
                    onToggleSave={() => toggleSaved(scholar.id)}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    ← Prev
                  </button>
                  <span className="page-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {selected && <Modal data={selected} onClose={() => setSelected(null)} />}

      {showListModal && (
        <ListModal
          savedList={savedList}
          allData={allData}
          onRemove={removeFromList}
          onClear={clearList}
          onDownloadCSV={downloadCSV}
          onDownloadJSON={downloadJSON}
          onClose={() => setShowListModal(false)}
        />
      )}
    </div>
  )
}

function ListModal({ savedList, allData, onRemove, onClear, onDownloadCSV, onDownloadJSON, onClose }) {
  const savedItems = allData.filter(item => savedList.has(item.id))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="list-modal" onClick={e => e.stopPropagation()}>
        <div className="list-modal-header">
          <h2>📋 Saved Scholars ({savedItems.length})</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="list-modal-body">
          {savedItems.length === 0 ? (
            <div className="empty-state">
              <h3>Your list is empty</h3>
              <p>Add scholars using the + button on their cards</p>
            </div>
          ) : (
            <table className="list-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Score</th>
                  <th>Email</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {savedItems.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong><br /><small>{item.title}</small></td>
                    <td>{item.department}</td>
                    <td>{item.relevance_score}</td>
                    <td>{item.email || '-'}</td>
                    <td>
                      <button className="remove-btn" onClick={() => onRemove(item.id)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="list-modal-footer">
          <button className="clear-list-btn" onClick={onClear} disabled={savedItems.length === 0}>
            🗑️ Clear
          </button>
          <button className="download-btn csv" onClick={onDownloadCSV} disabled={savedItems.length === 0}>
            📄 CSV
          </button>
          <button className="download-btn json" onClick={onDownloadJSON} disabled={savedItems.length === 0}>
            📦 JSON (Full)
          </button>
        </div>
      </div>
    </div>
  )
}

const MultiSelectFilter = memo(function MultiSelectFilter({ label, items, selected, onToggle, mode, onModeChange, onClear }) {
  const [expanded, setExpanded] = useState(false)
  const [filterText, setFilterText] = useState('')

  const filteredItems = useMemo(() => {
    return filterText
      ? items.filter(i => i.toLowerCase().includes(filterText.toLowerCase()))
      : items
  }, [items, filterText])

  return (
    <div className="filter-section multi-select">
      <div className="multi-header">
        <label className="filter-label">{label}</label>
        {selected.size > 0 && (
          <button className="clear-btn" onClick={onClear}>Clear ({selected.size})</button>
        )}
      </div>

      <div className="mode-toggle">
        <button className={`mode-btn ${mode === 'include' ? 'active' : ''}`} onClick={() => onModeChange('include')}>
          ✓ Include
        </button>
        <button className={`mode-btn ${mode === 'exclude' ? 'active' : ''}`} onClick={() => onModeChange('exclude')}>
          ✗ Exclude
        </button>
      </div>

      <input
        type="text"
        className="filter-input filter-search"
        placeholder="Filter options..."
        value={filterText}
        onChange={e => setFilterText(e.target.value)}
      />

      <div className={`checkbox-list ${expanded ? 'expanded' : ''}`}>
        {filteredItems.slice(0, expanded ? undefined : 6).map(item => (
          <label key={item} className="checkbox-item">
            <input type="checkbox" checked={selected.has(item)} onChange={() => onToggle(item)} />
            <span>{item}</span>
          </label>
        ))}
      </div>

      {filteredItems.length > 6 && (
        <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show Less' : `Show All (${filteredItems.length})`}
        </button>
      )}
    </div>
  )
})

const ScholarCard = memo(function ScholarCard({ data, onClick, isSaved, onToggleSave }) {
  const scoreClass = data.relevance_score >= 70 ? 'score-high' :
    data.relevance_score >= 40 ? 'score-med' : 'score-low'

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
          <strong>{data.publications?.length || 0}</strong> pubs
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

      {data.should_email === 'Yes' && (
        <div className="card-footer">
          <div className="good-match-badge">✓ Good Match</div>
        </div>
      )}
    </div>
  )
})

function PublicationCard({ pub }) {
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

function Modal({ data, onClose }) {
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
                <span>{data.should_email}</span>
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
        </div>
      </div>
    </div>
  )
}

export default App
