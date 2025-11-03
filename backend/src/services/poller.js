const { fetchMentions } = require('../lib/twitter');
const { parseTweet } = require('../lib/parser');
const { createCampaign, findCampaign, contribute } = require('../lib/campaign');
const { verifyAndExport } = require('../lib/export');
const { verifyUpdateRequest } = require('../lib/update');
const { notifyCampaignCreated, notifyDonation } = require('../lib/telegram');
const { getFirestore } = require('firebase-admin/firestore');

/**
 * Twitter mention poller
 * Runs every 15 seconds to check for new mentions
 */

let lastProcessedId = null;
let isPolling = false;

/**
 * Process a single tweet
 */
async function processTweet(tweet) {
  const db = getFirestore();

  // Check if already processed
  const processedDoc = await db.collection('processed_tweets').doc(tweet.id).get();
  if (processedDoc.exists) {
    return; // Skip already processed tweet
  }

  console.log(`Processing tweet ${tweet.id} from @${tweet.author.username}: ${tweet.text}`);

  // Parse tweet
  const command = parseTweet(tweet.text);

  if (!command) {
    console.log('No valid command found in tweet');
    return;
  }

  // CRITICAL: Mark as processed IMMEDIATELY to prevent duplicate processing
  // This must happen BEFORE any processing to prevent race conditions
  try {
    await db.collection('processed_tweets').doc(tweet.id).set({
      tweet_id: tweet.id,
      command_type: command.type,
      processed_at: Date.now(),
      status: 'processing'
    });
  } catch (error) {
    console.error(`Failed to mark tweet ${tweet.id} as processed:`, error.message);
    return; // Don't process if we can't mark it
  }

  // Now process the command
  try {
    switch (command.type) {
      case 'CREATE':
        await handleCreateCommand(tweet, command.data);
        break;

      case 'CONTRIBUTE':
        await handleContributeCommand(tweet, command.data);
        break;

      case 'EXPORT':
        await handleExportCommand(tweet, command.data);
        break;

      case 'UPDATE':
        await handleUpdateCommand(tweet, command.data);
        break;

      default:
        console.log(`Unknown command type: ${command.type}`);
    }

    // Update status to completed
    await db.collection('processed_tweets').doc(tweet.id).update({
      status: 'completed',
      completed_at: Date.now()
    });

  } catch (error) {
    console.error(`Error processing tweet ${tweet.id}:`, error.message);
    // Update status to failed but DON'T remove the processed marker
    await db.collection('processed_tweets').doc(tweet.id).update({
      status: 'failed',
      error: error.message,
      failed_at: Date.now()
    });
  }
}

/**
 * Handle CREATE command
 */
async function handleCreateCommand(tweet, data) {
  const { campaignType, tokenCA } = data;
  const db = getFirestore();

  // Find user by Twitter handle (normalized: no @, lowercase)
  const username = tweet.author.username.toLowerCase();
  const usersSnapshot = await db.collection('users')
    .where('x_handle', '==', username)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.log(`User ${username} not found. They need to register first.`);
    return;
  }

  const userId = usersSnapshot.docs[0].id;

  // Check if campaign already exists
  const existingCampaign = await findCampaign(campaignType, tokenCA);
  if (existingCampaign) {
    console.log(`Campaign already exists for ${campaignType} ${tokenCA}`);
    return;
  }

  // Create campaign with tweet (to extract images)
  const campaign = await createCampaign(campaignType, tokenCA, userId, tweet);
  console.log(`Created ${campaignType} campaign for ${tokenCA} by ${username}`);

  // Get user data for notification
  const userDoc = usersSnapshot.docs[0].data();

  // Send Telegram notification
  await notifyCampaignCreated({
    ...campaign,
    creator_x_handle: userDoc.x_handle
  });
}

/**
 * Handle CONTRIBUTE command
 */
async function handleContributeCommand(tweet, data) {
  const { campaignType, tokenCA, amount } = data;
  const db = getFirestore();

  // Find user by Twitter handle (normalized: no @, lowercase)
  const username = tweet.author.username.toLowerCase();
  const usersSnapshot = await db.collection('users')
    .where('x_handle', '==', username)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.log(`User ${username} not found. They need to register first.`);
    return;
  }

  const userId = usersSnapshot.docs[0].id;
  const userDoc = usersSnapshot.docs[0].data();

  // Find campaign
  const campaign = await findCampaign(campaignType, tokenCA);
  if (!campaign) {
    console.log(`Campaign not found for ${campaignType} ${tokenCA}`);
    return;
  }

  // Contribute
  const result = await contribute(campaign.id, userId, amount);
  console.log(`${username} contributed ${amount} SOL to campaign ${campaign.id}`);

  // Debug: Log campaign metadata
  console.log('Campaign metadata for donation notification:', {
    has_metadata: !!campaign.metadata,
    token_name: campaign.metadata?.token_name,
    token_symbol: campaign.metadata?.token_symbol
  });

  // Send Telegram notification
  await notifyDonation(
    {
      ...campaign,
      total_raised: result.newTotal,
      goal_amount: campaign.goal_amount
    },
    {
      amount,
      donor_x_handle: userDoc.x_handle
    }
  );
}

/**
 * Handle EXPORT command
 */
async function handleExportCommand(tweet, data) {
  const { verificationCode } = data;

  // Verify and export
  const result = await verifyAndExport(verificationCode, tweet.author.username);

  if (result.success) {
    console.log(`Export verified for @${tweet.author.username}`);
  } else {
    console.log(`Export verification failed: ${result.error}`);
  }
}

/**
 * Handle UPDATE command
 */
async function handleUpdateCommand(tweet, data) {
  const { verificationCode } = data;

  // Verify update request
  const result = await verifyUpdateRequest(verificationCode, tweet.author.username);

  if (result.success) {
    console.log(`Update request verified for campaign ${result.campaignId} by @${tweet.author.username}`);
  } else {
    console.log(`Update verification failed: ${result.error}`);
  }
}

/**
 * Poll for new mentions
 */
async function poll() {
  if (isPolling) {
    return; // Prevent concurrent polls
  }

  isPolling = true;

  try {
    console.log(`[Poller] Checking for mentions... (last ID: ${lastProcessedId || 'none'})`);

    // Fetch mentions
    const mentions = await fetchMentions(lastProcessedId);

    if (mentions.length === 0) {
      console.log('[Poller] No new mentions found');
      isPolling = false;
      return;
    }

    console.log(`[Poller] Found ${mentions.length} new mentions`);

    // Process each mention
    for (const tweet of mentions) {
      await processTweet(tweet);

      // Update last processed ID
      if (!lastProcessedId || BigInt(tweet.id) > BigInt(lastProcessedId)) {
        lastProcessedId = tweet.id;
      }
    }

  } catch (error) {
    console.error('[Poller] ERROR:', error.message);
    if (error.response) {
      console.error('[Poller] API Response:', JSON.stringify(error.response.data, null, 2));
      console.error('[Poller] Status:', error.response.status);
    }
    if (error.stack) {
      console.error('[Poller] Stack:', error.stack);
    }
  } finally {
    isPolling = false;
  }
}

/**
 * Start polling loop
 */
function startPoller() {
  console.log('Starting Twitter mention poller (every 15 seconds)');

  // Initial poll
  poll();

  // Set interval
  setInterval(poll, 15000); // 15 seconds
}

module.exports = {
  startPoller
};
