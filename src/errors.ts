/**
 * Custom error classes for the Datto BCDR client
 */

/**
 * Base error class for all Datto BCDR errors.
 */
export class DattoBcdrError extends Error {
  /** HTTP status code (0 for non-HTTP failures). */
  readonly statusCode: number;
  /** Raw response body, if available. */
  readonly response: unknown;

  constructor(message: string, statusCode: number = 0, response?: unknown) {
    super(message);
    this.name = 'DattoBcdrError';
    this.statusCode = statusCode;
    this.response = response;
    Object.setPrototypeOf(this, DattoBcdrError.prototype);
  }
}

/**
 * Authentication error (401 unauthorized).
 */
export class DattoBcdrAuthenticationError extends DattoBcdrError {
  constructor(message: string, statusCode: number = 401, response?: unknown) {
    super(message, statusCode, response);
    this.name = 'DattoBcdrAuthenticationError';
    Object.setPrototypeOf(this, DattoBcdrAuthenticationError.prototype);
  }
}

/**
 * HMAC signature / clock-skew error.
 *
 * Returned by the API as 401 with a body indicating signature failure. Most
 * commonly caused by host clock drift exceeding the 5-minute tolerance.
 */
export class DattoBcdrSignatureError extends DattoBcdrAuthenticationError {
  constructor(message: string, response?: unknown) {
    super(message, 401, response);
    this.name = 'DattoBcdrSignatureError';
    Object.setPrototypeOf(this, DattoBcdrSignatureError.prototype);
  }
}

/**
 * Forbidden (403) — credentials valid but lack permission.
 */
export class DattoBcdrForbiddenError extends DattoBcdrError {
  constructor(message: string, response?: unknown) {
    super(message, 403, response);
    this.name = 'DattoBcdrForbiddenError';
    Object.setPrototypeOf(this, DattoBcdrForbiddenError.prototype);
  }
}

/**
 * Resource not found (404).
 */
export class DattoBcdrNotFoundError extends DattoBcdrError {
  constructor(message: string, response?: unknown) {
    super(message, 404, response);
    this.name = 'DattoBcdrNotFoundError';
    Object.setPrototypeOf(this, DattoBcdrNotFoundError.prototype);
  }
}

/**
 * Rate limit exceeded (429).
 */
export class DattoBcdrRateLimitError extends DattoBcdrError {
  /** Suggested retry delay in milliseconds (parsed from Retry-After). */
  readonly retryAfter: number;

  constructor(message: string, retryAfter: number = 5000, response?: unknown) {
    super(message, 429, response);
    this.name = 'DattoBcdrRateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, DattoBcdrRateLimitError.prototype);
  }
}

/**
 * Server error (500+).
 */
export class DattoBcdrServerError extends DattoBcdrError {
  constructor(message: string, statusCode: number = 500, response?: unknown) {
    super(message, statusCode, response);
    this.name = 'DattoBcdrServerError';
    Object.setPrototypeOf(this, DattoBcdrServerError.prototype);
  }
}
