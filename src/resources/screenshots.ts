/**
 * Screenshot verification operations.
 */

import type { HttpClient } from '../http.js';
import type { BcdrScreenshot } from '../types/screenshots.js';
import { PaginatedIterable, type PaginationParams, type PaginatedResponse } from '../pagination.js';

/**
 * Operations on screenshot verification records.
 */
export class ScreenshotsResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  private listPath(serialNumber: string, agentId: string): string {
    return `/bcdr/device/${encodeURIComponent(serialNumber)}/asset/${encodeURIComponent(agentId)}/screenshot`;
  }

  /**
   * List screenshot verification records (single page).
   */
  async list(
    serialNumber: string,
    agentId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<BcdrScreenshot>> {
    return this.httpClient.get<PaginatedResponse<BcdrScreenshot>>(this.listPath(serialNumber, agentId), {
      _page: params?.page,
      _perPage: params?.perPage,
    });
  }

  /**
   * Iterate over every screenshot verification record for an asset.
   */
  listAll(
    serialNumber: string,
    agentId: string,
    params?: PaginationParams
  ): PaginatedIterable<BcdrScreenshot> {
    return new PaginatedIterable<BcdrScreenshot>(
      this.httpClient,
      this.listPath(serialNumber, agentId),
      params
    );
  }

  /**
   * Download the PNG body for a specific screenshot.
   *
   * @param epoch - Unix epoch seconds identifying the recovery point.
   * @returns A Buffer containing the PNG image bytes.
   */
  async getImage(serialNumber: string, agentId: string, epoch: number): Promise<Buffer> {
    return this.httpClient.getBinary(
      `/bcdr/device/${encodeURIComponent(serialNumber)}/asset/${encodeURIComponent(agentId)}/screenshot/${epoch}`
    );
  }
}
