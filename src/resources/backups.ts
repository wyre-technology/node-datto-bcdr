/**
 * Backup / recovery point operations.
 */

import type { HttpClient } from '../http.js';
import type { BcdrBackup } from '../types/backups.js';
import { PaginatedIterable, type PaginationParams, type PaginatedResponse } from '../pagination.js';

/**
 * Operations on recovery points for a protected asset.
 */
export class BackupsResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * Build the path for a backup endpoint.
   */
  private path(serialNumber: string, agentId: string): string {
    return `/bcdr/device/${encodeURIComponent(serialNumber)}/asset/${encodeURIComponent(agentId)}/backup`;
  }

  /**
   * List recovery points for an asset (single page).
   */
  async list(
    serialNumber: string,
    agentId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<BcdrBackup>> {
    return this.httpClient.get<PaginatedResponse<BcdrBackup>>(this.path(serialNumber, agentId), {
      _page: params?.page,
      _perPage: params?.perPage,
    });
  }

  /**
   * Iterate over every recovery point for an asset.
   */
  listAll(
    serialNumber: string,
    agentId: string,
    params?: PaginationParams
  ): PaginatedIterable<BcdrBackup> {
    return new PaginatedIterable<BcdrBackup>(this.httpClient, this.path(serialNumber, agentId), params);
  }
}
