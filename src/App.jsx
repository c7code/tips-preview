import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import LeaguePage from './pages/LeaguePage'
import MatchPage from './pages/MatchPage'

function App() {
  return (
    <>
      <Header />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/league/:leagueId" element={<LeaguePage />} />
            <Route path="/match/:matchId" element={<MatchPage />} />
          </Routes>
        </main>
      </div>
    </>
  )
}

export default App
