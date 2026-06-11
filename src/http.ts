/**
 * HTTP layer for the Datto BCDR API.
 */

import type { ResolvedConfig } from './config.js';
import type { RateLimiter } from './rate-limiter.js';
import { buildCanonicalPath, buildSignedHeaders } from './auth.js';
import {
  DattoBcdrError,
  DattoBcdrAuthenticationError,
  DattoBcdrForbiddenError,
  DattoBcdrNotFoundError,
  DattoBcdrRateLimitError,
  DattoBcdrServerError,
} from './errors.js';

/**
 * Options for an HTTP request.
 */
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
  /** When true, return the raw response body as a Buffer (for binary endpoints). */
  binary?: boolean;
}

/**
 * Authenticated HTTP client for the Datto BCDR API.
 */
export class HttpClient {
  private readonly config: ResolvedConfig;
  private readonly rateLimiter: RateLimiter;

  constructor(config: ResolvedConfig, rateLimiter: RateLimiter) {
    this.config = config;
    this.rateLimiter = rateLimiter;
  }

  /**
   * Make an authenticated request.
   *
   * @param path - API path beginning with "/", relative to the configured base URL
   *               (e.g. "/bcdr/device").
   */
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, params, binary = false } = options;
    const pathAndQuery = buildCanonicalPath(path, params);
    const url = `${this.config.apiUrl}${pathAndQuery}`;
    const bodyString = body === undefined ? '' : JSON.stringify(body);
    return this.executeRequest<T>(url, method, bodyString, binary, 0);
  }

  /**
   * Make a JSON GET to the given path and return the parsed response.
   */
  async get<T>(path: string, params?: RequestOptions['params']): Promise<T> {
    return this.request<T>(path, { method: 'GET', params });
  }

  /**
   * Make a binary GET to the given path and return the raw response Buffer.
   */
  async getBinary(path: string, params?: RequestOptions['params']): Promise<Buffer> {
    return this.request<Buffer>(path, { method: 'GET', params, binary: true });
  }

  private async executeRequest<T>(
    url: string,
    method: string,
    bodyString: string,
    binary: boolean,
    retryCount: number
  ): Promise<T> {
    await this.rateLimiter.waitForSlot();

    const signed = buildSignedHeaders(this.config.apiKey, this.config.apiSecretKey);

    const headers: Record<string, string> = {
      Accept: binary ? 'image/png, application/octet-stream, */*' : 'application/json',
      ...signed,
    };
    if (bodyString) headers['Content-Type'] = 'application/json';

    this.rateLimiter.recordRequest();

    const response = await fetch(url, {
      method,
      headers,
      body: bodyString || undefined,
    });

    return this.handleResponse<T>(response, url, method, bodyString, binary, retryCount);
  }

  private async handleResponse<T>(
    response: Response,
    url: string,
    method: string,
    bodyString: string,
    binary: boolean,
    retryCount: number
  ): Promise<T> {
    if (response.ok) {
      if (binary) {
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer) as unknown as T;
      }
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        return (await response.json()) as T;
      }
      const text = await response.text();
      return (text === '' ? ({} as T) : (text as unknown as T));
    }

    let responseBody: unknown;
    try {
      responseBody = await response.clone().json();
    } catch {
      try {
        responseBody = await response.text();
      } catch {
        responseBody = undefined;
      }
    }

    switch (response.status) {
      case 401: {
        throw new DattoBcdrAuthenticationError('Authentication failed', 401, responseBody);
      }
      case 403:
        throw new DattoBcdrForbiddenError('Access forbidden', responseBody);
      case 404:
        throw new DattoBcdrNotFoundError('Resource not found', responseBody);
      case 429: {
        const retryAfterHeader = response.headers.get('retry-after');
        const retryAfterSeconds =
          retryAfterHeader != null && retryAfterHeader !== ''
            ? parseInt(retryAfterHeader, 10)
            : undefined;
        if (this.rateLimiter.shouldRetry(retryCount)) {
          const delay = this.rateLimiter.calculateRetryDelay(retryCount, retryAfterSeconds);
          await this.sleep(delay);
          return this.executeRequest<T>(url, method, bodyString, binary, retryCount + 1);
        }
        throw new DattoBcdrRateLimitError(
          'Rate limit exceeded and max retries reached',
          (retryAfterSeconds ?? 5) * 1000,
          responseBody
        );
      }
      default:
        if (response.status >= 500) {
          if (retryCount === 0) {
            await this.sleep(1000);
            return this.executeRequest<T>(url, method, bodyString, binary, 1);
          }
          throw new DattoBcdrServerError(
            `Server error: ${response.status} ${response.statusText}`,
            response.status,
            responseBody
          );
        }
        throw new DattoBcdrError(
          `Request failed: ${response.status} ${response.statusText}`,
          response.status,
          responseBody
        );
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

