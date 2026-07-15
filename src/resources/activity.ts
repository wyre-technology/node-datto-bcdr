/**
 * Activity log operations.
 */

import type { HttpClient } from '../http.js';
import type { BcdrActivityLogEntry } from '../types/activity.js';
import { PaginatedIterable, type PaginationParams, type PaginatedResponse } from '../pagination.js';

/**
 * Operations on the BCDR activity log report endpoint.
 */
export class ActivityResource {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * List activity log entries (single page).
   */
  async list(params?: PaginationParams): Promise<PaginatedResponse<BcdrActivityLogEntry>> {
    return this.httpClient.get<PaginatedResponse<BcdrActivityLogEntry>>('/report/activity-log', {
      _page: params?.page,
      _perPage: params?.perPage,
    });
  }

  /**
   * Iterate over every activity log entry.
   */
  listAll(params?: PaginationParams): PaginatedIterable<BcdrActivityLogEntry> {
    return new PaginatedIterable<BcdrActivityLogEntry>(this.httpClient, '/report/activity-log', params);
  }
}
