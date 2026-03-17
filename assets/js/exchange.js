// ═══════════════════════════════════════════════════════════
//  exchange.js — Exchange rates widget + currency converter
// ═══════════════════════════════════════════════════════════

// We store all the fetched exchange rates here so we can reuse them later
// without making a new API request every time the user types a number.
let allRates = {};

/**
 * Fetches the latest currency exchange rates compared to EGP (Egyptian Pound)
 */
async function fetchRates() {
  const url = `${CONFIG.EXCHANGE_BASE}/${CONFIG.EXCHANGE_API_KEY}/latest/EGP`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Exchange API returned an error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // If the API returns rates, give them back. Otherwise return an empty object {}.
  if (data.conversion_rates) {
    return data.conversion_rates;
  } else {
    return {};
  }
}

/**
 * Generates the HTML to show the primary exchange rates (USD and SAR)
 */
function renderRates(rates) {
  // The API gives us how much 1 EGP is worth in USD. 
  // To find how much 1 USD is in EGP, we do: 1 / rates.USD
  
  let usdToEgp = '—'; // Default empty state
  if (rates.USD) {
    usdToEgp = (1 / rates.USD).toFixed(2); // Keep 2 decimal places
  }

  let sarToEgp = '—';
  if (rates.SAR) {
    sarToEgp = (1 / rates.SAR).toFixed(2);
  }

  return `
    <div class="exchange-item">
      <span class="font-semibold">🇺🇸 1 USD</span>
      <span class="exchange-value">${usdToEgp} EGP</span>
    </div>
    <div class="exchange-item no-border">
      <span class="font-semibold">🇸🇦 1 SAR</span>
      <span class="exchange-value">${sarToEgp} EGP</span>
    </div>`;
}

/**
 * Runs every time the user types an amount or changes a currency select dropdown
 */
function convertCurrency() {
  // 1. Read the amount from the input box. If it's empty, use 0.
  const amountInput = document.getElementById('conv-amount').value;
  const amount = parseFloat(amountInput) || 0;
  
  // 2. Find out which currencies they selected
  const fromCurrency = document.getElementById('conv-from').value;
  const toCurrency = document.getElementById('conv-to').value;
  const resultDiv = document.getElementById('conv-result');

  // 3. Make sure we have rates for both currencies
  if (!allRates[fromCurrency] || !allRates[toCurrency]) {
    resultDiv.textContent = '—';
    return;
  }

  // 4. Calculate the conversion.
  // We use EGP as our "base". 
  // Step A: Convert the 'from' amount into EGP by dividing.
  // Step B: Convert the EGP amount into the 'to' currency by multiplying.
  const baseValueInEGP = amount / allRates[fromCurrency];
  const finalConvertedValue = baseValueInEGP * allRates[toCurrency];

  // 5. Display the result, keeping 4 decimal places
  resultDiv.textContent = `${amount} ${fromCurrency} = ${finalConvertedValue.toFixed(4)} ${toCurrency}`;
}

/**
 * Main initialization function to fire up the widget
 */
async function initExchange() {
  const spinner = document.getElementById('exchange-spinner');
  const content = document.getElementById('exchange-content');
  const ratesList = document.getElementById('rates-list');

  try {
    // 1. Fetch rates and store them globally
    allRates = await fetchRates();
    
    // 2. Render the top list (USD, SAR)
    ratesList.innerHTML = renderRates(allRates);
    
    // 3. Show the whole widget
    content.style.display = 'block';

    // 4. Now that we have data, we listen for typed inputs or dropdown changes
    document.getElementById('conv-amount').addEventListener('input', convertCurrency);
    document.getElementById('conv-from').addEventListener('change', convertCurrency);
    document.getElementById('conv-to').addEventListener('change', convertCurrency);
    
    // 5. Run the conversion once manually to show a starting value (e.g. 1 USD -> EGP)
    convertCurrency();
    
  } catch (error) {
    content.innerHTML = `<div class="error-msg">⚠️ Failed to load rates: ${error.message}</div>`;
    content.style.display = 'block';
  } finally {
    spinner.style.display = 'none';
  }
}

// Start when the page loads
document.addEventListener('DOMContentLoaded', initExchange);
