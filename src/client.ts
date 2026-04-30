/**
 * Main Datto BCDR Client.
 */

import type { DattoBcdrConfig, ResolvedConfig } from './config.js';
import { resolveConfig } from './config.js';
import { HttpClient } from './http.js';
import { RateLimiter } from './rate-limiter.js';
import { DevicesResource } from './resources/devices.js';
import { AssetsResource } from './resources/assets.js';
import { BackupsResource } from './resources/backups.js';
import { ScreenshotsResource } from './resources/screenshots.js';
import { OffsiteResource } from './resources/offsite.js';
import { AlertsResource } from './resources/alerts.js';
import { ActivityResource } from './resources/activity.js';

/**
 * Datto BCDR API Client.
 *
 * @example
 * ```typescript
 * import { DattoBcdrClient } from '@wyre-technology/node-datto-bcdr';
 *
 * const client = new DattoBcdrClient({
 *   apiKey: process.env.DATTO_BCDR_PUBLIC_KEY!,
 *   apiSecretKey: process.env.DATTO_BCDR_PRIVATE_KEY!,
 * });
 *
 * for await (const device of client.devices.listAll()) {
 *   console.log(device.serialNumber, device.hostname);
 * }
 * ```
 */
export class DattoBcdrClient {
  private readonly config: ResolvedConfig;
  private readonly rateLimiter: RateLimiter;
  private readonly httpClient: HttpClient;

  /** BCDR device (appliance) operations. */
  readonly devices: DevicesResource;
  /** Protected asset (agent) operations. */
  readonly assets: AssetsResource;
  /** Recovery point / backup operations. */
  readonly backups: BackupsResource;
  /** Screenshot verification operations. */
  readonly screenshots: ScreenshotsResource;
  /** Offsite replication operations. */
  readonly offsite: OffsiteResource;
  /** Alert report operations. */
  readonly alerts: AlertsResource;
  /** Activity log report operations. */
  readonly activity: ActivityResource;

  constructor(config: DattoBcdrConfig) {
    this.config = resolveConfig(config);
    this.rateLimiter = new RateLimiter(this.config.rateLimit);
    this.httpClient = new HttpClient(this.config, this.rateLimiter);

    this.devices = new DevicesResource(this.httpClient);
    this.assets = new AssetsResource(this.httpClient);
    this.backups = new BackupsResource(this.httpClient);
    this.screenshots = new ScreenshotsResource(this.httpClient);
    this.offsite = new OffsiteResource(this.httpClient);
    this.alerts = new AlertsResource(this.httpClient);
    this.activity = new ActivityResource(this.httpClient);
  }

  /** Get the resolved configuration. */
  getConfig(): Readonly<ResolvedConfig> {
    return this.config;
  }
}
