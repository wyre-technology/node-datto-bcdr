/**
 * Pagination utilities for the Datto BCDR API.
 *
 * BCDR list endpoints use page-based pagination with `_page` (1-indexed) and
 * `_perPage` (default 50, max 250). Responses have shape:
 *
 *     {
 *       items: T[],
 *       pagination: { page, perPage, totalPages, totalItems }
 *     }
 */

import type { HttpClient } from './http.js';

/**
 * Pagination request parameters.
 */
export interface PaginationParams {
  /** Page number (1-indexed). Defaults to 1. */
  page?: number;
  /** Items per page (default 50, max 250). */
  perPage?: number;
}

/**
 * Pagination metadata returned by list endpoints.
 */
export interface PaginationInfo {
  page: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
}

/**
 * Generic paginated response shape.
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

/**
 * Map {@link PaginationParams} to the wire-format query parameters used by BCDR.
 */
export function buildPaginationParams(
  params?: PaginationParams
): Record<string, string | number | undefined> {
  if (!params) return {};
  return {
    _page: params.page,
    _perPage: params.perPage,
  };
}

/**
 * Async iterable over every item in a paginated endpoint, automatically
 * fetching subsequent pages as needed.
 */
export class PaginatedIterable<T> implements AsyncIterable<T> {
  private readonly httpClient: HttpClient;
  private readonly path: string;
  private readonly extraParams: Record<string, string | number | boolean | undefined>;
  private readonly perPage: number;
  private readonly startPage: number;

  constructor(
    httpClient: HttpClient,
    path: string,
    params: PaginationParams | undefined,
    extraParams?: Record<string, string | number | boolean | undefined>
  ) {
    this.httpClient = httpClient;
    this.path = path;
    this.extraParams = extraParams ?? {};
    this.perPage = params?.perPage ?? 50;
    this.startPage = params?.page ?? 1;
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    let page = this.startPage;
    while (true) {
      const response = await this.httpClient.get<PaginatedResponse<T>>(this.path, {
        ...this.extraParams,
        _page: page,
        _perPage: this.perPage,
      });

      const items = response.items ?? [];
      for (const item of items) yield item;

      const totalPages = response.pagination?.totalPages ?? page;
      if (items.length === 0 || page >= totalPages) return;
      page += 1;
    }
  }

  /** Collect every item into an array. */
  async toArray(): Promise<T[]> {
    const out: T[] = [];
    for await (const item of this) out.push(item);
    return out;
  }
}
