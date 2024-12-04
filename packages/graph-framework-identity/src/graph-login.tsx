import {
  type RequestCreateIdentity,
  type RequestLogin,
  type RequestLoginNonce,
  type RequestLoginWithSigningKey,
  ResponseCreateIdentity,
  ResponseIdentityEncrypted,
  ResponseLogin,
  ResponseLoginNonce,
} from '@graph-framework/messages';
import type { Hex } from '@graph-framework/utils';
import { Schema } from 'effect';
import { createContext, useContext } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { SiweMessage } from 'siwe';
import { privateKeyToAccount } from 'viem/accounts';
import {
  loadAccountId,
  loadKeys,
  loadSyncServerSessionToken,
  storeAccountId,
  storeKeys,
  storeSyncServerSessionToken,
  wipeAccountId,
  wipeKeys,
  wipeSyncServerSessionToken,
} from './auth-storage.js';
import { createIdentity } from './create-identity.js';
import { decryptIdentity, encryptIdentity } from './identity-encryption.js';
import { proveIdentityOwnership } from './prove-ownership.js';
import type { Identity, Keys, Signer, Storage } from './types.js';

export type LoginProps = {
  children: React.ReactNode;
  storage: Storage;
  signer: Signer | null;
  syncServer?: string;
  chainId?: number;
  onLogin?: () => void;
};

type GraphLoginState = {
  authenticated: boolean;
  accountId: string | null;
  sessionToken: string | null;
  keys: Keys | null;
};

const GraphLoginContext = createContext<{
  getSessionToken: () => string | null;
  getAccountId: () => string | null;
  getIdentity: () => Identity | null;
  isAuthenticated: () => boolean;
  login: () => void;
  logout: () => void;
  authenticated: boolean;
}>({
  getSessionToken: () => null,
  getAccountId: () => null,
  getIdentity: () => null,
  isAuthenticated: () => false,
  login: () => {},
  logout: () => {},
  authenticated: false,
});

// 1) a) Get session token from local storage, or
//    b) Auth with the sync server
// 2) a)Try to get identity from the sync server, or
//    b) If identity is not found, create a new identity
//      (and store it in the sync server)
export function GraphLogin({
  children,
  storage,
  signer,
  onLogin,
  syncServer = 'http://localhost:3030',
  chainId = 80451,
}: LoginProps) {
  const [state, setState] = useState<GraphLoginState>({
    authenticated: false,
    accountId: null,
    sessionToken: null,
    keys: null,
  });
  const getSessionToken = () => {
    return state.sessionToken;
  };

  const getAccountId = () => {
    return state.accountId;
  };

  const getIdentity = () => {
    if (state.authenticated && state.accountId && state.keys) {
      return {
        accountId: state.accountId,
        encryptionPublicKey: state.keys.encryptionPublicKey,
        encryptionPrivateKey: state.keys.encryptionPrivateKey,
        signaturePublicKey: state.keys.signaturePublicKey,
        signaturePrivateKey: state.keys.signaturePrivateKey,
      };
    }
    return null;
  };

  const isAuthenticated = () => {
    return state.authenticated;
  };

  const logout = () => {
    const accountId = loadAccountId(storage);
    wipeAccountId(storage);
    if (!accountId) {
      return;
    }
    wipeKeys(storage, accountId);
    wipeSyncServerSessionToken(storage, accountId);
    setState({ authenticated: false, accountId: null, sessionToken: null, keys: null });
  };

  const prepareSiweMessage = (address: string, nonce: string) => {
    const message = new SiweMessage({
      domain: window.location.host,
      address,
      statement: 'Sign in to The Graph',
      uri: window.location.origin,
      version: '1',
      chainId,
      nonce,
      expirationTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    }).prepareMessage();
    return message;
  };

  const getSessionNonce = async (accountId: string) => {
    const nonceReq: RequestLoginNonce = { accountId };
    const res = await fetch(new URL('/login/nonce', syncServer).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nonceReq),
    });
    const resDecoded = Schema.decodeUnknownSync(ResponseLoginNonce)(await res.json());
    return resDecoded.sessionNonce;
  };

  const loginWithWallet = async (signer: Signer, accountId: string) => {
    const sessionToken = loadSyncServerSessionToken(storage, accountId);
    if (!sessionToken) {
      const sessionNonce = await getSessionNonce(accountId);
      // Use SIWE to sign in with the server and get a token
      const message = prepareSiweMessage(accountId, sessionNonce);
      const signature = await signer.signMessage(message);
      const loginReq: RequestLogin = { accountId, message, signature };
      const res = await fetch(new URL('/login', syncServer).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginReq),
      });
      const resDecoded = Schema.decodeUnknownSync(ResponseLogin)(await res.json());
      storeAccountId(storage, accountId);
      storeSyncServerSessionToken(storage, accountId, resDecoded.sessionToken);
    } else {
      // use whoami to check if the session token is still valid
      const res = await fetch(new URL('/whoami', syncServer).toString(), {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      if (res.status !== 200 || (await res.text()) !== accountId) {
        console.log('Session token is invalid');
        wipeSyncServerSessionToken(storage, accountId);
        return loginWithWallet(signer, accountId);
      }
    }
  };

  const restoreKeys = async (signer: Signer, accountId: string) => {
    const sessionToken = loadSyncServerSessionToken(storage, accountId);
    if (!sessionToken) {
      return;
    }
    const keys = loadKeys(storage, accountId);
    if (!keys) {
      // Try to get an identity from the sync server
      const res = await fetch(new URL('/identity/encrypted', syncServer).toString(), {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      if (res.status === 200) {
        console.log('Identity found');
        const resDecoded = Schema.decodeUnknownSync(ResponseIdentityEncrypted)(await res.json());
        const { keyBox } = resDecoded;
        const { ciphertext, nonce } = keyBox;
        const keys = await decryptIdentity(signer, accountId, ciphertext as Hex, nonce as Hex);
        storeKeys(storage, accountId, keys);
      } else {
        // TODO: what's the best way to handle this?
        throw new Error(`Error fetching identity: ${res.status}`);
      }
    }
  };

  const identityExists = async (accountId: string) => {
    const res = await fetch(new URL(`/identity?accountId=${accountId}`, syncServer).toString(), {
      method: 'GET',
    });
    return res.status === 200;
  };

  const signup = async (signer: Signer, accountId: string) => {
    const keys = createIdentity();
    const { ciphertext, nonce } = await encryptIdentity(signer, accountId, keys);
    const { accountProof, keyProof } = await proveIdentityOwnership(signer, accountId, keys);

    const account = privateKeyToAccount(keys.signaturePrivateKey);
    const sessionNonce = await getSessionNonce(accountId);
    const message = prepareSiweMessage(account.address, sessionNonce);
    const signature = await account.signMessage({ message });
    const req: RequestCreateIdentity = {
      keyBox: { accountId, ciphertext, nonce },
      accountProof,
      keyProof,
      message,
      signaturePublicKey: keys.signaturePublicKey,
      encryptionPublicKey: keys.encryptionPublicKey,
      signature,
    };
    const res = await fetch(new URL('/identity', syncServer).toString(), {
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
    const resDecoded = Schema.decodeUnknownSync(ResponseCreateIdentity)(await res.json());
    storeAccountId(storage, accountId);
    storeSyncServerSessionToken(storage, accountId, resDecoded.sessionToken);
    storeKeys(storage, accountId, keys);
  };

  const loginWithKeys = async (keys: Keys, accountId: string) => {
    const sessionToken = loadSyncServerSessionToken(storage, accountId);
    if (!sessionToken) {
      const account = privateKeyToAccount(keys.signaturePrivateKey);
      const sessionNonce = await getSessionNonce(accountId);
      const message = prepareSiweMessage(account.address, sessionNonce);
      const signature = await account.signMessage({ message });
      const req: RequestLoginWithSigningKey = {
        accountId,
        message,
        publicKey: keys.signaturePublicKey,
        signature,
      };
      const res = await fetch(new URL('/login/with-signing-key', syncServer).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req),
      });
      if (res.status !== 200) {
        throw new Error('Error logging in with signing key');
      }
      const resDecoded = Schema.decodeUnknownSync(ResponseLogin)(await res.json());
      storeAccountId(storage, accountId);
      storeSyncServerSessionToken(storage, accountId, resDecoded.sessionToken);
    } else {
      // use whoami to check if the session token is still valid
      const res = await fetch(new URL('/whoami', syncServer).toString(), {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      if (res.status !== 200 || (await res.text()) !== accountId) {
        console.log('Session token is invalid');
        wipeSyncServerSessionToken(storage, accountId);
        return loginWithKeys(keys, accountId);
      }
    }
  };

  const login = async () => {
    if (!signer) {
      return;
    }
    const accountId = await signer.getAddress();
    if (!accountId) {
      return;
    }
    const keys = loadKeys(storage, accountId);
    if (!keys && !(await identityExists(accountId))) {
      await signup(signer, accountId);
    } else if (keys) {
      await loginWithKeys(keys, accountId);
    } else {
      await loginWithWallet(signer, accountId);
      await restoreKeys(signer, accountId);
    }
    console.log('Identity initialized');
    setState({
      authenticated: true,
      accountId,
      sessionToken: loadSyncServerSessionToken(storage, accountId),
      keys: loadKeys(storage, accountId),
    });
    if (onLogin) {
      console.log('Running onLogin');
      onLogin();
    }
  };

  useEffect(() => {
    const accountId = loadAccountId(storage);
    if (accountId) {
      const sessionToken = loadSyncServerSessionToken(storage, accountId);
      if (sessionToken) {
        const keys = loadKeys(storage, accountId);
        if (keys) {
          setState({ authenticated: true, accountId, sessionToken, keys });
          return;
        }
      }
    }
  }, [storage]);

  return (
    <GraphLoginContext.Provider
      value={{
        getSessionToken,
        getAccountId,
        getIdentity,
        isAuthenticated,
        login,
        logout,
        authenticated: isAuthenticated(),
      }}
    >
      {children}
    </GraphLoginContext.Provider>
  );
}

export const useGraphLogin = () => {
  return useContext(GraphLoginContext);
};
