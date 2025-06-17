import { v4 as uuidv4 } from 'uuid';

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
  return uuidv4();
}
