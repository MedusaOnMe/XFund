const { getFirestore } = require('firebase-admin/firestore');
const { cleanupExpiredExports } = require('../lib/export');
const { cleanupExpiredWithdrawals } = require('../lib/withdraw');

/**
 * Expiry service
 * Handles DEX campaign expiration and cleanup
 * Runs every 5 minutes
 */

/**
 * Expire DEX campaigns that are > 24h old
 */
async function expireDEXCampaigns() {
  const db = getFirestore();
  const now = Date.now();

  try {
    // Find active DEX campaigns that have expired
    const expiredCampaigns = await db.collection('campaigns')
      .where('type', '==', 'dex')
      .where('status', '==', 'active')
      .where('end_ts', '<', now)
      .get();

    if (expiredCampaigns.empty) {
      return;
    }

    console.log(`Expiring ${expiredCampaigns.size} DEX campaigns`);

    // Mark each as failed (expired without reaching goal)
    const batch = db.batch();

    for (const doc of expiredCampaigns.docs) {
      const campaign = doc.data();

      // Check if it reached its goal (should have been marked 'funded' already)
      // If still 'active' and expired, it failed to reach goal
      batch.update(doc.ref, {
        status: 'failed',
        ended_at: now
      });
    }

    await batch.commit();

    console.log(`Expired ${expiredCampaigns.size} DEX campaigns`);

  } catch (error) {
    console.error('Error expiring campaigns:', error);
  }
}

/**
 * Run cleanup tasks
 */
async function runCleanup() {
  console.log('Running cleanup tasks...');

  try {
    // Expire DEX campaigns
    await expireDEXCampaigns();

    // Cleanup expired export requests and keys
    await cleanupExpiredExports();

    // Cleanup expired withdrawal requests
    await cleanupExpiredWithdrawals();

    console.log('Cleanup completed');

  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

/**
 * Start expiry service
 */
function startExpiryService() {
  console.log('Starting expiry service (every 5 minutes)');

  // Initial run
  runCleanup();

  // Set interval
  setInterval(runCleanup, 5 * 60 * 1000); // 5 minutes
}

module.exports = {
  startExpiryService
};
