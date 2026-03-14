let statsData = { scorers: [], yellowCards: [], redCards: [] };

async function fetchTopScorers(leagueId) {
  const url = `https://apiv2.allsportsapi.com/football/?action=get_topscorers&league_id=${leagueId}&APIkey=${CONFIG.ALLSPORTSAPI_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Stats API error');
  const data = await response.json();
  if (data.error) throw new Error(data.message || 'API error');
  return Array.isArray(data) ? data : [];
}

const DEFAULT_PLAYER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23374151'/%3E%3Ccircle cx='40' cy='28' r='12' fill='%236B7280'/%3E%3Cellipse cx='40' cy='65' rx='20' ry='16' fill='%236B7280'/%3E%3C/svg%3E";
const DEFAULT_TEAM_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' fill='%23374151' rx='4'/%3E%3Ctext x='12' y='16' text-anchor='middle' fill='%239CA3AF' font-size='12'%3ET%3C/text%3E%3C/svg%3E";

function isValidImageUrl(url) {
  return typeof url === 'string' && url.trim() !== '' && (url.startsWith('http://') || url.startsWith('https://'));
}

function createPlayerCard(player) {
  const card = document.createElement('div');
  card.className = 'player-card';
  const photo = isValidImageUrl(player.player_image) ? player.player_image : DEFAULT_PLAYER_IMAGE;
  const teamLogo = isValidImageUrl(player.team_badge) ? player.team_badge : DEFAULT_TEAM_LOGO;
  card.innerHTML = `
    <img src="${photo}" alt="${player.player_name}" class="player-photo" onerror="this.onerror=null;this.src='${DEFAULT_PLAYER_IMAGE}'">
    <div class="player-info">
      <h3 class="player-name">${player.player_name}</h3>
      <div class="player-team">
        <img src="${teamLogo}" alt="${player.team_name}" class="team-logo-sm" onerror="this.onerror=null;this.src='${DEFAULT_TEAM_LOGO}'">
        <span>${player.team_name}</span>
      </div>
      <div class="player-stats">
        <span class="stat goals" title="Goals">⚽ ${player.player_goals || 0}</span>
        <span class="stat yellow" title="Yellow Cards">🟨 ${player.player_yellow_cards || 0}</span>
        <span class="stat red" title="Red Cards">🟥 ${player.player_red_cards || 0}</span>
      </div>
    </div>
  `;
  return card;
}

function renderSection(containerId, players) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  if (players.length === 0) {
    container.innerHTML = '<div class="no-data">No data available.</div>';
    return;
  }
  players.forEach(player => container.appendChild(createPlayerCard(player)));
}

const SORT_KEY_MAP = {
  goals: 'player_goals',
  yellow: 'player_yellow_cards',
  red: 'player_red_cards'
};

function sortPlayers(players, sortValue) {
  const key = SORT_KEY_MAP[sortValue] || 'player_goals';
  return [...players].sort((a, b) => parseInt(b[key] || 0) - parseInt(a[key] || 0));
}

function sortAndRender() {
  const sortScorers = document.getElementById('sort-scorers')?.value || 'goals';
  const sortYellow = document.getElementById('sort-yellow')?.value || 'yellow';
  const sortRed = document.getElementById('sort-red')?.value || 'red';

  renderSection('scorers-grid', sortPlayers(statsData.scorers, sortScorers));
  renderSection('yellow-grid', sortPlayers(statsData.yellowCards, sortYellow));
  renderSection('red-grid', sortPlayers(statsData.redCards, sortRed));
}

async function initStats() {
  const loadingEl = document.getElementById('stats-loading');

  try {
    const players = await fetchTopScorers(CONFIG.DEFAULT_LEAGUE_ID);

    if (loadingEl) loadingEl.remove();

    statsData.scorers = players.sort((a, b) => parseInt(b.player_goals || 0) - parseInt(a.player_goals || 0)).slice(0, 20);
    statsData.yellowCards = [...players].sort((a, b) => parseInt(b.player_yellow_cards || 0) - parseInt(a.player_yellow_cards || 0)).slice(0, 20);
    statsData.redCards = [...players].sort((a, b) => parseInt(b.player_red_cards || 0) - parseInt(a.player_red_cards || 0)).slice(0, 20);

    sortAndRender();

    document.getElementById('sort-scorers')?.addEventListener('change', sortAndRender);
    document.getElementById('sort-yellow')?.addEventListener('change', sortAndRender);
    document.getElementById('sort-red')?.addEventListener('change', sortAndRender);
  } catch (error) {
    console.error('Stats fetch error:', error);
    if (loadingEl) loadingEl.remove();
    const errorHtml = '<div class="error-message">Failed to load statistics. Please check your API key.</div>';
    ['scorers-grid', 'yellow-grid', 'red-grid'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = errorHtml;
    });
  }
}

document.addEventListener('DOMContentLoaded', initStats);
