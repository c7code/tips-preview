import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Trophy, Calendar } from 'lucide-react'
import { LEAGUES } from '../components/Sidebar'
import StandingsTable from '../components/StandingsTable'
import MatchCard from '../components/MatchCard'
import { fetchStandings, fetchEvents } from '../api/footballApi'

function formatDate(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}

export default function LeaguePage() {
  const { leagueId } = useParams()
  const [standings, setStandings] = useState([])
  const [matches, setMatches] = useState([])
  const [loadingStandings, setLoadingStandings] = useState(true)
  const [loadingMatches, setLoadingMatches] = useState(true)
  const [activeView, setActiveView] = useState('standings')

  const league = LEAGUES.find(l => l.id === parseInt(leagueId))

  useEffect(() => {
    const loadStandings = async () => {
      setLoadingStandings(true)
      try {
        const data = await fetchStandings(leagueId)
        setStandings(Array.isArray(data) ? data : [])
      } catch (err) {
        setStandings([])
      }
      setLoadingStandings(false)
    }

    const loadMatches = async () => {
      setLoadingMatches(true)
      try {
        // Get matches from 3 days ago to 3 days ahead
        const from = formatDate(-3)
        const to = formatDate(3)
        const data = await fetchEvents(leagueId, from, to)
        setMatches(Array.isArray(data) ? data : [])
      } catch (err) {
        setMatches([])
      }
      setLoadingMatches(false)
    }

    loadStandings()
    loadMatches()
  }, [leagueId])

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">
          {league ? league.flag : '🏆'} {league ? league.name : 'League'}
        </h1>
        <p className="page-subtitle">{league ? league.country : ''} · Season 2024/2025</p>
      </div>

      {/* View tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeView === 'standings' ? 'active' : ''}`}
          onClick={() => setActiveView('standings')}
        >
          <Trophy size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          Standings
        </button>
        <button
          className={`tab-btn ${activeView === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveView('matches')}
        >
          <Calendar size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          Matches
        </button>
      </div>

      {activeView === 'standings' && (
        <StandingsTable standings={standings} loading={loadingStandings} />
      )}

      {activeView === 'matches' && (
        <>
          {loadingMatches ? (
            <div className="match-cards-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton skeleton-card" />
              ))}
            </div>
          ) : matches.length > 0 ? (
            <div className="match-cards-grid">
              {matches.map((match) => (
                <MatchCard key={match.match_id} match={match} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="icon">📅</div>
              <h3>No recent matches</h3>
              <p>No matches found in the past 3 days or upcoming 3 days.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
