import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const FOOTBALL_API_BASE = 'https://apiv3.apifootball.com';
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Helper to call API-Football
async function footballApi(params) {
  const url = new URL(FOOTBALL_API_BASE);
  url.searchParams.set('APIkey', FOOTBALL_API_KEY);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, v);
    }
  });
  const res = await fetch(url.toString());
  return res.json();
}

// GET /api/leagues
app.get('/api/leagues', async (req, res) => {
  try {
    const data = await footballApi({ action: 'get_leagues' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/standings/:leagueId
app.get('/api/standings/:leagueId', async (req, res) => {
  try {
    const data = await footballApi({
      action: 'get_standings',
      league_id: req.params.leagueId,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:leagueId?from=&to=
app.get('/api/events/:leagueId', async (req, res) => {
  try {
    const { from, to } = req.query;
    const data = await footballApi({
      action: 'get_events',
      league_id: req.params.leagueId,
      from,
      to,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/match/:matchId
app.get('/api/match/:matchId', async (req, res) => {
  try {
    const data = await footballApi({
      action: 'get_events',
      match_id: req.params.matchId,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/h2h?firstTeamId=&secondTeamId=
app.get('/api/h2h', async (req, res) => {
  try {
    const { firstTeamId, secondTeamId } = req.query;
    const data = await footballApi({
      action: 'get_H2H',
      firstTeamId,
      secondTeamId,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/predictions?from=&to=&leagueId=
app.get('/api/predictions', async (req, res) => {
  try {
    const { from, to, leagueId } = req.query;
    const data = await footballApi({
      action: 'get_predictions',
      from,
      to,
      league_id: leagueId,
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/analyze — ChatGPT analysis
app.post('/api/analyze', async (req, res) => {
  try {
    const { matchData } = req.body;

    const hasStats = matchData.statistics && matchData.statistics.length > 0;
    const hasH2H = matchData.h2h && matchData.h2h.length > 0;
    const isUpcoming = !matchData.status || matchData.status === '' || matchData.status === 'Scheduled' || matchData.status === 'Not Started';

    let prompt;
    if (isUpcoming || !hasStats) {
      // Pre-match analysis — focus on H2H, form, and predictions
      prompt = `Você é um analista de futebol profissional fornecendo uma análise pré-jogo ÚNICA. Você DEVE basear sua análise nos dados ESPECÍFICOS fornecidos abaixo. NÃO forneça previsões genéricas.

Partida: ${matchData.homeTeam} vs ${matchData.awayTeam}
Liga: ${matchData.league}
Data: ${matchData.date}
Hora: ${matchData.matchTime || 'TBD'}
Estádio: ${matchData.stadium || 'Desconhecido'}
Árbitro: ${matchData.referee || 'Desconhecido'}

${hasH2H ? `HISTÓRICO DE CONFRONTO DIRETO (partidas mais recentes):
${matchData.h2h.map(m => `  - ${m.match_date}: ${m.match_hometeam_name} ${m.match_hometeam_score} - ${m.match_awayteam_score} ${m.match_awayteam_name}`).join('\n')}` : 'Nenhum dado de confronto direto disponível.'}

INSTRUÇÕES:
- Analise o histórico detalhadamente: quem tem a vantagem? Quais são os placares típicos?
- Mencione resultados específicos passados dos dados H2H
- Considere a vantagem de jogar em casa/fora
- NÃO use "2-1" ou qualquer placar genérico por padrão. Baseie sua previsão em padrões reais do H2H
- Se não houver dados H2H, reconheça isso e explique por que fazer previsões é mais difícil
- Use formatação markdown

Forneça:
1. **Visão Geral Pré-Jogo** (contexto sobre este confronto)
2. **Análise de Confronto Direto** (detalhes do histórico com resultados específicos)
3. **Fatores Chave** (vantagem em casa, contexto atual, árbitro)
4. **Previsão da Partida** (com base APENAS nos dados disponíveis, explique seu raciocínio)
5. **Apostas/Ângulos Recomendados** (com base em padrões de H2H)`;
    } else {
      // Post-match analysis — use real stats
      prompt = `Você é um analista de futebol profissional. Analise os seguintes dados da partida e forneça insights detalhados e BASEADOS EM DADOS. Referencie estatísticas específicas em sua análise. Use formatação markdown.

Partida: ${matchData.homeTeam} ${matchData.homeScore} - ${matchData.awayScore} ${matchData.awayTeam}
Liga: ${matchData.league}
Data: ${matchData.date}
Status: ${matchData.status}
Intervalo: ${matchData.homeHalftimeScore || '?'} - ${matchData.awayHalftimeScore || '?'}
Estádio: ${matchData.stadium || 'Desconhecido'}

Estatísticas:
${JSON.stringify(matchData.statistics, null, 2)}

Gols:
${JSON.stringify(matchData.goalscorer, null, 2)}

${matchData.cards ? `Cartões:\n${JSON.stringify(matchData.cards, null, 2)}` : ''}

${hasH2H ? `Histórico de Confronto Direto (H2H):
${matchData.h2h.map(m => `  - ${m.match_date}: ${m.match_hometeam_name} ${m.match_hometeam_score} - ${m.match_awayteam_score} ${m.match_awayteam_name}`).join('\n')}` : ''}

Forneça:
1. **Resumo da Partida** (com placar final e momentos-chave)
2. **Observações Táticas Principais** (referencie estatísticas específicas como % de posse, finalizações, etc)
3. **Jogadores Destaque** (mencione os artilheiros por nome e minuto)
4. **Pontos de Virada** (momentos específicos que mudaram a partida)
5. **Perspectiva Pós-Jogo** (o que este resultado significa para ambas as equipes)`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um analista de futebol profissional. Todas as suas respostas DEVEM ser em Português do Brasil (pt-BR). Sempre forneça análise ÚNICA baseada nos dados específicos fornecidos. Nunca dê previsões genéricas ou baseadas em templates. Referencie pontos de dados reais, resultados passados específicos e estatísticas reais na sua análise.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      res.json({ analysis: data.choices[0].message.content });
    } else {
      res.json({ analysis: 'Unable to generate analysis at this time. Please check your OpenAI API key.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`⚽ CrashedBet API proxy running on http://localhost:${PORT}`);
});
