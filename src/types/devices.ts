/**
 * Device (BCDR appliance) types.
 */

/**
 * A Datto BCDR device (e.g. a SIRIS or ALTO appliance).
 *
 * The BCDR API may include additional fields not modeled here; consumers can
 * cast to a wider type if needed.
 */
export interface BcdrDevice {
  serialNumber: string;
  hostname?: string;
  internalIP?: string;
  model?: string;
  clientCompanyName?: string;
  lastSeenDate?: number;
  registrationDate?: number;
  uptime?: number;
  [key: string]: unknown;
}
