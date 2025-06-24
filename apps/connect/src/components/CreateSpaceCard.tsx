import { Loading } from '@/components/ui/Loading';
import { cn } from '@/lib/utils';
import { Key, type Messages, SpaceEvents, SpaceInfo, StoreConnect, Utils } from '@graphprotocol/hypergraph';
import { useIdentityToken } from '@privy-io/react-auth';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from '@xstate/store/react';
import { Effect } from 'effect';
import { useState } from 'react';

interface CreateSpaceCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {}

export function CreateSpaceCard({ className, ...props }: CreateSpaceCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [spaceName, setSpaceName] = useState('');
  const { identityToken } = useIdentityToken();
  const accountAddress = useSelector(StoreConnect.store, (state) => state.context.accountAddress);
  const keys = useSelector(StoreConnect.store, (state) => state.context.keys);
  const queryClient = useQueryClient();

  const createSpace = async () => {
    setIsLoading(true);
    if (!accountAddress || !keys || !identityToken) {
      console.error('Missing required fields', {
        accountAddress,
        keys,
        identityToken,
      });
      setIsLoading(false);
      return;
    }

    try {
      const { encryptionPrivateKey, encryptionPublicKey, signaturePrivateKey, signaturePublicKey } = keys;
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
        name: spaceName,
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
        name: spaceName,
      };

      const response = await fetch(`${import.meta.env.VITE_HYPERGRAPH_SYNC_SERVER_ORIGIN}/connect/spaces`, {
        headers: {
          'privy-id-token': identityToken,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(message),
      });
      const data = await response.json();
      if (data.space) {
        queryClient.invalidateQueries({ queryKey: ['spaces'] });
        setSpaceName('');
      } else {
        throw new Error('Failed to create space');
      }
    } catch (error) {
      alert('Failed to create space');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('c-card', className)} {...props}>
      <h2 className="c-card-title">Create a new space</h2>
      <form className="flex gap-2">
        <input
          type="text"
          placeholder="My cool space"
          value={spaceName}
          onChange={(e) => setSpaceName(e.target.value)}
          className="c-input grow"
        />
        <button type="submit" disabled={isLoading} onClick={createSpace} className="c-button shrink-0">
          Create Space
          {isLoading ? <Loading hideLabel /> : null}
        </button>
      </form>
    </div>
  );
}
