let currentLeagueId = CONFIG.LEAGUES[0].id;
let allMatches = [];

function buildLeagueTabs() {
  const container = document.getElementById('league-tabs');
  let html = '';

  for (let i = 0; i < CONFIG.LEAGUES.length; i++) {
    const league = CONFIG.LEAGUES[i];

    const activeClass = (i === 0) ? 'bg-gradient-to-br from-blue-500 to-cyan-500 border-transparent text-white' : 'bg-slate-800 border-slate-600/40 text-slate-400 hover:border-blue-500 hover:text-slate-100';

    html += `
      <button class="league-tab flex items-center gap-2 px-5 py-2 border rounded-full text-sm font-semibold cursor-pointer transition-all ${ activeClass }" data-id="${ league.id }">
        <img src="${ league.logo }" alt="${ league.name }" class="w-5 h-5 object-contain" onerror="this.style.display='none'" />
        ${ league.name }
      </button>`;
  }

  container.innerHTML = html;

  // Listen for clicks on the buttons
  container.addEventListener('click', function (event) {
    const clickedButton = event.target.closest('.league-tab');

    // If we didn't click inside a button, do nothing
    if (!clickedButton) return;

    // Find all tabs and remove the "active" class from them
    const allTabs = container.querySelectorAll('.league-tab');
    for (let j = 0; j < allTabs.length; j++) {
      allTabs[j].classList.remove('bg-gradient-to-br', 'from-blue-500', 'to-cyan-500', 'border-transparent', 'text-white');
      allTabs[j].classList.add('bg-slate-800', 'border-slate-600/40', 'text-slate-400', 'hover:border-blue-500', 'hover:text-slate-100');
    }

    // Add "active" class only to the clicked tab
    clickedButton.classList.remove('bg-slate-800', 'border-slate-600/40', 'text-slate-400', 'hover:border-blue-500', 'hover:text-slate-100');
    clickedButton.classList.add('bg-gradient-to-br', 'from-blue-500', 'to-cyan-500', 'border-transparent', 'text-white');

    // Update the current league ID
    currentLeagueId = Number(clickedButton.getAttribute('data-id'));

    // Find the league's name to update the page title
    for (let k = 0; k < CONFIG.LEAGUES.length; k++) {
      if (CONFIG.LEAGUES[k].id === currentLeagueId) {
        document.getElementById('page-title').textContent = `${ CONFIG.LEAGUES[k].name } Matches`;
        break;
      }
    }

    // Reload the matches for the new league
    loadMatches();
  });
}


async function fetchMatches(leagueId) {
  const currentDate = new Date();
  let startYear = currentDate.getFullYear();
  if (currentDate.getMonth() < 7) {
    startYear = startYear - 1;
  }

  const fromDate = `${ startYear }-08-01`;
  const toDate = `${ startYear + 1 }-07-31`;

  const url = `${ CONFIG.SPORTS_BASE }/?met=Fixtures&leagueId=${ leagueId }&APIkey=${ CONFIG.SPORTS_API_KEY }&from=${ fromDate }&to=${ toDate }`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API returned an error: ${ response.status }`);
  }

  const data = await response.json();
  if (data.success === 1 && Array.isArray(data.result)) {
    return data.result;
  }

  return [];
}

function getMatchStatus(match) {
  const status = (match.event_status || '').trim();
  const isLive = (match.event_live === '1');

  if (isLive || status === 'Half Time' || /^\d+$/.test(status)) {
    if (isLive) {
      return { type: 'live', label: `<i class="fa-solid fa-circle text-red-500"></i> LIVE ${ status }'` };
    } else {
      return { type: 'live', label: status };
    }
  }

  if (status === 'Finished' || status === 'After Pens' || status === 'After ET') {
    return { type: 'finished', label: 'FT' };
  }

  return { type: 'upcoming', label: '' };
}

// Builds the HTML for a single Match Box
function renderMatchCard(match) {
  const statusInfo = getMatchStatus(match);

  // Get teams and score
  const score = match.event_final_result || '- : -';
  const home = match.event_home_team || 'TBD';
  const away = match.event_away_team || 'TBD';
  const homeLogo = match.home_team_logo || '';
  const awayLogo = match.away_team_logo || '';
  const dateStr = match.event_date || '';
  const timeStr = match.event_time || '';

  // Calculate the HTML for the middle part of the card based on match status
  let centerHTML = '';
  if (statusInfo.type === 'finished') {
    centerHTML = `
      <div class="text-2xl font-extrabold">${ score }</div>
      <span class="text-[0.7rem] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-green-500/15 text-green-500">${ statusInfo.label }</span>`;
  } else if (statusInfo.type === 'live') {
    centerHTML = `
      <div class="text-2xl font-extrabold text-red-500">${ score }</div>
      <span class="text-[0.7rem] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-red-500/15 text-red-500 animate-pulse">${ statusInfo.label }</span>`;
  } else {
    centerHTML = `
      <span class="text-[0.7rem] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-blue-500/15 text-blue-500">Upcoming</span>
      <div class="text-xs text-slate-400 text-center">${ dateStr }<br/>${ timeStr }</div>`;
  }

  return `
    <div class="bg-slate-800/65 border border-slate-600/40 rounded-2xl flex items-center justify-between p-5 transition-all hover:-translate-y-1 hover:shadow-2xl">
      <div class="flex flex-col items-center gap-2 flex-1 text-center">
        <img src="${ homeLogo }" alt="${ home }" class="w-12 h-12 object-contain" onerror="this.style.display='none'" />
        <span class="text-sm font-semibold">${ home }</span>
      </div>
      
      <div class="flex flex-col items-center gap-1 min-w-[90px]">${ centerHTML }</div>
      
      <div class="flex flex-col items-center gap-2 flex-1 text-center">
        <img src="${ awayLogo }" alt="${ away }" class="w-12 h-12 object-contain" onerror="this.style.display='none'" />
        <span class="text-sm font-semibold">${ away }</span>
      </div>
    </div>`;
}

/**
 * 4) Filter Logic
 * Applying user's search and date filters
 */
function applyFilters() {
  const teamSearchText = document.getElementById('filter-team').value.toLowerCase().trim();
  const selectedDate = document.getElementById('filter-date').value;

  // Start with all loaded matches
  let filteredMatches = [];

  // Loop through all matches to see if they match the filters
  for (let i = 0; i < allMatches.length; i++) {
    const match = allMatches[i];
    let keepMatch = true;

    // Filter by team name
    if (teamSearchText !== "") {
      const homeName = (match.event_home_team || '').toLowerCase();
      const awayName = (match.event_away_team || '').toLowerCase();

      if (!homeName.includes(teamSearchText) && !awayName.includes(teamSearchText)) {
        keepMatch = false; // The text doesn't match either team
      }
    }

    // Filter by date
    if (selectedDate !== "") {
      if (match.event_date !== selectedDate) {
        keepMatch = false; // It's not on the selected date
      }
    }

    // If both filters passed, keep the match in the list
    if (keepMatch) {
      filteredMatches.push(match);
    }
  }

  // Draw the remaining matches
  renderGrid(filteredMatches);
}

// Draws the final list of matches on the screen
function renderGrid(matches) {
  const grid = document.getElementById('matches-grid');

  if (matches.length === 0) {
    grid.innerHTML = '<div class="col-span-full text-slate-400 text-center py-8 text-sm">No matches found for your search.</div>';
    return;
  }

  let html = '';
  for (let i = 0; i < matches.length; i++) {
    html += renderMatchCard(matches[i]);
  }

  grid.innerHTML = html;
}

/**
 * 5) Main Loading Function
 * Called when a user clicks a new tab or when page first loads
 */
async function loadMatches() {
  const spinner = document.getElementById('matches-spinner');
  const grid = document.getElementById('matches-grid');

  spinner.style.display = 'flex';
  grid.innerHTML = '';

  try {
    // Wait for the API to give us the matches
    allMatches = await fetchMatches(currentLeagueId);

    // Sort matches: Live first -> Upcoming Second -> Finished Third
    allMatches.sort(function (a, b) {
      const statusA = getMatchStatus(a);
      const statusB = getMatchStatus(b);

      // We assign points to the types. Lower points = higher position
      const order = { live: 0, upcoming: 1, finished: 2 };

      // If categories are different, sort by category
      if (order[statusA.type] !== order[statusB.type]) {
        return order[statusA.type] - order[statusB.type];
      }

      // If categories are the same, order by Date (newest first for finished, oldest first for upcoming)
      const dateA = a.event_date || '';
      const dateB = b.event_date || '';
      return dateB.localeCompare(dateA);
    });

    // Finally apply any active filters and render
    applyFilters();

  } catch (error) {
    grid.innerHTML = `<div class="text-red-500 text-center py-4 text-sm col-span-full w-full mt-4">⚠️ Failed to load matches: ${ error.message }</div>`;
  } finally {
    spinner.style.display = 'none';
  }
}

/**
 * 6) Boot up when page is loaded
 */
document.addEventListener('DOMContentLoaded', function () {
  // Setup the tabs
  buildLeagueTabs();

  // Setup the search boxes to run filters when typed/changed
  document.getElementById('filter-team').addEventListener('input', applyFilters);
  document.getElementById('filter-date').addEventListener('change', applyFilters);

  // Set default date to today
  const today = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD
  document.getElementById('filter-date').value = today;

  // Set initial title based on first config league
  document.getElementById('page-title').textContent = `${ CONFIG.LEAGUES[0].name } Matches`;

  // Start the loading
  loadMatches();
});
