
let currentLeague = CONFIG.LEAGUES[0].id;
let currentStat = "goals";
let allPlayers = [];

const leagueTabsDiv = document.getElementById("league-tabs");
const statTabsDiv = document.getElementById("stat-tabs");
const spinner = document.getElementById("spinner");
const playersGrid = document.getElementById("players-grid");
const pageTitle = document.getElementById("page-title");

function buildLeagueTabs() {
  let html = "";

  for (let i = 0; i < CONFIG.LEAGUES.length; i++) {
    const league = CONFIG.LEAGUES[i];
    const isActive = (i === 0) ? 'bg-gradient-to-br from-blue-500 to-cyan-500 border-transparent text-white' : 'bg-slate-800 border-slate-600/40 text-slate-400 hover:border-blue-500 hover:text-slate-100';

    html += `
      <button class="league-tab flex items-center gap-2 px-5 py-2 border rounded-full text-sm font-semibold cursor-pointer transition-all ${ isActive }" data-id="${ league.id }">
        <img src="${ league.logo }" alt="${ league.name }" class="w-5 h-5 object-contain"
             onerror="this.style.display='none'" />
        ${ league.name }
      </button>
    `;
  }

  leagueTabsDiv.innerHTML = html;
}

leagueTabsDiv.addEventListener("click", function (e) {
  const btn = e.target.closest(".league-tab");
  if (!btn) return;

  const allTabs = leagueTabsDiv.querySelectorAll(".league-tab");
  for (let j = 0; j < allTabs.length; j++) {
    allTabs[j].classList.remove('bg-gradient-to-br', 'from-blue-500', 'to-cyan-500', 'border-transparent', 'text-white');
    allTabs[j].classList.add('bg-slate-800', 'border-slate-600/40', 'text-slate-400', 'hover:border-blue-500', 'hover:text-slate-100');
  }
  btn.classList.remove('bg-slate-800', 'border-slate-600/40', 'text-slate-400', 'hover:border-blue-500', 'hover:text-slate-100');
  btn.classList.add('bg-gradient-to-br', 'from-blue-500', 'to-cyan-500', 'border-transparent', 'text-white');

  currentLeague = Number(btn.getAttribute('data-id'));

  const leagueNameInfo = CONFIG.LEAGUES.find(l => l.id === currentLeague);
  pageTitle.textContent = leagueNameInfo ? leagueNameInfo.name + " Statistics" : "Player Statistics";

  loadStats();
});

statTabsDiv.addEventListener("click", function (e) {
  const btn = e.target.closest(".stat-btn");
  if (!btn) return;

  const allStatTabs = statTabsDiv.querySelectorAll(".stat-btn");
  for (let k = 0; k < allStatTabs.length; k++) {
    allStatTabs[k].classList.remove("active", "bg-[var(--btn-color)]", "border-[var(--btn-color)]", "text-white", "shadow-lg");
    allStatTabs[k].classList.add("bg-slate-800", "border-slate-600/40", "text-slate-400");
  }
  btn.classList.remove("bg-slate-800", "border-slate-600/40", "text-slate-400");
  btn.classList.add("active", "bg-[var(--btn-color)]", "border-[var(--btn-color)]", "text-white", "shadow-lg");

  currentStat = btn.getAttribute('data-stat');
  showPlayers();
});


async function getTopScorers(leagueId) {
  const url = CONFIG.SPORTS_BASE + "/?met=Topscorers&leagueId=" + leagueId + "&APIkey=" + CONFIG.SPORTS_API_KEY;
  const response = await fetch(url);
  const data = await response.json();

  if (data.success === 1 && data.result) {
    return data.result;
  }
  return [];
}

async function getTeamsPlayers(leagueId) {
  const url = CONFIG.SPORTS_BASE + "/?met=Teams&leagueId=" + leagueId + "&APIkey=" + CONFIG.SPORTS_API_KEY;
  const response = await fetch(url);
  const data = await response.json();

  if (data.success !== 1 || !data.result) return [];

  const players = [];

  for (let i = 0; i < data.result.length; i++) {
    const team = data.result[i];

    if (!team.players) continue;

    for (let j = 0; j < team.players.length; j++) {
      const p = team.players[j];
      players.push({
        player_key: p.player_key,
        player_name: p.player_name || "Unknown",
        player_image: p.player_image || "",
        goals: parseInt(p.player_goals) || 0,
        yellow_cards: parseInt(p.player_yellow_cards) || 0,
        red_cards: parseInt(p.player_red_cards) || 0,
        team_name: team.team_name || "",
        team_logo: team.team_logo || "",
      });
    }
  }

  return players;
}

async function loadStats() {
  spinner.style.display = "flex";
  playersGrid.innerHTML = "";

  currentStat = "goals";

  const allStatTabs = statTabsDiv.querySelectorAll(".stat-btn");
  for (let m = 0; m < allStatTabs.length; m++) {
    allStatTabs[m].classList.remove("active", "bg-[var(--btn-color)]", "border-[var(--btn-color)]", "text-white", "shadow-lg");
    allStatTabs[m].classList.add("bg-slate-800", "border-slate-600/40", "text-slate-400");
  }
  const defaultTab = statTabsDiv.querySelector('[data-stat="goals"]');
  defaultTab.classList.remove("bg-slate-800", "border-slate-600/40", "text-slate-400");
  defaultTab.classList.add("active", "bg-[var(--btn-color)]", "border-[var(--btn-color)]", "text-white", "shadow-lg");

  try {
    const scorers = await getTopScorers(currentLeague);
    const teamPlayers = await getTeamsPlayers(currentLeague);

    const playerMap = {};

    for (let n = 0; n < teamPlayers.length; n++) {
      const p = teamPlayers[n];
      playerMap[p.player_key] = {
        player_key: p.player_key,
        player_name: p.player_name,
        player_image: p.player_image,
        team_name: p.team_name,
        team_logo: p.team_logo,
        goals: p.goals,
        yellow_cards: p.yellow_cards,
        red_cards: p.red_cards,
      };
    }

    for (let c = 0; c < scorers.length; c++) {
      const s = scorers[c];
      if (playerMap[s.player_key]) {
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

    allPlayers = Object.values(playerMap);

    showPlayers();

  } catch (error) {
    playersGrid.innerHTML = '<div class="col-span-full text-red-500 text-center py-4 text-sm">Failed to load stats. Please try again.</div>';
  }

  spinner.style.display = "none";
}

function showPlayers() {
  const sorted = allPlayers.slice().sort(function (a, b) {
    return b[currentStat] - a[currentStat];
  });

  const filtered = [];
  for (let i = 0; i < sorted.length; i++) {
    const player = sorted[i];
    if (player[currentStat] > 0) {
      filtered.push(player);
    }
  }

  const top20 = filtered.slice(0, 20);

  if (top20.length === 0) {
    playersGrid.innerHTML = '<div class="col-span-full text-slate-400 text-center py-8 text-sm">No data available for this stat.</div>';
    return;
  }

  let html = "";
  for (let j = 0; j < top20.length; j++) {
    const player = top20[j];
    const rank = j + 1;
    html += createPlayerCard(player, rank);
  }

  playersGrid.innerHTML = html;
}

function createPlayerCard(player, rank) {
  const name = player.player_name;
  const team = player.team_name;
  const teamLogo = player.team_logo;
  const value = player[currentStat];

  let colorClass = "text-green-400";
  let label = "Goals";

  if (currentStat === "yellow_cards") {
    colorClass = "text-amber-400";
    label = "Yellow";
  }

  if (currentStat === "red_cards") {
    colorClass = "text-red-400";
    label = "Red";
  }

  const nameParts = name.split(" ");
  let initials = "";
  for (let p = 0; p < nameParts.length && p < 2; p++) {
    initials += nameParts[p][0];
  }

  const imgSrc = (player.player_image && player.player_image.trim() !== "") ? player.player_image : fallback;

  let teamLogoHtml = "";
  if (teamLogo) {
    teamLogoHtml = `<img src="${ teamLogo }" alt="" class="w-4 h-4 object-contain" onerror="this.style.display='none'" />`;
  }

  return `
    <div class="bg-slate-800/65 border border-slate-600/40 rounded-xl p-4 flex items-center gap-3 transition-transform hover:-translate-y-0.5 animate-[fadeIn_0.3s_ease-out_both]">
      
      <!-- Rank + Avatar -->
      <div class="relative">
        <img src="${ imgSrc }" alt="${ name }" onerror="this.onerror=null; this.src='${ fallback }';" loading="lazy" class="w-12 h-12 rounded-full object-cover border-2 border-blue-500 bg-slate-700" />
        <span class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 text-white text-[0.6rem] font-bold flex items-center justify-center border-2 border-slate-900">${ rank }</span>
      </div>

      <!-- Name + Team -->
      <div class="flex-1 min-w-0">
        <div class="text-sm font-semibold whitespace-nowrap overflow-hidden text-ellipsis">${ name }</div>
        <div class="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
          ${ teamLogoHtml }
          <span>${ team }</span>
        </div>
      </div>

      <!-- Stat Value (Goals/Yellows/etc) -->
      <div class="text-center px-2">
        <div class="text-lg font-bold ${ colorClass }">${ value }</div>
        <div class="text-[0.6rem] text-slate-500 uppercase">${ label }</div>
      </div>
      
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", function () {
  buildLeagueTabs();
  pageTitle.textContent = CONFIG.LEAGUES[0].name + " Statistics";
  loadStats();
});
