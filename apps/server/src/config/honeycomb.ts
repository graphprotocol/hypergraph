import { Config } from 'effect';

/**
 * Honeycomb configuration
 */
export const honeycombApiKeyConfig = Config.redacted('HONEYCOMB_API_KEY').pipe(Config.option);
