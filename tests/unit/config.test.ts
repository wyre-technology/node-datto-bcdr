import { describe, it, expect } from 'vitest';
import { resolveConfig, DEFAULT_API_URL, DEFAULT_RATE_LIMIT_CONFIG } from '../../src/config.js';

describe('resolveConfig', () => {
  it('applies the default API URL', () => {
    const c = resolveConfig({ apiKey: 'a', apiSecretKey: 'b' });
    expect(c.apiUrl).toBe(DEFAULT_API_URL);
  });

  it('strips trailing slashes from a custom apiUrl', () => {
    const c = resolveConfig({ apiKey: 'a', apiSecretKey: 'b', apiUrl: 'https://example.com/v1/' });
    expect(c.apiUrl).toBe('https://example.com/v1');
  });

  it('throws if keys are missing', () => {
    expect(() => resolveConfig({ apiKey: '', apiSecretKey: 'b' })).toThrow();
    expect(() => resolveConfig({ apiKey: 'a', apiSecretKey: '' })).toThrow();
  });

  it('merges rate limit overrides with defaults', () => {
    const c = resolveConfig({ apiKey: 'a', apiSecretKey: 'b', rateLimit: { maxRequests: 50 } });
    expect(c.rateLimit.maxRequests).toBe(50);
    expect(c.rateLimit.windowMs).toBe(DEFAULT_RATE_LIMIT_CONFIG.windowMs);
  });
});
