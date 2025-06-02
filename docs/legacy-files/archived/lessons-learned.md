# Lessons Learned

## Tinybase/Yjs Integration

- For Tinybase Yjs Persister you need to first to invoke `save` or `startAutoSave` before the first `load` or `startAutoLoad` call. Otherwise an error will be thrown since the whole Tinybase nested Map structure does not exist yet in the Yjs document.
  - Actually the above suggestion leads to data loss. If filed a bug report: https://github.com/tinyplex/tinybase/issues/186
- Do not modify the Yjs document directly in the same place since this will mess with the persister e.g. `const map = newYDoc.getMap("space"); map.set("id", spaceId);`.

## XMTP

- XMTP v3 will support MLS for group conversations. They yet have not managed to add Web support due and seem to struggle with it due WebAssembly limitations: https://docs.xmtp.org/groups/build-group-chat#web-support-for-group-chat
- XMTP manages to create a stable private key from the Wallet using the signature (when running the enable Identity part). See https://github.com/xmtp/xmtp-js/blob/003d770c63e17904650974c8d913c191d69b5040/packages/js-sdk/src/keystore/providers/NetworkKeyManager.ts#L136-L140

## XMTP stable keys

I could verify that signatures are stable (which surprised me).

The background probably is this work: https://datatracker.ietf.org/doc/html/rfc6979

So what they are doing is generate a random keypair for encryption which they want to store on the server encrypted.

To store it on the server they create anoterh random value which is shared with the server. And the wallet signature of this random value is the secret to encrypt and decrypt the encryption keypair. Since the server does not have the wallet private key it can't create the signature.

In general this is not a good practice. Signature have not been designed to be used as input for an encryption key.

## Process

how the XMTP library works:

Sign-up:

- Generate a random `encryptionPrivateKey` for encryption (and derive a `encryptionPublicKey` from it)
- Sign the `encryptionPublicKey` with your Wallet and send the `encryptionPublicKey` and `encryptionPublicKeySignature` to XMTP. So anyone can verify that this `encryptionPublicKey` really belongs to your Wallet.
- Then the `encryptionPrivateKey` backup starts:
  - Generate a random `prevKey`. Sign it with your wallet to get a `prevKeySignature`. Encrypt the `encryptionPrivateKey` with the `prevKeySignature` as key which results in `keyBackup`. This is the very unusual part in terms of cryptography.
  - Send `keyBackup` and `prevKey` to the server.

Sign in and restore keys:

- Get the `keyBackup` and `prevKey` from the server
- create `prevKeySignature` from `prevKey` with your Wallet (Enable Identity)
- With `prevKeySignature` you can decrypt `keyBackup` and get out the `encryptionPrivateKey`. Tadaaa, you used your Wallet to get back your one private key to have an end-to-end encryption identity.
