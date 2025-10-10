/**
 * Hash utilities for Markdown Annotations
 * Provides SHA-256 hashing functionality
 */

const crypto = require('crypto');

/**
 * Calculate SHA-256 hash of text
 * @param {string} text - Text to hash
 * @param {number} truncate - Optional truncation length (32-64 characters, default 64)
 * @returns {string} Hexadecimal hash string
 */
function calculateHash(text, truncate = 64) {
  if (truncate < 32 || truncate > 64) {
    throw new Error('Hash truncation must be between 32 and 64 characters');
  }

  const hash = crypto.createHash('sha256').update(text, 'utf8').digest('hex');
  return hash.substring(0, truncate);
}

/**
 * Verify hash matches text
 * @param {string} text - Text to verify
 * @param {string} expectedHash - Expected hash value
 * @returns {boolean} True if hash matches
 */
function verifyHash(text, expectedHash) {
  const hashLength = expectedHash.length;
  const actualHash = calculateHash(text, hashLength);
  return actualHash === expectedHash;
}

module.exports = {
  calculateHash,
  verifyHash
};
