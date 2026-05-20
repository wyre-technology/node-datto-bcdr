# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- CI workflow (`.github/workflows/ci.yml`) running lint, type check, build, and tests on pull requests and pushes (Node 22).
- `CODE_OF_CONDUCT.md` (Contributor Covenant).
- Validation of `apiUrl` in `resolveConfig` — it must be a well-formed `https://` URL.

### Fixed

- Resolved `strict-boolean-expressions` lint warnings in `src/http.ts` and `src/rate-limiter.ts` by handling nullish values explicitly.

## [0.1.0]

### Added

- Initial release of the Datto BCDR SDK with HMAC-SHA256 request signing, sliding-window rate limiting, pagination, and typed resource clients.
