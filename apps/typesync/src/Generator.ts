import { execSync } from 'node:child_process';
import * as fsSync from 'node:fs';
import * as nodePath from 'node:path';
import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem';
import * as FileSystem from '@effect/platform/FileSystem';
import * as Path from '@effect/platform/Path';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';

import * as Domain from '../domain/Domain.js';
import * as Utils from './Utils.js';

export class SchemaGenerator extends Effect.Service<SchemaGenerator>()('/typesync/services/Generator', {
  dependencies: [NodeFileSystem.layer],
  effect: Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

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
          // check directory
          /**
           * Decide where to place the new application.
           * If the caller explicitly provides `app.directory` we respect it.
           * Otherwise, we always create the application inside the repository-root
           * `apps` folder so it shows up next to `connect`, `events`, etc.
           */

          // 1. Locate the repo root by walking up until we find `pnpm-workspace.yaml`
          const findRepoRoot = (start: string): string => {
            let dir = start;
            while (true) {
              if (fsSync.existsSync(nodePath.join(dir, 'pnpm-workspace.yaml'))) return dir;
              const parent = nodePath.dirname(dir);
              if (parent === dir) return start; // Fallback if we can't find it
              dir = parent;
            }
          };

          const repoRoot = findRepoRoot(process.cwd());

          const directory = app.directory?.length ? app.directory : nodePath.join(repoRoot, 'apps', app.name);
          const directoryExists = yield* fs.exists(directory);
          if (directoryExists) {
            // directory already exists, fail
            yield* new DirectoryExistsError({ directory });
          }

          // create the directory
          yield* fs.makeDirectory(directory, { recursive: true });
          // generate root level files
          yield* Effect.all([
            fs.writeFileString(path.join(directory, 'package.json'), JSON.stringify(generatePackageJson(app), null, 2)),
            fs.writeFileString(path.join(directory, 'tsconfig.app.json'), JSON.stringify(tsconfigAppJson, null, 2)),
            fs.writeFileString(path.join(directory, 'tsconfig.node.json'), JSON.stringify(tsconfigNodeJson, null, 2)),
            fs.writeFileString(path.join(directory, 'tsconfig.json'), JSON.stringify(tsconfigJson, null, 2)),
            fs.writeFileString(path.join(directory, '.gitignore'), gitignore),
            fs.writeFileString(path.join(directory, 'eslint.config.mjs'), eslintConfigMjs),
            fs.writeFileString(path.join(directory, '.prettierrc'), JSON.stringify(prettierrc, null, 2)),
            fs.writeFileString(path.join(directory, '.prettierignore'), prettierignore),
            fs.writeFileString(path.join(directory, 'vite.config.ts'), viteConfigTs),
            fs.writeFileString(path.join(directory, 'index.html'), indexHtml(app.name)),
          ]);
          // create the src directory inside
          yield* fs.makeDirectory(path.join(directory, 'src'));
          yield* fs.makeDirectory(path.join(directory, 'src', 'routes'));

          // create the src files
          yield* Effect.all([
            fs.writeFileString(path.join(directory, 'src', 'index.css'), indexcss),
            fs.writeFileString(path.join(directory, 'src', 'main.tsx'), mainTsx),
            fs.writeFileString(path.join(directory, 'src', 'vite-env.d.ts'), vitEnvDTs),
            fs.writeFileString(path.join(directory, 'src', 'schema.ts'), buildSchemaFile(app)),
            fs.writeFileString(path.join(directory, 'src', 'routes', '__root.tsx'), rootRouteTsx),
            fs.writeFileString(path.join(directory, 'src', 'routes', 'index.tsx'), indexRouteTsx),
          ]);

          // -----------------------------
          // Post-generation helpers
          // 1. Add the new directory to pnpm-workspace.yaml
          // 2. Run `pnpm install` inside the new directory so deps are ready
          // 3. Run `pnpm install` at repo root to update lockfile/hoist
          // -----------------------------

          const workspaceFile = nodePath.join(repoRoot, 'pnpm-workspace.yaml');
          const workspaceExists = yield* fs.exists(workspaceFile);
          if (workspaceExists) {
            const current = yield* fs.readFileString(workspaceFile);
            const lines = current.split('\n');

            const relPackagePath = nodePath.relative(repoRoot, directory);
            const newPackageLine = `  - ${relPackagePath}`;
            const alreadyExists = lines.some((line) => line.trim() === newPackageLine.trim());

            if (!alreadyExists) {
              const packagesLineIndex = lines.findIndex((line) => line.startsWith('packages:'));

              if (packagesLineIndex !== -1) {
                let lastPackageLineIndex = packagesLineIndex;
                for (let i = packagesLineIndex + 1; i < lines.length; i++) {
                  if (lines[i].trim().startsWith('- ')) {
                    lastPackageLineIndex = i;
                  } else if (lines[i].trim() !== '') {
                    break;
                  }
                }
                lines.splice(lastPackageLineIndex + 1, 0, newPackageLine);
                const updated = lines.join('\n');
                yield* fs.writeFileString(workspaceFile, updated);
              }
            }
          }

          // helper to run a shell command synchronously (cross-platform)
          const run = (cmd: string, cwd?: string) =>
            Effect.sync(() => {
              try {
                execSync(cmd, { stdio: 'inherit', cwd });
              } catch {
                throw new Error(`command failed (${cmd})`);
              }
            });

          // install deps within the new app folder
          yield* run('pnpm install', directory);
          // update lockfile/hoist at repo root
          yield* run('pnpm install');

          return { directory };
        });
      },
    } as const;
  }),
}) {}
export const SchemaGeneratorLayer = SchemaGenerator.Default;

export class DirectoryExistsError extends Data.TaggedError('DirectoryExistsError')<{
  readonly directory: string;
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
function generatePackageJson(app: Domain.InsertAppSchema) {
  const validatedPackageName = validatePackageName(app.name);
  const name = validatedPackageName.normalizedName;

  return {
    name,
    description: app.description,
    version: 'v1.0.0',
    type: 'module',
    scripts: {
      build: 'tsc -b && vite build',
      dev: 'vite --force',
      preview: 'vite preview',
      typecheck: 'tsc --noEmit',
    },
    dependencies: {
      '@automerge/automerge': '^2.2.9',
      '@automerge/automerge-repo': '=2.0.0-beta.5',
      '@automerge/automerge-repo-react-hooks': '=2.0.0-beta.5',
      '@graphprotocol/hypergraph': 'https://pkg.pr.new/graphprotocol/hypergraph/@graphprotocol/hypergraph@82b867a',
      '@graphprotocol/hypergraph-react':
        'https://pkg.pr.new/graphprotocol/hypergraph/@graphprotocol/hypergraph-react@82b867a',
      '@privy-io/react-auth': '^2.13.7',
      '@tailwindcss/vite': '^4.1.8',
      '@tanstack/react-query': '^5.79.2',
      '@tanstack/react-query-devtools': '^5.79.2',
      '@tanstack/react-router': '^1.120.15',
      '@tanstack/react-router-devtools': '^1.120.15',
      effect: '^3.16.3',
      react: '^19.1.0',
      'react-dom': '^19.1.0',
      tailwindcss: '^4.1.8',
      vite: '^6.3.5',
    },
    devDependencies: {
      '@eslint/js': '^9.28.0',
      '@tanstack/router-plugin': '^1.116.1',
      '@types/node': '^22.14.1',
      '@types/react': '^19.1.6',
      '@types/react-dom': '^19.1.5',
      '@vitejs/plugin-react': '^4.3.4',
      eslint: '^9.28.0',
      'eslint-plugin-react-hooks': '^5.2.0',
      'eslint-plugin-react-refresh': '^0.4.19',
      globals: '^16.0.0',
      prettier: '^3.5.3',
      typescript: '~5.8.3',
      'typescript-eslint': '^8.29.1',
    },
  };
}

// --------------------
// tsconfig
// --------------------
const tsconfigAppJson = {
  compilerOptions: {
    tsBuildInfoFile: './node_modules/.tmp/tsconfig.app.tsbuildinfo',
    target: 'ESNext',
    useDefineForClassFields: true,
    lib: ['ESNext', 'DOM', 'DOM.Iterable'],
    module: 'ESNext',
    skipLibCheck: true,

    /* Bundler mode */
    moduleResolution: 'bundler',
    allowImportingTsExtensions: true,
    isolatedModules: true,
    moduleDetection: 'force',
    noEmit: true,
    jsx: 'react-jsx',

    /* Linting */
    strict: true,
    strictNullChecks: true,
    exactOptionalPropertyTypes: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noFallthroughCasesInSwitch: true,
    noUncheckedSideEffectImports: true,
    composite: true,
    downlevelIteration: true,
    resolveJsonModule: true,
    esModuleInterop: true,
    declaration: true,
    sourceMap: true,
    declarationMap: true,
    noImplicitReturns: false,
    noEmitOnError: false,
    noErrorTruncation: false,
    allowJs: false,
    checkJs: false,
    forceConsistentCasingInFileNames: true,
    noImplicitAny: true,
    noImplicitThis: true,
    noUncheckedIndexedAccess: false,

    baseUrl: '.',
    paths: {
      '@/*': ['./src/*'],
    },
  },
  include: ['src'],
};
const tsconfigNodeJson = {
  compilerOptions: {
    tsBuildInfoFile: './node_modules/.tmp/tsconfig.node.tsbuildinfo',
    target: 'ESNext',
    lib: ['ESNext'],
    module: 'ESNext',
    skipLibCheck: true,

    /* Bundler mode */
    moduleResolution: 'bundler',
    allowImportingTsExtensions: true,
    isolatedModules: true,
    moduleDetection: 'force',
    noEmit: true,

    /* Linting */
    strict: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noFallthroughCasesInSwitch: true,
    noUncheckedSideEffectImports: true,
  },
  include: ['vite.config.ts'],
};
const tsconfigJson = {
  files: [],
  references: [{ path: './tsconfig.app.json' }, { path: './tsconfig.node.json' }],
};

// --------------------
// linting + prettier
// --------------------
const eslintConfigMjs = `import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
`;
const prettierrc = {
  singleQuote: true,
  printWidth: 120,
};
const prettierignore = `
# Ignore artifacts:
build
dist
`;

// --------------------
// vite.config.ts
// --------------------
const viteConfigTs = `
import path from 'node:path';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
`;

// --------------------
// index.html
// --------------------
function indexHtml(appName: Domain.InsertAppSchema['name']) {
  return `<!DOCTYPE html>
<html
  lang="en"
  class="h-full min-h-screen w-full p-0 m-0 dark:bg-slate-950 dark:text-white bg-white text-gray-950 font-mono"
>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${appName}</title>
  </head>
  <body class="h-full w-full">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
  `;
}

// --------------------
// .gitignore
// --------------------
const gitignore = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`;

// --------------------
// src/
// --------------------

const indexcss = `
@tailwind base;
@tailwind components;
@tailwind utilities;
`;

const vitEnvDTs = `/// <reference types="vite/client" />
`;

const mainTsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import './index.css';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById('root');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}
`;

const rootRouteTsx = `import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <h1 className="text-2xl font-bold mb-4">My Hypergraph App</h1>
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  ),
});
`;

const indexRouteTsx = `import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div className="p-2">
      <h3 className="text-xl">Welcome Home!</h3>
      <p className="mt-2">This is your new application generated by Typesync.</p>
    </div>
  );
}
`;

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

  return `${Utils.toCamelCase(name)}: ${entityType}`;
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
  const importStatement = `import { Entity, Type } from '@graphprotocol/hypergraph';\nimport * as Schema from 'effect/Schema';`;
  const typeDefinitions = schema.types
    .map(typeDefinitionToString)
    .filter((def) => def != null)
    .join('\n\n');
  return [importStatement, typeDefinitions].join('\n\n');
}
