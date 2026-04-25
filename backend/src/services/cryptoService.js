import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const SECRET_KEY = process.env.ENCRYPTION_SECRET; // Must be 32 bytes

if (!SECRET_KEY || Buffer.from(SECRET_KEY, 'base64').length !== 32) {
  throw new Error('ENCRYPTION_SECRET must be a 32-byte base64 encoded string');
}

const key = Buffer.from(SECRET_KEY, 'base64');

/**
 * Encrypts a string using AES-256-GCM
 * @param {string} text 
 * @returns {string} iv:authTag:encryptedText (base64 encoded)
 */
export function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const tag = cipher.getAuthTag();
  
  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypts a string using AES-256-GCM
 * @param {string} encryptedData iv:authTag:encryptedText
 * @returns {string} decryptedText
 */
export function decrypt(encryptedData) {
  if (!encryptedData) return null;
  const [ivBase64, tagBase64, encryptedBase64] = encryptedData.split(':');
  
  const iv = Buffer.from(ivBase64, 'base64');
  const tag = Buffer.from(tagBase64, 'base64');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encryptedBase64, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
