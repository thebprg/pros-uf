'use client'

import { useState, useMemo, memo } from 'react'

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
          <button className="clear-filter-btn" onClick={onClear}>
            Clear ({selected.size})
          </button>
        )}
      </div>

      <div className="mode-toggle">
        <button className={`mode-btn ${mode === 'include' ? 'active' : ''}`}
          onClick={() => onModeChange('include')}>
          ✅ Include
        </button>
        <button className={`mode-btn ${mode === 'exclude' ? 'active' : ''}`}
          onClick={() => onModeChange('exclude')}>
          ❌ Exclude
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
            {item}
          </label>
        ))}
      </div>

      {filteredItems.length > 6 && (
        <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? '▲ Show less' : `▼ Show all (${filteredItems.length})`}
        </button>
      )}
    </div>
  )
})

export default MultiSelectFilter
