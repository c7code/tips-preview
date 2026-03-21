import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Swords } from 'lucide-react'
import MatchDetail from '../components/MatchDetail'
import AiAnalysis from '../components/AiAnalysis'
import { fetchMatch, fetchH2H } from '../api/footballApi'

export default function MatchPage() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const [match, setMatch] = useState(null)
  const [h2h, setH2h] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchMatch(matchId)
        const matchData = Array.isArray(data) ? data[0] : null
        setMatch(matchData)

        if (matchData && matchData.match_hometeam_id && matchData.match_awayteam_id) {
          try {
            const h2hData = await fetchH2H(matchData.match_hometeam_id, matchData.match_awayteam_id)
            if (h2hData && h2hData.firstTeam_VS_secondTeam) {
              setH2h(h2hData.firstTeam_VS_secondTeam.slice(0, 5))
            }
          } catch {
            setH2h([])
          }
        }
      } catch (err) {
        console.error('Error fetching match:', err)
      }
      setLoading(false)
    }
    load()
  }, [matchId])

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: 300, borderRadius: 16, marginBottom: 20 }} />
        <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
      </div>
    )
  }

  if (!match) {
    return (
      <div className="empty-state">
        <div className="icon">🔍</div>
        <h3>Match not found</h3>
        <p>The match data is not available. It may not exist or the API key may not be configured.</p>
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: 20,
            padding: '10px 24px',
            borderRadius: 10,
            border: '1px solid var(--border-color)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.9rem',
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          marginBottom: 20,
          fontFamily: 'Inter, sans-serif',
          padding: 0,
        }}
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Match Detail Inline */}
      <div className="standings-container" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Match Header */}
        <div className="match-detail-header">
          <div className="match-detail-teams">
            <div className="match-detail-team">
              {match.team_home_badge ? (
                <img src={match.team_home_badge} alt={match.match_hometeam_name} />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: 12, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🏠</div>
              )}
              <span className="match-detail-team-name">{match.match_hometeam_name}</span>
            </div>

            <div className="match-detail-score-box">
              <div className="match-detail-score">
                {match.match_hometeam_score ?? '–'} : {match.match_awayteam_score ?? '–'}
              </div>
              <div className="match-detail-info">
                {match.match_status === 'Finished' ? 'Full Time' : match.match_status || match.match_time || 'Scheduled'}
              </div>
            </div>

            <div className="match-detail-team">
              {match.team_away_badge ? (
                <img src={match.team_away_badge} alt={match.match_awayteam_name} />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: 12, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>✈️</div>
              )}
              <span className="match-detail-team-name">{match.match_awayteam_name}</span>
            </div>
          </div>

          <div className="match-detail-info" style={{ textAlign: 'center' }}>
            {match.match_date} · {match.match_time} · {match.league_name}
            {match.match_stadium ? ` · ${match.match_stadium}` : ''}
          </div>
        </div>

        {/* Statistics */}
        {match.statistics && match.statistics.length > 0 && (
          <div className="match-detail-body">
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)', marginBottom: 16 }}>
              Match Statistics
            </h3>
            {match.statistics.map((stat, i) => {
              const homeVal = parseFloat(stat.home) || 0
              const awayVal = parseFloat(stat.away) || 0
              const total = homeVal + awayVal || 1
              const homePct = (homeVal / total) * 100
              const awayPct = (awayVal / total) * 100

              return (
                <div className="stat-row" key={i}>
                  <span className="stat-value home">{stat.home}</span>
                  <div className="stat-bars" style={{ flex: 1 }}>
                    <div className="stat-bar-home" style={{ width: `${homePct}%` }} />
                    <div className="stat-bar-away" style={{ width: `${awayPct}%` }} />
                  </div>
                  <span className="stat-label">{stat.type}</span>
                  <div className="stat-bars" style={{ flex: 1 }}>
                    <div className="stat-bar-home" style={{ width: `${homePct}%` }} />
                    <div className="stat-bar-away" style={{ width: `${awayPct}%` }} />
                  </div>
                  <span className="stat-value away">{stat.away}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Goalscorers */}
        {match.goalscorer && match.goalscorer.length > 0 && (
          <div className="events-timeline">
            <h3>⚽ Goals</h3>
            {match.goalscorer.map((goal, i) => (
              <div className="event-item" key={i}>
                <span className="event-time">{goal.time}'</span>
                <span className="event-icon">⚽</span>
                <span>
                  {goal.home_scorer && <strong>{goal.home_scorer}</strong>}
                  {goal.away_scorer && <strong>{goal.away_scorer}</strong>}
                  {goal.info && <span style={{ color: 'var(--text-tertiary)', marginLeft: 6 }}>({goal.info})</span>}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* H2H Section */}
      {h2h.length > 0 && (
        <div className="h2h-container">
          <div className="h2h-header">
            <Swords size={18} style={{ color: 'var(--accent-secondary)' }} />
            Head-to-Head
          </div>
          {h2h.map((m, i) => (
            <div className="h2h-match" key={i}>
              <span className="date">{m.match_date}</span>
              <span className="teams">
                {m.match_hometeam_name} vs {m.match_awayteam_name}
              </span>
              <span className="score">
                {m.match_hometeam_score} - {m.match_awayteam_score}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* AI Analysis */}
      <AiAnalysis matchData={{
        homeTeam: match.match_hometeam_name,
        awayTeam: match.match_awayteam_name,
        homeScore: match.match_hometeam_score,
        awayScore: match.match_awayteam_score,
        league: match.league_name,
        date: match.match_date,
        status: match.match_status,
        statistics: match.statistics,
        goalscorer: match.goalscorer,
        cards: match.cards,
        h2h: h2h,
        homeHalftimeScore: match.match_hometeam_halftime_score,
        awayHalftimeScore: match.match_awayteam_halftime_score,
        stadium: match.match_stadium,
        referee: match.match_referee,
        matchTime: match.match_time,
      }} />
    </div>
  )
}
