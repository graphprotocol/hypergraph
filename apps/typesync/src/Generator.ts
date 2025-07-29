import { execSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { FileSystem, Path, type Error as PlatformError } from '@effect/platform';
import { NodeFileSystem } from '@effect/platform-node';
import { Doc } from '@effect/printer';
import { Mapping } from '@graphprotocol/typesync';
import { Cause, Console, Data, Effect, Array as EffectArray, String as EffectString } from 'effect';

import type * as Domain from '../domain/Domain.js';
import * as Utils from './Utils.js';

export class SchemaGenerator extends Effect.Service<SchemaGenerator>()('/typesync/services/Generator', {
  dependencies: [NodeFileSystem.layer],
  effect: Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const tmpDirectory = path.join(process.cwd(), '.tmp');

    const cleanup = fs
      .remove(tmpDirectory, { recursive: true, force: true })
      .pipe(Effect.tap(() => Console.log('successfully cleaned temp directory')));

    /**
     * Updates the name and description of the cloned package.json
     */
    function updatePackageJson(app: Pick<Domain.InsertAppSchema, 'name' | 'description'>, directory: string) {
      return Effect.gen(function* () {
        const packageJsonPath = path.join(directory, 'package.json');
        const exists = yield* fs.exists(packageJsonPath);
        if (!exists) {
          return yield* Effect.fail(new NoPackageJsonFoundError());
        }
        // read the cloned package.json
        const packageJson = yield* fs.readFileString(packageJsonPath).pipe(Effect.map(JSON.parse));

        const validatedPackageName = validatePackageName(app.name);
        const name = validatedPackageName.normalizedName;
        // update the name and description
        packageJson.name = name;
        packageJson.description = app.description || '';

        // rewrite file
        yield* fs.writeFileString(packageJsonPath, JSON.stringify(packageJson, null, 2));
      });
    }

    const cloneTemplRepo = Effect.async<void, CloneRepoError>((resume) => {
      try {
        execSync(`git clone git@github.com:geobrowser/hypergraph-app-template.git ${tmpDirectory}`, {
          stdio: 'inherit',
          cwd: process.cwd(),
        });
        return resume(Effect.void);
      } catch (err) {
        console.error('failure cloning template repo', { err });
        return resume(Effect.fail(new CloneRepoError({ cause: err })));
      }
    });

    const copyTempl = (src: string, dest: string): Effect.Effect<void, PlatformError.PlatformError> =>
      Effect.gen(function* () {
        // create the target directory
        yield* fs.makeDirectory(dest, { recursive: true });
        // read the cloned directory
        const entries = readdirSync(src, { withFileTypes: true });

        for (const entry of entries) {
          // Skip .git directory
          if (EffectString.startsWith('.git')(entry.name)) continue;

          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);

          if (entry.isDirectory()) {
            yield* copyTempl(srcPath, destPath);
          } else {
            yield* fs.copyFile(srcPath, destPath);
          }
        }
      });

    /**
     * Recursively processes all files in the src directory and replaces
     * "Address", "address", and "addresses" with the first schema type
     */
    const replaceAddressTerms = (
      directory: string,
      firstTypeName: string,
    ): Effect.Effect<void, PlatformError.PlatformError> =>
      Effect.gen(function* () {
        const srcPath = path.join(directory, 'src');
        const srcExists = yield* fs.exists(srcPath);

        if (!srcExists) {
          return; // No src directory to process
        }

        const processDirectory = (dirPath: string): Effect.Effect<void, PlatformError.PlatformError> =>
          Effect.gen(function* () {
            const entries = yield* fs.readDirectory(dirPath);

            for (const entry of entries) {
              const entryPath = path.join(dirPath, entry);
              const stat = yield* fs.stat(entryPath);

              if (stat.type === 'Directory') {
                // Recursively process subdirectories
                yield* processDirectory(entryPath);
              } else if (stat.type === 'File') {
                // Process files that are likely to contain code
                const fileExtension = path.extname(entry);
                const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte'];

                if (codeExtensions.includes(fileExtension)) {
                  yield* Effect.gen(function* () {
                    // Read file content
                    const content = yield* fs.readFileString(entryPath);

                    // Replace address-related terms with the first type name
                    const pascalCaseName = Utils.toPascalCase(firstTypeName);
                    const camelCaseName = Utils.toCamelCase(firstTypeName);
                    const pluralName = `${camelCaseName}s`; // Simple pluralization

                    const updatedContent = content
                      .replace(/\bAddress\b/g, pascalCaseName)
                      .replace(/\baddress\b/g, camelCaseName)
                      .replace(/\baddresses\b/g, pluralName);

                    // Write back the updated content
                    yield* fs.writeFileString(entryPath, updatedContent);
                  });
                }
              }
            }
          });

        yield* processDirectory(srcPath);
      });

    return {
      /**
       * Generate on the users machine, at the directory they provided,
       * a react + vitejs app with the generated schema defined in the payload.
       *
       * @todo allow for multiple templates to pull from
       * @todo allow user to specify package manager
       */
      codegen(app: Domain.InsertAppSchema) {
        return Effect.gen(function* () {
          const directory = app.directory || `./${app.name}`;
          const directoryExists = yield* fs.exists(directory);
          if (directoryExists) {
            // directory already exists, fail
            yield* new DirectoryExistsError({ directory });
          }

          // create the directory
          yield* fs.makeDirectory(directory, { recursive: true });

          /**
           * 1. clone the hypergraph-app-template repo
           * 2. copy it to the output directory from the app request
           * 3. update the package.json
           * 4. update the schema.ts
           * 5. update the mapping.ts
           * 6. replace the address terms with the first type name
           * 7. cleanup the .tmp directory
           */
          yield* cloneTemplRepo.pipe(
            Effect.tapErrorCause((cause) =>
              Console.error('failure cloning into hypergraph-app-template repo', { cause: Cause.pretty(cause) }),
            ),
            Effect.andThen(() => copyTempl(tmpDirectory, directory)),
            Effect.tapErrorCause((cause) =>
              Console.error('failure copying the cloned template repo into the directory', {
                cause: Cause.pretty(cause),
              }),
            ),
            Effect.andThen(() => updatePackageJson(app, directory)),
            Effect.andThen(() => fs.writeFileString(path.join(directory, 'src', 'schema.ts'), buildSchemaFile(app))),
            Effect.andThen(() => fs.writeFileString(path.join(directory, 'src', 'mapping.ts'), buildMappingFile(app))),
            Effect.andThen(() => replaceAddressTerms(directory, app.types[0]?.name || 'Address')),
            Effect.andThen(() => cleanup),
          );

          return { directory };
        });
      },
    } as const;
  }),
}) {}
export const SchemaGeneratorLayer = SchemaGenerator.Default;

export class DirectoryExistsError extends Data.TaggedError('/typesync/errors/DirectoryExistsError')<{
  readonly directory: string;
}> {}
export class NoPackageJsonFoundError extends Data.TaggedError('/typesync/errors/NoPackageJsonFoundError') {}
export class CloneRepoError extends Data.TaggedError('/typesync/errors/CloneRepoError')<{
  readonly cause: unknown;
}> {}

/**
 * @todo move this into separate template repos by type of template
 */

// --------------------
// package.json
// --------------------
/**
 * Validates and normalizes a package name according to npm rules
 * Uses the official npm package name regex:
 * "^(?:(?:@(?:[a-z0-9-*~][a-z0-9-*._~]*)?/[a-z0-9-._~])|[a-z0-9-~])[a-z0-9-._~]*$"
 *
 * @param name The proposed package name to validate
 * @returns An object with validity status, normalized name and error message if invalid
 */
function validatePackageName(name: string): {
  isValid: boolean;
  normalizedName: string;
  errorMessage?: string;
} {
  // Trim whitespace
  const normalizedName = name.trim();

  // Package name cannot be empty
  if (!normalizedName) {
    return {
      isValid: false,
      normalizedName: '',
      errorMessage: 'Package name cannot be empty',
    };
  }

  // Package name length constraints (npm limits to 214 chars)
  if (normalizedName.length > 214) {
    return {
      isValid: false,
      normalizedName,
      errorMessage: 'Package name cannot exceed 214 characters',
    };
  }

  // Use the official npm package name regex
  const npmPackageNameRegex = /^(?:(?:@(?:[a-z0-9-*~][a-z0-9-*._~]*)?\/[a-z0-9-._~])|[a-z0-9-~])[a-z0-9-._~]*$/;

  // If the name already matches the regex, it's valid
  if (npmPackageNameRegex.test(normalizedName)) {
    return {
      isValid: true,
      normalizedName,
    };
  }

  // Name is invalid, let's try to normalize it

  // Convert to lowercase (package names cannot contain uppercase)
  let suggestedName = normalizedName.toLowerCase();

  // Handle scoped packages (@username/package-name)
  const isScopedPackage = suggestedName.startsWith('@');

  if (isScopedPackage) {
    const parts = suggestedName.split('/');

    if (parts.length !== 2) {
      // Malformed scoped package, fix the structure
      const scopeName = parts[0].replace(/[^a-z0-9-*~]/g, '-').replace(/^@/, '@');
      const packageName = (parts[1] || 'package').replace(/[^a-z0-9-._~]/g, '-');
      suggestedName = `${scopeName}/${packageName}`;
    } else {
      // Fix each part of the scoped package
      const scopeName = parts[0].replace(/[^a-z0-9-*~@]/g, '-');
      const packageName = parts[1].replace(/[^a-z0-9-._~]/g, '-');
      suggestedName = `${scopeName}/${packageName}`;
    }
  } else {
    // Regular package (not scoped)

    // Remove invalid starting characters (only allow a-z, 0-9, tilde, hyphen)
    suggestedName = suggestedName.replace(/^[^a-z0-9-~]+/, '');

    if (suggestedName === '') {
      suggestedName = 'package'; // Default if nothing valid remains
    }

    // Replace invalid characters with hyphens
    suggestedName = suggestedName.replace(/[^a-z0-9-._~]/g, '-');
  }

  // Test if our suggestion is valid
  if (!npmPackageNameRegex.test(suggestedName)) {
    // If still invalid, provide a simple fallback
    suggestedName = isScopedPackage ? '@user/package' : 'package';
  }

  return {
    isValid: false,
    normalizedName: suggestedName,
    errorMessage: `Invalid package name. Suggested alternative: ${suggestedName}`,
  };
}

// --------------------
// schema builder
// --------------------
function fieldToEntityString({
  name,
  dataType,
}: Domain.InsertAppSchema['types'][number]['properties'][number]): string {
  // Convert type to Entity type
  const entityType = (() => {
    switch (true) {
      case dataType === 'Text':
        return 'Type.Text';
      case dataType === 'Number':
        return 'Type.Number';
      case dataType === 'Checkbox':
        return 'Type.Checkbox';
      case dataType === 'Date':
        return 'Type.Date';
      case dataType === 'Point':
        return 'Type.Point';
      case Mapping.isDataTypeRelation(dataType):
        // renders the type as `Type.Relation(Entity)`
        return `Type.${dataType}`;
      default:
        // how to handle complex types
        return 'Type.Text';
    }
  })();
  // adds a tab before the property
  return `  ${Utils.toCamelCase(name)}: ${entityType}`;
}

function typeDefinitionToString(type: Domain.InsertAppSchema['types'][number]): string | null {
  if (!type.name) {
    return null;
  }
  const fields = type.properties.filter((_prop) => _prop.name != null && _prop.name.length > 0);
  if (fields.length === 0) {
    return null;
  }

  const fieldStrings = fields.map(fieldToEntityString);

  const name = Utils.toPascalCase(type.name);
  return `export class ${name} extends Entity.Class<${name}>('${name}')({
${fieldStrings.join(',\n')}
}) {}`;
}

function buildSchemaFile(schema: Domain.InsertAppSchema) {
  const importStatement = `import { Entity, Type } from '@graphprotocol/hypergraph';`;

  const typeDefinitions = schema.types
    .map(typeDefinitionToString)
    .filter((def) => def != null)
    .join('\n\n');
  return [importStatement, typeDefinitions].join('\n\n');
}

export function buildMappingFile(schema: Domain.InsertAppSchema) {
  const [mapping] = Mapping.generateMapping({
    types: schema.types,
  });

  // Import statements
  const imports = Doc.vsep([
    Doc.text("import { Id } from '@graphprotocol/grc-20';"),
    Doc.text("import type { Mapping } from '@graphprotocol/typesync/Mapping';"),
  ]);

  // Generate the mapping object - build it line by line for exact formatting
  const mappingLines = [Doc.text('export const mapping: Mapping = {')];

  for (const [typeName, typeData] of Object.entries(mapping)) {
    mappingLines.push(Doc.text(`  ${typeName}: {`));

    // Type IDs
    const typeIdsList = typeData.typeIds.map((id: string) => `Id.Id("${id}")`).join(', ');
    mappingLines.push(Doc.text(`    typeIds: [${typeIdsList}],`));

    // Properties
    const properties = Object.entries(typeData.properties ?? {});
    if (EffectArray.isNonEmptyArray(properties)) {
      mappingLines.push(Doc.text('    properties: {'));
      properties.forEach(([propName, propId], index, entries) => {
        const isLast = index === entries.length - 1;
        const comma = isLast ? '' : ',';
        mappingLines.push(Doc.text(`      ${propName}: Id.Id("${propId}")${comma}`));
      });
      mappingLines.push(Doc.text('    },'));
    }

    // Relations
    const relations = Object.entries(typeData.relations ?? {});
    if (EffectArray.isNonEmptyArray(relations)) {
      mappingLines.push(Doc.text('    relations: {'));
      relations.forEach(([relationName, relationId], index, entries) => {
        const isLast = index === entries.length - 1;
        const comma = isLast ? '' : ',';
        mappingLines.push(Doc.text(`      ${relationName}: Id.Id("${relationId}")${comma}`));
      });
      mappingLines.push(Doc.text('    },'));
    }

    mappingLines.push(Doc.text('  },'));
  }

  mappingLines.push(Doc.rbrace);

  const compiled = Doc.vcat([imports, Doc.empty, ...mappingLines]);

  return Doc.render(compiled, {
    style: 'pretty',
    options: { lineWidth: 120 },
  });
}
