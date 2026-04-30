/**
 * MSW handlers mocking the Datto BCDR API.
 */

import { http, HttpResponse } from 'msw';

const BASE = 'https://api.datto.com/v1';

const samplePng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function paginated<T>(items: T[], page = 1, perPage = 50): {
  items: T[];
  pagination: { page: number; perPage: number; totalPages: number; totalItems: number };
} {
  return {
    items,
    pagination: {
      page,
      perPage,
      totalPages: 1,
      totalItems: items.length,
    },
  };
}

export const handlers = [
  // Devices list — supports two-page pagination for tests
  http.get(`${BASE}/bcdr/device`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('_page') ?? '1', 10);
    const perPage = parseInt(url.searchParams.get('_perPage') ?? '50', 10);
    if (page === 1) {
      return HttpResponse.json({
        items: [
          { serialNumber: 'SN-1', hostname: 'siris-1' },
          { serialNumber: 'SN-2', hostname: 'siris-2' },
        ],
        pagination: { page: 1, perPage, totalPages: 2, totalItems: 3 },
      });
    }
    return HttpResponse.json({
      items: [{ serialNumber: 'SN-3', hostname: 'siris-3' }],
      pagination: { page: 2, perPage, totalPages: 2, totalItems: 3 },
    });
  }),

  http.get(`${BASE}/bcdr/device/SN-1`, () => {
    return HttpResponse.json({ serialNumber: 'SN-1', hostname: 'siris-1', model: 'S5X' });
  }),

  http.get(`${BASE}/bcdr/device/MISSING`, () => {
    return HttpResponse.json({ message: 'not found' }, { status: 404 });
  }),

  http.get(`${BASE}/bcdr/device/UNAUTH`, () => {
    return HttpResponse.json(
      { message: 'Invalid signature - check your timestamp' },
      { status: 401 }
    );
  }),

  http.get(`${BASE}/bcdr/device/FORBIDDEN`, () => {
    return HttpResponse.json({ message: 'forbidden' }, { status: 403 });
  }),

  http.get(`${BASE}/bcdr/device/RATE_LIMITED`, () => {
    return HttpResponse.json(
      { message: 'rate limited' },
      { status: 429, headers: { 'Retry-After': '0' } }
    );
  }),

  // Assets
  http.get(`${BASE}/bcdr/device/SN-1/asset`, () => {
    return HttpResponse.json(
      paginated([
        { agentId: 'agent-a', hostname: 'host-a' },
        { agentId: 'agent-b', hostname: 'host-b' },
      ])
    );
  }),

  http.get(`${BASE}/bcdr/device/SN-1/asset/agent-a`, () => {
    return HttpResponse.json({ agentId: 'agent-a', hostname: 'host-a' });
  }),

  // Backups
  http.get(`${BASE}/bcdr/device/SN-1/asset/agent-a/backup`, () => {
    return HttpResponse.json(paginated([{ epoch: 1700000000 }, { epoch: 1700003600 }]));
  }),

  // Screenshots
  http.get(`${BASE}/bcdr/device/SN-1/asset/agent-a/screenshot`, () => {
    return HttpResponse.json(paginated([{ epoch: 1700000000, status: 'success' }]));
  }),

  http.get(`${BASE}/bcdr/device/SN-1/asset/agent-a/screenshot/1700000000`, () => {
    return HttpResponse.arrayBuffer(samplePng.buffer.slice(samplePng.byteOffset, samplePng.byteOffset + samplePng.byteLength), {
      headers: { 'Content-Type': 'image/png' },
    });
  }),

  // Offsite
  http.get(`${BASE}/bcdr/device/SN-1/offsite`, () => {
    return HttpResponse.json({ serialNumber: 'SN-1', syncState: 'idle', usedSize: 1024 });
  }),

  // Alerts
  http.get(`${BASE}/report/v2/alert`, () => {
    return HttpResponse.json(paginated([{ id: 'alert-1', severity: 'high' }]));
  }),

  // Activity
  http.get(`${BASE}/report/v2/activity-log`, () => {
    return HttpResponse.json(paginated([{ id: 'act-1', message: 'something happened' }]));
  }),
];
