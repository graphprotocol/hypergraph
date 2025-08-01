import { Config } from 'effect';

/**
 * Database configuration
 */
export const databaseUrlConfig = Config.string('DATABASE_URL').pipe(Config.withDefault('file:./dev.db'));
