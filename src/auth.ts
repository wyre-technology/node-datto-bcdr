/**
 * HTTP Basic authentication for the Datto BCDR API.
 *
 * The Datto BCDR API uses HTTP Basic authentication where:
 *   - username = public API key
 *   - password = private/secret API key
 *
 * This is included as an Authorization header:
 *   Authorization: Basic base64(publicKey + ":" + privateKey)
 */

/**
 * Headers required for an authenticated Datto BCDR request.
 */
export interface SignedHeaders {
  Authorization: string;
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
 * Build the Authorization header for HTTP Basic authentication.
 */
export function buildSignedHeaders(publicKey: string, privateKey: string): SignedHeaders {
  const credentials = Buffer.from(`${publicKey}:${privateKey}`).toString('base64');
  return {
    Authorization: `Basic ${credentials}`,
  };
}
