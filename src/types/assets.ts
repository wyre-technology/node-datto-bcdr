/**
 * Protected asset (agent) types.
 */

/**
 * A protected asset (agent) on a BCDR device.
 */
export interface BcdrAsset {
  agentId: string;
  hostname?: string;
  os?: string;
  type?: string;
  isArchived?: boolean;
  isPaused?: boolean;
  latestOffsite?: number;
  latestScreenshot?: number;
  protectedVolumeNames?: string[];
  [key: string]: unknown;
}
