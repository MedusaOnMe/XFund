const axios = require('axios');
const { Connection, PublicKey } = require('@solana/web3.js');
const { getConnection } = require('./solana');

/**
 * Token metadata extraction
 * Fetches metadata from pump.fun API
 */

/**
 * Fetch token name and symbol from DEXScreener
 * @param {string} tokenAddress - Solana token contract address
 * @returns {Promise<object>} - Token name and symbol only
 */
async function fetchDexScreenerTokenInfo(tokenAddress) {
  try {
    const dexUrl = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`;
    console.log(`Fetching token info from DEXScreener for ${tokenAddress}`);

    const response = await axios.get(dexUrl, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.data?.pairs || response.data.pairs.length === 0) {
      console.log(`No DEXScreener data found for token ${tokenAddress}`);
      return null;
    }

    // Get the first pair (usually the most liquid)
    const pair = response.data.pairs[0];
    const baseToken = pair.baseToken;

    return {
      token_name: baseToken.name || null,
      token_symbol: baseToken.symbol || null
    };

  } catch (error) {
    console.error(`Error fetching DEXScreener data for ${tokenAddress}:`, error.message);
    return null;
  }
}

/**
 * Fetch token metadata using pump.fun API with DEXScreener fallback
 * @param {string} tokenAddress - Solana token contract address
 * @returns {Promise<object>} - Token metadata
 */
async function fetchTokenMetadata(tokenAddress) {
  try {
    // Try pump.fun API first
    const pumpUrl = `https://frontend-api-v3.pump.fun/coins/${tokenAddress}`;
    console.log(`Fetching token metadata from pump.fun for ${tokenAddress}`);

    const response = await axios.get(pumpUrl, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.data) {
      const tokenData = response.data;

      // Extract metadata from pump.fun response (but NOT images - those come from tweet)
      const metadata = {
        description: tokenData.description || null,
        twitter_url: tokenData.twitter || null,
        telegram_url: tokenData.telegram || null,
        website_url: tokenData.website || null,
        token_name: tokenData.name || null,
        token_symbol: tokenData.symbol || null
      };

      console.log(`Fetched metadata from pump.fun for ${tokenAddress}:`, {
        name: metadata.token_name,
        symbol: metadata.token_symbol
      });

      return metadata;
    }

  } catch (error) {
    console.log(`Pump.fun API failed for ${tokenAddress}, trying DEXScreener fallback`);
  }

  // Fallback to DEXScreener for name/symbol only
  const dexInfo = await fetchDexScreenerTokenInfo(tokenAddress);

  if (dexInfo) {
    console.log(`Fetched token info from DEXScreener for ${tokenAddress}:`, {
      name: dexInfo.token_name,
      symbol: dexInfo.token_symbol
    });

    return {
      description: null,
      twitter_url: null,
      telegram_url: null,
      website_url: null,
      token_name: dexInfo.token_name,
      token_symbol: dexInfo.token_symbol
    };
  }

  console.log(`No metadata found for token ${tokenAddress} from any source`);
  return null;
}

/**
 * Enrich campaign metadata with on-chain token data
 * Merges existing metadata with on-chain data (existing data takes priority)
 * Images come from tweet, not from token data
 */
function enrichMetadata(existingMetadata, tokenData) {
  if (!tokenData) {
    return existingMetadata;
  }

  return {
    main_image_url: existingMetadata.main_image_url || null,
    header_image_url: existingMetadata.header_image_url || null,
    description: existingMetadata.description || tokenData.description,
    twitter_url: existingMetadata.twitter_url || tokenData.twitter_url,
    telegram_url: existingMetadata.telegram_url || tokenData.telegram_url,
    website_url: existingMetadata.website_url || tokenData.website_url,
    token_name: existingMetadata.token_name || tokenData.token_name,
    token_symbol: existingMetadata.token_symbol || tokenData.token_symbol
  };
}

module.exports = {
  fetchTokenMetadata,
  enrichMetadata,
  fetchDexScreenerTokenInfo
};
