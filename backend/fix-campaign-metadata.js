#!/usr/bin/env node

/**
 * Fix Campaign Metadata Script
 * Updates campaign metadata with correct token name/symbol from pump.fun or DEXScreener
 */

require('dotenv').config();
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { fetchTokenMetadata, enrichMetadata } = require('./src/lib/dexscreener');

// Initialize Firebase
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = getFirestore();

const args = process.argv.slice(2);

if (args.length < 1) {
  console.error('Usage: node fix-campaign-metadata.js <campaign_id>');
  console.error('\nExample:');
  console.error('  node fix-campaign-metadata.js c0nkKx6HpeBcsOICXTFX');
  process.exit(1);
}

const campaignId = args[0];

async function fixCampaignMetadata() {
  try {
    console.log(`🔍 Fetching campaign ${campaignId}...\n`);

    const campaignDoc = await db.collection('campaigns').doc(campaignId).get();

    if (!campaignDoc.exists) {
      console.error('❌ Campaign not found');
      process.exit(1);
    }

    const campaign = campaignDoc.data();

    console.log('Current metadata:', {
      token_name: campaign.metadata?.token_name,
      token_symbol: campaign.metadata?.token_symbol,
      has_description: !!campaign.metadata?.description
    });

    console.log(`\n🌐 Fetching fresh metadata for token ${campaign.token_ca}...\n`);

    // Fetch fresh metadata
    const tokenData = await fetchTokenMetadata(campaign.token_ca);

    if (!tokenData || (!tokenData.token_name && !tokenData.token_symbol)) {
      console.error('❌ Could not fetch token metadata from any source');
      process.exit(1);
    }

    console.log('Fetched metadata:', {
      token_name: tokenData.token_name,
      token_symbol: tokenData.token_symbol
    });

    // Enrich existing metadata (preserve images and other data)
    const updatedMetadata = enrichMetadata(campaign.metadata || {}, tokenData);

    console.log('\n📝 Updating campaign in Firestore...\n');

    // Update campaign
    await db.collection('campaigns').doc(campaignId).update({
      metadata: updatedMetadata
    });

    console.log('✅ Campaign metadata updated successfully!\n');
    console.log('New metadata:', {
      token_name: updatedMetadata.token_name,
      token_symbol: updatedMetadata.token_symbol,
      description: updatedMetadata.description ? 'present' : 'missing',
      twitter: updatedMetadata.twitter_url ? 'present' : 'missing',
      main_image: updatedMetadata.main_image_url ? 'present' : 'missing'
    });

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixCampaignMetadata();
