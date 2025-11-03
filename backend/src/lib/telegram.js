const axios = require('axios');
const { solToUsd } = require('./jupiter');

/**
 * Telegram Bot Integration
 * Sends notifications for campaign events
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Send message to Telegram
 */
async function sendTelegramMessage(message, options = {}) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram not configured, skipping notification');
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const payload = {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: options.disablePreview !== false,
      ...options
    };

    await axios.post(url, payload);
    console.log('Telegram notification sent');
  } catch (error) {
    console.error('Failed to send Telegram notification:', error.message);
  }
}

/**
 * Notify when a new campaign is created
 */
async function notifyCampaignCreated(campaign) {
  // Clean up X handle (remove @ if present)
  const cleanHandle = campaign.creator_x_handle.replace('@', '');

  // Get token metadata
  const tokenName = campaign.metadata?.token_name || 'Unknown';
  const tokenSymbol = campaign.metadata?.token_symbol || 'N/A';

  // Format goal
  const goalText = campaign.goal_usd
    ? `$${campaign.goal_usd} USD (~${campaign.goal_amount} SOL at $${campaign.sol_price_at_creation.toFixed(2)})`
    : `${campaign.goal_amount} SOL`;

  const message = `
🆕 <b>New Campaign Created!</b>

<b>Token:</b> ${tokenName} (${tokenSymbol})
<b>Type:</b> ${campaign.type.toUpperCase()}
<b>Goal:</b> ${goalText}
<b>Creator:</b> <a href="https://x.com/${cleanHandle}">@${cleanHandle}</a>

<b>Token CA:</b>
<code>${campaign.token_ca}</code>

<b>Campaign:</b> ${process.env.FRONTEND_URL || 'https://xfunder.app'}/campaign/${campaign.id}
  `.trim();

  await sendTelegramMessage(message);
}

/**
 * Notify when a campaign receives funding
 */
async function notifyDonation(campaign, donation) {
  // Clean up handles
  const cleanDonorHandle = donation.donor_x_handle.replace('@', '');

  // Get token metadata - use token CA if name not available
  const tokenName = campaign.metadata?.token_name || campaign.token_ca.slice(0, 8) + '...';
  const tokenSymbol = campaign.metadata?.token_symbol || '';

  // Calculate progress
  const progress = ((campaign.total_raised / campaign.goal_amount) * 100).toFixed(1);
  const isFullyFunded = campaign.total_raised >= campaign.goal_amount;

  // Get current USD values
  const donationUsd = await solToUsd(donation.amount);
  const totalRaisedUsd = await solToUsd(campaign.total_raised);

  let message = `
💰 <b>${isFullyFunded ? 'Campaign Fully Funded! 🎉' : 'New Donation'}</b>

<b>Token:</b> ${tokenName}${tokenSymbol ? ` (${tokenSymbol})` : ''}
<b>Amount:</b> ${donation.amount} SOL (~$${donationUsd.usdValue} USD)
<b>From:</b> <a href="https://x.com/${cleanDonorHandle}">@${cleanDonorHandle}</a>

<b>Progress:</b> ${campaign.total_raised.toFixed(4)} SOL (~$${totalRaisedUsd.usdValue} USD) / $${campaign.goal_usd} USD (${progress}%)
  `.trim();

  if (isFullyFunded) {
    message += `\n\n✅ Goal reached! Campaign will be processed.`;
  }

  message += `\n\n<b>Campaign:</b> ${process.env.FRONTEND_URL || 'https://xfunder.app'}/campaign/${campaign.id}`;

  await sendTelegramMessage(message);
}

/**
 * Notify when a campaign is completed/paid
 */
async function notifyCampaignCompleted(campaign, txHash) {
  const tokenName = campaign.metadata?.token_name || 'Unknown';
  const tokenSymbol = campaign.metadata?.token_symbol || 'N/A';
  const totalUsd = await solToUsd(campaign.total_raised);

  const message = `
✅ <b>Campaign Completed!</b>

<b>Token:</b> ${tokenName} (${tokenSymbol})
<b>Total Raised:</b> ${campaign.total_raised.toFixed(4)} SOL (~$${totalUsd.usdValue} USD)
<b>Status:</b> Paid to DEXScreener

<b>Transaction:</b>
<code>${txHash}</code>

<b>Campaign:</b> ${process.env.FRONTEND_URL || 'https://xfunder.app'}/campaign/${campaign.id}
  `.trim();

  await sendTelegramMessage(message);
}

/**
 * Notify when a campaign ends (time expired)
 */
async function notifyCampaignEnded(campaign) {
  const tokenName = campaign.metadata?.token_name || 'Unknown';
  const tokenSymbol = campaign.metadata?.token_symbol || 'N/A';
  const wasSuccessful = campaign.total_raised >= campaign.goal_amount;
  const totalUsd = await solToUsd(campaign.total_raised);

  const message = `
⏰ <b>Campaign Ended</b>

<b>Token:</b> ${tokenName} (${tokenSymbol})
<b>Result:</b> ${wasSuccessful ? '✅ Funded' : '❌ Not Funded'}
<b>Raised:</b> ${campaign.total_raised.toFixed(4)} SOL (~$${totalUsd.usdValue} USD) / $${campaign.goal_usd} USD

<b>Campaign:</b> ${process.env.FRONTEND_URL || 'https://xfunder.app'}/campaign/${campaign.id}
  `.trim();

  await sendTelegramMessage(message);
}

module.exports = {
  sendTelegramMessage,
  notifyCampaignCreated,
  notifyDonation,
  notifyCampaignCompleted,
  notifyCampaignEnded
};
