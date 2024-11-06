type Params = {
  preKey: string;
};

export const restoreIdentity = ({ preKey }: Params) => {
  return {
    signaturePublicKey: "",
    signaturePrivateKey: "",
    encryptionPublicKey: "",
    encryptionPrivateKey: "",
  };
};
