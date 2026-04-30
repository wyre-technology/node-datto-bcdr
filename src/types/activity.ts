/**
 * Activity log types.
 */

/**
 * An entry in the BCDR activity log.
 */
export interface BcdrActivityLogEntry {
  id?: string;
  serialNumber?: string;
  agentId?: string;
  category?: string;
  message?: string;
  timestamp?: number;
  [key: string]: unknown;
}
