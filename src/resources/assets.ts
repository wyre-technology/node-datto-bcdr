/**
 * Protected asset (agent) operations.
 */

import type { HttpClient } from '../http.js';
import type { BcdrAsset } from '../types/assets.js';
import { PaginatedIterable, type PaginationParams, type PaginatedResponse } from '../pagination.js';

/**
 * Operations on protected assets attached to a BCDR device.
 */
export class AssetsResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List protected assets on a device (single page).
   */
  async list(serialNumber: string, params?: PaginationParams): Promise<PaginatedResponse<BcdrAsset>> {
    return this.httpClient.get<PaginatedResponse<BcdrAsset>>(
      `/bcdr/device/${encodeURIComponent(serialNumber)}/asset`,
      { _page: params?.page, _perPage: params?.perPage }
    );
  }

  /**
   * Iterate over every protected asset on a device.
   */
  listAll(serialNumber: string, params?: PaginationParams): PaginatedIterable<BcdrAsset> {
    return new PaginatedIterable<BcdrAsset>(
      this.httpClient,
      `/bcdr/device/${encodeURIComponent(serialNumber)}/asset`,
      params
    );
  }

  /**
   * Get a single protected asset by agent ID.
   */
  async get(serialNumber: string, agentId: string): Promise<BcdrAsset> {
    return this.httpClient.get<BcdrAsset>(
      `/bcdr/device/${encodeURIComponent(serialNumber)}/asset/${encodeURIComponent(agentId)}`
    );
  }
}
