const { getFirestore } = require('firebase-admin/firestore');
const crypto = require('crypto');

/**
 * Campaign update verification system
 * Similar to export, but for updating campaign metadata
 */

/**
 * Create an update request
 * Returns verification code and secret path
 */
async function createUpdateRequest(campaignId, xHandle) {
  const db = getFirestore();

  // Generate 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Generate secret path (random string)
  const secretPath = crypto.randomBytes(16).toString('hex');

  // Store update request
  const updateRequest = {
    campaign_id: campaignId,
    x_handle: xHandle,
    verification_code: verificationCode,
    secret_path: secretPath,
    created_at: Date.now(),
    expires_at: Date.now() + (10 * 60 * 1000), // 10 minutes
    verified: false
  };

  await db.collection('update_requests').doc(secretPath).set(updateRequest);

  console.log(`Update request created for campaign ${campaignId} by ${xHandle}`);

  return {
    verificationCode,
    secretPath
  };
}

/**
 * Verify update request via tweet
 * Called when tweet with verification code is detected
 */
async function verifyUpdateRequest(verificationCode, twitterUsername) {
  const db = getFirestore();

  // Find update request with this code
  const snapshot = await db.collection('update_requests')
    .where('verification_code', '==', verificationCode)
    .where('verified', '==', false)
    .limit(1)
    .get();

  if (snapshot.empty) {
    console.log(`No pending update request found for code ${verificationCode}`);
    return { success: false, error: 'Invalid or expired verification code' };
  }

  const requestDoc = snapshot.docs[0];
  const request = requestDoc.data();

  // Check if expired
  if (Date.now() > request.expires_at) {
    await db.collection('update_requests').doc(requestDoc.id).delete();
    return { success: false, error: 'Verification code expired' };
  }

  // Check if username matches (case insensitive, with or without @)
  const normalizedRequestHandle = request.x_handle.toLowerCase().replace('@', '');
  const normalizedTweetHandle = twitterUsername.toLowerCase().replace('@', '');

  if (normalizedRequestHandle !== normalizedTweetHandle) {
    return { success: false, error: 'Twitter username mismatch' };
  }

  // Get campaign to verify user is creator
  const campaignDoc = await db.collection('campaigns').doc(request.campaign_id).get();
  if (!campaignDoc.exists) {
    return { success: false, error: 'Campaign not found' };
  }

  const campaign = campaignDoc.data();

  // Get user by X handle (normalize for case-insensitive comparison)
  const normalizedHandle = request.x_handle.toLowerCase().replace('@', '');

  // Get all users and filter (Firestore doesn't support case-insensitive queries)
  const allUsersSnapshot = await db.collection('users').get();
  const userDoc = allUsersSnapshot.docs.find(doc => {
    const userHandle = doc.data().x_handle.toLowerCase().replace('@', '');
    return userHandle === normalizedHandle;
  });

  if (!userDoc) {
    console.log(`User not found for handle: ${request.x_handle}`);
    return { success: false, error: 'User not found' };
  }

  const userId = userDoc.id;

  // Verify user is campaign creator
  if (campaign.creator_user_id !== userId) {
    return { success: false, error: 'Only campaign creator can update metadata' };
  }

  // Mark as verified
  await db.collection('update_requests').doc(requestDoc.id).update({
    verified: true,
    verified_at: Date.now()
  });

  console.log(`Update request verified for campaign ${request.campaign_id}`);

  return {
    success: true,
    campaignId: request.campaign_id,
    secretPath: request.secret_path
  };
}

module.exports = {
  createUpdateRequest,
  verifyUpdateRequest
};
