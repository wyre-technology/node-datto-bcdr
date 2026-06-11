/**
 * @wyre-technology/node-datto-bcdr
 *
 * Comprehensive, fully-typed Node.js/TypeScript library for the Datto BCDR
 * (Backup Portal) API v1.
 */

// Main client
export { DattoBcdrClient } from './client.js';

// Configuration
export type { DattoBcdrConfig, RateLimitConfig, ResolvedConfig } from './config.js';
export { DEFAULT_API_URL, DEFAULT_RATE_LIMIT_CONFIG } from './config.js';

// Errors
export {
  DattoBcdrError,
  DattoBcdrAuthenticationError,
  DattoBcdrSignatureError,
  DattoBcdrForbiddenError,
  DattoBcdrNotFoundError,
  DattoBcdrRateLimitError,
  DattoBcdrServerError,
} from './errors.js';

// Auth helpers (exported for advanced users / testing)
export { buildCanonicalPath, buildSignedHeaders } from './auth.js';
export type { SignedHeaders } from './auth.js';

// Pagination
export { PaginatedIterable, buildPaginationParams } from './pagination.js';
export type { PaginationParams, PaginationInfo, PaginatedResponse } from './pagination.js';

// Resource classes (for typing)
export { DevicesResource } from './resources/devices.js';
export { AssetsResource } from './resources/assets.js';
export { BackupsResource } from './resources/backups.js';
export { ScreenshotsResource } from './resources/screenshots.js';
export { OffsiteResource } from './resources/offsite.js';
export { AlertsResource } from './resources/alerts.js';
export { ActivityResource } from './resources/activity.js';

// Domain types
export * from './types/index.js';
