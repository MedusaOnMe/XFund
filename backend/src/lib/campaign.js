const { createWallet, sendSOL, getBalance } = require('./solana');
const { encrypt, decrypt } = require('./encrypt');
const { getFirestore } = require('firebase-admin/firestore');

/**
 * Campaign operations
 * Handles campaign creation and contributions
 */

/**
 * Create a new campaign
 * Returns: campaign object
 */
async function createCampaign(campaignType, tokenCA, creatorUserId) {
  const db = getFirestore();

  // Generate wallet for campaign
  const wallet = createWallet();

  // Encrypt campaign wallet private key
  const campaignId = db.collection('campaigns').doc().id;
  const encryptedPrivKey = encrypt(JSON.stringify(wallet.secretKey), campaignId);

  // Calculate end time (24h for DEX, null for BOOSTS)
  const now = Date.now();
  const endTs = campaignType === 'dex' ? now + (24 * 60 * 60 * 1000) : null;

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
    total_raised: 0,
    created_at: now
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

  // Update campaign total
  await db.collection('campaigns').doc(campaignId).update({
    total_raised: campaign.total_raised + amount
  });

  console.log(`Contribution: ${amount} SOL to campaign ${campaignId} (tx: ${txSignature})`);

  return {
    contribution,
    txSignature
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

module.exports = {
  createCampaign,
  contribute,
  findCampaign,
  getCampaign,
  listCampaigns,
  getCampaignContributions
};
