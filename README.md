# @wyre-technology/node-datto-bcdr

Comprehensive, fully-typed Node.js / TypeScript client library for the
[Datto BCDR (Backup Portal) API v1](https://api.datto.com/v1).

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

## Features

- Full coverage of BCDR endpoints: devices, assets, backups, screenshots, offsite, alerts, activity log
- HMAC-SHA256 request signing built in (no manual header construction)
- Automatic page-based pagination via async iterators
- Token-bucket rate limiting tuned for the 120 req/min Datto BCDR limit
- Typed error hierarchy with a dedicated `DattoBcdrSignatureError` for clock-skew failures
- ESM and CommonJS dual exports, full `.d.ts` types
- Zero `any` in the public API

## Install

```bash
npm install @wyre-technology/node-datto-bcdr
```

The package is published to GitHub Packages under the `@wyre-technology` scope.
Add this to a project-local `.npmrc`:

```
@wyre-technology:registry=https://npm.pkg.github.com
```

## Quick start

```typescript
import { DattoBcdrClient } from '@wyre-technology/node-datto-bcdr';

const client = new DattoBcdrClient({
  apiKey:       process.env.DATTO_BCDR_PUBLIC_KEY!,   // public key
  apiSecretKey: process.env.DATTO_BCDR_PRIVATE_KEY!,  // private key (HMAC secret)
});

// List one page of devices
const page = await client.devices.list({ page: 1, perPage: 100 });
console.log(page.pagination.totalItems);

// Iterate every device, fetching pages on demand
for await (const device of client.devices.listAll({ perPage: 250 })) {
  console.log(device.serialNumber, device.hostname);
}
```

## Configuration

```typescript
new DattoBcdrClient({
  apiKey: 'public-key',
  apiSecretKey: 'private-key',

  // Optional — override base URL (defaults to https://api.datto.com/v1)
  apiUrl: 'https://api.datto.com/v1',

  // Optional — tune client-side rate limiting
  rateLimit: {
    enabled: true,
    maxRequests: 120,
    windowMs: 60_000,
    throttleThreshold: 0.8,
    retryAfterMs: 5_000,
    maxRetries: 3,
  },
});
```

## Authentication: HMAC-SHA256 signing

Every request is signed with three headers:

| Header                    | Value                                          |
| ------------------------- | ---------------------------------------------- |
| `X-Datto-API-Key`         | The public key                                 |
| `X-Datto-API-Timestamp`   | Unix epoch seconds (UTC)                       |
| `X-Datto-API-Signature`   | Hex-encoded HMAC-SHA256 of the canonical input |

The string-to-sign is:

```
<METHOD> + "\n" + <URL_PATH_INCLUDING_QUERY> + "\n" + <TIMESTAMP> + "\n" + <BODY>
```

For GET requests the body is the empty string. **Query parameters are sorted
alphabetically by key** before signing, and the same canonical URL is used
for both the fetch and the signature.

> **Clock skew matters.** Datto rejects requests whose timestamp is more than
> roughly 5 minutes off UTC. If your host clock drifts you will see
> `DattoBcdrSignatureError`s.

## API surface

```typescript
client.devices.list(params)                      // page of devices
client.devices.listAll(params)                   // async iterable
client.devices.get(serialNumber)

client.assets.list(serialNumber, params)
client.assets.listAll(serialNumber, params)
client.assets.get(serialNumber, agentId)

client.backups.list(serialNumber, agentId, params)
client.backups.listAll(serialNumber, agentId, params)

client.screenshots.list(serialNumber, agentId, params)
client.screenshots.listAll(serialNumber, agentId, params)
client.screenshots.getImage(serialNumber, agentId, epoch) // → Buffer (PNG)

client.offsite.get(serialNumber)

client.alerts.listByDevice(serialNumber, params)    // page of one device's alerts
client.alerts.listAllByDevice(serialNumber, params) // async iterable (one device)
client.alerts.listAll(params)                        // async iterable, fanned out over every device

client.activity.list(params)
client.activity.listAll(params)
```

## Error handling

```typescript
import {
  DattoBcdrError,
  DattoBcdrAuthenticationError,
  DattoBcdrSignatureError,
  DattoBcdrForbiddenError,
  DattoBcdrNotFoundError,
  DattoBcdrRateLimitError,
  DattoBcdrServerError,
} from '@wyre-technology/node-datto-bcdr';

try {
  await client.devices.get('SN-1');
} catch (err) {
  if (err instanceof DattoBcdrSignatureError) {
    // Likely clock skew — sync NTP
  } else if (err instanceof DattoBcdrRateLimitError) {
    await new Promise((r) => setTimeout(r, err.retryAfter));
  } else if (err instanceof DattoBcdrNotFoundError) {
    // ...
  } else {
    throw err;
  }
}
```

## Development

```bash
npm install
npm test
npm run typecheck
npm run lint
npm run build
```

## License

Apache-2.0
