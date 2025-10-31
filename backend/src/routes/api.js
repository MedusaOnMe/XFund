const express = require('express');
const router = express.Router();
const { getFirestore } = require('firebase-admin/firestore');
const { createWallet, getBalance, sendSOL, isValidAddress } = require('../lib/solana');
const { encrypt } = require('../lib/encrypt');
const { createExportRequest } = require('../lib/export');
const { getCampaign, listCampaigns, getCampaignContributions } = require('../lib/campaign');

/**
 * API Routes
 */

/**
 * POST /api/login
 * Login or register user with X handle
 * Body: { x_handle: string }
 * Returns: { user_id, wallet_pub, is_new: boolean }
 */
router.post('/login', async (req, res) => {
  try {
    const { x_handle } = req.body;

    if (!x_handle) {
      return res.status(400).json({ error: 'x_handle is required' });
    }

    // Normalize handle
    const normalizedHandle = x_handle.startsWith('@') ? x_handle : `@${x_handle}`;

    const db = getFirestore();

    // Check if user exists
    const usersSnapshot = await db.collection('users')
      .where('x_handle', '==', normalizedHandle)
      .limit(1)
      .get();

    if (!usersSnapshot.empty) {
      // User exists
      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();

      return res.json({
        user_id: userDoc.id,
        wallet_pub: userData.user_wallet_pub,
        is_new: false
      });
    }

    // New user - create wallet
    const wallet = createWallet();
    const userId = db.collection('users').doc().id;

    // Encrypt private key
    const encryptedPrivKey = encrypt(JSON.stringify(wallet.secretKey), userId);

    // Save user
    const newUser = {
      x_handle: normalizedHandle,
      user_wallet_pub: wallet.publicKey,
      user_wallet_priv_enc: encryptedPrivKey,
      created_at: Date.now()
    };

    await db.collection('users').doc(userId).set(newUser);

    console.log(`New user registered: ${normalizedHandle} (${userId})`);

    return res.json({
      user_id: userId,
      wallet_pub: wallet.publicKey,
      is_new: true
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/wallet/:userId
 * Get wallet info for user
 * Returns: { wallet_pub, balance }
 */
router.get('/wallet/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getFirestore();

    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userDoc.data();

    // Get balance
    const balance = await getBalance(user.user_wallet_pub);

    return res.json({
      wallet_pub: user.user_wallet_pub,
      balance
    });

  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/export-request
 * Request private key export
 * Body: { user_id, x_handle }
 * Returns: { verification_code, secret_path }
 */
router.post('/export-request', async (req, res) => {
  try {
    const { user_id, x_handle } = req.body;

    if (!user_id || !x_handle) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getFirestore();

    // Verify user exists
    const userDoc = await db.collection('users').doc(user_id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create export request
    const { verificationCode, secretPath } = await createExportRequest(user_id, x_handle);

    return res.json({
      verification_code: verificationCode,
      secret_path: secretPath
    });

  } catch (error) {
    console.error('Export request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/export-status/:secretPath
 * Check if private key is ready (frontend polls this every 2s)
 * Returns: { ready: boolean, privkey?: string }
 */
router.get('/export-status/:secretPath', async (req, res) => {
  try {
    const { secretPath } = req.params;
    const db = getFirestore();

    // Check if key exists in Firestore
    const keyDoc = await db.collection('key_exports').doc(secretPath).get();

    if (!keyDoc.exists) {
      return res.json({ ready: false });
    }

    const keyData = keyDoc.data();

    // Check if expired
    if (Date.now() > keyData.expires_at) {
      // Delete expired key
      await db.collection('key_exports').doc(secretPath).delete();
      return res.json({ ready: false });
    }

    // Return key and delete immediately (one-time read)
    const privkey = keyData.privkey;
    await db.collection('key_exports').doc(secretPath).delete();

    return res.json({
      ready: true,
      privkey
    });

  } catch (error) {
    console.error('Export status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/campaigns
 * List campaigns with optional filters
 * Query params: type, status, limit
 */
router.get('/campaigns', async (req, res) => {
  try {
    const { type, status, limit } = req.query;

    const filters = {};
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (limit) filters.limit = parseInt(limit);

    const campaigns = await listCampaigns(filters);

    return res.json({
      campaigns
    });

  } catch (error) {
    console.error('List campaigns error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/campaign/:id
 * Get campaign details with contributions
 */
router.get('/campaign/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await getCampaign(id);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get contributions
    const contributions = await getCampaignContributions(id);

    // Get campaign wallet balance
    const balance = await getBalance(campaign.campaign_wallet_pub);

    return res.json({
      campaign,
      contributions,
      balance
    });

  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
