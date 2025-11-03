#!/usr/bin/env node

/**
 * Simple Campaign Wallet Decryption Script
 * 1. Paste encrypted campaign wallet key and campaign_id below
 * 2. Run: node decrypt.js
 */

require('dotenv').config();
const crypto = require('crypto');
const { Keypair } = require('@solana/web3.js');

// ============ PASTE YOUR DATA HERE ============
const ENCRYPTED_DATA = 'I7FontSeUdzHUq4iQdYdSQrd1ia+UDBBc8YSqxo5njj45+Fz21oIg58pq4fFD4LnJ7WkFiE0580ZKOg45gHKtR4lzI2bBM+l8OoZa7NPsVaom4ioLlqox31ayYvFTSd9ZQxHg1HVAlMpUtOfN/8/fq8F60XKLWD/uHE9rL3h3CN36FmSjmHS+3fWWbjvyPc3PbZC4HQuAe/dGW24/5aZFgJh6OIx9xrH4p2sA4qFpy0yRoeRR0oj+AjXWRlLi4DMf2107uUO2TxO/ZP0aZXEQSoUwc2reQjMt9imzCPJ5KJAwqz01VgaA5hEgJTA/hyd8SuiogocMm00SN8fgCOZOnhQ0aKEiT75';
const CAMPAIGN_ID = 'gDS4lqEAbpZhDbMmPLhk';
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
  console.log('\nPrivate Key (Base64):', Buffer.from(keypair.secretKey).toString('base64'));
  console.log('\n⚠️  Never share this key!\n');

} catch (error) {
  console.error('\n❌ Decryption failed:', error.message);
  console.error('Check ENCRYPTION_SECRET in .env matches the one used to encrypt\n');
}
