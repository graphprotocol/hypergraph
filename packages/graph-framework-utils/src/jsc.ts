export class NaNNotAllowedError extends Error {
  constructor() {
    super('NaN is not allowed');
  }
}
export class InfinityNotAllowedError extends Error {
  constructor() {
    super('Infinity is not allowed');
  }
}

/**
 * JSON canonicalize function.
 * Creates crypto safe predictable canocalization of JSON as defined by RFC8785.
 *
 * @see https://tools.ietf.org/html/rfc8785
 * @see https://www.rfc-editor.org/rfc/rfc8785
 *
 * @example <caption>Primitive values</caption>
 * ```ts
 * import { canonicalize } from 'graph-framework-utils'
 *
 * console.log(canonicalize(null)) // 'null'
 * console.log(canonicalize(1)) // '1'
 * console.log(canonicalize("test")) // "string"
 * console.log(canonicalize(true)) // 'true'
 * ```
 *
 * @example <caption>Objects</caption>
 * ```
 * import { canonicalize } from 'graph-framework-utils'
 *
 * const json = {
 *  from_account: '543 232 625-3',
 *  to_account: '321 567 636-4',
 *  amount: 500,
 *  currency: 'USD',
 * };
 * console.log(canonicalize(json)) // '{"amount":500,"currency":"USD","from_account":"543 232 625-3","to_account":"321 567 636-4"}'
 * ```
 *
 * @example <caption>Arrays</caption>
 * ```ts
 * import { canonicalize } from 'graph-framework-utils'
 *
 * console.log(canonicalize([1, 'text', null, true, false])) // '[1,"text",null,true,false]'
 * ```
 *
 * @param object object to JSC canonicalize
 * @throws NaNNotAllowedError if given object is of type number, but is not a valid number
 * @throws InfinityNotAllowedError if given object is of type number, but is the infinite number
 */
export function canonicalize<T = unknown>(object: T): string {
  if (typeof object === 'number' && Number.isNaN(object)) {
    throw new NaNNotAllowedError();
  }
  if (typeof object === 'number' && !Number.isFinite(object)) {
    throw new InfinityNotAllowedError();
  }

  if (object === null || typeof object !== 'object') {
    return JSON.stringify(object);
  }

  // biome-ignore lint/suspicious/noExplicitAny: typeof T is unknown, cast to any to check
  if ((object as any).toJSON instanceof Function) {
    // biome-ignore lint/suspicious/noExplicitAny: typeof T is unknown, cast to any to check
    return canonicalize((object as any).toJSON());
  }

  if (Array.isArray(object)) {
    const values = object.reduce((t, cv) => {
      if (cv === undefined || typeof cv === 'symbol') {
        return t; // Skip undefined and symbol values entirely
      }
      const comma = t.length === 0 ? '' : ',';
      return `${t}${comma}${canonicalize(cv)}`;
    }, '');
    return `[${values}]`;
  }

  const values = Object.keys(object)
    .sort()
    .reduce((t, cv) => {
      // biome-ignore lint/suspicious/noExplicitAny: typeof T is unknown, cast to any to check
      if ((object as any)[cv] === undefined || typeof (object as any)[cv] === 'symbol') {
        return t;
      }
      const comma = t.length === 0 ? '' : ',';
      // biome-ignore lint/suspicious/noExplicitAny: typeof T is unknown, cast to any to check
      return `${t}${comma}${canonicalize(cv)}:${canonicalize((object as any)[cv])}`;
    }, '');
  return `{${values}}`;
}
