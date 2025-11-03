const crypto = require('crypto');
const { getFirestore } = require('firebase-admin/firestore');
const { decrypt } = require('./encrypt');

/**
 * Private key export via tweet verification
 * FIRESTORE ONLY - No Realtime DB needed!
 * Frontend polls API endpoint instead of listening to Firebase
 */

/**
 * Create export request
 * Returns: { verificationCode, secretPath }
 */
async function createExportRequest(userId, xHandle) {
  const db = getFirestore();

  // Generate 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Generate ultra-random secret path (64 char hex)
  const secretPath = crypto.randomBytes(32).toString('hex');

  // Store pending export request
  const expiresAt = Date.now() + (2 * 60 * 1000); // 2 minutes

  await db.collection('pending_exports').doc(verificationCode).set({
    user_id: userId,
    handle: xHandle,
    secret_path: secretPath,
    expires_at: expiresAt,
    created_at: Date.now()
  });

  console.log(`Export request created for ${xHandle}: code ${verificationCode}`);

  return {
    verificationCode,
    secretPath
  };
}

/**
 * Verify export tweet and write private key to Firestore
 * Called when poller detects export tweet
 */
async function verifyAndExport(verificationCode, tweetAuthor) {
  const db = getFirestore();

  // Get pending export request
  const exportDoc = await db.collection('pending_exports').doc(verificationCode).get();

  if (!exportDoc.exists) {
    console.log(`Export code ${verificationCode} not found`);
    return { success: false, error: 'Invalid or expired verification code' };
  }

  const exportRequest = exportDoc.data();

  // Check expiration
  if (Date.now() > exportRequest.expires_at) {
    // Clean up expired request
    await db.collection('pending_exports').doc(verificationCode).delete();
    console.log(`Export code ${verificationCode} expired`);
    return { success: false, error: 'Verification code expired' };
  }

  // Verify tweet author matches handle (normalized: no @, lowercase)
  const normalizedAuthor = tweetAuthor.toLowerCase().replace(/^@/, '');
  const normalizedHandle = exportRequest.handle.toLowerCase().replace(/^@/, '');

  if (normalizedAuthor !== normalizedHandle) {
    console.log(`Author mismatch: ${normalizedAuthor} !== ${normalizedHandle}`);
    return { success: false, error: 'Tweet author does not match' };
  }

  // Get user's private key
  const userDoc = await db.collection('users').doc(exportRequest.user_id).get();

  if (!userDoc.exists) {
    console.log(`User ${exportRequest.user_id} not found`);
    return { success: false, error: 'User not found' };
  }

  const user = userDoc.data();

  // Decrypt private key
  const secretKey = JSON.parse(decrypt(user.user_wallet_priv_enc, exportRequest.user_id));

  // Convert secret key array to base58 (standard Solana format)
  const bs58 = require('bs58').default;
  const privateKeyBase58 = bs58.encode(Buffer.from(secretKey));

  // Write to Firestore at secret path (30 second expiry)
  const secretPath = exportRequest.secret_path;
  const expiresAt = Date.now() + (30 * 1000); // 30 seconds

  await db.collection('key_exports').doc(secretPath).set({
    privkey: privateKeyBase58,
    expires_at: expiresAt,
    created_at: Date.now()
  });

  // Delete pending export request
  await db.collection('pending_exports').doc(verificationCode).delete();

  console.log(`Export verified for ${exportRequest.handle}, key written to Firestore`);

  return { success: true };
}

/**
 * Cleanup expired export requests and keys from Firestore
 * Called by expiry service
 */
async function cleanupExpiredExports() {
  const db = getFirestore();
  const now = Date.now();

  // Clean up expired pending exports
  const expiredExports = await db.collection('pending_exports')
    .where('expires_at', '<', now)
    .get();

  for (const doc of expiredExports.docs) {
    await doc.ref.delete();
  }

  if (!expiredExports.empty) {
    console.log(`Cleaned up ${expiredExports.size} expired export requests`);
  }

  // Clean up expired keys from Firestore
  const expiredKeys = await db.collection('key_exports')
    .where('expires_at', '<', now)
    .get();

  for (const doc of expiredKeys.docs) {
    await doc.ref.delete();
  }

  if (!expiredKeys.empty) {
    console.log(`Cleaned up ${expiredKeys.size} expired keys from Firestore`);
  }
}

module.exports = {
  createExportRequest,
  verifyAndExport,
  cleanupExpiredExports
};
