async function fetchExchangeRates() {
  const url = `https://v6.exchangerate-api.com/v6/${CONFIG.EXCHANGERATE_API_KEY}/latest/EGP`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Exchange rate API error');
  return response.json();
}

async function fetchConversion(from, to, amount) {
  const url = `https://v6.exchangerate-api.com/v6/${CONFIG.EXCHANGERATE_API_KEY}/pair/${from}/${to}/${amount}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Conversion API error');
  return response.json();
}

function renderExchangeRates(data) {
  const widget = document.getElementById('exchange-widget');
  if (!widget) return;

  const egpToUSD = data.conversion_rates?.USD;
  const egpToSAR = data.conversion_rates?.SAR;

  if (!egpToUSD || !egpToSAR) {
    widget.innerHTML = '<div class="error-message">Exchange rate data unavailable.</div>';
    return;
  }

  const usdToEgp = (1 / egpToUSD).toFixed(2);
  const sarToEgp = (1 / egpToSAR).toFixed(2);

  widget.innerHTML = `
    <div class="exchange-rates">
      <div class="rate-item">
        <span class="rate-currency">🇺🇸 USD</span>
        <span class="rate-value">${usdToEgp} EGP</span>
      </div>
      <div class="rate-item">
        <span class="rate-currency">🇸🇦 SAR</span>
        <span class="rate-value">${sarToEgp} EGP</span>
      </div>
    </div>
  `;
}

function renderExchangeError(message) {
  const widget = document.getElementById('exchange-widget');
  if (!widget) return;
  widget.innerHTML = `<div class="error-message">${message}</div>`;
}

function initCurrencyConverter() {
  const converterForm = document.getElementById('converter-form');
  if (!converterForm) return;

  converterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('conv-amount').value);
    const from = document.getElementById('conv-from').value;
    const to = document.getElementById('conv-to').value;
    const resultEl = document.getElementById('conv-result');

    if (isNaN(amount) || amount <= 0) {
      resultEl.textContent = 'Please enter a valid amount.';
      return;
    }

    resultEl.textContent = 'Converting...';

    try {
      const data = await fetchConversion(from, to, amount);
      resultEl.textContent = `${amount} ${from} = ${data.conversion_result.toFixed(2)} ${to}`;
    } catch {
      resultEl.textContent = 'Conversion failed. Please try again.';
    }
  });
}

async function initExchange() {
  const widget = document.getElementById('exchange-widget');
  if (widget) {
    widget.innerHTML = '<div class="spinner"></div>';
    try {
      const data = await fetchExchangeRates();
      renderExchangeRates(data);
    } catch {
      renderExchangeError('Failed to load exchange rates. Please check your API key.');
    }
  }
  initCurrencyConverter();
}

document.addEventListener('DOMContentLoaded', initExchange);
