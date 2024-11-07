import { expect, it } from 'vitest';

import { applyEvent } from './apply-event.js';
import { createInvitation } from './create-invitation.js';
import { createSpace } from './create-space.js';

it('should create an invitation', () => {
  const author = {
    signaturePublicKey: 'signature',
    encryptionPublicKey: 'encryption',
  };
  const spaceEvent = createSpace({ author });
  const state = applyEvent({ event: spaceEvent });
  const spaceEvent2 = createInvitation({ author, id: state.id });
  const state2 = applyEvent({ state, event: spaceEvent2 });
  expect(state2).toEqual({
    id: state.id,
    members: {
      [author.signaturePublicKey]: {
        signaturePublicKey: author.signaturePublicKey,
        encryptionPublicKey: author.encryptionPublicKey,
        role: 'admin',
      },
    },
    removedMembers: {},
    invitations: {
      [spaceEvent2.transaction.id]: {
        signaturePublicKey: '',
        encryptionPublicKey: '',
      },
    },
    transactionHash: '',
  });
});
