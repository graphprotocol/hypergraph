import { type Inboxes, store } from '@graphprotocol/hypergraph';
import { useSelector as useSelectorStore } from '@xstate/store/react';
import { useCallback, useEffect, useState } from 'react';
import { useHypergraphApp, useHypergraphAuth } from '../HypergraphAppContext.js';

/**
 * Hook for managing a user's own space inbox
 * Provides full read/write capabilities for the user's own space inbox
 */
export function useOwnSpaceInbox({
  spaceId,
  inboxId,
  autoCreate = false,
  isPublic = false,
  authPolicy = 'requires_auth',
}: {
  spaceId: string;
  inboxId?: string;
  autoCreate?: boolean;
  isPublic?: boolean;
  authPolicy?: Inboxes.InboxSenderAuthPolicy;
}) {
  const { getLatestSpaceInboxMessages, sendSpaceInboxMessage, ensureSpaceInbox } = useHypergraphApp();
  const { identity } = useHypergraphAuth();

  // Get own space inbox from store
  const space = useSelectorStore(store, (state) => state.context.spaces.find((s) => s.id === spaceId));
  const [ownInboxId, setOwnInboxId] = useState<string | null>(null);
  const ownInbox = ownInboxId ? space?.inboxes.find((i) => i.inboxId === ownInboxId) : null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const realInboxId = ownInbox?.inboxId ?? inboxId;

  // Initial fetch for own inbox
  useEffect(() => {
    const ensureInbox = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!ownInboxId) {
          if (inboxId) {
            setOwnInboxId(inboxId);
          } else if (space?.inboxes[0]?.inboxId) {
            setOwnInboxId(space.inboxes[0].inboxId);
          } else if (autoCreate) {
            const inboxId = await ensureSpaceInbox({ spaceId, isPublic, authPolicy });
            setOwnInboxId(inboxId);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to ensure inbox'));
      }
    };

    const fetchInbox = async () => {
      try {
        if (ownInboxId) {
          await getLatestSpaceInboxMessages({ spaceId, inboxId: ownInboxId });
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to get inbox'));
      } finally {
        setLoading(false);
      }
    };

    ensureInbox().then(fetchInbox);
  }, [
    spaceId,
    inboxId,
    ownInboxId,
    getLatestSpaceInboxMessages,
    ensureSpaceInbox,
    autoCreate,
    isPublic,
    authPolicy,
    space?.inboxes[0]?.inboxId,
  ]);

  const refresh = useCallback(async () => {
    if (!ownInbox) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await getLatestSpaceInboxMessages({ spaceId, inboxId: ownInbox.inboxId });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh messages'));
    } finally {
      setLoading(false);
    }
  }, [spaceId, ownInbox, getLatestSpaceInboxMessages]);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!ownInbox) throw new Error('Inbox not found');
      if (!realInboxId) throw new Error('Inbox ID not found');

      try {
        setLoading(true);
        setError(null);

        let authorAccountId: string | null = null;
        let signaturePrivateKey: string | null = null;
        if (identity?.accountId && ownInbox.authPolicy !== 'anonymous') {
          authorAccountId = identity.accountId;
          signaturePrivateKey = identity.signaturePrivateKey;
        } else if (ownInbox.authPolicy === 'requires_auth') {
          throw new Error('Cannot send message to a required auth inbox without an identity');
        }

        await sendSpaceInboxMessage({
          message,
          spaceId,
          inboxId: realInboxId,
          encryptionPublicKey: ownInbox.encryptionPublicKey,
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
    [ownInbox, spaceId, realInboxId, identity, sendSpaceInboxMessage],
  );

  return {
    messages: ownInbox?.messages ?? [],
    loading,
    error,
    refresh,
    sendMessage,
    inboxId: realInboxId,
    isPublic: ownInbox?.isPublic ?? false,
    authPolicy: ownInbox?.authPolicy ?? 'unknown',
    encryptionPublicKey: ownInbox?.encryptionPublicKey ?? '',
  };
}
