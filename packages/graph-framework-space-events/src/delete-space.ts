import type { Author, SpaceEvent } from './types.js';

type Params = {
  author: Author;
  id: string;
};

export const deleteSpace = ({ author, id }: Params): SpaceEvent => {
  const transaction = {
    type: 'delete-space' as const,
    id,
  };
  // TODO canonicalize, hash and sign the transaction
  const signature = '';

  return {
    transaction,
    author: {
      publicKey: author.signaturePublicKey,
      signature,
    },
  };
};
