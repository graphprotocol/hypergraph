import * as Schema from 'effect/Schema';
import type { SmartAccountClient } from 'permissionless';
import type { Address, Chain, Hex, WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { loadAccountAddress, storeAccountAddress, storeKeys } from '../connect/auth-storage.js';
import { createIdentityKeys } from '../connect/create-identity-keys.js';
import { decryptIdentity, encryptIdentity } from '../connect/identity-encryption.js';
import {
  addSmartAccountOwner,
  getSmartAccountWalletClient,
  isSmartAccountDeployed,
  type SmartAccountParams,
  smartAccountNeedsUpdate,
  updateLegacySmartAccount,
} from '../connect/smart-account.js';
import type { IdentityKeys, Signer, Storage } from '../connect/types.js';
import { storePrivyIdentity } from '../identity/auth-storage.js';
import { proveIdentityOwnership } from '../identity/prove-ownership.js';
import * as Messages from '../messages/index.js';
import { store } from '../store.js';

export async function identityExists(accountAddress: string, syncServerUri: string) {
  const res = await fetch(new URL(`/connect/identity?accountAddress=${accountAddress}`, syncServerUri), {
    method: 'GET',
  });
  return res.status === 200;
}

export async function signup(
  signer: Signer,
  _walletClient: WalletClient,
  smartAccountClient: SmartAccountClient,
  accountAddress: Address,
  syncServerUri: string,
  addressStorage: Storage,
  keysStorage: Storage,
  identityToken: string,
  chain: Chain,
  rpcUrl: string,
) {
  const keys = createIdentityKeys();
  const { ciphertext, nonce } = await encryptIdentity(signer, keys);

  const localAccount = privateKeyToAccount(keys.signaturePrivateKey as `0x${string}`);
  // This will deploy the smart account if it's not deployed
  await addSmartAccountOwner(smartAccountClient, localAccount.address, chain, rpcUrl);
  const localSmartAccountClient = await getSmartAccountWalletClient({
    owner: localAccount,
    address: accountAddress,
    rpcUrl,
    chain,
  });

  const { accountProof, keyProof } = await proveIdentityOwnership(localSmartAccountClient, accountAddress, keys);

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
  storeKeys(keysStorage, accountAddress, keys);
  storeAccountAddress(addressStorage, accountAddress);
  return {
    accountAddress,
    keys,
  };
}

export async function restoreKeys(
  signer: Signer,
  accountAddress: Address,
  syncServerUri: string,
  addressStorage: Storage,
  keysStorage: Storage,
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
    storeKeys(keysStorage, accountAddress, keys);
    storeAccountAddress(addressStorage, accountAddress);
    return {
      accountAddress,
      keys,
    };
  }
  throw new Error(`Error fetching identity ${res.status}`);
}

const getAndUpdateSmartAccount = async (
  walletClient: WalletClient,
  rpcUrl: string,
  chain: Chain,
  addressStorage: Storage,
) => {
  const accountAddressFromStorage = loadAccountAddress(addressStorage) as Hex;
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
  console.log('leaving getAndUpdateSmartAccount');
  return smartAccountWalletClient;
};

export async function login({
  walletClient,
  signer,
  syncServerUri,
  addressStorage,
  keysStorage,
  identityToken,
  rpcUrl,
  chain,
}: {
  walletClient: WalletClient;
  signer: Signer;
  syncServerUri: string;
  addressStorage: Storage;
  keysStorage: Storage;
  identityToken: string;
  rpcUrl: string;
  chain: Chain;
}) {
  const smartAccountWalletClient = await getAndUpdateSmartAccount(walletClient, rpcUrl, chain, addressStorage);
  if (!smartAccountWalletClient.account) {
    throw new Error('Smart account wallet client account not found');
  }
  const accountAddress = smartAccountWalletClient.account.address;

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
      addressStorage,
      keysStorage,
      identityToken,
      chain,
      rpcUrl,
    );
  } else {
    authData = await restoreKeys(signer, accountAddress, syncServerUri, addressStorage, keysStorage, identityToken);
  }
  store.send({ type: 'reset' });
  store.send({
    type: 'setPrivyAuth',
    identity: {
      ...authData.keys,
      accountAddress: authData.accountAddress,
      privyIdentityToken: identityToken,
    },
  });
  storePrivyIdentity(addressStorage, {
    ...authData.keys,
    accountAddress: authData.accountAddress,
    privyIdentityToken: identityToken,
  });
}
