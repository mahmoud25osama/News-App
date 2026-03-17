
const NEWS_CATEGORIES = ["politics", "economy", "entertainment"];

async function fetchNewsByCategory(category) {
  const url = `${ CONFIG.GNEWS_BASE }/top-headlines?category=general&q=${ category }&lang=en&max=3&apikey=${ CONFIG.GNEWS_API_KEY }`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`GNews returned an error: ${ response.status }`);
  }

  const data = await response.json();

  if (data.articles) {
    return data.articles;
  } else {
    return [];
  }
}

function renderNewsCard(article) {
  const date = new Date(article.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const sourceName = article.source && article.source.name ? article.source.name : 'Unknown Source';

  return `
    <div class="bg-slate-800/65 border border-slate-600/40 rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-2xl">
      <img src="${ imageSrc }" alt="${ article.title }" loading="lazy" class="w-full h-[180px] object-cover"
      <div class="p-4 flex flex-col flex-1">
        <h3 class="text-sm font-semibold leading-tight mb-2">
          <a href="${ article.url }" target="_blank" rel="noopener" class="text-slate-100 hover:text-blue-500 transition-colors">${ article.title }</a>
        </h3>
        <p class="text-xs text-slate-400 mb-3 flex-1">${ article.description || '' }</p>
        <div class="flex justify-between text-xs text-slate-400">
          <span class="text-cyan-500 font-semibold">${ sourceName }</span>
          <span>${ date }</span>
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
      cardsHtml += renderNewsCard(article);
    }
  } else {
    cardsHtml = '<div class="col-span-full text-slate-400 text-center py-8 text-sm">No articles found for this category.</div>';
  }

  return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-5 flex items-center gap-2">
        <span class="w-2 h-2 bg-blue-500 rounded-full inline-block"></span> ${ label }
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">${ cardsHtml }</div>
    </section>`;
}

async function initNews() {
  const spinner = document.getElementById('news-spinner');
  const contentContainer = document.getElementById('news-content');

  try {
    let finalHtml = '';

    for (let i = 0; i < NEWS_CATEGORIES.length; i++) {
      const category = NEWS_CATEGORIES[i];

      try {
        const articles = await fetchNewsByCategory(category);

        finalHtml += renderCategoryRow(category, articles);
      } catch (categoryError) {
        console.error(`Failed to load category: ${ category }`, categoryError);
      }
    }

    contentContainer.innerHTML = finalHtml;

  } catch (error) {
    contentContainer.innerHTML = `<div class="text-red-500 text-center py-4 text-sm">⚠️ Failed to load news: ${ error.message }</div>`;
  } finally {
    spinner.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', initNews);
