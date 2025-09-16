import { useExternalAccountInbox } from '@graphprotocol/hypergraph-react';
import { useState } from 'react';

interface InboxCardProps {
  accountAddress: string;
  inboxId: string;
}

export function InboxCard({ accountAddress, inboxId }: InboxCardProps) {
  const [message, setMessage] = useState('');
  const { loading, error, sendMessage, isPublic, authPolicy } = useExternalAccountInbox(accountAddress, inboxId);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await sendMessage(message.trim());
      setMessage(''); // Clear the input after sending
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg mb-2">Inbox: {inboxId}</h2>
      <div className="text-sm text-muted-foreground mb-4">
        <div>{isPublic ? 'Public' : 'Private'} inbox</div>
        <div>Auth Policy: {authPolicy}</div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border rounded"
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={loading || !message.trim()}
        >
          Send
        </button>
      </div>

      {error && <div className="text-red-500 mt-2">{error.message}</div>}
    </div>
  );
}
