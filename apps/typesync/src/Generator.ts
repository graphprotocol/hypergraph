import { execSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { FileSystem, Path, type Error as PlatformError } from '@effect/platform';
import { NodeFileSystem } from '@effect/platform-node';
import { Cause, Console, Data, Effect, String as EffectString } from 'effect';

import * as Domain from '../domain/Domain.js';
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
           * 5. cleanup the .tmp directory
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
      case dataType === 'Boolean':
        return 'Type.Boolean';
      case dataType === 'Date':
        return 'Type.Date';
      case dataType === 'Url':
        return 'Type.Url';
      case dataType === 'Point':
        return 'Type.Point';
      case Domain.isDataTypeRelation(dataType):
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
  const importStatement1 = `import { Id } from '@graphprotocol/grc-20';`;
  const importStatement2 = `import type { Mapping } from '@graphprotocol/hypergraph';`;

  const typeMappings: string[] = [];

  for (const type of schema.types) {
    const properties: string[] = [];
    const relations: string[] = [];

    // Process properties and relations
    for (const property of type.properties) {
      if (Domain.isDataTypeRelation(property.dataType)) {
        // This is a relation
        relations.push(`      ${Utils.toCamelCase(property.name)}: Id.Id('${property.knowledgeGraphId}')`);
      } else {
        // This is a regular property
        properties.push(`      ${Utils.toCamelCase(property.name)}: Id.Id('${property.knowledgeGraphId}')`);
      }
    }

    const typeMapping = `  ${type.name}: {
    typeIds: [Id.Id('${type.knowledgeGraphId}')],
    properties: {
${properties.join(',\n')},
    },${
      relations.length > 0
        ? `
    relations: {
${relations.join(',\n')},
    },`
        : ''
    }
  }`;

    typeMappings.push(typeMapping);
  }

  const mappingString = `export const mapping: Mapping = {
${typeMappings.join(',\n')},
};`;

  return [importStatement1, importStatement2, '', mappingString].join('\n');
}
