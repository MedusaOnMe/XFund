/**
 * Tweet command parser
 * Parses tweet text to extract commands
 */

// Tweet command patterns
const PATTERNS = {
  CREATE: /@XFundDex\s+create\s+(dex|boosts)\s+([1-9A-HJ-NP-Za-km-z]{32,44})/i,
  CONTRIBUTE: /@XFundDex\s+fund\s+(dex|boosts)\s+([0-9.]+)\s+([1-9A-HJ-NP-Za-km-z]{32,44})/i,
  EXPORT: /@XFundDex\s+export\s+([0-9]{6})/i
};

/**
 * Parse a tweet and extract command
 * Returns: { type, data } or null if no valid command
 */
function parseTweet(tweetText) {
  if (!tweetText || typeof tweetText !== 'string') {
    return null;
  }

  // Try CREATE command
  const createMatch = tweetText.match(PATTERNS.CREATE);
  if (createMatch) {
    return {
      type: 'CREATE',
      data: {
        campaignType: createMatch[1].toLowerCase(), // dex or boosts
        tokenCA: createMatch[2]
      }
    };
  }

  // Try CONTRIBUTE command
  const contributeMatch = tweetText.match(PATTERNS.CONTRIBUTE);
  if (contributeMatch) {
    const amount = parseFloat(contributeMatch[2]);

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return null;
    }

    return {
      type: 'CONTRIBUTE',
      data: {
        campaignType: contributeMatch[1].toLowerCase(),
        tokenCA: contributeMatch[3],
        amount
      }
    };
  }

  // Try EXPORT command
  const exportMatch = tweetText.match(PATTERNS.EXPORT);
  if (exportMatch) {
    return {
      type: 'EXPORT',
      data: {
        verificationCode: exportMatch[1]
      }
    };
  }

  return null;
}

/**
 * Validate Solana token address format
 */
function isValidTokenCA(ca) {
  const pattern = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return pattern.test(ca);
}

module.exports = {
  parseTweet,
  isValidTokenCA
};
