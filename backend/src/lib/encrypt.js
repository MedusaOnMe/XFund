const crypto = require('crypto');

/**
 * AES-256-GCM Encryption for private keys
 * Key derivation: HMAC(SERVER_SECRET + userId)
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * Derive encryption key from server secret + userId
 */
function deriveKey(userId) {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('ENCRYPTION_SECRET must be at least 32 characters');
  }

  return crypto
    .createHmac('sha256', secret)
    .update(userId)
    .digest();
}

/**
 * Encrypt data (private key)
 * Returns base64 string: salt + iv + authTag + encrypted
 */
function encrypt(data, userId) {
  const key = deriveKey(userId);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(data, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const authTag = cipher.getAuthTag();

  // Combine: iv + authTag + encrypted
  const combined = Buffer.concat([iv, authTag, encrypted]);

  return combined.toString('base64');
}

/**
 * Decrypt data (private key)
 * Input: base64 string from encrypt()
 * Returns: decrypted string
 */
function decrypt(encryptedData, userId) {
  const key = deriveKey(userId);
  const combined = Buffer.from(encryptedData, 'base64');

  // Extract components
  const iv = combined.slice(0, IV_LENGTH);
  const authTag = combined.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = combined.slice(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}

module.exports = {
  encrypt,
  decrypt
};
