/**
 * HTTP layer integration tests — verifies that the HMAC headers reach the
 * server and match the canonical (sorted) query string.
 */

import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { createHmac } from 'node:crypto';
import { server } from '../mocks/server.js';
import { DattoBcdrClient } from '../../src/client.js';

describe('HMAC signing on the wire', () => {
  it('sends the three Datto headers and signs the sorted query string', async () => {
    let captured:
      | { method: string; pathAndQuery: string; headers: Record<string, string> }
      | null = null;

    server.use(
      http.get('https://api.datto.com/v1/bcdr/device', ({ request }) => {
        const url = new URL(request.url);
        captured = {
          method: request.method,
          pathAndQuery: `${url.pathname}${url.search}`,
          headers: Object.fromEntries(request.headers),
        };
        return HttpResponse.json({
          items: [],
          pagination: { page: 1, perPage: 50, totalPages: 1, totalItems: 0 },
        });
      })
    );

    const client = new DattoBcdrClient({
      apiKey: 'pub-key',
      apiSecretKey: 'priv-key',
      rateLimit: { maxRetries: 0 },
    });

    await client.devices.list({ page: 1, perPage: 50 });

    expect(captured).not.toBeNull();
    const c = captured as unknown as {
      method: string;
      pathAndQuery: string;
      headers: Record<string, string>;
    };

    // Headers present
    expect(c.headers['x-datto-api-key']).toBe('pub-key');
    expect(c.headers['x-datto-api-timestamp']).toMatch(/^\d+$/);
    expect(c.headers['x-datto-api-signature']).toMatch(/^[0-9a-f]{64}$/);

    // Query string is sorted alphabetically; path includes the /v1 base prefix
    expect(c.pathAndQuery).toBe('/v1/bcdr/device?_page=1&_perPage=50');

    // Signature matches the canonical input string (server-visible path + sorted query)
    const ts = c.headers['x-datto-api-timestamp'];
    const expected = createHmac('sha256', 'priv-key')
      .update(`GET\n/v1/bcdr/device?_page=1&_perPage=50\n${ts}\n`)
      .digest('hex');
    expect(c.headers['x-datto-api-signature']).toBe(expected);
  });
});
