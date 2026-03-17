// ═══════════════════════════════════════════════════════════
//  news.js — Fetch & render GNews articles by category
// ═══════════════════════════════════════════════════════════

// These are the categories of news we want to fetch
const NEWS_CATEGORIES = ["politics", "economy", "entertainment"];

/**
 * Fetches the latest top headlines for a specific category
 */
async function fetchNewsByCategory(category) {
  // 1. Build the API URL using the category and our API key from config.js
  const url = `${CONFIG.GNEWS_BASE}/top-headlines?category=general&q=${category}&lang=en&max=3&apikey=${CONFIG.GNEWS_API_KEY}`;
  
  // 2. Make the network request
  const response = await fetch(url);
  
  // 3. Check if the request was successful
  if (!response.ok) {
    throw new Error(`GNews returned an error: ${response.status}`);
  }
  
  // 4. Convert the response to JSON format
  const data = await response.json();
  
  // 5. Return the array of articles, or an empty array if none exist
  if (data.articles) {
    return data.articles;
  } else {
    return [];
  }
}

/**
 * Creates the HTML for a single news article card
 */
function renderNewsCard(article) {
  // Format the date to be easily readable (e.g., "Oct 12, 2026")
  const date = new Date(article.publishedAt).toLocaleDateString("en-US", {
    month: "short", 
    day: "numeric", 
    year: "numeric"
  });

  // Use a placeholder image if the article doesn't have one
  const imageSrc = article.image ? article.image : 'https://via.placeholder.com/400x200?text=No+Image';
  const sourceName = article.source && article.source.name ? article.source.name : 'Unknown Source';

  // Return the HTML structure for this article
  return `
    <div class="bg-slate-800/65 border border-slate-600/40 rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-2xl">
      <img src="${imageSrc}" alt="${article.title}" loading="lazy" class="w-full h-[180px] object-cover"
           onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'" />
      <div class="p-4 flex flex-col flex-1">
        <h3 class="text-sm font-semibold leading-tight mb-2">
          <a href="${article.url}" target="_blank" rel="noopener" class="text-slate-100 hover:text-blue-500 transition-colors">${article.title}</a>
        </h3>
        <p class="text-xs text-slate-400 mb-3 flex-1">${article.description || ''}</p>
        <div class="flex justify-between text-xs text-slate-400">
          <span class="text-cyan-500 font-semibold">${sourceName}</span>
          <span>${date}</span>
        </div>
      </div>
    </div>`;
}

/**
 * Creates the HTML for an entire category row (Title + Articles)
 */
function renderCategoryRow(category, articles) {
  // Capitalize the first letter of the category name (e.g., "politics" -> "Politics")
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  
  // Build the HTML for all the cards in this category
  let cardsHtml = '';
  
  if (articles.length > 0) {
    // If we have articles, loop through them and generate the HTML for each card
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      cardsHtml += renderNewsCard(article);
    }
  } else {
    // If we don't have articles, show a friendly message
    cardsHtml = '<div class="col-span-full text-slate-400 text-center py-8 text-sm">No articles found for this category.</div>';
  }

  // Return the full section HTML: the category title + the grid of cards
  return `
    <section class="mb-10">
      <h2 class="text-xl font-bold mb-5 flex items-center gap-2">
        <span class="w-2 h-2 bg-blue-500 rounded-full inline-block"></span> ${label}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">${cardsHtml}</div>
    </section>`;
}

/**
 * Main function that runs when the page loads to initialize the news section
 */
async function initNews() {
  // 1. Get the elements from the page where we will show loading spinners and news content
  const spinner = document.getElementById('news-spinner');
  const contentContainer = document.getElementById('news-content');

  try {
    let finalHtml = '';

    // 2. Loop through each category we defined at the top
    for (let i = 0; i < NEWS_CATEGORIES.length; i++) {
      const category = NEWS_CATEGORIES[i];
      
      try {
        // Fetch the articles for this specific category
        const articles = await fetchNewsByCategory(category);
        
        // Generate the HTML for this category row and add it to our final HTML string
        finalHtml += renderCategoryRow(category, articles);
      } catch (categoryError) {
        // If one category fails to load, we log the error but keep trying the others
        console.error(`Failed to load category: ${category}`, categoryError);
      }
    }

    // 3. Put the final HTML into the page
    contentContainer.innerHTML = finalHtml;
    
  } catch (error) {
    // If something goes completely wrong, show an error message on the page
    contentContainer.innerHTML = `<div class="text-red-500 text-center py-4 text-sm">⚠️ Failed to load news: ${error.message}</div>`;
  } finally {
    // 4. Hide the loading spinner regardless of success or failure
    spinner.style.display = 'none';
  }
}

// 5. Tell the browser to run our initNews function as soon as the HTML is fully loaded
document.addEventListener('DOMContentLoaded', initNews);
