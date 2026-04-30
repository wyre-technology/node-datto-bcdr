import { describe, it, expect } from 'vitest';
import {
  DattoBcdrError,
  DattoBcdrAuthenticationError,
  DattoBcdrSignatureError,
  DattoBcdrForbiddenError,
  DattoBcdrNotFoundError,
  DattoBcdrRateLimitError,
  DattoBcdrServerError,
} from '../../src/errors.js';

describe('errors', () => {
  it('all errors extend DattoBcdrError and Error', () => {
    const cases = [
      new DattoBcdrError('a'),
      new DattoBcdrAuthenticationError('a'),
      new DattoBcdrSignatureError('a'),
      new DattoBcdrForbiddenError('a'),
      new DattoBcdrNotFoundError('a'),
      new DattoBcdrRateLimitError('a'),
      new DattoBcdrServerError('a'),
    ];
    for (const e of cases) {
      expect(e).toBeInstanceOf(Error);
      expect(e).toBeInstanceOf(DattoBcdrError);
    }
  });

  it('signature error is also an authentication error', () => {
    const e = new DattoBcdrSignatureError('clock skew');
    expect(e).toBeInstanceOf(DattoBcdrAuthenticationError);
    expect(e.statusCode).toBe(401);
  });

  it('rate limit error preserves retryAfter', () => {
    const e = new DattoBcdrRateLimitError('slow down', 7000);
    expect(e.retryAfter).toBe(7000);
    expect(e.statusCode).toBe(429);
  });
});
