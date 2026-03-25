let currentLeague = CONFIG.LEAGUES[0].id;
let currentStatType = "goals"; 
let allPlayersCache = []; 
const leagueTabsDiv = document.getElementById("league-tabs");
const statTabsDiv = document.getElementById("stat-tabs");
const spinner = document.getElementById("spinner");
const playersGrid = document.getElementById("players-grid");
const pageTitle = document.getElementById("page-title");
function buildLeagueTabs() {
  let htmlString = "";
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
      </button>
    `;
  }
  leagueTabsDiv.innerHTML = htmlString;
}
leagueTabsDiv.addEventListener("click", function (event) {
  const clickedBtn = event.target.closest(".league-tab");
  if (clickedBtn === null) return;
  const allTabs = leagueTabsDiv.querySelectorAll(".league-tab");
  for (let j = 0; j < allTabs.length; j++) {
    allTabs[j].classList.remove('bg-blue-600', 'text-white', 'border-transparent');
    allTabs[j].classList.add('bg-white', 'border-gray-300', 'text-gray-600', 'hover:text-blue-600', 'hover:bg-blue-50');
  }
  clickedBtn.classList.remove('bg-white', 'border-gray-300', 'text-gray-600', 'hover:text-blue-600', 'hover:bg-blue-50');
  clickedBtn.classList.add('bg-blue-600', 'text-white', 'border-transparent');
  currentLeague = Number(clickedBtn.getAttribute('data-id'));
  for (let l = 0; l < CONFIG.LEAGUES.length; l++) {
     if (CONFIG.LEAGUES[l].id === currentLeague) {
        pageTitle.textContent = `${ CONFIG.LEAGUES[l].name } Statistics`;
        break;
     }
  }
  loadStats();
});
statTabsDiv.addEventListener("click", function (event) {
  const clickedBtn = event.target.closest(".stat-btn");
  if (clickedBtn === null) return;
  const allStatTabs = statTabsDiv.querySelectorAll(".stat-btn");
  for (let k = 0; k < allStatTabs.length; k++) {
    allStatTabs[k].classList.remove("active", "bg-blue-600", "border-blue-600", "text-white");
    allStatTabs[k].classList.add("bg-white", "border-gray-300", "text-gray-600", "hover:bg-gray-50", "hover:text-blue-600");
  }
  clickedBtn.classList.remove("bg-white", "border-gray-300", "text-gray-600", "hover:bg-gray-50", "hover:text-blue-600");
  clickedBtn.classList.add("active", "bg-blue-600", "border-blue-600", "text-white");
  currentStatType = clickedBtn.getAttribute('data-stat');
  renderPlayers();
});
async function getTopScorers(leagueId) {
  const url = `${CONFIG.SPORTS_BASE}/?met=Topscorers&leagueId=${leagueId}&APIkey=${CONFIG.SPORTS_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.success === 1 && data.result) {
    return data.result;
  }
  return [];
}
async function getTeamsPlayers(leagueId) {
  const url = `${CONFIG.SPORTS_BASE}/?met=Teams&leagueId=${leagueId}&APIkey=${CONFIG.SPORTS_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.success !== 1 || data.result == null) return [];
  let allLeaguePlayers = [];
  for (let i = 0; i < data.result.length; i++) {
    const teamObj = data.result[i];
    if (teamObj.players == null) continue;
    for (let j = 0; j < teamObj.players.length; j++) {
      const p = teamObj.players[j];
      allLeaguePlayers.push({
        player_key: p.player_key,
        player_name: p.player_name || "Unknown",
        player_image: p.player_image || "",
        goals: parseInt(p.player_goals) || 0,
        yellow_cards: parseInt(p.player_yellow_cards) || 0,
        red_cards: parseInt(p.player_red_cards) || 0,
        team_name: teamObj.team_name || "",
        team_logo: teamObj.team_logo || "",
      });
    }
  }
  return allLeaguePlayers;
}
async function loadStats() {
  spinner.style.display = "flex";
  playersGrid.innerHTML = "";
  currentStatType = "goals";
  const allStatTabs = statTabsDiv.querySelectorAll(".stat-btn");
  for (let m = 0; m < allStatTabs.length; m++) {
    allStatTabs[m].classList.remove("active", "bg-blue-600", "border-blue-600", "text-white");
    allStatTabs[m].classList.add("bg-white", "border-gray-300", "text-gray-600", "hover:bg-gray-50", "hover:text-blue-600");
  }
  const defaultTab = statTabsDiv.querySelector('[data-stat="goals"]');
  defaultTab.classList.remove("bg-white", "border-gray-300", "text-gray-600", "hover:bg-gray-50", "hover:text-blue-600");
  defaultTab.classList.add("active", "bg-blue-600", "border-blue-600", "text-white");
  try {
    console.log(`[Stats] Downloading Scorers and Teams data for League ${currentLeague}...`);
    const scorers = await getTopScorers(currentLeague);
    const teamPlayers = await getTeamsPlayers(currentLeague);
    const playerMap = {};
    for (let n = 0; n < teamPlayers.length; n++) {
      const p = teamPlayers[n];
      playerMap[p.player_key] = p; 
    }
    for (let c = 0; c < scorers.length; c++) {
      const s = scorers[c];
      if (playerMap[s.player_key] !== undefined) {
        playerMap[s.player_key].goals = parseInt(s.goals) || 0;
      } else {
        playerMap[s.player_key] = {
          player_key: s.player_key,
          player_name: s.player_name || "Unknown",
          player_image: "",
          team_name: s.team_name || "",
          team_logo: "",
          goals: parseInt(s.goals) || 0,
          yellow_cards: 0,
          red_cards: 0,
        };
      }
    }
    allPlayersCache = Object.values(playerMap);
    renderPlayers();
  } catch (error) {
    console.error("[Stats] Oh no! Bug:", error);
    playersGrid.innerHTML = `<div class="col-span-full text-red-600 text-center py-4 text-sm">Failed to load stats: ${error.message}</div>`;
  }
  spinner.style.display = "none";
}
function renderPlayers() {
  const sortedList = allPlayersCache.slice().sort(function (a, b) {
    return b[currentStatType] - a[currentStatType];
  });
  const filteredList = [];
  for (let i = 0; i < sortedList.length; i++) {
    const playerRecord = sortedList[i];
    if (playerRecord[currentStatType] > 0) {
      filteredList.push(playerRecord);
    }
  }
  const top20 = filteredList.slice(0, 20);
  if (top20.length === 0) {
    playersGrid.innerHTML = '<div class="col-span-full text-gray-500 text-center py-8 text-sm">No data available for this stat yet.</div>';
    return;
  }
  let finalHtml = "";
  for (let j = 0; j < top20.length; j++) {
    const playerObj = top20[j];
    const rankNum = j + 1; 
    finalHtml += createPlayerCard(playerObj, rankNum);
  }
  playersGrid.innerHTML = finalHtml;
}
function createPlayerCard(player, rank) {
  const name = player.player_name;
  const team = player.team_name;
  const teamLogo = player.team_logo;
  const value = player[currentStatType]; 
  let colorClass = "text-blue-600";
  let label = "Goals";
  if (currentStatType === "yellow_cards") {
    colorClass = "text-yellow-600";
    label = "Yellow";
  }
  if (currentStatType === "red_cards") {
    colorClass = "text-red-600";
    label = "Red";
  }
  const fallbackImg = "https://via.placeholder.com/150?text=No+Image";
  let imgSrc = fallbackImg;
  if (player.player_image && player.player_image.trim() !== "") {
     imgSrc = player.player_image;
  }
  let teamLogoHtml = "";
  if (teamLogo) {
    teamLogoHtml = `<img src="${ teamLogo }" alt="" class="w-4 h-4 object-contain" onerror="this.style.display='none'" />`;
  }
  return `
    <div class="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3 transition hover:shadow-md">
      <!-- Rank Number + Face Avatar -->
      <div class="relative">
        <img src="${ imgSrc }" alt="${ name }" onerror="this.onerror=null; this.src='${ fallbackImg }';" loading="lazy" class="w-12 h-12 rounded-full object-cover border border-gray-200 bg-gray-50" />
        <span class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-[0.6rem] font-bold flex items-center justify-center border-2 border-white">${ rank }</span>
      </div>
      <!-- Names -->
      <div class="flex-1 min-w-0">
        <div class="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-gray-800">${ name }</div>
        <div class="flex items-center gap-2 text-xs text-gray-500 mt-0.5 mt-1">
          ${ teamLogoHtml }
          <span>${ team }</span>
        </div>
      </div>
      <!-- Large Stat Value -->
      <div class="text-center px-3 border-l border-gray-100">
        <div class="text-xl font-extrabold ${ colorClass }">${ value }</div>
        <div class="text-[0.6rem] text-gray-400 uppercase font-bold tracking-widest">${ label }</div>
      </div>
    </div>
  `;
}
document.addEventListener("DOMContentLoaded", function () {
  buildLeagueTabs(); 
  pageTitle.textContent = CONFIG.LEAGUES[0].name + " Statistics"; 
  loadStats(); 
});
