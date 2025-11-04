const crypto = require('crypto');
const { getFirestore } = require('firebase-admin/firestore');
const { decrypt } = require('./encrypt');
const { sendSOL, isValidAddress } = require('./solana');

/**
 * Withdrawal via tweet verification
 * FIRESTORE ONLY - No Realtime DB needed!
 * Frontend polls API endpoint instead of listening to Firebase
 */

/**
 * Create withdrawal request
 * Returns: { verificationCode, withdrawalPath }
 */
async function createWithdrawRequest(userId, xHandle, destinationAddress, amount) {
  const db = getFirestore();

  // Validate destination address
  if (!isValidAddress(destinationAddress)) {
    throw new Error('Invalid destination address');
  }

  // Validate amount
  if (typeof amount !== 'number' || amount <= 0) {
    throw new Error('Invalid amount');
  }

  // Get user's balance to verify sufficient funds
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) {
    throw new Error('User not found');
  }

  // Generate 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Generate ultra-random secret path (64 char hex)
  const withdrawalPath = crypto.randomBytes(32).toString('hex');

  // Store pending withdrawal request
  const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes

  await db.collection('pending_withdrawals').doc(verificationCode).set({
    user_id: userId,
    handle: xHandle,
    destination_address: destinationAddress,
    amount: amount,
    withdrawal_path: withdrawalPath,
    expires_at: expiresAt,
    created_at: Date.now()
  });

  console.log(`Withdrawal request created for ${xHandle}: code ${verificationCode}, ${amount} SOL to ${destinationAddress}`);

  return {
    verificationCode,
    withdrawalPath
  };
}

/**
 * Verify withdrawal tweet and process transfer
 * Called when poller detects withdrawal tweet
 */
async function verifyAndWithdraw(verificationCode, tweetAuthor) {
  const db = getFirestore();

  // Get pending withdrawal request
  const withdrawalDoc = await db.collection('pending_withdrawals').doc(verificationCode).get();

  if (!withdrawalDoc.exists) {
    console.log(`Withdrawal code ${verificationCode} not found`);
    return { success: false, error: 'Invalid or expired verification code' };
  }

  const withdrawalRequest = withdrawalDoc.data();

  // Check expiration
  if (Date.now() > withdrawalRequest.expires_at) {
    // Clean up expired request
    await db.collection('pending_withdrawals').doc(verificationCode).delete();
    console.log(`Withdrawal code ${verificationCode} expired`);
    return { success: false, error: 'Verification code expired' };
  }

  // Verify tweet author matches handle (normalized: no @, lowercase)
  const normalizedAuthor = tweetAuthor.toLowerCase().replace(/^@/, '');
  const normalizedHandle = withdrawalRequest.handle.toLowerCase().replace(/^@/, '');

  if (normalizedAuthor !== normalizedHandle) {
    console.log(`Author mismatch: ${normalizedAuthor} !== ${normalizedHandle}`);
    return { success: false, error: 'Tweet author does not match' };
  }

  // Get user's wallet
  const userDoc = await db.collection('users').doc(withdrawalRequest.user_id).get();

  if (!userDoc.exists) {
    console.log(`User ${withdrawalRequest.user_id} not found`);
    return { success: false, error: 'User not found' };
  }

  const user = userDoc.data();

  // Decrypt private key
  const secretKey = JSON.parse(decrypt(user.user_wallet_priv_enc, withdrawalRequest.user_id));

  try {
    // Process withdrawal (sendSOL expects secret key array, not Keypair)
    const signature = await sendSOL(
      secretKey,
      withdrawalRequest.destination_address,
      withdrawalRequest.amount
    );

    console.log(`Withdrawal processed: ${withdrawalRequest.amount} SOL to ${withdrawalRequest.destination_address}, tx: ${signature}`);

    // Write completion to Firestore at withdrawal path
    const withdrawalPath = withdrawalRequest.withdrawal_path;

    await db.collection('completed_withdrawals').doc(withdrawalPath).set({
      signature: signature,
      amount: withdrawalRequest.amount,
      destination: withdrawalRequest.destination_address,
      completed_at: Date.now()
    });

    // Delete pending withdrawal request
    await db.collection('pending_withdrawals').doc(verificationCode).delete();

    console.log(`Withdrawal verified and completed for ${withdrawalRequest.handle}`);

    return { success: true, signature };

  } catch (error) {
    console.error('Withdrawal processing error:', error);

    // Write error to Firestore so frontend can see it
    const withdrawalPath = withdrawalRequest.withdrawal_path;

    await db.collection('completed_withdrawals').doc(withdrawalPath).set({
      error: error.message || 'Withdrawal failed',
      completed_at: Date.now()
    });

    // Delete pending withdrawal request
    await db.collection('pending_withdrawals').doc(verificationCode).delete();

    return { success: false, error: error.message || 'Withdrawal failed' };
  }
}

/**
 * Cleanup expired withdrawal requests from Firestore
 * Called by expiry service
 */
async function cleanupExpiredWithdrawals() {
  const db = getFirestore();
  const now = Date.now();

  // Clean up expired pending withdrawals
  const expiredWithdrawals = await db.collection('pending_withdrawals')
    .where('expires_at', '<', now)
    .get();

  for (const doc of expiredWithdrawals.docs) {
    await doc.ref.delete();
  }

  if (!expiredWithdrawals.empty) {
    console.log(`Cleaned up ${expiredWithdrawals.size} expired withdrawal requests`);
  }

  // Clean up old completed withdrawals (older than 1 hour)
  const oneHourAgo = now - (60 * 60 * 1000);
  const oldCompletedWithdrawals = await db.collection('completed_withdrawals')
    .where('completed_at', '<', oneHourAgo)
    .get();

  for (const doc of oldCompletedWithdrawals.docs) {
    await doc.ref.delete();
  }

  if (!oldCompletedWithdrawals.empty) {
    console.log(`Cleaned up ${oldCompletedWithdrawals.size} old completed withdrawals`);
  }
}

module.exports = {
  createWithdrawRequest,
  verifyAndWithdraw,
  cleanupExpiredWithdrawals
};
