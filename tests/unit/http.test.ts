/**
 * HTTP layer integration tests — verifies that HTTP Basic auth headers reach
 * the server and the query string is properly sorted.
 */

import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server.js';
import { DattoBcdrClient } from '../../src/client.js';

describe('HTTP Basic auth on the wire', () => {
  it('sends correct Authorization header and sorts query string', async () => {
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

    // Basic auth header present and correctly formatted
    expect(c.headers.authorization).toBeDefined();
    expect(c.headers.authorization).toMatch(/^Basic /);

    // Verify base64 encoding of credentials
    const expectedAuth = Buffer.from('pub-key:priv-key').toString('base64');
    expect(c.headers.authorization).toBe(`Basic ${expectedAuth}`);

    // Query string is sorted alphabetically; path includes the /v1 base prefix
    expect(c.pathAndQuery).toBe('/v1/bcdr/device?_page=1&_perPage=50');
  });
});
