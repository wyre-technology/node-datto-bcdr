/**
 * Offsite / cloud replication operations.
 */

import type { HttpClient } from '../http.js';
import type { BcdrOffsiteStatus } from '../types/offsite.js';

/**
 * Operations on offsite replication status.
 */
export class OffsiteResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * Get the offsite replication status for a device.
   */
  async get(serialNumber: string): Promise<BcdrOffsiteStatus> {
    return this.httpClient.get<BcdrOffsiteStatus>(
      `/bcdr/device/${encodeURIComponent(serialNumber)}/offsite`
    );
  }
}
