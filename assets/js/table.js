// ═══════════════════════════════════════════════════════════
//  table.js — League Standings (Table) with Big-5 Tabs
// ═══════════════════════════════════════════════════════════

let currentLeagueId = CONFIG.LEAGUES[0].id; // The currently selected league

/**
 * 1) Build League Tabs
 * Creates the buttons at the top of the page
 */
function buildLeagueTabs() {
  const container = document.getElementById('league-tabs');
  let html = '';

  for (let i = 0; i < CONFIG.LEAGUES.length; i++) {
    const league = CONFIG.LEAGUES[i];
    const activeClass = (i === 0) ? 'active' : '';

    html += `
      <button class="league-tab ${activeClass}" data-id="${league.id}">
        <img src="${league.logo}" alt="${league.name}" class="league-tab-logo" onerror="this.style.display='none'" />
        ${league.name}
      </button>`;
  }

  container.innerHTML = html;

  // Listen for clicks on the buttons
  container.addEventListener('click', function(event) {
    const clickedButton = event.target.closest('.league-tab');
    if (!clickedButton) return;
    
    // Manage active classes
    const allTabs = container.querySelectorAll('.league-tab');
    for (let j = 0; j < allTabs.length; j++) {
      allTabs[j].classList.remove('active');
    }
    clickedButton.classList.add('active');
    
    // Update the ID
    currentLeagueId = Number(clickedButton.getAttribute('data-id'));
    
    // Find the league's name to update the page title
    for (let k = 0; k < CONFIG.LEAGUES.length; k++) {
      if (CONFIG.LEAGUES[k].id === currentLeagueId) {
        document.getElementById('page-title').textContent = `${CONFIG.LEAGUES[k].name} Standings`;
        break;
      }
    }
    
    // Reload the data
    loadStandings();
  });
}

/**
 * 2) Fetch Data from API
 * Gets the league table rankings
 */
async function fetchStandings(leagueId) {
  const url = `${CONFIG.SPORTS_BASE}/?met=Standings&leagueId=${leagueId}&APIkey=${CONFIG.SPORTS_API_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API returned an error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // The API returns standings differently for different leagues. Sometimes inside "total", sometimes as a raw array.
  // We handle both variants here.
  if (data.success === 1 && data.result) {
    if (data.result.total) {
      return data.result.total;
    } 
    if (Array.isArray(data.result)) {
      return data.result;
    }
  }
  
  return []; // Return empty array if logic fails
}

/**
 * 3) Render Standings HTML Table
 */
function renderStandings(standings) {
  if (standings.length === 0) {
    return '<div class="no-data pt-8">No standings data available.</div>';
  }

  const totalTeams = standings.length;
  let tableRows = '';

  // Loop through every team position
  for (let i = 0; i < standings.length; i++) {
    const team = standings[i];
    const rank = i + 1;
    
    // Find proper indicators for top/bottom teams
    let borderClass = '';
    if (rank <= 4) {
      borderClass = 'champ-league'; // Top 4 places
    } else if (rank <= 6) {
      borderClass = 'europa-league'; // 5th, 6th place
    } else if (rank > totalTeams - 3) {
      borderClass = 'relegation'; // Last 3 places
    }

    // Extrapolate API values. We handle both possible field names.
    const name = team.standing_team || team.team_name || '—';
    const logo = team.team_logo || team.team_badge || '';
    
    // P = Played, W = Wins, D = Draws, L = Losses
    const p = team.standing_P || team.overall_league_payed || '0';
    const w = team.standing_W || team.overall_league_W || '0';
    const d = team.standing_D || team.overall_league_D || '0';
    const l = team.standing_L || team.overall_league_L || '0';
    
    // GF = Goals For, GA = Goals Against, GD = Goal Difference, PTS = Points
    const gf = team.standing_F || team.overall_league_GF || '0';
    const ga = team.standing_A || team.overall_league_GA || '0';
    const gd = team.standing_GD || (Number(gf) - Number(ga)) || '0';
    const pts = team.standing_PTS || team.overall_league_PTS || '0';

    // Build the row HTML
    tableRows += `
      <tr class="table-row ${borderClass}">
        <td class="text-center">${rank}</td>
        <td class="text-center">
          <img src="${logo}" alt="" class="team-logo-small" onerror="this.style.display='none'" />
        </td>
        <td class="text-left font-semibold">${name}</td>
        <td class="text-center">${p}</td>
        <td class="text-center">${w}</td>
        <td class="text-center">${d}</td>
        <td class="text-center">${l}</td>
        <td class="text-center">${gf}</td>
        <td class="text-center">${ga}</td>
        <td class="text-center">${gd}</td>
        <td class="text-center font-extrabold text-blue-500">${pts}</td>
      </tr>`;
  }

  // Return the full table layout
  return `
    <div class="table-container">
      <table class="standings-table">
        <thead>
          <tr>
            <th>#</th>
            <th></th>
            <th class="text-left">Team</th>
            <th>P</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>GF</th>
            <th>GA</th>
            <th>GD</th>
            <th>PTS</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
    <div class="table-legend">
      <span><span class="legend-dot bg-blue-500"></span> Champions League</span>
      <span><span class="legend-dot bg-amber-500"></span> Europa / Conference</span>
      <span><span class="legend-dot bg-red-500"></span> Relegation</span>
    </div>`;
}

/**
 * 4) Initialization and Loading
 */
async function loadStandings() {
  const spinner = document.getElementById('table-spinner');
  const content = document.getElementById('table-content');
  
  spinner.style.display = 'flex';
  content.innerHTML = '';

  try {
    const standings = await fetchStandings(currentLeagueId);
    content.innerHTML = renderStandings(standings);
  } catch (err) {
    content.innerHTML = `<div class="error-msg pt-8">Failed to load standings: ${err.message}</div>`;
  } finally {
    spinner.style.display = 'none';
  }
}

// Start everything up
document.addEventListener('DOMContentLoaded', function() {
  buildLeagueTabs();
  document.getElementById('page-title').textContent = `${CONFIG.LEAGUES[0].name} Standings`;
  loadStandings();
});
