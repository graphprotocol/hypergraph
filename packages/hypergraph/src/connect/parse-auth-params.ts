import * as Effect from 'effect/Effect';
import * as Either from 'effect/Either';
import * as Schema from 'effect/Schema';
import { ConnectAuthPayload, FailedToParseConnectAuthUrl } from '../types.js';

type ParseAuthUrlParams = {
  data: unknown;
  redirect: string;
  nonce: string;
};

const decodePayload = Schema.decodeEither(ConnectAuthPayload);

export const parseAuthParams = (
  params: ParseAuthUrlParams,
): Effect.Effect<{ payload: ConnectAuthPayload; redirect: string; nonce: string }, FailedToParseConnectAuthUrl> => {
  const { data, redirect, nonce } = params;
  if (!data || !redirect || !nonce) {
    return Effect.fail(new FailedToParseConnectAuthUrl({ message: 'Missing data or redirect in callback URL' }));
  }

  if (nonce.length !== 64) {
    return Effect.fail(new FailedToParseConnectAuthUrl({ message: 'Invalid nonce' }));
  }

  try {
    console.log('data', data);
    const result = decodePayload(data as ConnectAuthPayload);

    if (Either.isLeft(result)) {
      return Effect.fail(new FailedToParseConnectAuthUrl({ message: 'Failed to parse connect auth payload' }));
    }

    return Effect.succeed({ payload: result.right, redirect, nonce });
  } catch (_error) {
    return Effect.fail(new FailedToParseConnectAuthUrl({ message: 'Failed to parse connect auth payload' }));
  }
};
