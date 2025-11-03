#!/usr/bin/env node

/**
 * Simple Campaign Wallet Decryption Script
 * 1. Paste encrypted campaign wallet key and campaign_id below
 * 2. Run: node decrypt.js
 */

require('dotenv').config();
const crypto = require('crypto');
const { Keypair } = require('@solana/web3.js');
const base58 = require('bs58').default;

// ============ PASTE YOUR DATA HERE ============
const ENCRYPTED_DATA = '2DvVX4bs8QEd2azQchrSYen1BSTcugeO5bN/bs/IFaBPVsWfD9mDqyt2WqOtJUsKU7/WSuKOZmE/cChr9D7TQNsyVNzEdk4ye4ZWl9tqF6kRyqC4tPZLepTAKO5TJeNS8W7EA2ElZyklhGq8U/eii1uy+rxqhqwcFB7cRC/cEiHDzNtB1lXhD//7rn1M7Z9Ni9eeHtdm6VifkgvlzfUESRtZwAYkej4GLmU9plJg1F5KQTwF9J+gaDPoC/R2ou0IC4t3mPCmTfBl/eLlNBKeifBi/QYkrnOwCKSM3v6XINvuet1qwUn+/xqAH+lfjAbzGtl7E8yB12/hmcDFr1kRRrbU/bFqNg==';
const CAMPAIGN_ID = 'xukRkQ14TMwnkueOBJps';
// ==============================================

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

function deriveKey(campaignId) {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('ENCRYPTION_SECRET not found in .env file');
  }
  return crypto.createHmac('sha256', secret).update(campaignId).digest();
}

function decrypt(encryptedData, campaignId) {
  const key = deriveKey(campaignId);
  const combined = Buffer.from(encryptedData, 'base64');
  const iv = combined.slice(0, IV_LENGTH);
  const authTag = combined.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = combined.slice(IV_LENGTH + TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString('utf8');
}

try {
  const decryptedJSON = decrypt(ENCRYPTED_DATA, CAMPAIGN_ID);
  const secretKey = JSON.parse(decryptedJSON);
  const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));

  console.log('\n✅ Campaign Wallet Decrypted!\n');
  console.log('Campaign ID:', CAMPAIGN_ID);
  console.log('Public Key:', keypair.publicKey.toString());
  console.log('\nPrivate Key (Base58):', base58.encode(Buffer.from(secretKey)));
  console.log('Private Key (Base64):', Buffer.from(keypair.secretKey).toString('base64'));
  console.log('\n⚠️  Never share this key!\n');

} catch (error) {
  console.error('\n❌ Decryption failed:', error.message);
  console.error('Check ENCRYPTION_SECRET in .env matches the one used to encrypt\n');
}
