/**
 * Alert reporting operations.
 */

import type { HttpClient } from '../http.js';
import type { BcdrAlert } from '../types/alerts.js';
import type { BcdrDevice } from '../types/devices.js';
import { PaginatedIterable, type PaginationParams, type PaginatedResponse } from '../pagination.js';

/**
 * Operations on BCDR alerts.
 *
 * Datto's API exposes no portal-wide alerts endpoint — alerts are scoped to a
 * single device (`GET /bcdr/device/{serialNumber}/alert`). {@link listAll}
 * transparently fans out across every device so callers can still get a
 * fleet-wide view without knowing each serial number up front.
 */
export class AlertsResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List alerts for a single device (single page).
   */
  async listByDevice(
    serialNumber: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<BcdrAlert>> {
    return this.httpClient.get<PaginatedResponse<BcdrAlert>>(
      `/bcdr/device/${encodeURIComponent(serialNumber)}/alert`,
      { _page: params?.page, _perPage: params?.perPage }
    );
  }

  /**
   * Iterate over every alert for a single device, paging automatically.
   */
  listAllByDevice(serialNumber: string, params?: PaginationParams): PaginatedIterable<BcdrAlert> {
    return new PaginatedIterable<BcdrAlert>(
      this.httpClient,
      `/bcdr/device/${encodeURIComponent(serialNumber)}/alert`,
      params
    );
  }

  /**
   * Iterate over every alert across every device.
   *
   * There is no single portal-wide alerts endpoint, so this walks the device
   * list and yields each device's alerts in turn. Every alert is stamped with
   * the `serialNumber` of the device it came from so the flattened stream stays
   * attributable to its source appliance.
   */
  async *listAll(params?: PaginationParams): AsyncGenerator<BcdrAlert> {
    const devices = new PaginatedIterable<BcdrDevice>(this.httpClient, '/bcdr/device', undefined);
    for await (const device of devices) {
      const { serialNumber } = device;
      if (!serialNumber) continue;
      for await (const alert of this.listAllByDevice(serialNumber, params)) {
        yield { serialNumber, ...alert };
      }
    }
  }
}
