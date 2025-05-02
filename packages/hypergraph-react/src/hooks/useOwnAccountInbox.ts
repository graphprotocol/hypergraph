import { store } from '@graphprotocol/hypergraph';
import { useSelector as useSelectorStore } from '@xstate/store/react';
import { useCallback, useEffect, useState } from 'react';
import { useHypergraphApp, useHypergraphAuth } from '../HypergraphAppContext.js';

/**
 * Hook for managing a user's own inbox
 * Provides full read/write capabilities for the user's own inbox
 */
export function useOwnAccountInbox(inboxId: string) {
  const { getLatestAccountInboxMessages, sendAccountInboxMessage, getOwnAccountInboxes } = useHypergraphApp();
  const { identity } = useHypergraphAuth();
  const accountId = identity?.accountId;

  // Get own inbox from store
  const inbox = useSelectorStore(store, (state) => state.context.accountInboxes.find((i) => i.inboxId === inboxId));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initial fetch for own inbox
  useEffect(() => {
    const fetchInbox = async () => {
      if (!accountId) return;

      try {
        setLoading(true);
        setError(null);

        // First ensure inbox is in store
        await getOwnAccountInboxes();
        // Then get latest messages
        await getLatestAccountInboxMessages({ accountId, inboxId });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to get inbox'));
      } finally {
        setLoading(false);
      }
    };

    fetchInbox();
  }, [accountId, inboxId, getOwnAccountInboxes, getLatestAccountInboxMessages]);

  const refresh = useCallback(async () => {
    if (!accountId) throw new Error('User not authenticated');

    try {
      setLoading(true);
      setError(null);
      await getLatestAccountInboxMessages({ accountId, inboxId });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh messages'));
    } finally {
      setLoading(false);
    }
  }, [accountId, inboxId, getLatestAccountInboxMessages]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!inbox) throw new Error('Inbox not found');
      if (!accountId) throw new Error('User not authenticated');

      try {
        setLoading(true);
        setError(null);

        let authorAccountId: string | null = null;
        let signaturePrivateKey: string | null = null;
        if (inbox.authPolicy !== 'anonymous') {
          authorAccountId = accountId;
          signaturePrivateKey = identity?.signaturePrivateKey || null;
        }

        await sendAccountInboxMessage({
          message,
          accountId,
          inboxId,
          encryptionPublicKey: inbox.encryptionPublicKey,
          signaturePrivateKey,
          authorAccountId,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to send message'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [inbox, accountId, inboxId, identity, sendAccountInboxMessage],
  );

  return {
    messages: inbox?.messages ?? [],
    loading,
    error,
    refresh,
    sendMessage,
    isPublic: inbox?.isPublic ?? false,
    authPolicy: inbox?.authPolicy ?? 'unknown',
    encryptionPublicKey: inbox?.encryptionPublicKey ?? '',
  };
}
