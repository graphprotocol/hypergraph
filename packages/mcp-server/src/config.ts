import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Effect } from 'effect';
import { z } from 'zod';
import { ConfigError } from './errors.js';

export const SpaceConfigSchema = z.object({
  name: z.string(),
  id: z.string(),
  description: z.string(),
});

export const ConfigSchema = z.object({
  endpoint: z.string().url(),
  spaces: z.array(SpaceConfigSchema).min(1),
});

export type SpacesConfig = z.infer<typeof ConfigSchema>;
export type SpaceConfig = z.infer<typeof SpaceConfigSchema>;

export const loadConfig = (
  configPath: string = resolve(import.meta.dirname, '..', 'config', 'spaces.json'),
): Effect.Effect<SpacesConfig, ConfigError> =>
  Effect.try({
    try: () => {
      const raw = readFileSync(configPath, 'utf-8');
      const json: unknown = JSON.parse(raw);
      return ConfigSchema.parse(json);
    },
    catch: () =>
      new ConfigError({
        message: 'Failed to load configuration. Ensure config file exists and is valid JSON.',
      }),
  });
