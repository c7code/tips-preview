import { useState } from 'react'
import { Ticket, X, Loader2, RefreshCw, Trophy, Target } from 'lucide-react'
import { fetchOdds } from '../api/footballApi'
import { parseOddsData, generateTicket } from '../utils/ticketGenerator'

function formatDate(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().split('T')[0]
}

export default function TicketModal({ show, onClose }) {
  const [targetOdd, setTargetOdd] = useState('')
  const [loading, setLoading] = useState(false)
  const [ticket, setTicket] = useState(null)
  const [error, setError] = useState('')

  if (!show) return null

  const handleGenerate = async () => {
    const parsed = parseFloat(targetOdd)
    if (!parsed || parsed < 1.5) {
      setError('Informe uma odd mínima de 1.50')
      return
    }
    setError('')
    setLoading(true)
    setTicket(null)

    try {
      const today = formatDate(0)
      const tomorrow = formatDate(1)

      // Fetch odds for today and tomorrow
      const oddsData = await fetchOdds(today, tomorrow)

      if (!Array.isArray(oddsData) || oddsData.length === 0) {
        setError('Nenhuma odd disponível no momento. Tente novamente mais tarde.')
        setLoading(false)
        return
      }

      const matchesWithOdds = parseOddsData(oddsData)

      if (matchesWithOdds.length === 0) {
        setError('Nenhuma partida com odds válidas encontrada.')
        setLoading(false)
        return
      }

      const result = generateTicket(matchesWithOdds, parsed)

      if (!result || !result.selections.length) {
        setError('Não foi possível gerar um bilhete com essa odd. Tente um valor diferente.')
      } else {
        setTicket(result)
      }
    } catch (err) {
      console.error(err)
      setError('Erro ao buscar odds. Verifique a conexão e tente novamente.')
    }

    setLoading(false)
  }

  const handleRegenerate = () => {
    setTicket(null)
    handleGenerate()
  }

  const handleClose = () => {
    setTicket(null)
    setTargetOdd('')
    setError('')
    onClose()
  }

  return (
    <div className="ticket-overlay" onClick={handleClose}>
      <div className="ticket-modal" onClick={e => e.stopPropagation()}>
        <button className="ticket-close" onClick={handleClose}>
          <X size={18} />
        </button>

        {/* Header */}
        <div className="ticket-modal-header">
          <div className="ticket-modal-icon">
            <Ticket size={28} />
          </div>
          <h2>Gerar Bilhete</h2>
          <p>Insira a odd desejada e geraremos um bilhete automaticamente</p>
        </div>

        {/* Input */}
        {!ticket && (
          <div className="ticket-input-section">
            <label className="ticket-label">
              <Target size={16} />
              Cotação Desejada
            </label>
            <div className="ticket-input-row">
              <input
                type="number"
                step="0.1"
                min="1.5"
                placeholder="Ex: 10.00"
                value={targetOdd}
                onChange={e => setTargetOdd(e.target.value)}
                className="ticket-input"
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                autoFocus
              />
              <button
                className="ticket-generate-btn"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? <Loader2 size={20} className="spin" /> : <><Ticket size={18} /> Gerar</>}
              </button>
            </div>
            {error && <p className="ticket-error">{error}</p>}
          </div>
        )}

        {/* Result */}
        {ticket && (
          <div className="ticket-result">
            <div className="ticket-result-header">
              <div className="ticket-total-odd">
                <span className="ticket-total-label">Odd Total</span>
                <span className="ticket-total-value">{ticket.totalOdd.toFixed(2)}</span>
              </div>
              <div className="ticket-meta">
                <span>{ticket.selections.length} {ticket.selections.length === 1 ? 'jogo' : 'jogos'}</span>
              </div>
            </div>

            <div className="ticket-selections">
              {ticket.selections.map((sel, idx) => (
                <div className="ticket-selection-card" key={idx}>
                  <div className="ticket-sel-number">{idx + 1}</div>
                  <div className="ticket-sel-info">
                    <div className="ticket-sel-teams">
                      {sel.homeTeam} <span className="ticket-vs">vs</span> {sel.awayTeam}
                    </div>
                    <div className="ticket-sel-meta">
                      {sel.league && <span className="ticket-sel-league">{sel.league}</span>}
                      {sel.date && <span>{sel.date}</span>}
                      {sel.time && <span>{sel.time}</span>}
                    </div>
                  </div>
                  <div className="ticket-sel-bet">
                    <span className="ticket-sel-bet-type">{sel.bet}</span>
                    <span className="ticket-sel-bet-label">{sel.betLabel}</span>
                    <span className="ticket-sel-odd">{sel.odd.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="ticket-actions">
              <button className="ticket-regen-btn" onClick={handleRegenerate}>
                <RefreshCw size={16} /> Gerar Outro
              </button>
              <button className="ticket-new-btn" onClick={() => { setTicket(null); setTargetOdd(''); }}>
                <Target size={16} /> Nova Odd
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
