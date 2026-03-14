async function fetchStandings(leagueId) {
  const url = `https://apiv3.apifootball.com/?action=get_standings&league_id=${leagueId}&APIkey=${CONFIG.APIFOOTBALL_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Standings API error');
  const data = await response.json();
  if (data.error) throw new Error(data.message || 'API error');
  return Array.isArray(data) ? data : [];
}

function createTableRow(team, index) {
  const tr = document.createElement('tr');
  const logo = team.team_badge || 'https://via.placeholder.com/28?text=T';
  tr.innerHTML = `
    <td class="rank">${index + 1}</td>
    <td class="team-logo-cell"><img src="${logo}" alt="${team.team_name}" class="team-logo-sm" onerror="this.src='https://via.placeholder.com/28?text=T'"></td>
    <td class="team-name-cell">${team.team_name}</td>
    <td>${team.overall_league_payed || 0}</td>
    <td>${team.overall_league_W || 0}</td>
    <td>${team.overall_league_D || 0}</td>
    <td>${team.overall_league_L || 0}</td>
    <td>${team.overall_league_GF || 0}</td>
    <td>${team.overall_league_GA || 0}</td>
    <td>${team.overall_league_GD || 0}</td>
    <td class="points">${team.overall_league_PTS || 0}</td>
  `;
  return tr;
}

async function initTable() {
  const tbody = document.getElementById('standings-tbody');
  const loadingEl = document.getElementById('table-loading');
  if (!tbody) return;

  try {
    const standings = await fetchStandings(CONFIG.DEFAULT_LEAGUE_ID);

    if (loadingEl) loadingEl.remove();

    if (standings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="11" class="no-data">No standings data available.</td></tr>';
      return;
    }

    standings.forEach((team, index) => {
      tbody.appendChild(createTableRow(team, index));
    });
  } catch (error) {
    console.error('Standings fetch error:', error);
    if (loadingEl) loadingEl.remove();
    tbody.innerHTML = '<tr><td colspan="11" class="error-message">Failed to load standings. Please check your API key.</td></tr>';
  }
}

document.addEventListener('DOMContentLoaded', initTable);
