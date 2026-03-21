import { useNavigate } from 'react-router-dom'

function getMatchStatus(match) {
  const status = (match.match_status || '').trim()
  if (!status || status === '') return 'scheduled'
  if (status === 'Finished' || status === 'After Pens.' || status === 'After ET') return 'finished'
  if (status === 'Half Time' || !isNaN(parseInt(status))) return 'live'
  return 'scheduled'
}

function getStatusLabel(match) {
  const status = (match.match_status || '').trim()
  if (!status || status === '') {
    return match.match_time || 'TBD'
  }
  if (status === 'Finished') return 'FT'
  if (status === 'Half Time') return 'HT'
  if (status === 'After Pens.') return 'Pens'
  if (!isNaN(parseInt(status))) return `${status}'`
  return status
}

export default function MatchCard({ match, showLeague = false }) {
  const navigate = useNavigate()
  const status = getMatchStatus(match)

  return (
    <div
      className={`match-card ${status === 'live' ? 'live' : ''}`}
      onClick={() => navigate(`/match/${match.match_id}`)}
      style={{ animationDelay: `${Math.random() * 0.2}s` }}
    >
      <div className="match-card-header">
        <span className="match-card-league">
          {showLeague ? match.league_name : match.match_date}
        </span>
        <span className={`match-status ${status}`}>{getStatusLabel(match)}</span>
      </div>
      <div className="match-card-body">
        <div className="match-team">
          {match.team_home_badge ? (
            <img src={match.team_home_badge} alt={match.match_hometeam_name} />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏠</div>
          )}
          <span className="match-team-name">{match.match_hometeam_name}</span>
        </div>

        {status === 'scheduled' ? (
          <div className="match-card-time">
            <span>{match.match_time || 'TBD'}</span>
          </div>
        ) : (
          <div className="match-score">
            <span className="match-score-number">{match.match_hometeam_score}</span>
            <span className="match-score-divider">–</span>
            <span className="match-score-number">{match.match_awayteam_score}</span>
          </div>
        )}

        <div className="match-team">
          {match.team_away_badge ? (
            <img src={match.team_away_badge} alt={match.match_awayteam_name} />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✈️</div>
          )}
          <span className="match-team-name">{match.match_awayteam_name}</span>
        </div>
      </div>

      {(match.match_hometeam_halftime_score || match.statistics) && (
        <div className="match-card-footer">
          {match.match_hometeam_halftime_score && (
            <div className="match-card-stat">
              <span className="value">
                {match.match_hometeam_halftime_score} - {match.match_awayteam_halftime_score}
              </span>
              <span>Half Time</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
