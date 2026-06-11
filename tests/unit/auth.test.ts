/**
 * Auth / signing tests.
 */
import { describe, it, expect } from 'vitest';
import {
  buildCanonicalPath,
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

describe('buildSignedHeaders', () => {
  it('returns HTTP Basic auth header', () => {
    const headers = buildSignedHeaders('pub', 'priv');
    expect(headers.Authorization).toBeDefined();
    expect(headers.Authorization).toMatch(/^Basic /);
  });

  it('correctly encodes credentials in base64', () => {
    const headers = buildSignedHeaders('testpub', 'testpriv');
    const expected = Buffer.from('testpub:testpriv').toString('base64');
    expect(headers.Authorization).toBe(`Basic ${expected}`);
  });

  it('handles special characters in credentials', () => {
    const headers = buildSignedHeaders('user@example.com', 'p@ssw0rd!');
    const expected = Buffer.from('user@example.com:p@ssw0rd!').toString('base64');
    expect(headers.Authorization).toBe(`Basic ${expected}`);
  });

  it('produces different auth headers for different credentials', () => {
    const headers1 = buildSignedHeaders('pub1', 'priv1');
    const headers2 = buildSignedHeaders('pub2', 'priv2');
    expect(headers1.Authorization).not.toBe(headers2.Authorization);
  });
});
