// ═══════════════════════════════════════════════════════════
//  liveMatches.js — Live football scores widget (sidebar)
// ═══════════════════════════════════════════════════════════

/**
 * Asks the AllSportsAPI for any football matches happening right now
 */
async function fetchLiveMatches() {
  // 1. Build the correct API URL
  const url = `${CONFIG.SPORTS_BASE}/?met=Livescore&APIkey=${CONFIG.SPORTS_API_KEY}`;
  
  // 2. Send the request
  const response = await fetch(url);
  
  // 3. Catch general network errors
  if (!response.ok) {
    throw new Error(`Sports API gave error code: ${response.status}`);
  }
  
  // 4. Parse JSON data
  const data = await response.json();
  
  // 5. If successful and we have a list of results, return them
  if (data.success === 1 && Array.isArray(data.result)) {
    return data.result;
  }
  
  // Otherwise, return an empty array (no live matches)
  return [];
}

/**
 * Builds the HTML layout for a single live match box
 */
function renderLiveMatch(match) {
  // Sometimes API values are missing, so we provide default values using the `||` operator
  const homeTeam = match.event_home_team || 'Home';
  const awayTeam = match.event_away_team || 'Away';
  
  const homeLogo = match.home_team_logo || '';
  const awayLogo = match.away_team_logo || '';
  
  // The API sometimes uses different fields for the score, so we check both
  const score = match.event_final_result || match.event_ft_result || '- : -';

  return `
    <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800 mb-2.5 transition-colors hover:bg-slate-700">
      
      <!-- Home Team -->
      <div class="flex flex-col items-center gap-1 flex-1 text-center">
        <img src="${homeLogo}" alt="${homeTeam}" class="w-8 h-8 object-contain" onerror="this.style.display='none'" />
        <span class="text-[0.7rem] font-medium leading-tight">${homeTeam}</span>
      </div>
      
      <!-- Live Score -->
      <div class="text-lg font-extrabold text-red-500 py-1 px-3 rounded-lg bg-red-500/10 min-w-[60px] text-center">${score}</div>
      
      <!-- Away Team -->
      <div class="flex flex-col items-center gap-1 flex-1 text-center">
        <img src="${awayLogo}" alt="${awayTeam}" class="w-8 h-8 object-contain" onerror="this.style.display='none'" />
        <span class="text-[0.7rem] font-medium leading-tight">${awayTeam}</span>
      </div>
      
    </div>`;
}

/**
 * Start the live matches widget
 */
async function initLiveMatches() {
  const spinner = document.getElementById('live-spinner');
  const content = document.getElementById('live-content');

  try {
    // 1. Get the list of matches
    const matches = await fetchLiveMatches();

    if (matches.length === 0) {
      // 2. If no matches are live, display a simple message
      content.innerHTML = '<div class="text-slate-400 text-center py-8 text-sm col-span-full">No live matches right now.</div>';
    } else {
      // 3. Build HTML string for the first 6 matches
      let html = '';
      const limit = Math.min(matches.length, 6); // Up to 6 matches max
      
      for (let i = 0; i < limit; i++) {
        html += renderLiveMatch(matches[i]);
      }
      
      // Inject the HTML
      content.innerHTML = html;
    }
    
    // Show the box
    content.style.display = 'block';
    
  } catch (error) {
    // 4. Catch any errors (like an invalid API key) and display it gracefully
    content.innerHTML = `<div class="text-red-500 text-center py-4 text-sm">⚠️ ${error.message}</div>`;
    content.style.display = 'block';
  } finally {
    // 5. Hide the loading spinner
    spinner.style.display = 'none';
  }
}

// Run when HTML is ready
document.addEventListener('DOMContentLoaded', initLiveMatches);
