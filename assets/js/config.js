// ─── API Keys ────────────────────────────────────────────────
// Replace these with your own free-tier keys
const CONFIG = {
  GNEWS_API_KEY: '10d81657bcbc88f1e8ec3d5751d7a477',
  WEATHER_API_KEY: 'a43cc0740223a21a2996c5224f55c414',
  EXCHANGE_API_KEY: '1512c14c421336bc4d73659a',
  SPORTS_API_KEY: '9d96ccd544cee2fe8bbd0d08651d9093f50dae6040ad644c7ed4a0cee20c8f94',

  // ─── AllSportsAPI Big-5 League IDs ────────────────────────
  LEAGUES: [
    { id: 152, name: "Premier League", logo: "https://apiv2.allsportsapi.com/logo/logo_leagues/152_premier-league.png" },
    { id: 302, name: "La Liga", logo: "https://apiv2.allsportsapi.com/logo/logo_leagues/302_la-liga.png" },
    { id: 175, name: "Bundesliga", logo: "https://apiv2.allsportsapi.com/logo/logo_leagues/175_bundesliga.png" },
    { id: 207, name: "Serie A", logo: "https://apiv2.allsportsapi.com/logo/logo_leagues/207_serie-a.png" },
    { id: 168, name: "Ligue 1", logo: "https://apiv2.allsportsapi.com/logo/logo_leagues/168_ligue-1.png" },
  ],

  // ─── Base URLs ────────────────────────────────────────────
  GNEWS_BASE: "https://gnews.io/api/v4",
  WEATHER_BASE: "https://api.openweathermap.org/data/2.5",
  EXCHANGE_BASE: "https://v6.exchangerate-api.com/v6",
  SPORTS_BASE: "https://apiv2.allsportsapi.com/football",
};
