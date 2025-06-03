// This file now uses the unified storage solution from sessionUtils.ts
// All offline authentication functionality has been moved to sessionUtils.ts
// for better consistency and maintainability.

import {
  saveOfflineCredentials,
  verifyOfflineCredentials,
  clearOfflineCredentials,
  hasOfflineCredentials
} from './sessionUtils';

// Re-export functions for backward compatibility
export { saveOfflineCredentials, verifyOfflineCredentials };

// Legacy function names for backward compatibility
export const saveOfflineCredentials_legacy = saveOfflineCredentials;
export const verifyOfflineCredentials_legacy = verifyOfflineCredentials;

// Additional utility functions
export const clearOfflineCredentials_forEmail = clearOfflineCredentials;
export const hasOfflineCredentials_forEmail = hasOfflineCredentials;

// Note: This file is now a thin wrapper around sessionUtils.ts
// Consider updating imports in other files to use sessionUtils.ts directly
// for better consistency across the application.
