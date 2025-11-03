#!/usr/bin/env node

/**
 * Migrate campaigns with "ended" status to "failed"
 */

require('dotenv').config();
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

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

async function migrateEndedToFailed() {
  try {
    console.log('🔍 Looking for campaigns with "ended" status...\n');

    const endedCampaigns = await db.collection('campaigns')
      .where('status', '==', 'ended')
      .get();

    if (endedCampaigns.empty) {
      console.log('✅ No campaigns with "ended" status found. All good!\n');
      process.exit(0);
    }

    console.log(`Found ${endedCampaigns.size} campaign(s) with "ended" status\n`);

    const batch = db.batch();

    for (const doc of endedCampaigns.docs) {
      const campaign = doc.data();
      console.log(`  - ${campaign.metadata?.token_name || campaign.token_ca.slice(0, 8)} (${doc.id})`);
      
      batch.update(doc.ref, {
        status: 'failed'
      });
    }

    console.log('\n📝 Updating campaigns to "failed" status...\n');
    await batch.commit();

    console.log(`✅ Successfully migrated ${endedCampaigns.size} campaign(s) from "ended" to "failed"\n`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

migrateEndedToFailed();
