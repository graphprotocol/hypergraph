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
