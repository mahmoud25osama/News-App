const NEWS_CATEGORIES = ["politics", "economy", "entertainment"];
async function fetchNewsByCategory(category) {
  const url = `${ CONFIG.GNEWS_BASE }/top-headlines?category=general&q=${ category }&lang=en&max=3&apikey=${ CONFIG.GNEWS_API_KEY }`;
  console.log(`[News] Requesting ${category} articles from:`, url);
  const response = await fetch(url);
  if (response.ok === false) {
    throw new Error(`The News API returned an error! Status Code: ${ response.status }`);
  }
  const data = await response.json();
  if (data.articles) {
    return data.articles;
  } else {
    return [];
  }
}
function renderNewsCard(article) {
  const dateObj = new Date(article.publishedAt);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  let sourceName = "Unknown Source";
  if (article.source && article.source.name) {
    sourceName = article.source.name;
  }
  let imageSrc = "https://via.placeholder.com/300x180?text=No+Image";
  if (article.image) {
    imageSrc = article.image;
  }
  return `
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col transition hover:shadow-md">
      <img src="${ imageSrc }" alt="${ article.title }" loading="lazy" class="w-full h-[180px] object-cover" />
      <div class="p-4 flex flex-col flex-1">
        <h3 class="text-sm font-semibold leading-tight mb-2">
          <a href="${ article.url }" target="_blank" rel="noopener" class="text-gray-900 hover:text-blue-600 transition-colors">${ article.title }</a>
        </h3>
        <p class="text-xs text-gray-500 mb-3 flex-1">${ article.description || 'No description available for this article.' }</p>
        <div class="flex justify-between text-xs text-gray-500">
          <span class="text-blue-600 font-semibold">${ sourceName }</span>
          <span>${ formattedDate }</span>
        </div>
      </div>
    </div>`;
}
function renderCategoryRow(category, articles) {
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  let cardsHtml = '';
  if (articles.length > 0) {
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      cardsHtml = cardsHtml + renderNewsCard(article);
    }
  } else {
    cardsHtml = '<div class="col-span-full text-gray-500 text-center py-8 text-sm">No articles found for this topic.</div>';
  }
  return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-5 flex items-center gap-2 text-gray-800">
        <span class="w-2 h-2 bg-blue-600 rounded-full inline-block"></span> ${ label }
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">${ cardsHtml }</div>
    </section>`;
}
async function initNews() {
  console.log("[News] Application starting...");
  const spinnerContainer = document.getElementById('news-spinner');
  const newsContainer = document.getElementById('news-content');
  try {
    let finalHtml = '';
    for (let i = 0; i < NEWS_CATEGORIES.length; i++) {
      const category = NEWS_CATEGORIES[i];
      try {
        const articles = await fetchNewsByCategory(category);
        finalHtml = finalHtml + renderCategoryRow(category, articles);
      } catch (categoryError) {
        console.error(`[News] Failed to load ${ category }:`, categoryError);
      }
    }
    newsContainer.innerHTML = finalHtml;
  } catch (error) {
    newsContainer.innerHTML = `<div class="text-red-600 text-center py-4 text-sm">⚠️ Our news system crashed: ${ error.message }</div>`;
  } finally {
    spinnerContainer.style.display = 'none';
  }
}
document.addEventListener('DOMContentLoaded', initNews);
