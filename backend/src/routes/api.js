const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getFirestore } = require('firebase-admin/firestore');
const { createWallet, getBalance, sendSOL, isValidAddress } = require('../lib/solana');
const { encrypt } = require('../lib/encrypt');
const { createExportRequest } = require('../lib/export');
const { createWithdrawRequest } = require('../lib/withdraw');
const { createUpdateRequest } = require('../lib/update');
const { getCampaign, listCampaigns, getCampaignContributions, updateCampaignMetadata } = require('../lib/campaign');
const { uploadImage, isValidImageType, isValidFileSize } = require('../lib/storage');

// Configure multer for memory storage (we'll upload to Firebase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

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

    if (!x_handle || typeof x_handle !== 'string') {
      return res.status(400).json({ error: 'x_handle is required and must be a string' });
    }

    // Normalize handle: ALWAYS strip @ and lowercase to prevent duplicate accounts
    const normalizedHandle = x_handle.toLowerCase().replace(/^@/, '').trim();

    // Validate format and length
    if (normalizedHandle.length < 1 || normalizedHandle.length > 15) {
      return res.status(400).json({ error: 'X handle must be between 1 and 15 characters' });
    }

    if (!/^[a-z0-9_]+$/.test(normalizedHandle)) {
      return res.status(400).json({ error: 'X handle can only contain letters, numbers, and underscores' });
    }

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

    // Save user (without @ prefix)
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
 * POST /api/withdraw-request
 * Request withdrawal
 * Body: { user_id, x_handle, destination_address, amount }
 * Returns: { verification_code, withdrawal_path }
 */
router.post('/withdraw-request', async (req, res) => {
  try {
    const { user_id, x_handle, destination_address, amount } = req.body;

    if (!user_id || !x_handle || !destination_address || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create withdrawal request
    const { verificationCode, withdrawalPath } = await createWithdrawRequest(
      user_id,
      x_handle,
      destination_address,
      amount
    );

    return res.json({
      verification_code: verificationCode,
      withdrawal_path: withdrawalPath
    });

  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(400).json({ error: error.message || 'Failed to create withdrawal request' });
  }
});

/**
 * GET /api/withdraw-status/:withdrawalPath
 * Check if withdrawal is completed (frontend polls this every 2s)
 * Returns: { completed: boolean, signature?: string, error?: string }
 */
router.get('/withdraw-status/:withdrawalPath', async (req, res) => {
  try {
    const { withdrawalPath } = req.params;
    const db = getFirestore();

    // Check if withdrawal is completed
    const withdrawalDoc = await db.collection('completed_withdrawals').doc(withdrawalPath).get();

    if (!withdrawalDoc.exists) {
      return res.json({ completed: false });
    }

    const withdrawalData = withdrawalDoc.data();

    // Delete the document after reading (one-time read)
    await db.collection('completed_withdrawals').doc(withdrawalPath).delete();

    if (withdrawalData.error) {
      return res.json({
        completed: true,
        error: withdrawalData.error
      });
    }

    return res.json({
      completed: true,
      signature: withdrawalData.signature,
      amount: withdrawalData.amount,
      destination: withdrawalData.destination
    });

  } catch (error) {
    console.error('Withdrawal status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/update-request
 * Request campaign metadata update
 * Body: { campaign_id, x_handle }
 * Returns: { verification_code, secret_path }
 */
router.post('/update-request', async (req, res) => {
  try {
    const { campaign_id, x_handle } = req.body;

    if (!campaign_id || !x_handle) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getFirestore();

    // Verify campaign exists
    const campaignDoc = await db.collection('campaigns').doc(campaign_id).get();
    if (!campaignDoc.exists) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Create update request
    const { verificationCode, secretPath } = await createUpdateRequest(campaign_id, x_handle);

    return res.json({
      verification_code: verificationCode,
      secret_path: secretPath
    });

  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/update-status/:secretPath
 * Check if update request is verified (frontend polls this every 2s)
 * Returns: { verified: boolean, campaign_id?: string }
 */
router.get('/update-status/:secretPath', async (req, res) => {
  try {
    const { secretPath } = req.params;
    const db = getFirestore();

    // Check if update request exists
    const updateDoc = await db.collection('update_requests').doc(secretPath).get();

    if (!updateDoc.exists) {
      return res.json({ verified: false });
    }

    const updateData = updateDoc.data();

    // Check if expired
    if (Date.now() > updateData.expires_at) {
      await db.collection('update_requests').doc(secretPath).delete();
      return res.json({ verified: false });
    }

    // Return verification status
    return res.json({
      verified: updateData.verified,
      campaign_id: updateData.verified ? updateData.campaign_id : undefined
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/update-metadata
 * Update campaign metadata after verification
 * Body: { secret_path, metadata: { main_image_url, header_image_url, description, twitter_url, telegram_url, website_url } }
 * Returns: { success: boolean }
 */
router.post('/update-metadata', async (req, res) => {
  try {
    const { secret_path, metadata } = req.body;

    if (!secret_path || !metadata) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getFirestore();

    // Get update request
    const updateDoc = await db.collection('update_requests').doc(secret_path).get();

    if (!updateDoc.exists) {
      return res.status(404).json({ error: 'Update request not found' });
    }

    const updateData = updateDoc.data();

    // Check if verified
    if (!updateData.verified) {
      return res.status(403).json({ error: 'Update request not verified' });
    }

    // Check if expired
    if (Date.now() > updateData.expires_at) {
      await db.collection('update_requests').doc(secret_path).delete();
      return res.status(403).json({ error: 'Update request expired' });
    }

    // Update campaign metadata
    await updateCampaignMetadata(updateData.campaign_id, metadata);

    // Delete update request (one-time use)
    await db.collection('update_requests').doc(secret_path).delete();

    return res.json({
      success: true
    });

  } catch (error) {
    console.error('Update metadata error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/upload-image
 * Upload campaign image (main or header)
 * Body: multipart/form-data with 'image' file and 'type' field ('main' or 'header')
 * Returns: { image_url: string }
 */
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageType = req.body.type; // 'main' or 'header'

    if (!imageType || !['main', 'header'].includes(imageType)) {
      return res.status(400).json({ error: 'Invalid image type. Must be "main" or "header"' });
    }

    // Validate content type
    if (!isValidImageType(req.file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Must be JPEG, PNG, GIF, or WebP' });
    }

    // Validate file size
    if (!isValidFileSize(req.file.buffer)) {
      return res.status(400).json({ error: 'File too large. Max size is 5MB' });
    }

    // Upload to Firebase Storage
    const imageUrl = await uploadImage(
      req.file.buffer,
      req.file.mimetype,
      `campaigns/${imageType}`
    );

    return res.json({
      image_url: imageUrl
    });

  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
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

    // Add pagination with default limit of 20, max 100
    if (limit) {
      const parsedLimit = parseInt(limit);
      filters.limit = Math.min(Math.max(parsedLimit, 1), 100); // Between 1 and 100
    } else {
      filters.limit = 20; // Default 20 campaigns per request
    }

    const campaigns = await listCampaigns(filters);

    return res.json({
      campaigns,
      count: campaigns.length,
      limit: filters.limit
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
