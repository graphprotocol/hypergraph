import type { Connect, Messages } from '@graphprotocol/hypergraph';
import { useCallback, useEffect, useState } from 'react';
import { useHypergraphApp, useHypergraphAuth } from '../HypergraphAppContext.js';

/**
 * Hook for interacting with external inboxes
 * Provides limited capabilities for sending messages to other users' inboxes
 */
export function useExternalAccountInbox(accountAddress: string, inboxId: string) {
  const { sendAccountInboxMessage, getAccountInbox } = useHypergraphApp();
  const result = useHypergraphAuth();
  let identity: Connect.PrivatePrivyAppIdentity | Connect.PrivateAppIdentity | null = result.identity;
  if (!identity && result.privyIdentity) {
    identity = result.privyIdentity;
  }

  // Use local state for external inbox
  const [inbox, setInbox] = useState<Messages.AccountInboxPublic | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initial fetch for external inbox
  useEffect(() => {
    const fetchInbox = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch external inbox
        const fetchedInbox = await getAccountInbox({ accountAddress, inboxId });
        setInbox(fetchedInbox);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to get inbox'));
      } finally {
        setLoading(false);
      }
    };

    fetchInbox();
  }, [accountAddress, inboxId, getAccountInbox]);

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
        }

        await sendAccountInboxMessage({
          message,
          accountAddress,
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
    [inbox, accountAddress, inboxId, identity, sendAccountInboxMessage],
  );

  return {
    loading,
    error,
    sendMessage,
    isPublic: inbox?.isPublic ?? false,
    authPolicy: inbox?.authPolicy ?? 'unknown',
    encryptionPublicKey: inbox?.encryptionPublicKey ?? '',
  };
}
