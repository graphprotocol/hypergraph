import { generateId } from "../generateId.js";
import { Author, SpaceEvent } from "./types.js";

type Params = {
  author: Author;
};

export const createSpace = ({ author }: Params): SpaceEvent => {
  const transaction = {
    type: "create-space" as const,
    id: generateId(),
    creatorSignaturePublicKey: author.signaturePublicKey,
    creatorEncryptionPublicKey: author.encryptionPublicKey,
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
