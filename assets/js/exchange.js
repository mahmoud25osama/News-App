let allRatesCache = {};
async function fetchRates() {
  const url = `${CONFIG.EXCHANGE_BASE}/${CONFIG.EXCHANGE_API_KEY}/latest/EGP`;
  console.log("[Exchange] Getting the latest money values from:", url);
  const response = await fetch(url);
  if (response.ok === false) {
    throw new Error(`Exchange API returned an error: ${response.status}`);
  }
  const data = await response.json();
  if (data.conversion_rates) {
    return data.conversion_rates;
  } else {
    return {};
  }
}
function renderRatesList(ratesObj) {
  let usdToEgp = "—"; 
  if (ratesObj.USD) {
    usdToEgp = (1 / ratesObj.USD).toFixed(2);
  }
  let sarToEgp = "—";
  if (ratesObj.SAR) {
    sarToEgp = (1 / ratesObj.SAR).toFixed(2);
  }
  return `
    <div class="flex justify-between items-center py-2.5 border-b border-gray-200">
      <span class="font-semibold"><i class="fa-solid fa-dollar-sign text-green-600"></i> 1 USD</span>
      <span class="text-lg text-blue-600 font-bold">${usdToEgp} EGP</span>
    </div>
    <div class="flex justify-between items-center py-2.5">
      <span class="font-semibold"><i class="fa-solid fa-coins text-yellow-500"></i> 1 SAR</span>
      <span class="text-lg text-blue-600 font-bold">${sarToEgp} EGP</span>
    </div>`;
}
function convertCurrency() {
  console.log("[Exchange] A user is typing or clicking in the converter box.");
  const amountInputRaw = document.getElementById('conv-amount').value;
  let amount = parseFloat(amountInputRaw);
  if (isNaN(amount)) {
    amount = 0;
  }
  const fromCurrencyString = document.getElementById('conv-from').value;
  const toCurrencyString = document.getElementById('conv-to').value;
  const resultDisplayDiv = document.getElementById('conv-result');
  if (allRatesCache[fromCurrencyString] === undefined || allRatesCache[toCurrencyString] === undefined) {
    resultDisplayDiv.textContent = '—';
    return;
  }
  const baseValueInEGP = amount / allRatesCache[fromCurrencyString];
  const finalConvertedValue = baseValueInEGP * allRatesCache[toCurrencyString];
  resultDisplayDiv.textContent = `${amount} ${fromCurrencyString} = ${finalConvertedValue.toFixed(4)} ${toCurrencyString}`;
}
async function initExchange() {
  const spinnerContainer = document.getElementById('exchange-spinner');
  const widgetContent = document.getElementById('exchange-content');
  const topRatesListContainer = document.getElementById('rates-list');
  try {
    allRatesCache = await fetchRates();
    const ratesHtmlString = renderRatesList(allRatesCache);
    topRatesListContainer.innerHTML = ratesHtmlString;
    widgetContent.style.display = 'block';
    const amountBox = document.getElementById('conv-amount');
    const fromChoiceBox = document.getElementById('conv-from');
    const toChoiceBox = document.getElementById('conv-to');
    amountBox.addEventListener('input', convertCurrency);
    fromChoiceBox.addEventListener('change', convertCurrency);
    toChoiceBox.addEventListener('change', convertCurrency);
    convertCurrency();
  } catch (error) {
    console.error("[Exchange] Oh no! Conversion failed:", error);
    widgetContent.innerHTML = `<div class="text-red-600 text-center py-4 text-sm">⚠️ Failed to connect to exchange rates.</div>`;
    widgetContent.style.display = 'block';
  } finally {
    spinnerContainer.style.display = 'none';
  }
}
document.addEventListener('DOMContentLoaded', initExchange);
