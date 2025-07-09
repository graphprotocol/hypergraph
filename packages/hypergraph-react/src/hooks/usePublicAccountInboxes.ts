import { useEffect, useState } from 'react';
import { useHypergraphApp } from '../HypergraphAppContext.js';

export function usePublicAccountInboxes(accountAddress: string) {
  const { listPublicAccountInboxes } = useHypergraphApp();
  const [publicInboxes, setPublicInboxes] = useState<Array<{ inboxId: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadInboxes() {
      try {
        const inboxes = await listPublicAccountInboxes({ accountAddress });
        setPublicInboxes(inboxes.map((inbox: { inboxId: string }) => ({ inboxId: inbox.inboxId })));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load public inboxes'));
      } finally {
        setLoading(false);
      }
    }
    loadInboxes();
  }, [accountAddress, listPublicAccountInboxes]);

  return { publicInboxes, loading, error };
}
