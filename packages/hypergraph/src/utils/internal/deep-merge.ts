// A “plain object” is any non-null object that isn’t an array
const isPlainObject = (obj: unknown): obj is Record<string, unknown> =>
  typeof obj === 'object' && obj !== null && !Array.isArray(obj);

/**
 * Deeply merges two plain‐object types T and U,
 * returning a new object that has properties of both.
 * Arrays or other non‐object values in `source` simply overwrite.
 */
export const deepMerge = <T extends Record<string, unknown>, U extends Record<string, unknown>>(
  target: T,
  source: U,
): T & U => {
  // Start with a shallow clone of target
  const result = { ...target } as T & U;

  for (const key of Object.keys(source) as (keyof U)[]) {
    const srcVal = source[key];
    // biome-ignore lint/suspicious/noExplicitAny: good enough
    const tgtVal = (target as any)[key];

    if (isPlainObject(srcVal) && isPlainObject(tgtVal)) {
      // Both sides are plain objects → recurse
      // biome-ignore lint/suspicious/noExplicitAny: good enough
      result[key] = deepMerge(tgtVal as Record<string, unknown>, srcVal as Record<string, unknown>) as any;
    } else if (isPlainObject(srcVal)) {
      // Source is object but target missing or not object → clone source
      // biome-ignore lint/suspicious/noExplicitAny: good enough
      result[key] = deepMerge({} as Record<string, unknown>, srcVal as Record<string, unknown>) as any;
    } else {
      // Non‐objects (including arrays) overwrite
      // biome-ignore lint/suspicious/noExplicitAny: good enough
      result[key] = srcVal as any;
    }
  }

  return result;
};
