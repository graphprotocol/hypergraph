import type { Connect, Messages } from '@graphprotocol/hypergraph';
import { useCallback, useEffect, useState } from 'react';
import { useHypergraphApp, useHypergraphAuth } from '../HypergraphAppContext.js';

/**
 * Hook for interacting with external space inboxes
 * Provides limited capabilities for sending messages to other spaces' inboxes
 */
export function useExternalSpaceInbox({ spaceId, inboxId }: { spaceId: string; inboxId: string }) {
  const { sendSpaceInboxMessage, getSpaceInbox } = useHypergraphApp();
  const result = useHypergraphAuth();
  let identity: Connect.PrivatePrivyAppIdentity | Connect.PrivateAppIdentity | null = result.identity;
  if (!identity && result.privyIdentity) {
    identity = result.privyIdentity;
  }

  // Use local state for external inbox
  const [inbox, setInbox] = useState<Messages.SpaceInboxPublic | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initial fetch for external inbox
  useEffect(() => {
    const fetchInbox = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch external inbox
        const fetchedInbox = await getSpaceInbox({ spaceId, inboxId });
        setInbox(fetchedInbox);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to get inbox'));
      } finally {
        setLoading(false);
      }
    };

    fetchInbox();
  }, [spaceId, inboxId, getSpaceInbox]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!inbox) throw new Error('Inbox not found');

      try {
        setLoading(true);
        setError(null);

        let authorAccountAddress: string | null = null;
        let signaturePrivateKey: string | null = null;
        if (identity?.accountAddress && inbox.authPolicy !== 'anonymous') {
          authorAccountAddress = identity.accountAddress;
          signaturePrivateKey = identity.signaturePrivateKey;
        } else if (inbox.authPolicy === 'requires_auth') {
          throw new Error('Cannot send message to a required auth inbox without an identity');
        }

        await sendSpaceInboxMessage({
          message,
          spaceId,
          inboxId,
          encryptionPublicKey: inbox.encryptionPublicKey,
          signaturePrivateKey,
          authorAccountAddress,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to send message'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [inbox, spaceId, inboxId, identity, sendSpaceInboxMessage],
  );

  return {
    loading,
    error,
    sendMessage,
    inboxId,
    isPublic: inbox?.isPublic ?? false,
    authPolicy: inbox?.authPolicy ?? 'unknown',
    encryptionPublicKey: inbox?.encryptionPublicKey ?? '',
  };
}
