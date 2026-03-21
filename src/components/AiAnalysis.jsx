import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { fetchAiAnalysis } from '../api/footballApi'

export default function AiAnalysis({ matchData }) {
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [displayed, setDisplayed] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setAnalysis('')
    setDisplayed('')
    try {
      const res = await fetchAiAnalysis(matchData)
      const text = res.analysis || 'Unable to generate analysis. Please check your API key.'
      setAnalysis(text)
      // Typing animation
      setIsTyping(true)
      let i = 0
      const interval = setInterval(() => {
        i += 3
        if (i >= text.length) {
          setDisplayed(text)
          setIsTyping(false)
          clearInterval(interval)
        } else {
          setDisplayed(text.slice(0, i))
        }
      }, 10)
    } catch (err) {
      setAnalysis('Failed to generate analysis. Make sure the backend server is running and API keys are configured.')
      setDisplayed('Failed to generate analysis. Make sure the backend server is running and API keys are configured.')
    }
    setLoading(false)
  }

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <div className="ai-panel-title">
          <div className="ai-icon">🤖</div>
          <span>AI Match Analysis</span>
        </div>
        <button
          className="ai-generate-btn"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate Analysis
            </>
          )}
        </button>
      </div>

      {!analysis && !loading && (
        <div className="ai-placeholder">
          <div style={{ fontSize: '2rem' }}>🧠</div>
          <p>Click "Generate Analysis" to get AI-powered insights about this match.</p>
        </div>
      )}

      {(displayed || loading) && (
        <div className="ai-content">
          {loading && !displayed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-tertiary)' }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Analyzing match data with AI...</span>
            </div>
          )}
          {displayed && (
            <div>
              {displayed.split('\n').map((line, i) => {
                if (line.startsWith('### ')) return <h3 key={i}>{line.replace('### ', '')}</h3>
                if (line.startsWith('## ')) return <h2 key={i}>{line.replace('## ', '')}</h2>
                if (line.startsWith('# ')) return <h1 key={i}>{line.replace('# ', '')}</h1>
                if (line.startsWith('**') && line.endsWith('**')) return <p key={i}><strong>{line.replace(/\*\*/g, '')}</strong></p>
                if (line.trim() === '') return <br key={i} />
                return <p key={i}>{line}</p>
              })}
              {isTyping && <span className="ai-typing" />}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
