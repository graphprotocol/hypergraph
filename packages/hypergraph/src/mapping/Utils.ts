import { Data, String as EffectString } from 'effect';

/**
 * Takes the input string and returns the camelCase equivalent
 *
 * @example
 * ```ts
 * import { toCamelCase } from '@graphprotocol/hypergraph/mapping'
 *
 * expect(toCamelCase('Address line 1')).toEqual('addressLine1');
 * expect(toCamelCase('AddressLine1')).toEqual('addressLine1');
 * expect(toCamelCase('addressLine1')).toEqual('addressLine1');
 * expect(toCamelCase('address_line_1')).toEqual('addressLine1');
 * expect(toCamelCase('address-line-1')).toEqual('addressLine1');
 * expect(toCamelCase('address-line_1')).toEqual('addressLine1');
 * expect(toCamelCase('address-line 1')).toEqual('addressLine1');
 * expect(toCamelCase('ADDRESS_LINE_1')).toEqual('addressLine1');
 * ```
 *
 * @since 0.2.0
 *
 * @param str input string
 * @returns camelCased value of the input string
 */
export function toCamelCase(str: string): string {
  if (EffectString.isEmpty(str)) {
    throw new InvalidInputError({ input: str, cause: 'Input is empty' });
  }

  let result = '';
  let capitalizeNext = false;
  let i = 0;

  // Skip leading non-alphanumeric characters
  while (i < EffectString.length(str) && !/[a-zA-Z0-9]/.test(str[i])) {
    i++;
  }

  for (; i < EffectString.length(str); i++) {
    const char = str[i];

    if (/[a-zA-Z0-9]/.test(char)) {
      if (capitalizeNext) {
        result += EffectString.toUpperCase(char);
        capitalizeNext = false;
      } else if (EffectString.length(result) === 0) {
        // First character should always be lowercase
        result += EffectString.toLowerCase(char);
      } else if (/[A-Z]/.test(char) && i > 0 && /[a-z0-9]/.test(str[i - 1])) {
        // Capital letter following lowercase/number - this indicates a word boundary
        // So we need to capitalize this letter (it starts a new word)
        result += EffectString.toUpperCase(char);
      } else {
        result += EffectString.toLowerCase(char);
      }
    } else {
      // Non-alphanumeric character - set flag to capitalize next letter
      capitalizeNext = EffectString.length(result) > 0; // Only capitalize if we have existing content
    }
  }

  return result;
}

/**
 * Takes the input string and returns the PascalCase equivalent
 *
 * @example
 * ```ts
 * iimport { toPascalCase } from '@graphprotocol/hypergraph/mapping'
 *
 * expect(toPascalCase('Address line 1')).toEqual('AddressLine1');
 * expect(toPascalCase('AddressLine1')).toEqual('AddressLine1');
 * expect(toPascalCase('addressLine1')).toEqual('AddressLine1');
 * expect(toPascalCase('address_line_1')).toEqual('AddressLine1');
 * expect(toPascalCase('address-line-1')).toEqual('AddressLine1');
 * expect(toPascalCase('address-line_1')).toEqual('AddressLine1');
 * expect(toPascalCase('address-line 1')).toEqual('AddressLine1');
 * expect(toPascalCase('ADDRESS_LINE_1')).toEqual('AddressLine1');
 * ```
 *
 * @since 0.2.0
 *
 * @param str input string
 * @returns PascalCased value of the input string
 */
export function toPascalCase(str: string): string {
  if (EffectString.isEmpty(str)) {
    throw new InvalidInputError({ input: str, cause: 'Input is empty' });
  }

  let result = '';
  let capitalizeNext = true; // Start with true to capitalize the first letter
  let i = 0;

  // Skip leading non-alphanumeric characters
  while (i < EffectString.length(str) && !/[a-zA-Z0-9]/.test(str[i])) {
    i++;
  }

  for (; i < EffectString.length(str); i++) {
    const char = str[i];

    if (/[a-zA-Z0-9]/.test(char)) {
      if (capitalizeNext) {
        result += EffectString.toUpperCase(char);
        capitalizeNext = false;
      } else if (/[A-Z]/.test(char) && i > 0 && /[a-z0-9]/.test(str[i - 1])) {
        // Capital letter following lowercase/number - this indicates a word boundary
        // So we need to capitalize this letter (it starts a new word)
        result += EffectString.toUpperCase(char);
      } else {
        result += EffectString.toLowerCase(char);
      }
    } else {
      // Non-alphanumeric character - set flag to capitalize next letter
      capitalizeNext = true;
    }
  }

  return result;
}

export class InvalidInputError extends Data.TaggedError('/typesync/errors/InvalidInputError')<{
  readonly input: string;
  readonly cause: unknown;
}> {}

/**
 * Adds schema validation that the array of objects with property `name` only has unique names
 *
 * @example <caption>only unique names -> returns true</caption>
 * ```ts
 * const types = [{name:'Account'}, {name:'Event'}]
 * expect(namesAreUnique(types)).toEqual(true)
 * ```
 *
 * @example <caption>duplicate name -> returns false</caption>
 * ```ts
 * const types = [{name:'Account'}, {name:'Event'}, {name:'Account'}]
 * expect(namesAreUnique(types)).toEqual(false)
 * ```
 */
export function namesAreUnique<T extends { readonly name: string }>(entries: ReadonlyArray<T>): boolean {
  const names = new Set<string>();

  for (const entry of entries) {
    const name = EffectString.toLowerCase(entry.name);
    if (names.has(name)) {
      return false;
    }
    names.add(name);
  }

  return true;
}
