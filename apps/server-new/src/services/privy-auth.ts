import { PrivyClient, type Wallet } from '@privy-io/server-auth';
import { Config, Context, Effect, Layer } from 'effect';
import { AuthenticationError, AuthorizationError, PrivyConfigError, PrivyTokenError } from '../http/errors.js';
import { DatabaseService } from './database.js';

export interface PrivyAuthService {
  readonly verifyPrivyToken: (idToken: string) => Effect.Effect<string, PrivyTokenError | PrivyConfigError>;
  readonly isSignerForAccount: (
    signerAddress: string,
    accountAddress: string,
  ) => Effect.Effect<boolean, AuthorizationError>;
  readonly authenticateRequest: (
    idToken: string | undefined,
    accountAddress: string,
  ) => Effect.Effect<void, AuthenticationError | AuthorizationError | PrivyConfigError | PrivyTokenError>;
}

export const PrivyAuthService = Context.GenericTag<PrivyAuthService>('PrivyAuthService');

export const makePrivyAuthService = Effect.fn(function* () {
  const { client } = yield* DatabaseService;

  const privyAppId = yield* Config.string('PRIVY_APP_ID').pipe(Config.orElse(() => Config.succeed('')));
  const privyAppSecret = yield* Config.string('PRIVY_APP_SECRET').pipe(Config.orElse(() => Config.succeed('')));

  const verifyPrivyToken = (idToken: string) =>
    Effect.fn(function* () {
      if (!privyAppId || !privyAppSecret) {
        yield* new PrivyConfigError({ message: 'Missing Privy configuration' });
      }

      const privy = new PrivyClient(privyAppId, privyAppSecret);

      const user = yield* Effect.tryPromise({
        try: () => privy.getUser({ idToken }),
        catch: (error) =>
          new PrivyTokenError({
            message: `Invalid Privy token: ${error}`,
          }),
      });

      if (!user) {
        return yield* Effect.fail(new PrivyTokenError({ message: 'Invalid Privy user' }));
      }

      const wallet = user.linkedAccounts.find(
        (account) => account.type === 'wallet' && account.walletClientType === 'privy',
      ) as Wallet | undefined;

      if (!wallet) {
        return yield* Effect.fail(new PrivyTokenError({ message: 'No Privy wallet found' }));
      }

      return wallet.address;
    })();

  const isSignerForAccount = (signerAddress: string, accountAddress: string) =>
    Effect.fn(function* () {
      const account = yield* Effect.tryPromise({
        try: () =>
          client.account.findUnique({
            where: {
              address: accountAddress,
            },
          }),
        catch: () =>
          new AuthorizationError({
            message: 'Failed to verify signer',
            accountAddress,
          }),
      });

      if (!account) {
        return yield* Effect.fail(
          new AuthorizationError({
            message: 'Account not found',
            accountAddress,
          }),
        );
      }

      const isAuthorized = account.connectSignerAddress === signerAddress;
      if (!isAuthorized) {
        yield* new AuthorizationError({
          message: 'Signer not authorized for account',
          accountAddress,
        });
      }

      return true;
    })();

  const authenticateRequest = (idToken: string | undefined, accountAddress: string) =>
    Effect.fn(function* () {
      if (!idToken) {
        return yield* Effect.fail(new AuthenticationError({ message: 'No Privy ID token provided' }));
      }

      const signerAddress = yield* verifyPrivyToken(idToken);
      yield* isSignerForAccount(signerAddress, accountAddress);
    })();

  return {
    verifyPrivyToken,
    isSignerForAccount,
    authenticateRequest,
  } as const;
})();

export const PrivyAuthServiceLive = Layer.effect(PrivyAuthService, makePrivyAuthService);
