import { useState, useEffect, useMemo } from 'react'
import { Calendar, TrendingUp } from 'lucide-react'
import { LEAGUES } from '../components/Sidebar'
import MatchCard from '../components/MatchCard'
import { fetchEvents } from '../api/footballApi'

function formatDate(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}

const DAY_TABS = [
  { label: 'Yesterday', offset: -1 },
  { label: 'Today', offset: 0 },
  { label: 'Tomorrow', offset: 1 },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(1) // "Today" is default
  const [activeLeague, setActiveLeague] = useState(null) // null = all
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const offset = DAY_TABS[activeTab].offset
      const date = formatDate(offset)

      try {
        const leagues = activeLeague ? [LEAGUES.find(l => l.id === activeLeague)] : LEAGUES
        const promises = leagues.filter(Boolean).map(league =>
          fetchEvents(league.id, date, date).then(data => {
            if (Array.isArray(data)) return data
            if (data && data.error) return []
            return []
          }).catch(() => [])
        )
        const results = await Promise.all(promises)
        setMatches(results.flat())
      } catch (err) {
        console.error('Error fetching matches:', err)
        setMatches([])
      }
      setLoading(false)
    }
    load()
  }, [activeTab, activeLeague])

  const sortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => {
      // Live matches first
      const aLive = a.match_status && a.match_status !== '' && a.match_status !== 'Finished'
      const bLive = b.match_status && b.match_status !== '' && b.match_status !== 'Finished'
      if (aLive && !bLive) return -1
      if (!aLive && bLive) return 1
      return (a.match_time || '').localeCompare(b.match_time || '')
    })
  }, [matches])

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          <Calendar size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10, color: 'var(--accent-primary)' }} />
          Match Center
        </h1>
        <p className="page-subtitle">Track live and upcoming matches across all major leagues</p>
      </div>

      {/* Day tabs */}
      <div className="tabs">
        {DAY_TABS.map((tab, i) => (
          <button
            key={i}
            className={`tab-btn ${activeTab === i ? 'active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* League filter chips */}
      <div className="filter-chips">
        <button
          className={`filter-chip ${activeLeague === null ? 'active' : ''}`}
          onClick={() => setActiveLeague(null)}
        >
          All Leagues
        </button>
        {LEAGUES.map((league) => (
          <button
            key={league.id}
            className={`filter-chip ${activeLeague === league.id ? 'active' : ''}`}
            onClick={() => setActiveLeague(league.id)}
          >
            {league.flag} {league.name}
          </button>
        ))}
      </div>

      {/* Matches */}
      {loading ? (
        <div className="match-cards-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton skeleton-card" />
          ))}
        </div>
      ) : sortedMatches.length > 0 ? (
        <div className="match-cards-grid">
          {sortedMatches.map((match) => (
            <MatchCard key={match.match_id} match={match} showLeague />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="icon">⚽</div>
          <h3>No matches found</h3>
          <p>There are no matches scheduled for {DAY_TABS[activeTab].label.toLowerCase()}{activeLeague ? ' in the selected league' : ''}. Try a different day or league.</p>
        </div>
      )}
    </div>
  )
}
