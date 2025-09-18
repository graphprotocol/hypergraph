import { Key, type Messages, SpaceEvents, SpaceInfo, Utils } from '@graphprotocol/hypergraph';
import * as Effect from 'effect/Effect';
import { useState } from 'react';
import { useHypergraphApp, useHypergraphAuth } from '../HypergraphAppContext.js';

type CreatePrivateSpaceParams = {
  name: string;
};

export const usePrivyAuthCreatePrivateSpace = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { privyIdentity } = useHypergraphAuth();
  const { syncServerUri, listSpaces } = useHypergraphApp();

  const createPrivateSpace = async ({ name }: CreatePrivateSpaceParams) => {
    const accountAddress = privyIdentity?.accountAddress;
    if (!accountAddress) {
      setIsLoading(false);
      throw new Error('No account address found');
    }
    const encryptionPrivateKey = privyIdentity?.encryptionPrivateKey;
    const encryptionPublicKey = privyIdentity?.encryptionPublicKey;
    const signaturePrivateKey = privyIdentity?.signaturePrivateKey;
    const signaturePublicKey = privyIdentity?.signaturePublicKey;
    if (!encryptionPrivateKey || !encryptionPublicKey || !signaturePrivateKey || !signaturePublicKey) {
      setIsLoading(false);
      throw new Error('No keys found');
    }
    const privyIdentityToken = privyIdentity?.privyIdentityToken;
    if (!privyIdentityToken) {
      setIsLoading(false);
      throw new Error('No Privy identity token found');
    }
    setIsLoading(true);

    try {
      const spaceId = Utils.generateId();

      const spaceEvent = await Effect.runPromise(
        SpaceEvents.createSpace({
          author: {
            accountAddress,
            encryptionPublicKey,
            signaturePrivateKey,
            signaturePublicKey,
          },
          spaceId,
        }),
      );
      const result = Key.createKey({
        privateKey: Utils.hexToBytes(encryptionPrivateKey),
        publicKey: Utils.hexToBytes(encryptionPublicKey),
      });

      const { infoContent, signature } = SpaceInfo.encryptAndSignSpaceInfo({
        accountAddress,
        name,
        secretKey: Utils.bytesToHex(result.key),
        signaturePrivateKey,
        spaceId,
      });

      const message: Messages.RequestConnectCreateSpaceEvent = {
        type: 'connect-create-space-event',
        accountAddress,
        event: spaceEvent,
        spaceId: spaceEvent.transaction.id,
        keyBox: {
          accountAddress,
          ciphertext: Utils.bytesToHex(result.keyBoxCiphertext),
          nonce: Utils.bytesToHex(result.keyBoxNonce),
          authorPublicKey: encryptionPublicKey,
          id: Utils.generateId(),
        },
        infoContent: Utils.bytesToHex(infoContent),
        infoSignature: signature,
        name,
      };

      const response = await fetch(`${syncServerUri}/connect/spaces`, {
        headers: {
          'privy-id-token': privyIdentityToken,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(message),
      });
      const data = await response.json();
      if (data.space) {
        listSpaces(); // list spaces to update the list of private spaces
      } else {
        throw new Error('Failed to create space');
      }
      return data.space;
    } finally {
      setIsLoading(false);
    }
  };

  return { createPrivateSpace, isLoading };
};
