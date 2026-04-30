/**
 * Auth / signing tests.
 */
import { describe, it, expect } from 'vitest';
import { createHmac } from 'node:crypto';
import {
  buildCanonicalPath,
  computeSignature,
  buildSignedHeaders,
} from '../../src/auth.js';

describe('buildCanonicalPath', () => {
  it('returns the path unchanged when there are no params', () => {
    expect(buildCanonicalPath('/bcdr/device')).toBe('/bcdr/device');
    expect(buildCanonicalPath('/bcdr/device', {})).toBe('/bcdr/device');
  });

  it('omits undefined params', () => {
    expect(buildCanonicalPath('/bcdr/device', { _page: 1, _perPage: undefined })).toBe(
      '/bcdr/device?_page=1'
    );
  });

  it('sorts query parameters alphabetically by key', () => {
    const out = buildCanonicalPath('/bcdr/device', {
      zeta: 'last',
      alpha: 'first',
      mike: 'middle',
    });
    expect(out).toBe('/bcdr/device?alpha=first&mike=middle&zeta=last');
  });

  it('produces identical output regardless of input key order', () => {
    const a = buildCanonicalPath('/x', { b: 2, a: 1, c: 3 });
    const b = buildCanonicalPath('/x', { c: 3, a: 1, b: 2 });
    expect(a).toBe(b);
  });
});

describe('computeSignature', () => {
  it('produces a deterministic HMAC-SHA256 hex digest', () => {
    const sig = computeSignature('secret', 'GET', '/bcdr/device', '1700000000', '');
    const expected = createHmac('sha256', 'secret')
      .update('GET\n/bcdr/device\n1700000000\n')
      .digest('hex');
    expect(sig).toBe(expected);
    // sanity: 64 hex chars
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
  });

  it('changes when any input changes', () => {
    const base = computeSignature('secret', 'GET', '/x', '100', '');
    expect(computeSignature('secret', 'GET', '/x', '101', '')).not.toBe(base);
    expect(computeSignature('secret', 'POST', '/x', '100', '')).not.toBe(base);
    expect(computeSignature('secret', 'GET', '/y', '100', '')).not.toBe(base);
    expect(computeSignature('secret', 'GET', '/x', '100', 'body')).not.toBe(base);
    expect(computeSignature('other', 'GET', '/x', '100', '')).not.toBe(base);
  });
});

describe('buildSignedHeaders', () => {
  it('includes the three required headers', () => {
    const headers = buildSignedHeaders(
      'pub',
      'priv',
      'GET',
      '/bcdr/device',
      '',
      () => 1700000000_000
    );
    expect(headers['X-Datto-API-Key']).toBe('pub');
    expect(headers['X-Datto-API-Timestamp']).toBe('1700000000');
    expect(headers['X-Datto-API-Signature']).toMatch(/^[0-9a-f]{64}$/);
  });

  it('uses the same canonical path for signing as the caller passes in', () => {
    const path = buildCanonicalPath('/bcdr/device', { _perPage: 250, _page: 1 });
    expect(path).toBe('/bcdr/device?_page=1&_perPage=250');
    const headers = buildSignedHeaders('pub', 'priv', 'GET', path, '', () => 1_700_000_000_000);
    const expected = createHmac('sha256', 'priv')
      .update(`GET\n${path}\n1700000000\n`)
      .digest('hex');
    expect(headers['X-Datto-API-Signature']).toBe(expected);
  });
});
