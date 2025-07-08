import { Data, String as EffectString } from 'effect';

/**
 * Takes the input string and returns the camelCase equivalent
 *
 * @example
 * ```ts
 * import * as Utils from '@graphprotocol/typesync/Utils'
 *
 * expect(Utils.toCamelCase('Address line 1')).toEqual('addressLine1');
 * expect(Utils.toCamelCase('AddressLine1')).toEqual('addressLine1');
 * expect(Utils.toCamelCase('addressLine1')).toEqual('addressLine1');
 * expect(Utils.toCamelCase('address_line_1')).toEqual('addressLine1');
 * expect(Utils.toCamelCase('address-line-1')).toEqual('addressLine1');
 * expect(Utils.toCamelCase('address-line_1')).toEqual('addressLine1');
 * expect(Utils.toCamelCase('address-line 1')).toEqual('addressLine1');
 * expect(Utils.toCamelCase('ADDRESS_LINE_1')).toEqual('addressLine1');
 * ```
 *
 * @since 0.0.1
 *
 * @param str input string
 * @returns camelCased value of the input string
 */
export function toCamelCase(str: string) {
  if (EffectString.isEmpty(str) || /^\s+$/.test(str)) {
    throw new InvalidInputError({ input: str, cause: 'Input is empty or contains only whitespace' });
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
 * import * as Utils from '@graphprotocol/typesync/Utils'
 *
 * expect(Utils.toPascalCase('Address line 1')).toEqual('AddressLine1');
 * expect(Utils.toPascalCase('AddressLine1')).toEqual('AddressLine1');
 * expect(Utils.toPascalCase('addressLine1')).toEqual('AddressLine1');
 * expect(Utils.toPascalCase('address_line_1')).toEqual('AddressLine1');
 * expect(Utils.toPascalCase('address-line-1')).toEqual('AddressLine1');
 * expect(Utils.toPascalCase('address-line_1')).toEqual('AddressLine1');
 * expect(Utils.toPascalCase('address-line 1')).toEqual('AddressLine1');
 * expect(Utils.toPascalCase('ADDRESS_LINE_1')).toEqual('AddressLine1');
 * ```
 *
 * @since 0.0.1
 *
 * @param str input string
 * @returns PascalCased value of the input string
 */
export function toPascalCase(str: string): string {
  if (EffectString.isEmpty(str) || /^\s+$/.test(str)) {
    throw new InvalidInputError({ input: str, cause: 'Input is empty or contains only whitespace' });
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

/* ------------------------------------------------------------------ */
/*  Windows-safe migration loader                                      */
/* ------------------------------------------------------------------ */

import { pathToFileURL } from "node:url"
import { FileSystem } from "@effect/platform/FileSystem"
import * as Effect from "effect/Effect"
import type { Loader, ResolvedMigration } from "@effect/sql/Migrator"
import { MigrationError } from "@effect/sql/Migrator"

/**
 * Patched version of
 * `@effect/sql/Migrator/FileSystem.fromFileSystem`.
 *
 * The only difference is that the dynamic `import()` receives a proper
 * `file://` URL, so it works on Windows as well as on Linux / macOS.
 */
export const fromFileSystem = (
  dir: string,
): Loader<FileSystem> =>
  FileSystem.pipe(
    /* read directory ----------------------------------------------------- */
    Effect.flatMap((FS) => FS.readDirectory(dir)),
    Effect.mapError(
      (e) => new MigrationError({ reason: "failed", message: e.message }),
    ),
    /* build migration list ---------------------------------------------- */
    Effect.map((files): ReadonlyArray<ResolvedMigration> =>
      files
        .flatMap((file) => {
          const m =
            file.match(/^(?:.*[\\/])?(\d+)_([^.]+)\.(js|ts)$/) // win/posix
          if (!m) return []
          const [basename, id, name] = m
          return [
            [
              Number(id),
              name,
              Effect.promise(() =>
                import(
                  /* @vite-ignore */ /* webpackIgnore: true */
                  pathToFileURL(`${dir}/${basename}`).href,
                ),
              ),
            ],
          ] as const
        })
        .sort(([a], [b]) => a - b),
    ),
  )