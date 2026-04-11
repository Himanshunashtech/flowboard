import { generateKeyBetween } from 'fractional-indexing';

/**
 * Generates a position string between two existing positions.
 * @param {string|null} prevPos - The position string of the item before.
 * @param {string|null} nextPos - The position string of the item after.
 * @returns {string} - The new midpoint position string.
 */
export const getNewPosition = (prevPos, nextPos) => {
  // fractional-indexing handles null as boundaries for start/end
  return generateKeyBetween(prevPos || null, nextPos || null);
};

/**
 * Sanitizes an order key to ensure it's valid for fractional-indexing.
 * Corrupted or legacy data starting with '0' will be treated as null.
 */
const sanitize = (key) => {
  if (!key) return null;
  const s = String(key);
  // Basic check: if it starts with '0', it's likely a legacy numeric string or invalid.
  if (s.startsWith('0')) return null;
  return s;
};

/**
 * Helper to get positions for common scenarios
 */
export const Ordering = {
  // Get position for the very first item in a list
  first: (nextPos) => generateKeyBetween(null, sanitize(nextPos)),
  
  // Get position for the very last item in a list
  last: (prevPos) => generateKeyBetween(sanitize(prevPos), null),
  
  // Get position between two items
  between: (prevPos, nextPos) => generateKeyBetween(sanitize(prevPos), sanitize(nextPos)),
};
