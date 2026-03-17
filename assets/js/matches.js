// ═══════════════════════════════════════════════════════════
//  matches.js — League fixtures with Big-5 tabs + filters
// ═══════════════════════════════════════════════════════════

let currentLeagueId = CONFIG.LEAGUES[0].id; // The currently selected league
let allMatches = []; // A list containing all the loaded matches

/**
 * 1) Build League Tabs
 * Creates the buttons at the top of the page (Premier League, La Liga, etc.)
 */
function buildLeagueTabs() {
  const container = document.getElementById('league-tabs');
  let html = '';

  // Loop through the leagues defined in config.js
  for (let i = 0; i < CONFIG.LEAGUES.length; i++) {
    const league = CONFIG.LEAGUES[i];
    
    // The first tab should be active by default
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
    
    // If we didn't click inside a button, do nothing
    if (!clickedButton) return;
    
    // Find all tabs and remove the "active" class from them
    const allTabs = container.querySelectorAll('.league-tab');
    for (let j = 0; j < allTabs.length; j++) {
      allTabs[j].classList.remove('active');
    }
    
    // Add "active" class only to the clicked tab
    clickedButton.classList.add('active');
    
    // Update the current league ID
    currentLeagueId = Number(clickedButton.getAttribute('data-id'));
    
    // Find the league's name to update the page title
    for (let k = 0; k < CONFIG.LEAGUES.length; k++) {
      if (CONFIG.LEAGUES[k].id === currentLeagueId) {
        document.getElementById('page-title').textContent = `${CONFIG.LEAGUES[k].name} Matches`;
        break;
      }
    }
    
    // Reload the matches for the new league
    loadMatches();
  });
}

/**
 * 2) Fetch Matches from API
 * Gets the match schedule for the selected league for the current season
 */
async function fetchMatches(leagueId) {
  // Determine if we are starting from last year or this year (Seasons usually start in August/month 7)
  const currentDate = new Date();
  let startYear = currentDate.getFullYear();
  if (currentDate.getMonth() < 7) { 
    startYear = startYear - 1; 
  }
  
  const fromDate = `${startYear}-08-01`;
  const toDate = `${startYear + 1}-07-31`;

  // Build the correct API URL
  const url = `${CONFIG.SPORTS_BASE}/?met=Fixtures&leagueId=${leagueId}&APIkey=${CONFIG.SPORTS_API_KEY}&from=${fromDate}&to=${toDate}`;
  
  // Make network request
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API returned an error: ${response.status}`);
  }
  
  // Return the matches list (or empty list if failed)
  const data = await response.json();
  if (data.success === 1 && Array.isArray(data.result)) {
    return data.result;
  }
  
  return [];
}

/**
 * 3) Render Helpers
 * Functions to handle logic like Live Status and HTML building
 */

// Determines if a match is "live", "finished", or "upcoming"
function getMatchStatus(match) {
  const status = (match.event_status || '').trim();
  const isLive = (match.event_live === '1');

  // Logic: if it's explicitly live, or half time, or status is a number (minutes passed)
  if (isLive || status === 'Half Time' || /^\d+$/.test(status)) {
    if (isLive) {
      return { type: 'live', label: `🔴 LIVE ${status}'` };
    } else {
      return { type: 'live', label: status };
    }
  }
  
  if (status === 'Finished' || status === 'After Pens' || status === 'After ET') {
    return { type: 'finished', label: 'FT' }; // FT = Full Time
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
      <div class="match-score">${score}</div>
      <span class="match-status-finished">${statusInfo.label}</span>`;
  } else if (statusInfo.type === 'live') {
    centerHTML = `
      <div class="match-score live">${score}</div>
      <span class="match-status-live pulse">${statusInfo.label}</span>`;
  } else {
    centerHTML = `
      <span class="match-status-upcoming">Upcoming</span>
      <div class="match-time">${dateStr}<br/>${timeStr}</div>`;
  }

  return `
    <div class="match-card">
      <div class="match-team">
        <img src="${homeLogo}" alt="${home}" class="match-team-logo" onerror="this.style.display='none'" />
        <span class="match-team-name">${home}</span>
      </div>
      
      <div class="match-center">${centerHTML}</div>
      
      <div class="match-team">
        <img src="${awayLogo}" alt="${away}" class="match-team-logo" onerror="this.style.display='none'" />
        <span class="match-team-name">${away}</span>
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
    grid.innerHTML = '<div class="no-data">No matches found for your search.</div>';
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
    allMatches.sort(function(a, b) {
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
    grid.innerHTML = `<div class="error-msg text-center w-full mt-4">⚠️ Failed to load matches: ${error.message}</div>`;
  } finally {
    spinner.style.display = 'none';
  }
}

/**
 * 6) Boot up when page is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  // Setup the tabs
  buildLeagueTabs();
  
  // Setup the search boxes to run filters when typed/changed
  document.getElementById('filter-team').addEventListener('input', applyFilters);
  document.getElementById('filter-date').addEventListener('change', applyFilters);
  
  // Set default date to today
  const today = new Date().toISOString().slice(0, 10); // Format: YYYY-MM-DD
  document.getElementById('filter-date').value = today;
  
  // Set initial title based on first config league
  document.getElementById('page-title').textContent = `${CONFIG.LEAGUES[0].name} Matches`;
  
  // Start the loading
  loadMatches();
});
