import { useHypergraphAuth, useOwnAccountInbox } from '@graphprotocol/hypergraph-react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/account-inbox/$inboxId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { inboxId } = Route.useParams();
  const { privyIdentity } = useHypergraphAuth();
  const { messages, loading, error } = useOwnAccountInbox(inboxId);

  // Ensure we have an authenticated user
  if (!privyIdentity?.accountAddress) {
    return <div>Please login to view your inbox</div>;
  }

  if (loading) {
    return <div>Loading inbox messages...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!messages) {
    return <div>Inbox not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Inbox Messages</h1>
      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="bg-card rounded-lg p-4 shadow-xs border">
            <div className="text-lg mb-2">{message.plaintext}</div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="message-time">{new Date(message.createdAt).toLocaleString()}</div>
              {message.authorAccountAddress && <div>From: {message.authorAccountAddress}</div>}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No messages in this inbox</div>
        )}
      </div>
    </div>
  );
}
