const { fetchMentions } = require('../lib/twitter');
const { parseTweet } = require('../lib/parser');
const { createCampaign, findCampaign, contribute } = require('../lib/campaign');
const { verifyAndExport } = require('../lib/export');
const { getFirestore } = require('firebase-admin/firestore');

/**
 * Twitter mention poller
 * Runs every 10 seconds to check for new mentions
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

      default:
        console.log(`Unknown command type: ${command.type}`);
    }

    // Mark as processed
    await db.collection('processed_tweets').doc(tweet.id).set({
      tweet_id: tweet.id,
      command_type: command.type,
      processed_at: Date.now()
    });

  } catch (error) {
    console.error(`Error processing tweet ${tweet.id}:`, error.message);
  }
}

/**
 * Handle CREATE command
 */
async function handleCreateCommand(tweet, data) {
  const { campaignType, tokenCA } = data;
  const db = getFirestore();

  // Find user by Twitter handle
  const username = `@${tweet.author.username}`;
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

  // Create campaign
  await createCampaign(campaignType, tokenCA, userId);
  console.log(`Created ${campaignType} campaign for ${tokenCA} by ${username}`);
}

/**
 * Handle CONTRIBUTE command
 */
async function handleContributeCommand(tweet, data) {
  const { campaignType, tokenCA, amount } = data;
  const db = getFirestore();

  // Find user by Twitter handle
  const username = `@${tweet.author.username}`;
  const usersSnapshot = await db.collection('users')
    .where('x_handle', '==', username)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.log(`User ${username} not found. They need to register first.`);
    return;
  }

  const userId = usersSnapshot.docs[0].id;

  // Find campaign
  const campaign = await findCampaign(campaignType, tokenCA);
  if (!campaign) {
    console.log(`Campaign not found for ${campaignType} ${tokenCA}`);
    return;
  }

  // Contribute
  await contribute(campaign.id, userId, amount);
  console.log(`${username} contributed ${amount} SOL to campaign ${campaign.id}`);
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
 * Poll for new mentions
 */
async function poll() {
  if (isPolling) {
    return; // Prevent concurrent polls
  }

  isPolling = true;

  try {
    // Fetch mentions
    const mentions = await fetchMentions(lastProcessedId);

    if (mentions.length === 0) {
      // No new mentions
      isPolling = false;
      return;
    }

    console.log(`Found ${mentions.length} new mentions`);

    // Process each mention
    for (const tweet of mentions) {
      await processTweet(tweet);

      // Update last processed ID
      if (!lastProcessedId || BigInt(tweet.id) > BigInt(lastProcessedId)) {
        lastProcessedId = tweet.id;
      }
    }

  } catch (error) {
    console.error('Polling error:', error.message);
  } finally {
    isPolling = false;
  }
}

/**
 * Start polling loop
 */
function startPoller() {
  console.log('Starting Twitter mention poller (every 10 seconds)');

  // Initial poll
  poll();

  // Set interval
  setInterval(poll, 10000); // 10 seconds
}

module.exports = {
  startPoller
};
