/**
 * Ticket Generator Algorithm
 * Given a list of matches with odds and a target total odd,
 * finds a combination of bets that approximates the target odd.
 */

// Shuffle array (Fisher-Yates)
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Parse odds data from APIfootball format into a flat list of match bets.
 * Each entry contains match info and three possible bets (Home, Draw, Away).
 */
export function parseOddsData(oddsData) {
  if (!Array.isArray(oddsData)) return [];

  const parsed = [];

  for (const match of oddsData) {
    // Skip entries without real team names (no matching event data)
    if (!match.match_hometeam_name || !match.match_awayteam_name) continue;

    const home = match.match_hometeam_name;
    const away = match.match_awayteam_name;
    const bets = [];

    // Helper to add a bet if the odd is valid
    const addBet = (type, label, rawOdd) => {
      const odd = parseFloat(rawOdd);
      if (!isNaN(odd) && odd > 1) bets.push({ type, label, odd });
    };

    // --- 1x2 (Resultado Final) ---
    addBet('1x2', home, match.odd_1);
    addBet('1x2', 'Empate', match.odd_x);
    addBet('1x2', away, match.odd_2);

    // --- Dupla Chance ---
    addBet('Dupla Chance', `${home} ou Empate`, match.odd_1x);
    addBet('Dupla Chance', `${home} ou ${away}`, match.odd_12);
    addBet('Dupla Chance', `Empate ou ${away}`, match.odd_x2);

    // --- Over/Under Gols ---
    const ouLines = ['1.5', '2.5', '3.5'];
    for (const line of ouLines) {
      addBet('Gols', `Mais de ${line}`, match[`o+${line}`]);
      addBet('Gols', `Menos de ${line}`, match[`u+${line}`]);
    }

    // --- Ambas Marcam (BTTS) ---
    addBet('Ambas Marcam', 'Sim', match.bts_yes);
    addBet('Ambas Marcam', 'Não', match.bts_no);

    if (bets.length === 0) continue;

    parsed.push({
      matchId: match.match_id,
      homeTeam: home,
      awayTeam: away,
      date: match.match_date || '',
      time: match.match_time || '',
      league: match.league_name || '',
      bets,
    });
  }

  return parsed;
}

/**
 * Generate a ticket (combination of bets) that approximates the target odd.
 * @param {Array} matchesWithOdds - parsed matches from parseOddsData
 * @param {number} targetOdd - desired total odd
 * @param {number} tolerance - acceptable deviation (default 15%)
 * @param {number} maxAttempts - max random attempts
 * @returns {object} { selections, totalOdd }
 */
export function generateTicket(matchesWithOdds, targetOdd, tolerance = 0.20, maxAttempts = 5000) {
  if (!matchesWithOdds.length) return null;

  let bestTicket = null;
  let bestDiff = Infinity;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const shuffled = shuffle(matchesWithOdds);
    const selections = [];
    let currentOdd = 1.0;

    for (const match of shuffled) {
      if (currentOdd >= targetOdd) break;
      if (match.bets.length === 0) continue;

      // Pick a random bet for this match
      const bet = match.bets[Math.floor(Math.random() * match.bets.length)];

      // Only add if the combined odd doesn't overshoot too much
      const potentialOdd = currentOdd * bet.odd;
      if (potentialOdd <= targetOdd * (1 + tolerance + 0.5)) {
        selections.push({
          matchId: match.matchId,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          date: match.date,
          time: match.time,
          league: match.league,
          bet: bet.type,
          betLabel: bet.label,
          odd: bet.odd,
        });
        currentOdd = potentialOdd;
      }

      // Stop if we're close enough
      if (currentOdd >= targetOdd * (1 - tolerance) && currentOdd <= targetOdd * (1 + tolerance)) {
        break;
      }
    }

    const diff = Math.abs(currentOdd - targetOdd);
    if (diff < bestDiff && selections.length >= 2) {
      bestDiff = diff;
      bestTicket = { selections, totalOdd: parseFloat(currentOdd.toFixed(2)) };

      // Good enough match
      if (currentOdd >= targetOdd * (1 - tolerance) && currentOdd <= targetOdd * (1 + tolerance)) {
        break;
      }
    }
  }

  return bestTicket;
}
