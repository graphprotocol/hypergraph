import { v4 as uuidv4 } from 'uuid';
import { normalizeGeoId } from './geo-id.js';

/**
 * Generate a v4 UUID.
 *
 * @example
 * ```
 * import { generateId } from '@graph-framework/utils'
 *
 * const id = generateId()
 * console.log(id)
 * ```
 *
 * @returns v4 UUID
 */
export function generateId() {
  // GRC-20 now uses UUIDs without dashes; normalize for internal consistency.
  return normalizeGeoId(uuidv4());
}
