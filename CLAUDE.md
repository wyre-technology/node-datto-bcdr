# node-datto-bcdr

Node.js/TypeScript SDK for the Datto BCDR (Backup Portal) API v1.

## Project info

- **GitHub**: https://github.com/wyre-technology/node-datto-bcdr
- **Package**: `@wyre-technology/node-datto-bcdr` (GitHub Packages)
- **Sister SDK**: [`node-datto-rmm`](https://github.com/wyre-technology/node-datto-rmm) — same overall architecture, different auth model (OAuth instead of HMAC).

## Architecture

- `src/client.ts` — composition root (`DattoBcdrClient`)
- `src/config.ts` — config resolution and rate-limit defaults
- `src/auth.ts` — HMAC-SHA256 request signing (`buildCanonicalPath`, `computeSignature`, `buildSignedHeaders`)
- `src/http.ts` — fetch + retry + error mapping
- `src/rate-limiter.ts` — sliding-window limiter (120/min default)
- `src/pagination.ts` — `PaginatedIterable` for `_page`/`_perPage` async iteration
- `src/resources/*.ts` — one class per API entity
- `src/types/*.ts` — domain types (intentionally permissive — `[key: string]: unknown` on most interfaces)

## Auth model gotchas

- Three headers per request: `X-Datto-API-Key`, `X-Datto-API-Timestamp`, `X-Datto-API-Signature`
- String-to-sign: `METHOD\nPATH+SORTED_QUERY\nTIMESTAMP\nBODY`
- The **same** canonical (sorted-query) URL string must be used for both `fetch` and signature input — see `HttpClient.executeRequest`.
- Clock skew >~5 min causes 401. We map this to `DattoBcdrSignatureError` (subclass of `DattoBcdrAuthenticationError`).

## Build / test

```bash
npm install
npm test
npm run typecheck
npm run lint
npm run build
```

## Release

Pushes to `main` trigger semantic-release via `.github/workflows/release.yml`, which publishes to GitHub Packages.
