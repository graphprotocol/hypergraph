import { useOwnSpaceInbox } from '@graphprotocol/hypergraph-react';
import { useState } from 'react';
import { Button } from './ui/button';

interface SpaceChatProps {
  spaceId: string;
}

export function SpaceChat({ spaceId }: SpaceChatProps) {
  const [message, setMessage] = useState('');

  // This will create the inbox if it doesn't exist, or use the first inbox in the space
  const { messages, error, sendMessage, loading } = useOwnSpaceInbox({
    spaceId,
    autoCreate: true,
  });

  if (loading) {
    return <div>Creating space chat...</div>;
  }

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
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Space Chat</h3>

      <div className="border rounded-lg p-4">
        {/* Messages */}
        <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
          {messages?.map((msg) => (
            <div key={msg.id} className="bg-muted p-3 rounded">
              <div className="text-sm text-muted-foreground mb-1">
                <div>From: {msg.authorAccountId?.substring(0, 6) || 'Anonymous'}</div>
                <div>{new Date(msg.createdAt).toLocaleString()}</div>
              </div>
              <div>{msg.plaintext}</div>
            </div>
          ))}
          {messages?.length === 0 && <div className="text-center text-muted-foreground py-4">No messages yet</div>}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded"
            disabled={loading}
          />
          <Button onClick={handleSendMessage} disabled={loading || !message.trim()}>
            Send
          </Button>
        </div>

        {error && <div className="text-red-500 mt-2">{error.message}</div>}
      </div>
    </div>
  );
}
