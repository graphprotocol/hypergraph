import { Graph } from '@graphprotocol/grc-20';
import type { CodegenConfig } from '@graphql-codegen/cli';
import type { TypeScriptPluginConfig } from '@graphql-codegen/typescript';
import type { TypeScriptDocumentsPluginConfig } from '@graphql-codegen/typescript-operations';

interface PluginConfig extends TypeScriptPluginConfig, TypeScriptDocumentsPluginConfig {}

const pluginConfig = {
  arrayInputCoercion: false,
  enumsAsTypes: true,
  dedupeFragments: true,
  scalars: {
    UUID: 'string',
  },
} satisfies PluginConfig;

const config = {
  overwrite: true,
  generates: {
    './client/src/generated/': {
      schema: `${Graph.TESTNET_API_ORIGIN}/graphql`,
      documents: ['./client/src/**/*.{ts,tsx}'],
      preset: 'client',
      config: pluginConfig,
      presetConfig: {
        /**
         * We're not using fragments to colocate data requirements with components,
         * so fragment masking ends up causing a lot of unnecessary `unmask/useFragment` calls.
         * @see https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#embrace-fragment-masking-principles
         */
        fragmentMasking: false,
      },
    },
  },
} as const satisfies CodegenConfig;

export default config;
