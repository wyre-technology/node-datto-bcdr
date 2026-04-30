/**
 * Backup / recovery point types.
 */

/**
 * A recovery point for a protected asset.
 */
export interface BcdrBackup {
  /** Unix epoch seconds identifying this recovery point. */
  epoch: number;
  type?: string;
  status?: string;
  used?: number;
  localVerification?: {
    screenshot?: string;
    [key: string]: unknown;
  };
  offsite?: {
    status?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
