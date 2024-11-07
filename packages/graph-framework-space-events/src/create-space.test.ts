import { expect, it } from 'vitest';
import { applyEvent } from './apply-event.js';
import { createSpace } from './create-space.js';

it('should create a space state', () => {
  const author = {
    signaturePublicKey: 'signature',
    encryptionPublicKey: 'encryption',
  };
  const spaceEvent = createSpace({ author });
  const state = applyEvent({ event: spaceEvent });
  expect(state).toEqual({
    id: spaceEvent.transaction.id,
    invitations: {},
    members: {
      [author.signaturePublicKey]: {
        signaturePublicKey: author.signaturePublicKey,
        encryptionPublicKey: author.encryptionPublicKey,
        role: 'admin',
      },
    },
    removedMembers: {},
    transactionHash: '',
  });
});
