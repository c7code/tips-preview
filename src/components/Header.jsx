import { useState, useEffect } from 'react'
import { Activity } from 'lucide-react'

export default function Header() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (d) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  const formatDate = (d) =>
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-brand-icon">⚽</div>
        <h1>
          Crashed<span>Bet</span>
        </h1>
      </div>
      <div className="header-right">
        <div className="header-badge">
          <span className="dot" />
          <span>Live Data</span>
        </div>
        <div className="header-time">
          {formatDate(time)} · {formatTime(time)}
        </div>
      </div>
    </header>
  )
}
