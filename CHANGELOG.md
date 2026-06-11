## [1.0.1](https://github.com/wyre-technology/node-datto-bcdr/compare/v1.0.0...v1.0.1) (2026-05-20)


### Bug Fixes

* address medium/low review findings ([#2](https://github.com/wyre-technology/node-datto-bcdr/issues/2)) ([0b939e9](https://github.com/wyre-technology/node-datto-bcdr/commit/0b939e98f17e9227764b65cfc8d66ba22b0f3b1c))

# 1.0.0 (2026-04-30)


### Features

* initial SDK scaffold for Datto BCDR API ([e44b8ce](https://github.com/wyre-technology/node-datto-bcdr/commit/e44b8ce8c1e6b30d324d2469f5b5a0248830fa36))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Fixed authentication failure by switching from custom HMAC-SHA256 signing to HTTP Basic auth. The Datto BCDR API expects Basic authentication (public key = username, secret key = password), not custom HMAC headers. This resolves universal HTTP 401 authentication failures.

## [0.1.0]

### Added

- Initial release of the Datto BCDR SDK with HMAC-SHA256 request signing, sliding-window rate limiting, pagination, and typed resource clients.
