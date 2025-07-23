import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from '@effect/vitest';
import { Effect } from 'effect';
import { execaCommandSync } from 'execa';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const CLI_PATH = resolve(__dirname, '../src/bin.ts');

const projectName = 'test-app';
const testDir = join(tmpdir(), 'create-hypergraph-test-');

const run = (args: Array<string>, cwd?: string) => {
  return Effect.sync(() => {
    const fullCommand = `pnpx tsx ${CLI_PATH} ${args.join(' ')}`;
    const result = execaCommandSync(fullCommand, { cwd, env: { ...process.env, NODE_ENV: 'development' } });
    return result.stdout;
  });
};

const runExpectError = (args: Array<string>, cwd?: string) => {
  return Effect.sync(() => {
    const fullCommand = `pnpx tsx ${CLI_PATH} ${args.join(' ')}`;
    try {
      const result = execaCommandSync(fullCommand, { cwd, reject: false, env: { ...process.env, NODE_ENV: 'development' } });
      return { stdout: result.stdout, stderr: result.stderr, exitCode: result.exitCode };
      // biome-ignore lint/suspicious/noExplicitAny: error
    } catch (error: any) {
      return { stdout: error.stdout || '', stderr: error.stderr || '', exitCode: error.exitCode || 1 };
    }
  });
};

const cleanupTestDirs = () => {
  return Effect.sync(() => {
    const tmpDirContents = readdirSync(tmpdir());
    tmpDirContents.forEach((file) => {
      if (file.startsWith('create-hypergraph-test-')) {
        rmSync(join(tmpdir(), file), { recursive: true, force: true });
      }
    });
  });
};

const createTempDir = () => {
  return Effect.sync(() => mkdtempSync(testDir));
};

const cleanupTempDir = (tempDir: string) => {
  return Effect.sync(() => {
    if (tempDir && existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
};

describe('create-hypergraph CLI', () => {
  it.effect('happy path - scaffolds app with all options provided', () =>
    Effect.gen(function* () {
      // Clean up any previous test directories
      yield* cleanupTestDirs();

      // Create a fresh temp directory for this test
      const tempDir = yield* createTempDir();

      try {
        // Run the CLI with all options provided
        const output = yield* run(
          [
            '--template',
            'vite-react',
            '--package-manager',
            'pnpm',
            '--skip-install-deps',
            '--skip-initialize-git',
            projectName,
          ],
          tempDir,
        );

        // Verify the output contains success message
        expect(output).toContain('Successfully scaffolded your hypergraph enabled app');

        // Verify the project directory was created
        const projectPath = join(tempDir, projectName);
        expect(existsSync(projectPath)).toBe(true);

        // Verify expected files/directories exist
        const expectedFiles = [
          'package.json',
          'tsconfig.json',
          'vite.config.ts',
          'index.html',
          'src/main.tsx',
          'src/index.css',
          'src/schema.ts',
          'src/mapping.ts',
        ];

        expectedFiles.forEach((file) => {
          const filePath = join(projectPath, file);
          expect(existsSync(filePath)).toBe(true);
        });

        // Verify package.json exists and has a valid name
        const packageJsonPath = join(projectPath, 'package.json');
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        // The CLI normalizes the package name, so just verify it's not empty
        expect(packageJson.name).toBeTruthy();
        expect(typeof packageJson.name).toBe('string');

        // Verify no .git directory exists (since we skipped git init)
        expect(existsSync(join(projectPath, '.git'))).toBe(false);

        // Verify no node_modules exists (since we skipped install)
        expect(existsSync(join(projectPath, 'node_modules'))).toBe(false);
      } finally {
        // Clean up the temp directory
        yield* cleanupTempDir(tempDir);
      }
    }),
  );

  it.effect('error - invalid app name with capital letters', () =>
    Effect.gen(function* () {
      yield* cleanupTestDirs();
      const tempDir = yield* createTempDir();

      try {
        const result = yield* runExpectError(
          [
            '--template',
            'vite-react',
            '--skip-install-deps',
            '--skip-initialize-git',
            'MyApp', // Capital letters not allowed
          ],
          tempDir,
        );

        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain('Project name must not contain capital letters');
      } finally {
        yield* cleanupTempDir(tempDir);
      }
    }),
  );

  it.effect('error - invalid app name starting with underscore', () =>
    Effect.gen(function* () {
      yield* cleanupTestDirs();
      const tempDir = yield* createTempDir();

      try {
        const result = yield* runExpectError(
          [
            '--template',
            'vite-react',
            '--skip-install-deps',
            '--skip-initialize-git',
            '_myapp', // Starting with underscore not allowed
          ],
          tempDir,
        );

        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain('Project name must not start with an underscore');
      } finally {
        yield* cleanupTempDir(tempDir);
      }
    }),
  );

  it.effect('error - non-empty directory already exists', () =>
    Effect.gen(function* () {
      yield* cleanupTestDirs();
      const tempDir = yield* createTempDir();

      try {
        // Create the project directory and add a file to make it non-empty
        const projectPath = join(tempDir, projectName);
        yield* Effect.sync(() => {
          mkdirSync(projectPath, { recursive: true });
          writeFileSync(join(projectPath, 'existing-file.txt'), 'content');
        });

        const result = yield* runExpectError(
          ['--template', 'vite-react', '--skip-install-deps', '--skip-initialize-git', projectName],
          tempDir,
        );

        expect(result.exitCode).not.toBe(0);
        expect(result.stderr).toContain("Path 'test-app' must not exist");
      } finally {
        yield* cleanupTempDir(tempDir);
      }
    }),
  );

  it.effect('test git initialization when not skipped', () =>
    Effect.gen(function* () {
      yield* cleanupTestDirs();
      const tempDir = yield* createTempDir();

      try {
        // Run CLI without skipping git initialization
        const output = yield* run(
          [
            '--template',
            'vite-react',
            '--package-manager',
            'pnpm',
            '--skip-install-deps',
            // Note: not skipping git init
            'test-git-app',
          ],
          tempDir,
        );

        expect(output).toContain('Successfully scaffolded your hypergraph enabled app');

        // Verify .git directory was created
        const projectPath = join(tempDir, 'test-git-app');
        expect(existsSync(join(projectPath, '.git'))).toBe(true);
      } finally {
        yield* cleanupTempDir(tempDir);
      }
    }),
  );

  it.effect(
    'test dependency installation when not skipped',
    () =>
      Effect.gen(function* () {
        yield* cleanupTestDirs();
        const tempDir = yield* createTempDir();

        try {
          // Run CLI without skipping dependency installation
          const output = yield* run(
            [
              '--template',
              'vite-react',
              '--package-manager',
              'pnpm',
              '--skip-initialize-git',
              // Note: not skipping install deps
              'test-deps-app',
            ],
            tempDir,
          );

          expect(output).toContain('Successfully scaffolded your hypergraph enabled app');

          // Verify node_modules directory was created
          const projectPath = join(tempDir, 'test-deps-app');
          expect(existsSync(join(projectPath, 'node_modules'))).toBe(true);
        } finally {
          yield* cleanupTempDir(tempDir);
        }
      }),
    { timeout: 60000 }, // 60 second timeout for dependency installation
  );
});
