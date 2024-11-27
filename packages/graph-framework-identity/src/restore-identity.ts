type Params = {
  preKey: string;
};

export const restoreIdentity = ({ preKey }: Params) => {
  console.log('preKey', preKey);
  return {
    signaturePublicKey: '',
    signaturePrivateKey: '',
    encryptionPublicKey: '',
    encryptionPrivateKey: '',
  };
};
