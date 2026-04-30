/**
 * BCDR device operations.
 */

import type { HttpClient } from '../http.js';
import type { BcdrDevice } from '../types/devices.js';
import { PaginatedIterable, type PaginationParams, type PaginatedResponse } from '../pagination.js';

/**
 * Operations on BCDR devices (appliances).
 */
export class DevicesResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List BCDR devices (single page).
   */
  async list(params?: PaginationParams): Promise<PaginatedResponse<BcdrDevice>> {
    return this.httpClient.get<PaginatedResponse<BcdrDevice>>('/bcdr/device', {
      _page: params?.page,
      _perPage: params?.perPage,
    });
  }

  /**
   * Iterate over every BCDR device, fetching successive pages automatically.
   */
  listAll(params?: PaginationParams): PaginatedIterable<BcdrDevice> {
    return new PaginatedIterable<BcdrDevice>(this.httpClient, '/bcdr/device', params);
  }

  /**
   * Get a single BCDR device by serial number.
   */
  async get(serialNumber: string): Promise<BcdrDevice> {
    return this.httpClient.get<BcdrDevice>(`/bcdr/device/${encodeURIComponent(serialNumber)}`);
  }
}
