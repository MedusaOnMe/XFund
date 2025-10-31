/**
 * Firebase NO LONGER NEEDED!
 * We're using simple API polling instead of Realtime DB listeners
 * This file is kept for backwards compatibility but does nothing
 */

// No Firebase client needed - we're using API polling!
// See lib/api.js for checkExportStatus() function

export function listenForKey() {
  console.warn('listenForKey() is deprecated. Use API polling instead');
  return null;
}

export function stopListeningForKey() {
  // No-op
}
