let currentLeagueId = CONFIG.LEAGUES[0].id;
function buildLeagueTabs() {
  const container = document.getElementById('league-tabs');
  let htmlString = '';
  for (let i = 0; i < CONFIG.LEAGUES.length; i++) {
    const league = CONFIG.LEAGUES[i];
    let activeClass = '';
    if (i === 0) {
      activeClass = 'bg-blue-600 text-white border-transparent';
    } else {
      activeClass = 'bg-white border-gray-300 text-gray-600 hover:text-blue-600 hover:bg-blue-50';
    }
    htmlString += `
      <button class="league-tab flex items-center gap-2 px-5 py-2 border rounded text-sm font-semibold cursor-pointer transition ${ activeClass }" data-id="${ league.id }">
        <img src="${ league.logo }" alt="${ league.name }" class="w-5 h-5 object-contain" onerror="this.style.display='none'" />
        ${ league.name }
      </button>`;
  }
  container.innerHTML = htmlString;
  container.addEventListener('click', function (event) {
    const clickedButton = event.target.closest('.league-tab');
    if (clickedButton === null) return; 
    const allTabs = container.querySelectorAll('.league-tab');
    for (let j = 0; j < allTabs.length; j++) {
      allTabs[j].classList.remove('bg-blue-600', 'text-white', 'border-transparent');
      allTabs[j].classList.add('bg-white', 'border-gray-300', 'text-gray-600', 'hover:text-blue-600', 'hover:bg-blue-50');
    }
    clickedButton.classList.remove('bg-white', 'border-gray-300', 'text-gray-600', 'hover:text-blue-600', 'hover:bg-blue-50');
    clickedButton.classList.add('bg-blue-600', 'text-white', 'border-transparent');
    currentLeagueId = Number(clickedButton.getAttribute('data-id'));
    for (let k = 0; k < CONFIG.LEAGUES.length; k++) {
      if (CONFIG.LEAGUES[k].id === currentLeagueId) {
        document.getElementById('page-title').textContent = `${ CONFIG.LEAGUES[k].name } Standings`;
        break; 
      }
    }
    loadStandings();
  });
}
async function fetchStandings(leagueId) {
  const url = `${ CONFIG.SPORTS_BASE }/?met=Standings&leagueId=${ leagueId }&APIkey=${ CONFIG.SPORTS_API_KEY }`;
  console.log("[Table] Requesting standings from:", url);
  const response = await fetch(url);
  if (response.ok === false) {
    throw new Error(`API returned an error: ${ response.status }`);
  }
  const data = await response.json();
  if (data.success === 1 && data.result) {
    if (data.result.total) {
      return data.result.total;
    }
    if (Array.isArray(data.result)) {
      return data.result;
    }
  }
  return [];
}
function renderStandings(standingsList) {
  if (standingsList.length === 0) {
    return '<div class="col-span-full text-gray-500 text-center py-8 text-sm pt-8">No standings data available.</div>';
  }
  const totalTeams = standingsList.length;
  let tableRowsHtml = '';
  for (let i = 0; i < standingsList.length; i++) {
    const team = standingsList[i];
    const rank = i + 1;
    let borderClass = '';
    if (rank <= 4) {
      borderClass = 'border-l-[4px] border-l-blue-500';
    } else if (rank <= 6) {
      borderClass = 'border-l-[4px] border-l-yellow-500';
    } else if (rank > totalTeams - 3) {
      borderClass = 'border-l-[4px] border-l-red-500';
    }
    const name = team.standing_team || team.team_name || '—';
    const logo = team.team_logo || team.team_badge || '';
    const played = team.standing_P || team.overall_league_payed || '0';
    const wins = team.standing_W || team.overall_league_W || '0';
    const draws = team.standing_D || team.overall_league_D || '0';
    const losses = team.standing_L || team.overall_league_L || '0';
    const goalsFor = team.standing_F || team.overall_league_GF || '0';
    const goalsAgainst = team.standing_A || team.overall_league_GA || '0';
    const goalDiff = team.standing_GD || (Number(goalsFor) - Number(goalsAgainst)) || '0';
    const points = team.standing_PTS || team.overall_league_PTS || '0';
    tableRowsHtml += `
      <tr class="transition-colors hover:bg-gray-50 text-gray-800 ${ borderClass }">
        <td class="text-center p-3 text-sm border-b border-gray-200">${ rank }</td>
        <td class="text-center p-3 text-sm border-b border-gray-200">
          <img src="${ logo }" alt="" class="w-6 h-6 object-contain inline-block" onerror="this.style.display='none'" />
        </td>
        <td class="text-left font-semibold p-3 text-sm border-b border-gray-200">${ name }</td>
        <td class="text-center p-3 text-sm border-b border-gray-200">${ played }</td>
        <td class="text-center p-3 text-sm border-b border-gray-200">${ wins }</td>
        <td class="text-center p-3 text-sm border-b border-gray-200">${ draws }</td>
        <td class="text-center p-3 text-sm border-b border-gray-200">${ losses }</td>
        <td class="text-center p-3 text-sm border-b border-gray-200">${ goalsFor }</td>
        <td class="text-center p-3 text-sm border-b border-gray-200">${ goalsAgainst }</td>
        <td class="text-center p-3 text-sm border-b border-gray-200">${ goalDiff }</td>
        <td class="text-center font-extrabold text-blue-600 p-3 text-sm border-b border-gray-200">${ points }</td>
      </tr>`;
  }
  return `
    <div class="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table class="w-full border-collapse min-w-[800px]">
        <thead>
          <tr class="bg-gray-100 border-b border-gray-200">
            <th class="p-3 text-xs font-bold uppercase tracking-wider text-gray-600 text-center sticky top-0">#</th>
            <th class="p-3 text-xs font-bold uppercase tracking-wider text-gray-600 sticky top-0"></th>
            <th class="p-3 text-xs font-bold uppercase tracking-wider text-gray-600 sticky top-0 text-left">Team</th>
            <th class="p-3 text-xs font-bold uppercase tracking-wider text-gray-600 text-center sticky top-0">P</th>
            <th class="p-3 text-xs font-bold uppercase tracking-wider text-gray-600 text-center sticky top-0">W</th>
            <th class="p-3 text-xs font-bold uppercase tracking-wider text-gray-600 text-center sticky top-0">D</th>
            <th class="p-3 text-xs font-bold uppercase tracking-wider text-gray-600 text-center sticky top-0">L</th>
            <th class="p-3 text-xs font-bold uppercase tracking-wider text-gray-600 text-center sticky top-0">GF</th>
            <th class="p-3 text-xs font-bold uppercase tracking-wider text-gray-600 text-center sticky top-0">GA</th>
            <th class="p-3 text-xs font-bold uppercase tracking-wider text-gray-600 text-center sticky top-0">GD</th>
            <th class="p-3 text-xs font-bold uppercase tracking-wider text-gray-600 text-center sticky top-0">PTS</th>
          </tr>
        </thead>
        <tbody>
          ${ tableRowsHtml }
        </tbody>
      </table>
    </div>
    <!-- Legend describing the colored borders -->
    <div class="flex gap-6 mt-4 p-3 text-xs text-gray-600 max-sm:flex-col max-sm:gap-2">
      <span><span class="w-2.5 h-2.5 rounded-full inline-block mr-1 bg-blue-500"></span> Champions League Qualifiers</span>
      <span><span class="w-2.5 h-2.5 rounded-full inline-block mr-1 bg-yellow-500"></span> Europa / Conference</span>
      <span><span class="w-2.5 h-2.5 rounded-full inline-block mr-1 bg-red-500"></span> Relegation Zone</span>
    </div>`;
}
async function loadStandings() {
  console.log("[Table] Starting load...");
  const spinner = document.getElementById('table-spinner');
  const content = document.getElementById('table-content');
  spinner.style.display = 'flex';
  content.innerHTML = '';
  try {
    const standingsList = await fetchStandings(currentLeagueId);
    const tableHTMLString = renderStandings(standingsList);
    content.innerHTML = tableHTMLString;
  } catch (err) {
    console.error("[Table] Load failed:", err);
    content.innerHTML = `<div class="text-red-600 text-center py-4 text-sm pt-8">⚠️ Server Error: ${ err.message }</div>`;
  } finally {
    spinner.style.display = 'none';
  }
}
document.addEventListener('DOMContentLoaded', function () {
  buildLeagueTabs(); 
  document.getElementById('page-title').textContent = `${ CONFIG.LEAGUES[0].name } Standings`; 
  loadStandings(); 
});
