/**
 * Configuration types and defaults for the Datto BCDR client
 */

/**
 * Default Datto BCDR API base URL.
 * BCDR uses a single global endpoint (no regional split).
 */
export const DEFAULT_API_URL = 'https://api.datto.com/v1';

/**
 * Rate limiting configuration.
 *
 * Datto BCDR enforces approximately 120 requests/minute per partner key.
 */
export interface RateLimitConfig {
  /** Whether rate limiting is enabled (default: true) */
  enabled: boolean;
  /** Maximum requests per window (default: 120) */
  maxRequests: number;
  /** Window duration in milliseconds (default: 60000) */
  windowMs: number;
  /** Threshold percentage to start throttling (default: 0.8 = 80%) */
  throttleThreshold: number;
  /** Default delay between retries on 429 (default: 5000ms) */
  retryAfterMs: number;
  /** Maximum retry attempts on rate limit errors (default: 3) */
  maxRetries: number;
}

/**
 * Default rate limit configuration tuned for Datto BCDR (120/min).
 */
export const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  enabled: true,
  maxRequests: 120,
  windowMs: 60_000,
  throttleThreshold: 0.8,
  retryAfterMs: 5_000,
  maxRetries: 3,
};

/**
 * Configuration for the Datto BCDR client.
 */
export interface DattoBcdrConfig {
  /** Public API key (sent as the X-Datto-API-Key header). */
  apiKey: string;
  /** Private API key, used to compute the HMAC-SHA256 request signature. */
  apiSecretKey: string;
  /** Override the API base URL. Defaults to {@link DEFAULT_API_URL}. */
  apiUrl?: string;
  /** Rate limiting configuration overrides. */
  rateLimit?: Partial<RateLimitConfig>;
}

/**
 * Resolved configuration with defaults applied.
 */
export interface ResolvedConfig {
  apiKey: string;
  apiSecretKey: string;
  apiUrl: string;
  rateLimit: RateLimitConfig;
}

/**
 * Resolve a {@link DattoBcdrConfig} by applying defaults.
 */
export function resolveConfig(config: DattoBcdrConfig): ResolvedConfig {
  if (!config.apiKey || !config.apiSecretKey) {
    throw new Error('Both apiKey and apiSecretKey must be provided');
  }
  const apiUrl = (config.apiUrl ?? DEFAULT_API_URL).replace(/\/+$/, '');
  return {
    apiKey: config.apiKey,
    apiSecretKey: config.apiSecretKey,
    apiUrl,
    rateLimit: {
      ...DEFAULT_RATE_LIMIT_CONFIG,
      ...config.rateLimit,
    },
  };
}
