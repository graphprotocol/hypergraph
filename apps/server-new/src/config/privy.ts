import { Config, Effect } from 'effect';
import { PrivyConfigError } from '../http/errors.js';

/**
 * Privy configuration
 */
export const privyAppIdConfig = Config.string('PRIVY_APP_ID');
export const privyAppSecretConfig = Config.redacted('PRIVY_APP_SECRET');

/**
 * Load and validate Privy configuration
 */
export const privyConfig = Effect.fn(function* () {
  const appId = yield* privyAppIdConfig;
  const appSecret = yield* privyAppSecretConfig;

  if (!appId || !appSecret) {
    return yield* Effect.fail(new PrivyConfigError({ message: 'Missing Privy configuration' }));
  }

  return {
    appId,
    appSecret,
  };
});
