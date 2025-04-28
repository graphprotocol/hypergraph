import { useEffect, useState } from 'react';
import { useHypergraphApp } from '../HypergraphAppContext.js';

export function usePublicSpaceInboxes(spaceId: string) {
  const { listPublicSpaceInboxes } = useHypergraphApp();
  const [publicInboxes, setPublicInboxes] = useState<Array<{ inboxId: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadInboxes() {
      try {
        const inboxes = await listPublicSpaceInboxes({ spaceId });
        setPublicInboxes(inboxes.map((inbox: { inboxId: string }) => ({ inboxId: inbox.inboxId })));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load public space inboxes'));
      } finally {
        setLoading(false);
      }
    }
    loadInboxes();
  }, [spaceId, listPublicSpaceInboxes]);

  return { publicInboxes, loading, error };
}
