import type { Messages } from '@graphprotocol/hypergraph';
import { prisma } from '../prisma';
export const createAccountInbox = async (data: Messages.RequestCreateAccountInbox) => {
  const { accountId, inboxId, isPublic, authPolicy, encryptionPublicKey, signature } = data;
  // This will throw an error if the inbox already exists
  const inbox = await prisma.accountInbox.create({
    data: {
      id: inboxId,
      isPublic,
      authPolicy,
      encryptionPublicKey,
      signatureHex: signature.hex,
      signatureRecovery: signature.recovery,
      account: { connect: { id: accountId } },
    },
  });
  return inbox;
};
