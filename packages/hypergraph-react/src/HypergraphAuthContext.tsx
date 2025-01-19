'use client';

import * as Schema from 'effect/Schema';
import { type ReactNode, createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { SiweMessage } from 'siwe';
import type { Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { Identity, Messages, store } from '@graphprotocol/hypergraph';
import { type Address, getAddress } from 'viem';

export type HypergraphAuthCtx = {
  getSessionToken(): string | null;
  getAccountId(): string | null;
  getIdentity(): Identity.Identity | null;
  authenticated: boolean;
  login(): void;
  logout(): void;
  setIdentityAndSessionToken(account: Identity.Identity & { sessionToken: string }): void;
};

export const HypergraphAuthContext = createContext<HypergraphAuthCtx>({
  getAccountId() {
    return null;
  },
  getIdentity() {
    return null;
  },
  getSessionToken() {
    return null;
  },
  authenticated: false,
  login() {},
  logout() {},
  setIdentityAndSessionToken() {},
});

export function useHypergraphAuth() {
  return useContext<HypergraphAuthCtx>(HypergraphAuthContext);
}

export function useAuthenticated() {
  const ctx = useHypergraphAuth();
  return ctx.authenticated;
}
export function useHypergraphAccountId() {
  const ctx = useHypergraphAuth();
  return ctx.getAccountId();
}
export function useHypergraphIdentity() {
  const ctx = useHypergraphAuth();
  return ctx.getIdentity();
}
export function useHypergraphSessionToken() {
  const ctx = useHypergraphAuth();
  return ctx.getSessionToken();
}

export type HypergraphAuthProviderProps = Readonly<{
  storage: Identity.Storage;
  signer: Identity.Signer | null;
  syncServerUri?: string;
  chainId?: number;
  children: ReactNode;
}>;
// 1) a) Get session token from local storage, or
//    b) Auth with the sync server
// 2) a)Try to get identity from the sync server, or
//    b) If identity is not found, create a new identity
//      (and store it in the sync server)
export function HypergraphAuthProvider({
  storage,
  signer,
  syncServerUri = 'http://localhost:3030',
  chainId = 80451,
  children,
}: HypergraphAuthProviderProps) {
  const [authState, setAuthState] = useState<HypergraphAuthState>({
    authenticated: false,
    accountId: null,
    sessionToken: null,
    keys: null,
  });

  function prepareSiweMessage(address: Address, nonce: string) {
    return new SiweMessage({
      domain: window.location.host,
      address,
      statement: 'Sign in to Hypergraph',
      uri: window.location.origin,
      version: '1',
      chainId,
      nonce,
      expirationTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    }).prepareMessage();
  }

  async function getSessionNonce(accountId: string) {
    const nonceReq = { accountId } as const satisfies Messages.RequestLoginNonce;
    const res = await fetch(new URL('/login/nonce', syncServerUri), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nonceReq),
    });
    const decoded = Schema.decodeUnknownSync(Messages.ResponseLoginNonce)(await res.json());
    return decoded.sessionNonce;
  }

  async function identityExists(accountId: string) {
    const res = await fetch(new URL(`/identity?accountId=${accountId}`, syncServerUri), {
      method: 'GET',
    });
    return res.status === 200;
  }

  async function loginWithWallet(signer: Identity.Signer, accountId: Address) {
    const sessionToken = Identity.loadSyncServerSessionToken(storage, accountId);
    if (!sessionToken) {
      const sessionNonce = await getSessionNonce(accountId);
      // Use SIWE to login with the server and get a token
      const message = prepareSiweMessage(accountId, sessionNonce);
      const signature = await signer.signMessage(message);
      const loginReq = { accountId, message, signature } as const satisfies Messages.RequestLogin;
      const res = await fetch(new URL('/login', syncServerUri), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginReq),
      });
      const decoded = Schema.decodeUnknownSync(Messages.ResponseLogin)(await res.json());
      Identity.storeAccountId(storage, accountId);
      Identity.storeSyncServerSessionToken(storage, accountId, decoded.sessionToken);
    } else {
      // use whoami to check if the session token is still valid
      const res = await fetch(new URL('/whoami', syncServerUri), {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      if (res.status !== 200 || (await res.text()) !== accountId) {
        console.warn('Session token is invalid, wiping state and retrying login with wallet');
        Identity.wipeSyncServerSessionToken(storage, accountId);
        return await loginWithWallet(signer, accountId);
      }
    }
  }

  async function loginWithKeys(keys: Identity.Keys, accountId: Address) {
    const sessionToken = Identity.loadSyncServerSessionToken(storage, accountId);
    if (sessionToken) {
      // use whoami to check if the session token is still valid
      const res = await fetch(new URL('/whoami', syncServerUri), {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      if (res.status !== 200 || (await res.text()) !== accountId) {
        console.warn('Session token is invalid, wiping state and retrying login with keys');
        Identity.wipeSyncServerSessionToken(storage, accountId);
        return await loginWithKeys(keys, accountId);
      }
    } else {
      const account = privateKeyToAccount(keys.signaturePrivateKey as Hex);
      const sessionNonce = await getSessionNonce(account.address);
      const message = prepareSiweMessage(account.address, sessionNonce);
      const signature = await account.signMessage({ message });
      const req = {
        accountId,
        message,
        publicKey: keys.signaturePublicKey,
        signature,
      } as const satisfies Messages.RequestLoginWithSigningKey;
      const res = await fetch(new URL('/login/with-signing-key', syncServerUri), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req),
      });
      if (res.status !== 200) {
        throw new Error('Error logging in with signing key');
      }
      const decoded = Schema.decodeUnknownSync(Messages.ResponseLogin)(await res.json());
      Identity.storeAccountId(storage, accountId);
      Identity.storeSyncServerSessionToken(storage, accountId, decoded.sessionToken);
    }
  }

  async function restoreKeys(signer: Identity.Signer, accountId: Address) {
    const sessionToken = Identity.loadSyncServerSessionToken(storage, accountId);
    if (!sessionToken) {
      return;
    }
    const keys = Identity.loadKeys(storage, accountId);
    if (!keys) {
      // Try to get the users identity from the sync server
      const res = await fetch(new URL('/identity/encrypted', syncServerUri), {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      if (res.status === 200) {
        console.log('Identity found');
        const decoded = Schema.decodeUnknownSync(Messages.ResponseIdentityEncrypted)(await res.json());
        const { keyBox } = decoded;
        const { ciphertext, nonce } = keyBox;
        const keys = await Identity.decryptIdentity(signer, accountId, ciphertext, nonce);
        Identity.storeKeys(storage, accountId, keys);
      } else {
        throw new Error(`Error fetching identity ${res.status}`);
      }
    }
  }

  async function signup(signer: Identity.Signer, accountId: Address) {
    const keys = Identity.createIdentity();
    const { ciphertext, nonce } = await Identity.encryptIdentity(signer, accountId, keys);
    const { accountProof, keyProof } = await Identity.proveIdentityOwnership(signer, accountId, keys);

    const account = privateKeyToAccount(keys.signaturePrivateKey as Hex);
    const sessionNonce = await getSessionNonce(accountId);
    const message = prepareSiweMessage(account.address, sessionNonce);
    const signature = await account.signMessage({ message });
    const req = {
      keyBox: { accountId, ciphertext, nonce },
      accountProof,
      keyProof,
      message,
      signaturePublicKey: keys.signaturePublicKey,
      encryptionPublicKey: keys.encryptionPublicKey,
      signature,
    } as const satisfies Messages.RequestCreateIdentity;
    const res = await fetch(new URL('/identity', syncServerUri), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    });
    if (res.status !== 200) {
      // TODO: handle this better?
      throw new Error(`Error creating identity: ${res.status}`);
    }
    const decoded = Schema.decodeUnknownSync(Messages.ResponseCreateIdentity)(await res.json());
    Identity.storeAccountId(storage, accountId);
    Identity.storeSyncServerSessionToken(storage, accountId, decoded.sessionToken);
    Identity.storeKeys(storage, accountId, keys);
  }

  async function login() {
    if (!signer) {
      return;
    }
    const address = await signer.getAddress();
    if (!address) {
      return;
    }
    const accountId = getAddress(address);
    const keys = Identity.loadKeys(storage, accountId);
    if (!keys && !(await identityExists(accountId))) {
      await signup(signer, accountId);
    } else if (keys) {
      await loginWithKeys(keys, accountId);
    } else {
      await loginWithWallet(signer, accountId).then(() => restoreKeys(signer, accountId));
    }
    console.log('Identity initialized');
    setAuthState({
      authenticated: true,
      accountId,
      sessionToken: Identity.loadSyncServerSessionToken(storage, accountId),
      keys: Identity.loadKeys(storage, accountId),
    });
    store.send({ type: 'reset' });
  }

  function logout() {
    const accountId = Identity.loadAccountId(storage) ?? authState.accountId;
    Identity.wipeAccountId(storage);
    if (!accountId) {
      return;
    }
    Identity.wipeKeys(storage, accountId);
    Identity.wipeSyncServerSessionToken(storage, accountId);
    setAuthState({ authenticated: false, accountId: null, sessionToken: null, keys: null });
  }

  const setIdentityAndSessionToken = useCallback(
    (account: Identity.Identity & { sessionToken: string }) => {
      Identity.storeAccountId(storage, account.accountId);
      Identity.storeSyncServerSessionToken(storage, account.accountId, account.sessionToken);
      Identity.storeKeys(storage, account.accountId, {
        encryptionPublicKey: account.encryptionPublicKey,
        encryptionPrivateKey: account.encryptionPrivateKey,
        signaturePublicKey: account.signaturePublicKey,
        signaturePrivateKey: account.signaturePrivateKey,
      });
      store.send({ type: 'reset' });
      setAuthState({
        authenticated: true,
        accountId: getAddress(account.accountId),
        sessionToken: account.sessionToken,
        keys: {
          encryptionPublicKey: account.encryptionPublicKey,
          encryptionPrivateKey: account.encryptionPrivateKey,
          signaturePublicKey: account.signaturePublicKey,
          signaturePrivateKey: account.signaturePrivateKey,
        },
      });
      console.log('Identity set');
    },
    [storage],
  );

  // check if the user is already authenticated on initial render
  const initialRenderAuthCheckRef = useRef(false);
  useEffect(() => {
    if (!initialRenderAuthCheckRef.current) {
      const accountId = Identity.loadAccountId(storage);
      if (accountId) {
        const sessionToken = Identity.loadSyncServerSessionToken(storage, accountId);
        if (sessionToken) {
          const keys = Identity.loadKeys(storage, accountId);
          if (keys) {
            // user is already authenticated, set state
            setAuthState({ authenticated: true, accountId: getAddress(accountId), sessionToken, keys });
          }
        }
      }
      // set render auth check to true so next potential rerender doesn't proc this
      initialRenderAuthCheckRef.current = true;
    }
  }, [storage]);

  return (
    <HypergraphAuthContext.Provider
      value={{
        getAccountId() {
          return authState.accountId;
        },
        getSessionToken() {
          return authState.sessionToken;
        },
        getIdentity() {
          if (authState.authenticated && authState.accountId && authState.keys) {
            return {
              accountId: authState.accountId,
              encryptionPublicKey: authState.keys.encryptionPublicKey,
              encryptionPrivateKey: authState.keys.encryptionPrivateKey,
              signaturePublicKey: authState.keys.signaturePublicKey,
              signaturePrivateKey: authState.keys.signaturePrivateKey,
            } as const satisfies Identity.Identity;
          }
          return null;
        },
        authenticated: authState.authenticated,
        login,
        logout,
        setIdentityAndSessionToken,
      }}
    >
      {children}
    </HypergraphAuthContext.Provider>
  );
}

type HypergraphAuthState = {
  authenticated: boolean;
  accountId: Address | null;
  sessionToken: string | null;
  keys: Identity.Keys | null;
};
