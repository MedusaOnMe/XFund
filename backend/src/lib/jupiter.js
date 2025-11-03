const axios = require('axios');

/**
 * Jupiter Price API v3 integration
 * Fetches real-time SOL price in USD
 * Docs: https://lite-api.jup.ag/price/v3
 */

const JUPITER_PRICE_API = 'https://lite-api.jup.ag/price/v3';
const SOL_MINT = 'So11111111111111111111111111111111111111112';

/**
 * Get current SOL price in USD
 * Returns price as a number
 */
async function getSolPrice() {
  try {
    const response = await axios.get(JUPITER_PRICE_API, {
      params: {
        ids: SOL_MINT
      },
      timeout: 10000
    });

    // Jupiter v3 response format: { "So111...": { "usdPrice": 188.33, ... } }
    const priceData = response.data[SOL_MINT];

    if (!priceData || !priceData.usdPrice) {
      console.error('No price data found in Jupiter response:', response.data);
      return 200; // Fallback price
    }

    const price = parseFloat(priceData.usdPrice);
    console.log(`Current SOL price: $${price.toFixed(2)} USD (Jupiter v3)`);

    return price;
  } catch (error) {
    console.error('Failed to fetch SOL price from Jupiter v3:', error.message);
    if (error.response) {
      console.error('API Error Response:', error.response.data);
    }
    return 200; // Updated fallback price
  }
}

/**
 * Calculate how much SOL is needed to reach a USD target
 */
async function calculateSolAmount(usdTarget) {
  const solPrice = await getSolPrice();
  const solAmount = usdTarget / solPrice;

  console.log(`$${usdTarget} USD = ${solAmount.toFixed(4)} SOL at $${solPrice.toFixed(2)}/SOL`);

  return {
    solAmount: parseFloat(solAmount.toFixed(4)),
    solPrice,
    usdTarget
  };
}

/**
 * Convert SOL amount to USD value
 */
async function solToUsd(solAmount) {
  const solPrice = await getSolPrice();
  const usdValue = solAmount * solPrice;

  return {
    usdValue: parseFloat(usdValue.toFixed(2)),
    solPrice,
    solAmount
  };
}

module.exports = {
  getSolPrice,
  calculateSolAmount,
  solToUsd
};
