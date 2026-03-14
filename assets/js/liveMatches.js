async function fetchLiveMatches() {
  const url = `https://apiv3.apifootball.com/?action=get_events&match_live=1&APIkey=${CONFIG.APIFOOTBALL_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Live matches API error');
  const data = await response.json();
  if (data.error) throw new Error(data.message || 'API error');
  return Array.isArray(data) ? data : [];
}

function createMatchCard(match) {
  const card = document.createElement('div');
  card.className = 'match-card live';
  const home_badge = match.team_home_badge || 'https://via.placeholder.com/30?text=H';
  const away_badge = match.team_away_badge || 'https://via.placeholder.com/30?text=A';
  card.innerHTML = `
    <div class="match-teams">
      <div class="team home">
        <img src="${home_badge}" alt="${match.match_hometeam_name}" class="team-logo" onerror="this.src='https://via.placeholder.com/30?text=H'">
        <span class="team-name">${match.match_hometeam_name}</span>
      </div>
      <div class="match-score live-score">
        ${match.match_hometeam_score} - ${match.match_awayteam_score}
        <span class="match-time">${match.match_status}'</span>
      </div>
      <div class="team away">
        <img src="${away_badge}" alt="${match.match_awayteam_name}" class="team-logo" onerror="this.src='https://via.placeholder.com/30?text=A'">
        <span class="team-name">${match.match_awayteam_name}</span>
      </div>
    </div>
  `;
  return card;
}

async function initLiveMatches() {
  const widget = document.getElementById('live-matches-widget');
  if (!widget) return;

  widget.innerHTML = '<div class="spinner"></div>';

  try {
    const matches = await fetchLiveMatches();
    widget.innerHTML = '';

    if (matches.length === 0) {
      widget.innerHTML = '<div class="no-data">No live matches at the moment.</div>';
      return;
    }

    matches.slice(0, 5).forEach(match => {
      widget.appendChild(createMatchCard(match));
    });
  } catch (error) {
    console.error('Live matches fetch error:', error);
    widget.innerHTML = '<div class="error-message">Failed to load live matches. Please check your API key.</div>';
  }
}

document.addEventListener('DOMContentLoaded', initLiveMatches);
