import { usePublicAccountInboxes } from '@graphprotocol/hypergraph-react';
import { createFileRoute } from '@tanstack/react-router';
import { InboxCard } from '../../components/InboxCard';

export const Route = createFileRoute('/friends/$accountId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { accountAddress } = Route.useParams();
  const { publicInboxes, loading, error } = usePublicAccountInboxes(accountAddress);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (publicInboxes.length === 0) {
    return <div>No public inboxes found</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Friend's Public Inboxes: {accountAddress}</h1>

      <div className="space-y-6">
        {publicInboxes.map((inbox: { inboxId: string }) => (
          <InboxCard key={inbox.inboxId} accountAddress={accountAddress} inboxId={inbox.inboxId} />
        ))}
      </div>
    </div>
  );
}
