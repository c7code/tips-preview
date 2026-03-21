const API_BASE = 'http://localhost:3001/api';

export async function fetchLeagues() {
  const res = await fetch(`${API_BASE}/leagues`);
  return res.json();
}

export async function fetchStandings(leagueId) {
  const res = await fetch(`${API_BASE}/standings/${leagueId}`);
  return res.json();
}

export async function fetchEvents(leagueId, from, to) {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const res = await fetch(`${API_BASE}/events/${leagueId}?${params}`);
  return res.json();
}

export async function fetchMatch(matchId) {
  const res = await fetch(`${API_BASE}/match/${matchId}`);
  return res.json();
}

export async function fetchH2H(teamId1, teamId2) {
  const res = await fetch(`${API_BASE}/h2h?firstTeamId=${teamId1}&secondTeamId=${teamId2}`);
  return res.json();
}

export async function fetchPredictions(leagueId, from, to) {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (leagueId) params.set('leagueId', leagueId);
  const res = await fetch(`${API_BASE}/predictions?${params}`);
  return res.json();
}

export async function fetchAiAnalysis(matchData) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matchData }),
  });
  return res.json();
}
