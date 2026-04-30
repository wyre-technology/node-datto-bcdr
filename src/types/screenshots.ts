/**
 * Screenshot verification types.
 */

/**
 * Metadata for a screenshot verification record.
 */
export interface BcdrScreenshot {
  /** Unix epoch seconds of the recovery point this screenshot belongs to. */
  epoch: number;
  status?: string;
  errorMessage?: string;
  uri?: string;
  [key: string]: unknown;
}
