import { describe, it, expect } from 'vitest';
import { buildPaginationParams } from '../../src/pagination.js';

describe('buildPaginationParams', () => {
  it('returns empty object when no params', () => {
    expect(buildPaginationParams()).toEqual({});
  });

  it('maps page/perPage to wire-format keys', () => {
    expect(buildPaginationParams({ page: 2, perPage: 100 })).toEqual({ _page: 2, _perPage: 100 });
  });

  it('preserves undefined for absent fields', () => {
    expect(buildPaginationParams({ page: 3 })).toEqual({ _page: 3, _perPage: undefined });
  });
});
