import { X } from 'lucide-react'

export default function MatchDetail({ match, onClose }) {
  if (!match) return null

  const stats = match.statistics || []
  const goalscorers = match.goalscorer || []
  const cards = match.cards || []

  const statPairs = []
  if (stats.length > 0) {
    stats.forEach((stat) => {
      statPairs.push({
        label: stat.type,
        home: stat.home,
        away: stat.away,
      })
    })
  }

  return (
    <div className="match-detail-overlay" onClick={onClose}>
      <div className="match-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="match-detail-close" onClick={onClose}>
          <X size={18} />
        </button>

        {/* Header */}
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
                {match.match_status === 'Finished' ? 'Full Time' : match.match_status || match.match_time}
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
            {match.match_date} · {match.match_time} · {match.league_name} · {match.match_stadium || 'Unknown Venue'}
          </div>
        </div>

        {/* Statistics */}
        {statPairs.length > 0 && (
          <div className="match-detail-body">
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)', marginBottom: 16 }}>
              Match Statistics
            </h3>
            {statPairs.map((stat, i) => {
              const homeVal = parseFloat(stat.home) || 0
              const awayVal = parseFloat(stat.away) || 0
              const total = homeVal + awayVal || 1
              const homePct = (homeVal / total) * 100
              const awayPct = (awayVal / total) * 100

              return (
                <div className="stat-row" key={i}>
                  <span className="stat-value home">{stat.home}</span>
                  <div className="stat-bars">
                    <div className="stat-bar-home" style={{ width: `${homePct}%` }} />
                    <div className="stat-bar-away" style={{ width: `${awayPct}%` }} />
                  </div>
                  <span className="stat-label">{stat.label}</span>
                  <div className="stat-bars">
                    <div className="stat-bar-home" style={{ width: `${homePct}%` }} />
                    <div className="stat-bar-away" style={{ width: `${awayPct}%` }} />
                  </div>
                  <span className="stat-value away">{stat.away}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Goal Scorers */}
        {goalscorers.length > 0 && (
          <div className="events-timeline">
            <h3>⚽ Goals</h3>
            {goalscorers.map((goal, i) => (
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

        {/* Cards */}
        {cards.length > 0 && (
          <div className="events-timeline">
            <h3>🟨 Cards</h3>
            {cards.map((card, i) => (
              <div className="event-item" key={i}>
                <span className="event-time">{card.time}'</span>
                <span className="event-icon">{card.card === 'yellow card' ? '🟨' : '🟥'}</span>
                <span>
                  {card.home_fault && <span>{card.home_fault}</span>}
                  {card.away_fault && <span>{card.away_fault}</span>}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* If no stats available */}
        {statPairs.length === 0 && goalscorers.length === 0 && (
          <div className="empty-state" style={{ padding: 40 }}>
            <div className="icon">📊</div>
            <h3>Match details not yet available</h3>
            <p>Statistics and events will appear once the match starts.</p>
          </div>
        )}
      </div>
    </div>
  )
}
