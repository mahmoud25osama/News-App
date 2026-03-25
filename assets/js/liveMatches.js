async function fetchLiveMatches() {
  const url = `${CONFIG.SPORTS_BASE}/?met=Livescore&APIkey=${CONFIG.SPORTS_API_KEY}`;
  console.log(`[Matches] Checking for live games at: ${url}`);
  const response = await fetch(url);
  if (response.ok === false) {
    throw new Error(`Sports API gave error code: ${response.status}`);
  }
  const data = await response.json();
  if (data.success === 1 && Array.isArray(data.result)) {
    return data.result;
  } else {
    return [];
  }
}
function renderLiveMatch(match) {
  const homeTeam = match.event_home_team || 'Home';
  const awayTeam = match.event_away_team || 'Away';
  const homeLogo = match.home_team_logo || '';
  const awayLogo = match.away_team_logo || '';
  const score = match.event_final_result || match.event_ft_result || '- : -';
  return `
    <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 mb-2.5 transition-colors hover:bg-gray-100">
      <!-- Home Team Column -->
      <div class="flex flex-col items-center gap-1 flex-1 text-center">
        <img src="${homeLogo}" alt="${homeTeam}" class="w-8 h-8 object-contain" onerror="this.style.display='none'" />
        <span class="text-[0.7rem] font-medium leading-tight text-gray-800">${homeTeam}</span>
      </div>
      <!-- Live Score Column -->
      <div class="text-lg font-extrabold text-red-600 py-1 px-3 rounded text-center">${score}</div>
      <!-- Away Team Column -->
      <div class="flex flex-col items-center gap-1 flex-1 text-center">
        <img src="${awayLogo}" alt="${awayTeam}" class="w-8 h-8 object-contain" onerror="this.style.display='none'" />
        <span class="text-[0.7rem] font-medium leading-tight text-gray-800">${awayTeam}</span>
      </div>
    </div>`;
}
async function initLiveMatches() {
  console.log("[Matches] Starting live match engine...");
  const spinnerContainer = document.getElementById('live-spinner');
  const widgetContent = document.getElementById('live-content');
  try {
    const matchesArray = await fetchLiveMatches();
    if (matchesArray.length === 0) {
      widgetContent.innerHTML = '<div class="text-gray-500 text-center py-8 text-sm col-span-full">No live matches right now.</div>';
    } else {
      let fullHtml = '';
      const maximumLimit = 6;
      let finalLimit = matchesArray.length;
      if (finalLimit > maximumLimit) {
         finalLimit = maximumLimit;
      }
      for (let i = 0; i < finalLimit; i++) {
        fullHtml = fullHtml + renderLiveMatch(matchesArray[i]);
      }
      widgetContent.innerHTML = fullHtml;
    }
    widgetContent.style.display = 'block';
  } catch (error) {
    console.error(`[Matches] Failed because:`, error);
    widgetContent.innerHTML = `<div class="text-red-600 text-center py-4 text-sm">⚠️ Server failure: ${error.message}</div>`;
    widgetContent.style.display = 'block';
  } finally {
    spinnerContainer.style.display = 'none';
  }
}
document.addEventListener('DOMContentLoaded', initLiveMatches);
