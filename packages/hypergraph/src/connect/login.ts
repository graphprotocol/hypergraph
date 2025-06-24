import * as Schema from 'effect/Schema';
import type { SmartAccountClient } from 'permissionless';
import type { Address, Chain, Hex, WalletClient } from 'viem';
import { proveIdentityOwnership } from '../identity/prove-ownership.js';
import * as Messages from '../messages/index.js';
import { store } from '../store-connect.js';
import { loadAccountAddress, storeAccountAddress, storeKeys, wipeAccountAddress } from './auth-storage.js';
import { createIdentityKeys } from './create-identity-keys.js';
import { decryptIdentity, encryptIdentity } from './identity-encryption.js';
import {
  type SmartAccountParams,
  getSmartAccountWalletClient,
  isSmartAccountDeployed,
  smartAccountNeedsUpdate,
  updateLegacySmartAccount,
} from './smart-account.js';
import type { IdentityKeys, Signer, Storage } from './types.js';

export async function identityExists(accountAddress: string, syncServerUri: string) {
  const res = await fetch(new URL(`/identity?accountAddress=${accountAddress}`, syncServerUri), {
    method: 'GET',
  });
  return res.status === 200;
}

export async function signup(
  signer: Signer,
  walletClient: WalletClient,
  smartAccountClient: SmartAccountClient,
  accountAddress: Address,
  syncServerUri: string,
  storage: Storage,
  identityToken: string,
) {
  const keys = createIdentityKeys();
  const { ciphertext, nonce } = await encryptIdentity(signer, keys);
  const { accountProof, keyProof } = await proveIdentityOwnership(
    walletClient,
    smartAccountClient,
    accountAddress,
    keys,
  );

  const req: Messages.RequestConnectCreateIdentity = {
    keyBox: { signer: await signer.getAddress(), accountAddress, ciphertext, nonce },
    accountProof,
    keyProof,
    signaturePublicKey: keys.signaturePublicKey,
    encryptionPublicKey: keys.encryptionPublicKey,
  };
  const res = await fetch(new URL('/connect/identity', syncServerUri), {
    method: 'POST',
    headers: {
      'privy-id-token': identityToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });
  if (res.status !== 200) {
    // TODO: handle this better?
    throw new Error(`Error creating identity: ${res.status}`);
  }
  const decoded = Schema.decodeUnknownSync(Messages.ResponseConnectCreateIdentity)(await res.json());
  if (!decoded.success) {
    throw new Error('Error creating identity');
  }
  storeKeys(storage, accountAddress, keys);
  storeAccountAddress(storage, accountAddress);
  return {
    accountAddress,
    keys,
  };
}

export async function restoreKeys(
  signer: Signer,
  accountAddress: Address,
  syncServerUri: string,
  storage: Storage,
  identityToken: string,
) {
  const res = await fetch(new URL('/connect/identity/encrypted', syncServerUri), {
    method: 'GET',
    headers: {
      'privy-id-token': identityToken,
      'account-address': accountAddress,
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 200) {
    const decoded = Schema.decodeUnknownSync(Messages.ResponseIdentityEncrypted)(await res.json());
    const { keyBox } = decoded;
    const { ciphertext, nonce } = keyBox;
    const keys = await decryptIdentity(signer, ciphertext, nonce);
    storeKeys(storage, accountAddress, keys);
    storeAccountAddress(storage, accountAddress);
    return {
      accountAddress,
      keys,
    };
  }
  throw new Error(`Error fetching identity ${res.status}`);
}

const getAndDeploySmartAccount = async (walletClient: WalletClient, rpcUrl: string, chain: Chain, storage: Storage) => {
  const accountAddressFromStorage = loadAccountAddress(storage) as Hex;
  const smartAccountParams: SmartAccountParams = {
    owner: walletClient,
    rpcUrl,
    chain,
  };
  if (accountAddressFromStorage) {
    smartAccountParams.address = accountAddressFromStorage;
  }
  const smartAccountWalletClient = await getSmartAccountWalletClient(smartAccountParams);
  if (!smartAccountWalletClient.account) {
    throw new Error('Smart account wallet client not found');
  }
  console.log('smartAccountWalletClient', smartAccountWalletClient);
  console.log('address', smartAccountWalletClient.account.address);
  console.log('is deployed', await isSmartAccountDeployed(smartAccountWalletClient));
  // This will prompt the user to sign a user operation to update the smart account
  if (await smartAccountNeedsUpdate(smartAccountWalletClient, chain, rpcUrl)) {
    console.log('updating smart account');
    await updateLegacySmartAccount(smartAccountWalletClient, chain, rpcUrl);
    smartAccountParams.address = smartAccountWalletClient.account.address;
    // Create the client again to ensure we have the 7579 config now
    return getSmartAccountWalletClient(smartAccountParams);
  }
  if (!(await isSmartAccountDeployed(smartAccountWalletClient))) {
    // TODO: remove this once we manage to get counterfactual signatures working
    console.log('sending dummy userOp to deploy smart account');
    if (!walletClient.account) {
      throw new Error('Wallet client account not found');
    }
    const tx = await smartAccountWalletClient.sendUserOperation({
      calls: [{ to: walletClient.account.address, data: '0x' }],
      account: smartAccountWalletClient.account,
    });

    console.log('tx', tx);
    const receipt = await smartAccountWalletClient.waitForUserOperationReceipt({ hash: tx });
    console.log('receipt', receipt);
  }
  return smartAccountWalletClient;
};

export async function login({
  walletClient,
  signer,
  syncServerUri,
  storage,
  identityToken,
  rpcUrl,
  chain,
}: {
  walletClient: WalletClient;
  signer: Signer;
  syncServerUri: string;
  storage: Storage;
  identityToken: string;
  rpcUrl: string;
  chain: Chain;
}) {
  let smartAccountWalletClient: SmartAccountClient;
  try {
    smartAccountWalletClient = await getAndDeploySmartAccount(walletClient, rpcUrl, chain, storage);
  } catch (error) {
    wipeAccountAddress(storage);
    smartAccountWalletClient = await getAndDeploySmartAccount(walletClient, rpcUrl, chain, storage);
  }
  if (!smartAccountWalletClient.account) {
    throw new Error('Smart account wallet client account not found');
  }
  const accountAddress = smartAccountWalletClient.account.address;
  // const keys = loadKeys(storage, accountAddress);
  let authData: {
    accountAddress: Address;
    keys: IdentityKeys;
  };
  const exists = await identityExists(accountAddress, syncServerUri);
  if (!exists) {
    authData = await signup(
      signer,
      walletClient,
      smartAccountWalletClient,
      accountAddress,
      syncServerUri,
      storage,
      identityToken,
    );
  } else {
    authData = await restoreKeys(signer, accountAddress, syncServerUri, storage, identityToken);
  }
  store.send({ type: 'reset' });
  store.send({
    ...authData,
    sessionToken: 'dummy', // not needed in the connect app
    type: 'setAuth',
  });
}
