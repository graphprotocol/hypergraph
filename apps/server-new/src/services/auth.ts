import { PrivyClient } from '@privy-io/server-auth';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Redacted from 'effect/Redacted';
import * as Config from '../config/privy.js';

/**
 * Auth service tag
 */
export class AuthService extends Context.Tag('AuthService')<
  AuthService,
  {
    readonly privy: PrivyClient;
    readonly verifyAuthToken: (token: string) => Effect.Effect<{ userId: string }, Error>;
    readonly verifySessionToken: (token: string) => Effect.Effect<{ address: string }, Error>;
  }
>() {}

/**
 * Auth service implementation
 */
export const makeAuthService = Effect.fn('makeAuthService')(function* () {
  const config = yield* Config.privyConfig;
  const privy = new PrivyClient(config.appId, Redacted.value(config.appSecret));

  const verifyAuthToken = Effect.fn('verifyAuthToken')(function* (token: string) {
    const user = yield* Effect.tryPromise({
      try: () => privy.getUser({ idToken: token }),
      catch: (error) => new Error(`Failed to verify auth token: ${error}`),
    });

    if (!user) {
      return yield* Effect.fail(new Error('User not found'));
    }

    return { userId: user.id };
  });

  const verifySessionToken = Effect.fn('verifySessionToken')((_token: string) => {
    // TODO: Implement session token verification logic
    // This would typically involve:
    // 1. Decoding the JWT token
    // 2. Verifying the signature
    // 3. Checking expiration
    // 4. Extracting the address

    // For now, return a placeholder
    return Effect.succeed({ address: 'placeholder' });
  });

  return {
    privy,
    verifyAuthToken,
    verifySessionToken,
  };
});

/**
 * Auth service layer
 */
export const AuthServiceLive = Layer.effect(AuthService, makeAuthService());
