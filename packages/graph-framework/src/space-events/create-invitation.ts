import { Author, SpaceEvent } from "./types.js";

type Params = {
  author: Author;
  id: string;
};

export const createInvitation = ({ author, id }: Params): SpaceEvent => {
  const transaction = {
    type: "create-invitation" as const,
    id,
    ciphertext: "",
    nonce: "",
    signaturePublicKey: "",
    encryptionPublicKey: "",
  };
  // TODO canonicalize, hash and sign the transaction
  const signature = "";

  return {
    transaction,
    author: {
      publicKey: author.signaturePublicKey,
      signature,
    },
  };
};
