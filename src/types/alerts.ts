/**
 * BCDR alert types.
 */

/**
 * An alert reported by a BCDR device.
 */
export interface BcdrAlert {
  id?: string;
  serialNumber?: string;
  agentId?: string;
  type?: string;
  severity?: string;
  status?: string;
  createdAt?: number;
  resolvedAt?: number | null;
  message?: string;
  [key: string]: unknown;
}
