/**
 * HMAC-SHA256 request signing for the Datto BCDR API.
 *
 * Every request must include three headers:
 *   - X-Datto-API-Key:       the public key
 *   - X-Datto-API-Timestamp: Unix epoch seconds (UTC)
 *   - X-Datto-API-Signature: hex-encoded HMAC-SHA256
 *
 * The signature input string is:
 *   <METHOD> + "\n" + <URL_PATH_INCLUDING_QUERY> + "\n" + <TIMESTAMP> + "\n" + <BODY>
 *
 * For GET requests the body is the empty string.
 *
 * Query string parameters MUST be sorted alphabetically before signing, and
 * the SAME canonical URL string must be used for both the fetch and the
 * signature input.
 *
 * The host clock must be within ~5 minutes of UTC; otherwise requests will
 * fail with a signature error.
 */

import { createHmac } from 'node:crypto';

/**
 * Headers required for an authenticated Datto BCDR request.
 */
export interface SignedHeaders {
  'X-Datto-API-Key': string;
  'X-Datto-API-Timestamp': string;
  'X-Datto-API-Signature': string;
}

/**
 * Build a canonical path-and-query string from a path and a params object.
 * Query parameters are sorted alphabetically by key.
 *
 * @param path - URL path beginning with "/", e.g. "/bcdr/device".
 * @param params - Optional key/value pairs to include as the query string.
 *                 Keys with `undefined` values are omitted.
 */
export function buildCanonicalPath(
  path: string,
  params?: Record<string, string | number | boolean | undefined> | undefined
): string {
  if (!params) return path;

  const entries: Array<[string, string]> = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    entries.push([key, String(value)]);
  }
  if (entries.length === 0) return path;

  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

  const search = new URLSearchParams();
  for (const [key, value] of entries) {
    search.append(key, value);
  }
  return `${path}?${search.toString()}`;
}

/**
 * Compute the HMAC-SHA256 signature for a request.
 */
export function computeSignature(
  privateKey: string,
  method: string,
  canonicalPath: string,
  timestamp: number | string,
  body: string
): string {
  const stringToSign = `${method.toUpperCase()}\n${canonicalPath}\n${timestamp}\n${body}`;
  return createHmac('sha256', privateKey).update(stringToSign).digest('hex');
}

/**
 * Build the full set of signed headers for a request.
 *
 * @param now - Override clock for deterministic testing. Defaults to {@link Date.now}.
 */
export function buildSignedHeaders(
  publicKey: string,
  privateKey: string,
  method: string,
  canonicalPath: string,
  body: string,
  now: () => number = Date.now
): SignedHeaders {
  const timestamp = Math.floor(now() / 1000).toString();
  const signature = computeSignature(privateKey, method, canonicalPath, timestamp, body);
  return {
    'X-Datto-API-Key': publicKey,
    'X-Datto-API-Timestamp': timestamp,
    'X-Datto-API-Signature': signature,
  };
}
