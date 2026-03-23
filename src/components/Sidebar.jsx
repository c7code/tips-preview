import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'

const LEAGUES = [
  { id: 152, name: 'Premier League', country: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 302, name: 'La Liga', country: 'Spain', flag: '🇪🇸' },
  { id: 207, name: 'Serie A', country: 'Italy', flag: '🇮🇹' },
  { id: 175, name: 'Bundesliga', country: 'Germany', flag: '🇩🇪' },
  { id: 168, name: 'Ligue 1', country: 'France', flag: '🇫🇷' },
  { id: 99, name: 'Brasileirão', country: 'Brazil', flag: '🇧🇷' },
  { id: 75, name: 'Série B', country: 'Brazil', flag: '🇧🇷' },
  { id: 44, name: 'Liga Argentina', country: 'Argentina', flag: '🇦🇷' },
  { id: 244, name: 'Eredivisie', country: 'Netherlands', flag: '🇳🇱' },
  { id: 266, name: 'Primeira Liga', country: 'Portugal', flag: '🇵🇹' },
  { id: 332, name: 'MLS', country: 'USA', flag: '🇺🇸' },
  { id: 278, name: 'Saudi Pro League', country: 'Saudi Arabia', flag: '🇸🇦' },
]

export { LEAGUES }

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="sidebar">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `sidebar-dashboard-link ${isActive && location.pathname === '/' ? 'active' : ''}`
        }
      >
        <LayoutDashboard size={18} />
        Dashboard
      </NavLink>

      <div className="sidebar-divider" />

      <div className="sidebar-section-title">Leagues</div>
      <ul className="sidebar-nav">
        {LEAGUES.map((league) => (
          <li key={league.id}>
            <NavLink
              to={`/league/${league.id}`}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="league-badge">{league.flag}</span>
              <span>{league.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  )
}
