import * as Identity from '../identity/index.js';
import type * as Messages from '../messages/index.js';
import type { AccountInboxStorageEntry, SpaceInboxStorageEntry } from '../store.js';
import { recoverAccountInboxMessageSigner, recoverSpaceInboxMessageSigner } from './recover-inbox-message-signer.js';

export const validateSpaceInboxMessage = async (
  message: Messages.InboxMessage,
  inbox: SpaceInboxStorageEntry,
  spaceId: string,
  syncServerUri: string,
) => {
  if (message.signature) {
    if (inbox.authPolicy === 'anonymous') {
      console.error('Signed message in anonymous inbox');
      return false;
    }
    if (!message.authorAccountAddress) {
      console.error('Signed message without authorAccountAddress');
      return false;
    }
    const signer = recoverSpaceInboxMessageSigner(message, spaceId, inbox.inboxId);
    const verifiedIdentity = await Identity.getVerifiedIdentity(message.authorAccountAddress, syncServerUri);
    const isValid = signer === verifiedIdentity.signaturePublicKey;
    if (!isValid) {
      console.error('Invalid signature', signer, verifiedIdentity.signaturePublicKey);
    }
    return isValid;
  }
  // Unsigned message is valid if the inbox is anonymous or optional auth
  const isValid = inbox.authPolicy !== 'requires_auth';
  if (!isValid) {
    console.error('Unsigned message in required auth inbox');
  }
  return isValid;
};

export const validateAccountInboxMessage = async (
  message: Messages.InboxMessage,
  inbox: AccountInboxStorageEntry,
  accountAddress: string,
  syncServerUri: string,
) => {
  if (message.signature) {
    if (inbox.authPolicy === 'anonymous') {
      console.error('Signed message in anonymous inbox');
      return false;
    }
    if (!message.authorAccountAddress) {
      console.error('Signed message without authorAccountAddress');
      return false;
    }
    const signer = recoverAccountInboxMessageSigner(message, accountAddress, inbox.inboxId);
    const verifiedIdentity = await Identity.getVerifiedIdentity(message.authorAccountAddress, syncServerUri);
    const isValid = signer === verifiedIdentity.signaturePublicKey;
    if (!isValid) {
      console.error('Invalid signature', signer, verifiedIdentity.signaturePublicKey);
    }
    return isValid;
  }
  // Unsigned message is valid if the inbox is anonymous or optional auth
  const isValid = inbox.authPolicy !== 'requires_auth';
  if (!isValid) {
    console.error('Unsigned message in required auth inbox');
  }
  return isValid;
};
