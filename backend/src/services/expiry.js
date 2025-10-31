const { getFirestore } = require('firebase-admin/firestore');
const { cleanupExpiredExports } = require('../lib/export');

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

    // Mark each as ended
    const batch = db.batch();

    for (const doc of expiredCampaigns.docs) {
      batch.update(doc.ref, {
        status: 'ended',
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
