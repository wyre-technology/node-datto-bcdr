import { describe, it, expect } from 'vitest';
import { DattoBcdrClient } from '../../src/client.js';
import {
  DattoBcdrAuthenticationError,
  DattoBcdrForbiddenError,
  DattoBcdrNotFoundError,
  DattoBcdrRateLimitError,
} from '../../src/errors.js';

function makeClient(): DattoBcdrClient {
  return new DattoBcdrClient({
    apiKey: 'test-public',
    apiSecretKey: 'test-private',
    rateLimit: { maxRetries: 0, retryAfterMs: 1 },
  });
}

describe('DattoBcdrClient', () => {
  it('exposes all resource namespaces', () => {
    const c = makeClient();
    expect(c.devices).toBeDefined();
    expect(c.assets).toBeDefined();
    expect(c.backups).toBeDefined();
    expect(c.screenshots).toBeDefined();
    expect(c.offsite).toBeDefined();
    expect(c.alerts).toBeDefined();
    expect(c.activity).toBeDefined();
  });

  it('lists devices (single page)', async () => {
    const c = makeClient();
    const page = await c.devices.list({ page: 1, perPage: 50 });
    expect(page.items).toHaveLength(2);
    expect(page.items[0]?.serialNumber).toBe('SN-1');
    expect(page.pagination.totalPages).toBe(2);
  });

  it('iterates devices across pages with listAll', async () => {
    const c = makeClient();
    const all: string[] = [];
    for await (const d of c.devices.listAll({ perPage: 50 })) {
      all.push(d.serialNumber);
    }
    expect(all).toEqual(['SN-1', 'SN-2', 'SN-3']);
  });

  it('gets a single device', async () => {
    const c = makeClient();
    const d = await c.devices.get('SN-1');
    expect(d.serialNumber).toBe('SN-1');
    expect(d.model).toBe('S5X');
  });

  it('lists assets, backups, screenshots, offsite, alerts, activity', async () => {
    const c = makeClient();
    expect((await c.assets.list('SN-1')).items).toHaveLength(2);
    expect(await c.assets.get('SN-1', 'agent-a')).toMatchObject({ agentId: 'agent-a' });
    expect((await c.backups.list('SN-1', 'agent-a')).items).toHaveLength(2);
    expect((await c.screenshots.list('SN-1', 'agent-a')).items).toHaveLength(1);
    expect(await c.offsite.get('SN-1')).toMatchObject({ syncState: 'idle' });
    expect((await c.alerts.listByDevice('SN-1')).items).toHaveLength(2);
    expect((await c.activity.list()).items).toHaveLength(1);
  });

  it('lists alerts for a single device', async () => {
    const c = makeClient();
    const page = await c.alerts.listByDevice('SN-2');
    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.id).toBe('alert-3');
  });

  it('iterates a single device\'s alerts with listAllByDevice', async () => {
    const c = makeClient();
    const ids: string[] = [];
    for await (const a of c.alerts.listAllByDevice('SN-1')) ids.push(a.id ?? '');
    expect(ids).toEqual(['alert-1', 'alert-2']);
  });

  it('fans listAll out across every device, stamping each alert with its serialNumber', async () => {
    const c = makeClient();
    const seen: Array<{ id?: string; serialNumber?: string }> = [];
    for await (const a of c.alerts.listAll()) seen.push(a);
    // SN-1 has 2, SN-2 has 1, SN-3 has 0 → 3 total across the fleet
    expect(seen.map((a) => a.id)).toEqual(['alert-1', 'alert-2', 'alert-3']);
    expect(seen.map((a) => a.serialNumber)).toEqual(['SN-1', 'SN-1', 'SN-2']);
  });

  it('reads the activity log from the non-v2 report path', async () => {
    const c = makeClient();
    const page = await c.activity.list();
    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.id).toBe('act-1');
  });

  it('downloads a screenshot PNG as a Buffer', async () => {
    const c = makeClient();
    const buf = await c.screenshots.getImage('SN-1', 'agent-a', 1700000000);
    expect(Buffer.isBuffer(buf)).toBe(true);
    // PNG magic number
    expect(buf.subarray(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  });

  it('maps 404 to DattoBcdrNotFoundError', async () => {
    const c = makeClient();
    await expect(c.devices.get('MISSING')).rejects.toBeInstanceOf(DattoBcdrNotFoundError);
  });

  it('maps 401 to DattoBcdrAuthenticationError', async () => {
    const c = makeClient();
    const err = await c.devices.get('UNAUTH').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(DattoBcdrAuthenticationError);
  });

  it('maps 403 to DattoBcdrForbiddenError', async () => {
    const c = makeClient();
    await expect(c.devices.get('FORBIDDEN')).rejects.toBeInstanceOf(DattoBcdrForbiddenError);
  });

  it('maps 429 (after retries exhausted) to DattoBcdrRateLimitError', async () => {
    const c = makeClient();
    await expect(c.devices.get('RATE_LIMITED')).rejects.toBeInstanceOf(DattoBcdrRateLimitError);
  });
});
