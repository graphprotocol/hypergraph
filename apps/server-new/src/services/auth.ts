import { PrivyClient } from '@privy-io/server-auth';
import { Context, Effect, Layer, Redacted } from 'effect';
import * as Config from '../config/privy.js';

/**
 * Auth service interface
 */
export interface AuthService {
  readonly privy: PrivyClient;
  readonly verifyAuthToken: (token: string) => Effect.Effect<{ userId: string }, Error>;
  readonly verifySessionToken: (token: string) => Effect.Effect<{ address: string }, Error>;
}

/**
 * Auth service tag
 */
export const AuthService = Context.GenericTag<AuthService>('AuthService');

/**
 * Auth service implementation
 */
export const makeAuthService = Effect.fn(function* () {
  const config = yield* Config.privyConfig();

  const privy = new PrivyClient(config.appId, Redacted.value(config.appSecret));

  const verifyAuthToken = Effect.fn(function* (token: string) {
    const user = yield* Effect.tryPromise({
      try: () => privy.getUser({ idToken: token }),
      catch: (error) => new Error(`Failed to verify auth token: ${error}`),
    });

    if (!user) {
      yield* Effect.fail(new Error('User not found'));
    }

    return { userId: user.id };
  });

  const verifySessionToken = Effect.fn(function* (_token: string) {
    // TODO: Implement session token verification logic
    // This would typically involve:
    // 1. Decoding the JWT token
    // 2. Verifying the signature
    // 3. Checking expiration
    // 4. Extracting the address

    // For now, return a placeholder
    return { address: 'placeholder' };
  });

  return {
    privy,
    verifyAuthToken,
    verifySessionToken,
  } as const;
});

/**
 * Auth service layer
 */
export const AuthServiceLive = Layer.effect(AuthService, makeAuthService());
