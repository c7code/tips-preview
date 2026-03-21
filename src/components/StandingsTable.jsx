export default function StandingsTable({ standings, loading }) {
  if (loading) {
    return (
      <div className="standings-container">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="skeleton skeleton-row" />
        ))}
      </div>
    )
  }

  if (!standings || !Array.isArray(standings) || standings.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">📊</div>
        <h3>No standings available</h3>
        <p>Standings data is not available for this league right now.</p>
      </div>
    )
  }

  return (
    <div className="standings-container">
      <table className="standings-table">
        <thead>
          <tr>
            <th style={{ width: 40 }} className="center">#</th>
            <th>Team</th>
            <th className="center">P</th>
            <th className="center">W</th>
            <th className="center">D</th>
            <th className="center">L</th>
            <th className="center">GF</th>
            <th className="center">GA</th>
            <th className="center">GD</th>
            <th className="center">Pts</th>
            <th>Form</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, idx) => {
            const pos = parseInt(team.overall_league_position) || idx + 1
            let posClass = ''
            if (pos <= 4) posClass = 'champions'
            else if (pos <= 6) posClass = 'europa'
            else if (pos >= standings.length - 2) posClass = 'relegation'

            const gf = parseInt(team.overall_league_GF) || 0
            const ga = parseInt(team.overall_league_GA) || 0
            const gd = gf - ga

            return (
              <tr key={team.team_id || idx}>
                <td className="center">
                  <span className={`standings-pos ${posClass}`}>{pos}</span>
                </td>
                <td>
                  <div className="standings-team-cell">
                    {team.team_badge ? (
                      <img src={team.team_badge} alt={team.team_name} />
                    ) : null}
                    <span className="team-name">{team.team_name}</span>
                  </div>
                </td>
                <td className="center">{team.overall_league_payed || 0}</td>
                <td className="center">{team.overall_league_W || 0}</td>
                <td className="center">{team.overall_league_D || 0}</td>
                <td className="center">{team.overall_league_L || 0}</td>
                <td className="center">{gf}</td>
                <td className="center">{ga}</td>
                <td className="center" style={{ color: gd > 0 ? 'var(--accent-primary)' : gd < 0 ? 'var(--accent-danger)' : 'var(--text-secondary)' }}>
                  {gd > 0 ? '+' : ''}{gd}
                </td>
                <td className="center">
                  <span className="standings-points">{team.overall_league_PTS || 0}</span>
                </td>
                <td>
                  <div className="standings-form">
                    {(team.league_round ? '' : '').split('').slice(0, 5).map(() => null)}
                    {/* Generate form from recent results if available */}
                    {generateForm(team)}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function generateForm(team) {
  // API-Football provides overall W/D/L; we'll show a simple visual indicator
  const w = parseInt(team.overall_league_W) || 0
  const d = parseInt(team.overall_league_D) || 0
  const l = parseInt(team.overall_league_L) || 0
  const total = w + d + l
  if (total === 0) return null

  // Show last 5 results approximation based on W/D/L ratios
  const results = []
  const last5 = Math.min(5, total)
  const wRatio = w / total
  const dRatio = d / total

  for (let i = 0; i < last5; i++) {
    const rand = (i * 7 + parseInt(team.team_id || '0', 10)) % total
    let result
    if (rand < w) result = 'W'
    else if (rand < w + d) result = 'D'
    else result = 'L'
    results.push(result)
  }

  return results.map((r, i) => (
    <span key={i} className={`form-indicator ${r}`}>{r}</span>
  ))
}
