const { createWallet, sendSOL, getBalance } = require('./solana');
const { encrypt, decrypt } = require('./encrypt');
const { getFirestore } = require('firebase-admin/firestore');
const { fetchTokenMetadata, enrichMetadata } = require('./dexscreener');
const { classifyAndUploadTweetImages } = require('./storage');
const { calculateSolAmount, solToUsd } = require('./jupiter');

/**
 * Campaign operations
 * Handles campaign creation and contributions
 */

/**
 * Create a new campaign
 * Returns: campaign object
 */
async function createCampaign(campaignType, tokenCA, creatorUserId, tweet = null) {
  const db = getFirestore();

  // Generate wallet for campaign
  const wallet = createWallet();

  // Encrypt campaign wallet private key
  const campaignId = db.collection('campaigns').doc().id;
  const encryptedPrivKey = encrypt(JSON.stringify(wallet.secretKey), campaignId);

  // Calculate end time (24h for DEX, null for BOOSTS)
  const now = Date.now();
  const endTs = campaignType === 'dex' ? now + (24 * 60 * 60 * 1000) : null;

  // Fetch token metadata from on-chain data (pump.fun API)
  const tokenData = await fetchTokenMetadata(tokenCA);

  // Extract images from tweet and classify by aspect ratio
  let tweetImages = {
    main_image_url: null,
    header_image_url: null
  };

  if (tweet && tweet.media && tweet.media.length > 0) {
    // Extract photo URLs
    const photoUrls = tweet.media
      .filter(m => m.type === 'photo' || m.media_url_https || m.url)
      .map(m => m.media_url_https || m.url)
      .filter(url => url);

    if (photoUrls.length > 0) {
      console.log(`Extracting ${photoUrls.length} images from tweet`);
      tweetImages = await classifyAndUploadTweetImages(photoUrls);
    }
  }

  // Create base metadata structure with tweet images
  const baseMetadata = {
    main_image_url: tweetImages.main_image_url,
    header_image_url: tweetImages.header_image_url,
    description: null,
    twitter_url: null,
    telegram_url: null,
    website_url: null,
    token_name: null,
    token_symbol: null
  };

  // Enrich with on-chain token data (but don't override tweet images)
  const metadata = enrichMetadata(baseMetadata, tokenData);

  // Set goal amount based on campaign type
  // DEX: $300 USD (cost for DEXScreener enhanced token info) - calculated dynamically
  // BOOSTS: No fixed goal (flexible)
  let goalAmount = null;
  let goalUsd = null;
  let solPriceAtCreation = null;

  if (campaignType === 'dex') {
    const DEX_COST_USD = 300;
    const priceData = await calculateSolAmount(DEX_COST_USD);
    goalAmount = priceData.solAmount;
    goalUsd = DEX_COST_USD;
    solPriceAtCreation = priceData.solPrice;
  }

  const campaign = {
    id: campaignId,
    type: campaignType,
    creator_user_id: creatorUserId,
    token_ca: tokenCA,
    campaign_wallet_pub: wallet.publicKey,
    campaign_wallet_priv_enc: encryptedPrivKey,
    start_ts: now,
    end_ts: endTs,
    status: 'active',
    goal_amount: goalAmount,
    goal_usd: goalUsd,
    sol_price_at_creation: solPriceAtCreation,
    total_raised: 0,
    created_at: now,
    metadata
  };

  // Save to Firestore
  await db.collection('campaigns').doc(campaignId).set(campaign);

  console.log(`Created ${campaignType.toUpperCase()} campaign: ${campaignId} for token ${tokenCA}`);

  return campaign;
}

/**
 * Contribute SOL to a campaign
 * Transfers from user wallet to campaign wallet
 */
async function contribute(campaignId, userId, amount) {
  const db = getFirestore();

  // Get campaign
  const campaignDoc = await db.collection('campaigns').doc(campaignId).get();
  if (!campaignDoc.exists) {
    throw new Error('Campaign not found');
  }

  const campaign = campaignDoc.data();

  // Check if campaign is active
  if (campaign.status !== 'active') {
    throw new Error('Campaign is not active');
  }

  // Check if DEX campaign is expired
  if (campaign.type === 'dex' && campaign.end_ts && Date.now() > campaign.end_ts) {
    throw new Error('Campaign has expired');
  }

  // Get user wallet
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  const user = userDoc.data();

  // Check user balance (need amount + fee buffer)
  const userBalance = await getBalance(user.user_wallet_pub);
  const FEE_BUFFER = 0.00001; // 0.00001 SOL (~10000 lamports) for tx fee

  if (userBalance < (amount + FEE_BUFFER)) {
    throw new Error(`Insufficient balance. You have ${userBalance.toFixed(6)} SOL but need ${(amount + FEE_BUFFER).toFixed(6)} SOL (including tx fee)`);
  }

  // Decrypt user's private key
  const userSecretKey = JSON.parse(decrypt(user.user_wallet_priv_enc, userId));

  // Send SOL from user wallet to campaign wallet
  const txSignature = await sendSOL(
    userSecretKey,
    campaign.campaign_wallet_pub,
    amount
  );

  // Record contribution
  const contributionId = db.collection('contributions').doc().id;
  const contribution = {
    id: contributionId,
    campaign_id: campaignId,
    user_id: userId,
    amount,
    tx_signature: txSignature,
    timestamp: Date.now()
  };

  await db.collection('contributions').doc(contributionId).set(contribution);

  // Get ACTUAL campaign wallet balance after transaction
  const actualBalance = await getBalance(campaign.campaign_wallet_pub);
  console.log(`Campaign wallet ${campaign.campaign_wallet_pub} actual balance: ${actualBalance} SOL`);

  // Update campaign total with actual balance
  const updateData = {
    total_raised: actualBalance
  };

  // Check if campaign is now fully funded based on USD value
  // Fetch current SOL price and calculate USD value of wallet
  if (campaign.goal_usd && campaign.status === 'active') {
    const walletUsdValue = await solToUsd(actualBalance);
    console.log(`Campaign wallet USD value: $${walletUsdValue.usdValue} (goal: $${campaign.goal_usd})`);

    if (walletUsdValue.usdValue >= campaign.goal_usd) {
      updateData.status = 'funded';
      updateData.funded_at = Date.now();
      console.log(`Campaign ${campaignId} is now FULLY FUNDED! Reached $${walletUsdValue.usdValue} USD (goal: $${campaign.goal_usd})`);
    }
  }

  await db.collection('campaigns').doc(campaignId).update(updateData);

  console.log(`Contribution: ${amount} SOL to campaign ${campaignId} (tx: ${txSignature})`);

  return {
    contribution,
    txSignature,
    newTotal: actualBalance,
    isFullyFunded: updateData.status === 'funded'
  };
}

/**
 * Find campaign by type and token CA
 */
async function findCampaign(campaignType, tokenCA) {
  const db = getFirestore();

  const snapshot = await db.collection('campaigns')
    .where('type', '==', campaignType)
    .where('token_ca', '==', tokenCA)
    .where('status', '==', 'active')
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data();
}

/**
 * Get campaign by ID
 */
async function getCampaign(campaignId) {
  const db = getFirestore();
  const doc = await db.collection('campaigns').doc(campaignId).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data();
}

/**
 * List all campaigns with optional filters
 */
async function listCampaigns(filters = {}) {
  const db = getFirestore();
  let query = db.collection('campaigns');

  if (filters.type) {
    query = query.where('type', '==', filters.type);
  }

  if (filters.status) {
    query = query.where('status', '==', filters.status);
  }

  query = query.orderBy('created_at', 'desc');

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const snapshot = await query.get();

  return snapshot.docs.map(doc => doc.data());
}

/**
 * Get contributions for a campaign
 */
async function getCampaignContributions(campaignId) {
  const db = getFirestore();

  const snapshot = await db.collection('contributions')
    .where('campaign_id', '==', campaignId)
    .orderBy('timestamp', 'desc')
    .get();

  return snapshot.docs.map(doc => doc.data());
}

/**
 * Update campaign metadata
 * Merges new metadata with existing to preserve token_name and token_symbol
 */
async function updateCampaignMetadata(campaignId, metadata) {
  const db = getFirestore();

  // Get existing campaign to preserve token info
  const campaignDoc = await db.collection('campaigns').doc(campaignId).get();
  if (!campaignDoc.exists) {
    throw new Error('Campaign not found');
  }

  const existingMetadata = campaignDoc.data().metadata || {};

  // Merge: new metadata can override everything EXCEPT we preserve token_name and token_symbol
  const mergedMetadata = {
    ...metadata,
    token_name: existingMetadata.token_name || metadata.token_name,
    token_symbol: existingMetadata.token_symbol || metadata.token_symbol
  };

  await db.collection('campaigns').doc(campaignId).update({
    metadata: mergedMetadata
  });

  console.log(`Updated metadata for campaign ${campaignId}`);
  return true;
}

module.exports = {
  createCampaign,
  contribute,
  findCampaign,
  getCampaign,
  listCampaigns,
  getCampaignContributions,
  updateCampaignMetadata
};
