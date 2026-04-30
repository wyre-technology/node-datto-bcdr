/**
 * Alert reporting operations.
 */

import type { HttpClient } from '../http.js';
import type { BcdrAlert } from '../types/alerts.js';
import { PaginatedIterable, type PaginationParams, type PaginatedResponse } from '../pagination.js';

/**
 * Operations on the BCDR alert report endpoint.
 */
export class AlertsResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List alerts (single page).
   */
  async list(params?: PaginationParams): Promise<PaginatedResponse<BcdrAlert>> {
    return this.httpClient.get<PaginatedResponse<BcdrAlert>>('/report/v2/alert', {
      _page: params?.page,
      _perPage: params?.perPage,
    });
  }

  /**
   * Iterate over every alert.
   */
  listAll(params?: PaginationParams): PaginatedIterable<BcdrAlert> {
    return new PaginatedIterable<BcdrAlert>(this.httpClient, '/report/v2/alert', params);
  }
}
