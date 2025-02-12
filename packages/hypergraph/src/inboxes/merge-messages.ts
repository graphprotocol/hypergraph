import type { InboxMessageStorageEntry } from '../store.js';

export function mergeMessages(
  existingMessages: InboxMessageStorageEntry[],
  existingSeenIds: Set<string>,
  newMessages: InboxMessageStorageEntry[],
) {
  const messages = [...existingMessages];
  const seenMessageIds = new Set(existingSeenIds);

  // Filter and add new messages
  const newFilteredMessages = newMessages.filter((msg) => !seenMessageIds.has(msg.id));
  for (const msg of newFilteredMessages) {
    seenMessageIds.add(msg.id);
  }

  if (newFilteredMessages.length > 0) {
    // Only sort if the last new message is earlier than the last existing message
    if (messages.length > 0 && newFilteredMessages[0].createdAt < messages[messages.length - 1].createdAt) {
      messages.push(...newFilteredMessages);
      messages.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
    } else {
      messages.push(...newFilteredMessages);
    }
  }

  return { messages, seenMessageIds };
}
