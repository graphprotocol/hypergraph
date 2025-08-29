import { PrivyClient, type Wallet } from '@privy-io/server-auth';
import { Config, Context, Effect, Layer } from 'effect';
import * as Predicate from 'effect/Predicate';
import { AuthenticationError, AuthorizationError, PrivyConfigError, PrivyTokenError } from '../http/errors.js';
import * as DatabaseService from './database.js';

export class PrivyAuthService extends Context.Tag('PrivyAuthService')<
  PrivyAuthService,
  {
    readonly verifyPrivyToken: (idToken: string) => Effect.Effect<string, PrivyTokenError | PrivyConfigError>;
    readonly isSignerForAccount: (
      signerAddress: string,
      accountAddress: string,
    ) => Effect.Effect<boolean, AuthorizationError | DatabaseService.DatabaseError>;
    readonly authenticateRequest: (
      idToken: string | undefined,
      accountAddress: string,
    ) => Effect.Effect<
      void,
      AuthenticationError | AuthorizationError | PrivyConfigError | PrivyTokenError | DatabaseService.DatabaseError
    >;
  }
>() {}

export const layer = Effect.gen(function* () {
  const { use } = yield* DatabaseService.DatabaseService;

  const privyAppId = yield* Config.string('PRIVY_APP_ID').pipe(Config.orElse(() => Config.succeed('')));
  const privyAppSecret = yield* Config.string('PRIVY_APP_SECRET').pipe(Config.orElse(() => Config.succeed('')));

  const verifyPrivyToken = Effect.fn('verifyPrivyToken')(function* (idToken: string) {
    if (!privyAppId || !privyAppSecret) {
      return yield* new PrivyConfigError({ message: 'Missing Privy configuration' });
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
  });

  const isSignerForAccount = Effect.fn('isSignerForAccount')(function* (signerAddress: string, accountAddress: string) {
    const account = yield* use((client) =>
      client.account.findUnique({
        where: {
          address: accountAddress,
        },
      }),
    ).pipe(
      Effect.filterOrFail(
        Predicate.isNotNull,
        () =>
          new AuthorizationError({
            message: 'Account not found',
            accountAddress,
          }),
      ),
    );

    const isAuthorized = account.connectSignerAddress === signerAddress;
    if (!isAuthorized) {
      return yield* new AuthorizationError({
        message: 'Signer not authorized for account',
        accountAddress,
      });
    }

    return true;
  });

  const authenticateRequest = Effect.fn('authenticateRequest')(function* (
    idToken: string | undefined,
    accountAddress: string,
  ) {
    if (!idToken) {
      return yield* Effect.fail(new AuthenticationError({ message: 'No Privy ID token provided' }));
    }

    const signerAddress = yield* verifyPrivyToken(idToken);
    yield* isSignerForAccount(signerAddress, accountAddress);
  });

  return {
    verifyPrivyToken,
    isSignerForAccount,
    authenticateRequest,
  };
}).pipe(Layer.effect(PrivyAuthService), Layer.provide(DatabaseService.layer));
