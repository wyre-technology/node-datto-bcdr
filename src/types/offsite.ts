/**
 * Offsite / cloud replication types.
 */

/**
 * Offsite replication status for a BCDR device.
 */
export interface BcdrOffsiteStatus {
  serialNumber?: string;
  totalSize?: number;
  usedSize?: number;
  syncState?: string;
  lastSyncDate?: number;
  [key: string]: unknown;
}
