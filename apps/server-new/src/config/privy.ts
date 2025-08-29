import { Config } from 'effect';

/**
 * Privy configuration
 */
export const privyAppIdConfig = Config.string('PRIVY_APP_ID');
export const privyAppSecretConfig = Config.redacted('PRIVY_APP_SECRET');

/**
 * Load and validate Privy configuration
 */
export const privyConfig = Config.all({
  appId: privyAppIdConfig,
  appSecret: privyAppSecretConfig,
});
