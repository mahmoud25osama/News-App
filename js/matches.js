let allMatches = [];

async function fetchMatches(leagueId) {
  const url = `https://apiv3.apifootball.com/?action=get_events&league_id=${leagueId}&from=2024-08-01&to=2025-06-30&APIkey=${CONFIG.APIFOOTBALL_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Matches API error');
  const data = await response.json();
  if (data.error) throw new Error(data.message || 'API error');
  return Array.isArray(data) ? data : [];
}

function getMatchStatus(match) {
  const status = match.match_status;
  if (status === 'Finished' || status === 'FT') return 'finished';
  if (status && status !== '' && !isNaN(parseInt(status))) return 'live';
  if (match.match_live === '1') return 'live';
  return 'upcoming';
}

function createMatchRow(match) {
  const row = document.createElement('div');
  const statusType = getMatchStatus(match);
  row.className = `match-row ${statusType}`;
  row.dataset.hometeam = match.match_hometeam_name.toLowerCase();
  row.dataset.awayteam = match.match_awayteam_name.toLowerCase();
  row.dataset.date = match.match_date;

  const home_badge = match.team_home_badge || 'https://via.placeholder.com/32?text=H';
  const away_badge = match.team_away_badge || 'https://via.placeholder.com/32?text=A';

  let scoreOrDate = '';
  if (statusType === 'finished') {
    scoreOrDate = `<div class="score">${match.match_hometeam_score} - ${match.match_awayteam_score}</div>`;
  } else if (statusType === 'live') {
    scoreOrDate = `<div class="score live-score">${match.match_hometeam_score} - ${match.match_awayteam_score} <span class="live-badge">LIVE ${match.match_status}'</span></div>`;
  } else {
    scoreOrDate = `<div class="match-datetime"><div>${match.match_date}</div><div>${match.match_time}</div></div>`;
  }

  row.innerHTML = `
    <div class="match-team home-team">
      <img src="${home_badge}" alt="${match.match_hometeam_name}" class="team-logo" onerror="this.src='https://via.placeholder.com/32?text=H'">
      <span>${match.match_hometeam_name}</span>
    </div>
    ${scoreOrDate}
    <div class="match-team away-team">
      <img src="${away_badge}" alt="${match.match_awayteam_name}" class="team-logo" onerror="this.src='https://via.placeholder.com/32?text=A'">
      <span>${match.match_awayteam_name}</span>
    </div>
  `;
  return row;
}

function filterMatches() {
  const teamFilter = document.getElementById('filter-team').value.toLowerCase().trim();
  const dateFilter = document.getElementById('filter-date').value;
  const rows = document.querySelectorAll('.match-row');

  rows.forEach(row => {
    const homeTeam = row.dataset.hometeam;
    const awayTeam = row.dataset.awayteam;
    const matchDate = row.dataset.date;
    const teamMatch = !teamFilter || homeTeam.includes(teamFilter) || awayTeam.includes(teamFilter);
    const dateMatch = !dateFilter || matchDate === dateFilter;
    row.style.display = teamMatch && dateMatch ? '' : 'none';
  });
}

async function initMatches() {
  const container = document.getElementById('matches-container');
  if (!container) return;

  container.innerHTML = '<div class="spinner"></div>';

  try {
    allMatches = await fetchMatches(CONFIG.DEFAULT_LEAGUE_ID);
    container.innerHTML = '';

    if (allMatches.length === 0) {
      container.innerHTML = '<div class="no-data">No matches found.</div>';
      return;
    }

    allMatches.forEach(match => {
      container.appendChild(createMatchRow(match));
    });

    document.getElementById('filter-team').addEventListener('input', filterMatches);
    document.getElementById('filter-date').addEventListener('change', filterMatches);
  } catch {
    container.innerHTML = '<div class="error-message">Failed to load matches. Please check your API key.</div>';
  }
}

document.addEventListener('DOMContentLoaded', initMatches);
