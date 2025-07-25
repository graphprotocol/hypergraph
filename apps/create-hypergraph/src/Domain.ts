import * as Schema from 'effect/Schema';

export const ALWAYS_SKIP_DIRECTORIES = ['node_modules', '.git'];

export const AvailableFrameworkKey = Schema.Union(Schema.Literal('vite-react'), Schema.Literal('nextjs'));
export type AvailableFrameworkKey = typeof AvailableFrameworkKey.Type;
export const Framework = Schema.Record({
  key: AvailableFrameworkKey,
  value: Schema.Struct({
    directory: Schema.NonEmptyTrimmedString,
    skipDirectories: Schema.Set(Schema.NonEmptyTrimmedString),
  }),
});
export type Framework = typeof Framework.Type;

export const availableFrameworks = {
  'vite-react': {
    directory: 'template-vite-react',
    skipDirectories: new Set([...ALWAYS_SKIP_DIRECTORIES, '.tanstack', 'dist']),
  },
  nextjs: {
    directory: 'template-nextjs',
    skipDirectories: new Set([...ALWAYS_SKIP_DIRECTORIES, '.next', 'dist']),
  },
} as const satisfies Framework;
export const availableFrameworkKeys = Object.keys(availableFrameworks) as ReadonlyArray<AvailableFrameworkKey>;

export const PackageManager = ['pnpm', 'bun', 'yarn', 'npm'] as const;
export type PackageManager = (typeof PackageManager)[number];
