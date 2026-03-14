const NEWS_CATEGORIES = ['politics', 'economy', 'entertainment'];

async function fetchNewsByCategory(category) {
  try {
    const url = `https://gnews.io/api/v4/search?q=${ category }&lang=en&max=3&apikey=${ CONFIG.GNEWS_API_KEY }`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch news');
    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error(`Error fetching ${ category } news:`, error);
    return [];
  }
}

function createNewsCard(article) {
  const card = document.createElement('div');
  card.className = 'news-card';
  const imageUrl = article.image || 'https://via.placeholder.com/300x200?text=No+Image';
  const date = new Date(article.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  card.innerHTML = `
    <a href="${ article.url }" target="_blank" rel="noopener">
      <div class="news-card__image">
        <img src="${ imageUrl }" alt="${ article.title }" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
      </div>
      <div class="news-card__body">
        <h3 class="news-card__title">${ article.title }</h3>
        <p class="news-card__description">${ article.description || '' }</p>
        <div class="news-card__meta">
          <span class="news-card__source">${ article.source?.name || 'Unknown' }</span>
          <span class="news-card__date">${ date }</span>
        </div>
      </div>
    </a>
  `;
  return card;
}

function showNewsLoading(container) {
  container.innerHTML = `
    <div class="news-card skeleton"></div>
    <div class="news-card skeleton"></div>
    <div class="news-card skeleton"></div>
  `;
}

function showNewsError(container, category) {
  container.innerHTML = `<div class="error-message">Failed to load ${ category } news. Please try again later.</div>`;
}

async function renderNewsSection() {
  const newsMain = document.getElementById('news-main');
  if (!newsMain) return;

  for (const category of NEWS_CATEGORIES) {
    const section = document.createElement('section');
    section.className = 'news-section';
    section.innerHTML = `
      <h2 class="section-title">${ category.charAt(0).toUpperCase() + category.slice(1) }</h2>
      <div class="news-grid" id="news-${ category }"></div>
    `;
    newsMain.appendChild(section);

    const grid = section.querySelector(`#news-${ category }`);
    showNewsLoading(grid);

    const articles = await fetchNewsByCategory(category);
    grid.innerHTML = '';

    if (articles.length === 0) {
      showNewsError(grid, category);
    } else {
      articles.slice(0, 3).forEach(article => {
        grid.appendChild(createNewsCard(article));
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', renderNewsSection);
