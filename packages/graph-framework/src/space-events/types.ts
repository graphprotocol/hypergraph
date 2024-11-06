export type SpaceMember = {
  signaturePublicKey: string;
  encryptionPublicKey: string;
  role: "admin" | "member";
};

export type SpaceInvitation = {
  signaturePublicKey: string;
  encryptionPublicKey: string;
};

export type SpaceState = {
  id: string;
  invitations: { [signaturePublicKey: string]: SpaceInvitation };
  members: { [signaturePublicKey: string]: SpaceMember };
  removedMembers: { [signaturePublicKey: string]: SpaceMember };
  transactionHash: string;
};

export type SpaceEvent = {
  transaction:
    | {
        type: "create-space";
        id: string;
        creatorSignaturePublicKey: string;
        creatorEncryptionPublicKey: string;
      }
    | {
        type: "delete-space";
        id: string;
      }
    | {
        type: "create-invitation";
        id: string;
        ciphertext: string;
        nonce: string;
        signaturePublicKey: string;
        encryptionPublicKey: string;
      };
  author: {
    publicKey: string;
    signature: string;
  };
};

export type Author = {
  signaturePublicKey: string;
  encryptionPublicKey: string;
};
