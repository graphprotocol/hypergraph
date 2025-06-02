import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem';
import * as FileSystem from '@effect/platform/FileSystem';
import * as Path from '@effect/platform/Path';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';

import type * as Domain from './Domain.js';

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
          /** @todo solve directory pathing */
          let directory = app.directory;
          if (!directory) {
            directory = `./${app.name}`;
          }
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

          // create the src files
          yield* Effect.all([
            fs.writeFileString(path.join(directory, 'src', 'index.css'), indexcss),
            fs.writeFileString(path.join(directory, 'src', 'main.tsx'), mainTsx),
            fs.writeFileString(path.join(directory, 'src', 'App.tsx'), appTsx),
            fs.writeFileString(path.join(directory, 'src', 'vite-env.d.ts'), vitEnvDTs),
            fs.writeFileString(path.join(directory, 'src', 'schema.ts'), buildSchemaFile(app)),
          ]);

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
      '@automerge/automerge': '^v2.2.9-alpha.3',
      '@automerge/automerge-repo': '^2.0.0-alpha.14',
      '@automerge/automerge-repo-react-hooks': '^2.0.0-alpha.14',
      '@graphprotocol/hypergraph': '^v0.0.0-alpha',
      '@graphprotocol/hypergraph-react': '^v0.0.0-alpha',
      '@privy-io/react-auth': '^2.8.3',
      '@tailwindcss/vite': '^4.1.3',
      '@tanstack/react-query': '^5.74.0',
      '@tanstack/react-query-devtools': '^5.74.0',
      '@tanstack/react-router': '^1.116.0',
      effect: '^3.14.8',
      react: '^19.1.0',
      'react-dom': '^19.1.0',
      tailwindcss: '^4.1.3',
      vite: '^6.2.6',
    },
    devDependencies: {
      '@eslint/js': '^9.24.0',
      '@tanstack/react-router-devtools': '^1.116.0',
      '@tanstack/router-plugin': '^1.116.1',
      '@types/node': '^22.14.1',
      '@types/react': '^19.1.1',
      '@types/react-dom': '^19.1.2',
      '@vitejs/plugin-react': '^4.3.4',
      eslint: '^9.24.0',
      'eslint-plugin-react-hooks': '^5.2.0',
      'eslint-plugin-react-refresh': '^0.4.19',
      globals: '^16.0.0',
      prettier: '^3.5.3',
      typescript: '~5.8.3',
      'typescript-eslint': '^8.29.1',
      'vite-plugin-node-polyfills': '^0.23.0',
      'vite-plugin-top-level-await': '^1.5.0',
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
const prettierignore = 'dist/';

// --------------------
// vite.config.ts
// --------------------
const viteConfigTs = `
import path from 'node:path';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import topLevelAwait from 'vite-plugin-top-level-await';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    topLevelAwait(),
    TanStackRouterVite(),
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
      },
    }),
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
function indexHtml(appName: Domain.AppSchema['name']) {
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

const indexcss = `@import "tailwindcss";`;

const vitEnvDTs = `/// <reference types="vite/client" />`;

const appTsx = `export default function App() {
  return (
    <div className="flex flex-col gap-y-8 h-full items-center justify-center py-16">
      <h1>Vite + React + Hypergraph starter</h1>

      <p>Import schema from '@/schema'</p>
    </div>
  )
}
`;

const mainTsx = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`;

// --------------------
// schema builder
// --------------------
function fieldToEntityString({
  name,
  type_name,
  nullable = false,
  optional = false,
  description,
}: Domain.InsertAppSchema['types'][number]['properties'][number]): string {
  // Add JSDoc comment if description exists
  const jsDoc = description ? `  /** ${description} */\n` : '';

  // Convert type to Entity type
  const entityType = (() => {
    switch (type_name) {
      case 'Text':
        return 'Entity.Text';
      case 'Number':
        return 'Entity.Number';
      case 'Checkbox':
        return 'Entity.Checkbox';
      default:
        // how to handle complex types
        return 'Entity.Text';
    }
  })();

  let derivedEntityType = entityType;
  if (optional) {
    derivedEntityType = `Schema.NullishOr(${derivedEntityType})`;
  } else if (nullable) {
    derivedEntityType = `Schema.NullOr(${entityType})`;
  }

  return `${jsDoc}  ${name}: ${derivedEntityType}`;
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

  const capitalizedName = type.name.charAt(0).toUpperCase() + type.name.slice(1);
  return `class ${capitalizedName} extends Entity.Class<${capitalizedName}>('${capitalizedName}')({
${fieldStrings.join(',\n')}
}) {}`;
}

function buildSchemaFile(schema: Domain.InsertAppSchema) {
  const importStatement = `import * as Entity from '@graphprotocol/hypergraph/Entity';\nimport * as Schema from 'effect/Schema';`;
  const typeDefinitions = schema.types
    .map(typeDefinitionToString)
    .filter((def) => def != null)
    .join('\n\n');
  return [importStatement, typeDefinitions].join('\n\n');
}
