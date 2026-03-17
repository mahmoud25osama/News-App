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
    const activeClass = (i === 0) ? 'bg-gradient-to-br from-blue-500 to-cyan-500 border-transparent text-white' : 'bg-slate-800 border-slate-600/40 text-slate-400 hover:border-blue-500 hover:text-slate-100';

    html += `
      <button class="league-tab flex items-center gap-2 px-5 py-2 border rounded-full text-sm font-semibold cursor-pointer transition-all ${activeClass}" data-id="${league.id}">
        <img src="${league.logo}" alt="${league.name}" class="w-5 h-5 object-contain" onerror="this.style.display='none'" />
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
      allTabs[j].classList.remove('bg-gradient-to-br', 'from-blue-500', 'to-cyan-500', 'border-transparent', 'text-white');
      allTabs[j].classList.add('bg-slate-800', 'border-slate-600/40', 'text-slate-400', 'hover:border-blue-500', 'hover:text-slate-100');
    }
    clickedButton.classList.remove('bg-slate-800', 'border-slate-600/40', 'text-slate-400', 'hover:border-blue-500', 'hover:text-slate-100');
    clickedButton.classList.add('bg-gradient-to-br', 'from-blue-500', 'to-cyan-500', 'border-transparent', 'text-white');
    
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
    return '<div class="col-span-full text-slate-400 text-center py-8 text-sm pt-8">No standings data available.</div>';
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
      borderClass = 'border-l-[3px] border-l-blue-500'; // Top 4 places
    } else if (rank <= 6) {
      borderClass = 'border-l-[3px] border-l-amber-500'; // 5th, 6th place
    } else if (rank > totalTeams - 3) {
      borderClass = 'border-l-[3px] border-l-red-500'; // Last 3 places
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
      <tr class="transition-colors hover:bg-blue-500/[.08] ${borderClass}">
        <td class="text-center p-3 text-sm border-b border-slate-600/40">${rank}</td>
        <td class="text-center p-3 text-sm border-b border-slate-600/40">
          <img src="${logo}" alt="" class="w-6 h-6 object-contain inline-block" onerror="this.style.display='none'" />
        </td>
        <td class="text-left font-semibold p-3 text-sm border-b border-slate-600/40">${name}</td>
        <td class="text-center p-3 text-sm border-b border-slate-600/40">${p}</td>
        <td class="text-center p-3 text-sm border-b border-slate-600/40">${w}</td>
        <td class="text-center p-3 text-sm border-b border-slate-600/40">${d}</td>
        <td class="text-center p-3 text-sm border-b border-slate-600/40">${l}</td>
        <td class="text-center p-3 text-sm border-b border-slate-600/40">${gf}</td>
        <td class="text-center p-3 text-sm border-b border-slate-600/40">${ga}</td>
        <td class="text-center p-3 text-sm border-b border-slate-600/40">${gd}</td>
        <td class="text-center font-extrabold text-blue-500 p-3 text-sm border-b border-slate-600/40">${pts}</td>
      </tr>`;
  }

  // Return the full table layout
  return `
    <div class="overflow-x-auto rounded-2xl border border-slate-600/40 bg-slate-800/65 backdrop-blur-md">
      <table class="w-full border-collapse min-w-[800px]">
        <thead>
          <tr>
            <th class="bg-slate-800 p-3 text-xs font-bold uppercase tracking-wider text-slate-400 sticky top-0">#</th>
            <th class="bg-slate-800 p-3 text-xs font-bold uppercase tracking-wider text-slate-400 sticky top-0"></th>
            <th class="bg-slate-800 p-3 text-xs font-bold uppercase tracking-wider text-slate-400 sticky top-0 text-left">Team</th>
            <th class="bg-slate-800 p-3 text-xs font-bold uppercase tracking-wider text-slate-400 sticky top-0">P</th>
            <th class="bg-slate-800 p-3 text-xs font-bold uppercase tracking-wider text-slate-400 sticky top-0">W</th>
            <th class="bg-slate-800 p-3 text-xs font-bold uppercase tracking-wider text-slate-400 sticky top-0">D</th>
            <th class="bg-slate-800 p-3 text-xs font-bold uppercase tracking-wider text-slate-400 sticky top-0">L</th>
            <th class="bg-slate-800 p-3 text-xs font-bold uppercase tracking-wider text-slate-400 sticky top-0">GF</th>
            <th class="bg-slate-800 p-3 text-xs font-bold uppercase tracking-wider text-slate-400 sticky top-0">GA</th>
            <th class="bg-slate-800 p-3 text-xs font-bold uppercase tracking-wider text-slate-400 sticky top-0">GD</th>
            <th class="bg-slate-800 p-3 text-xs font-bold uppercase tracking-wider text-slate-400 sticky top-0">PTS</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
    <div class="flex gap-6 mt-4 p-3 text-xs text-slate-400 max-sm:flex-col max-sm:gap-2">
      <span><span class="w-2.5 h-2.5 rounded-full inline-block mr-1 bg-blue-500"></span> Champions League</span>
      <span><span class="w-2.5 h-2.5 rounded-full inline-block mr-1 bg-amber-500"></span> Europa / Conference</span>
      <span><span class="w-2.5 h-2.5 rounded-full inline-block mr-1 bg-red-500"></span> Relegation</span>
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
    content.innerHTML = `<div class="text-red-500 text-center py-4 text-sm pt-8">Failed to load standings: ${err.message}</div>`;
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
