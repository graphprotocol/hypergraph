# Identity

## Goals

- Allow all sorts of wallet providers or wallets integrations
- Avoid passwords for encryptions keys

## Proposal A: Wallet to sign locally stored keys

### Sign up

- [UI] Click sign up
- During signup a key pair is generated that is stored locally
- [UI] Sign with your wallet
- The key pair is signed by the wallet and uploaded to the relay server
- [UI] Modal shown with recovery phrase
- The key pair is encrypted with a backup key (recovery phrase) and stored in the relay server

### Sign in with another browser/device

- [UI] Click sign in
- A new key pair is generated and stored locally
- [UI] Sign with your wallet
- The key pair needs to be signed by the wallet and uploaded to the relay server

### Account recovery

- [UI] Click recover account
- The user can enter the recovery key
- [UI] Enter recovery phrase in a form
- The key pair is fetched from the server, decrypted and stored locally

### Device management

- [UI] See a list of devices
- From the server you can fetch a list of devices that are signed by the wallet
- [UI] Click on revoke device and sign with your wallet
- You can revoke a device by signing with the wallet that the device should be revoked

### Remarks

If we go down that route we probably still want some form of user keypair that can be unlocked with these device keys. The reason here is that every browser sign in would be a new device and this would mean you need if I would want to send you the key to a workspace I would need to encrypt it possibly for hundreds of devices instead of one. In addition it's quite privacy concern because you basically can track logins from other users.
Key rotation of the user-key pair is relatively easy since this can be done with signing with the wallet.

One open question for me is if the current user public key should be stored on chain or if it's fine to trust the server to be honest. Due the wallet the server can never inject their own public key, but it could withhold the information of a removed device. Maybe that's up an option and up to the developer using the SDK?

This is the most wallet oriented approach, but feels unnecessary complex in the Web3 context. For non-web3 context this makes a lot of sense and is something I thinking a lot about here: https://github.com/serenity-kit/identity

## Proposal B: Wallet and additionally Passkey

### Sign up

- [UI] Click the sign up button and need to log in with a passkey
- A passkey keypair is created
- [UI] Sign with your wallet
- The public key of your passkey is signed with your wallet (this actually could be completely optional and is only relevant in the Web3 context).

### Sign in with another browser/device

- [UI] Click sign in and use your passkey

### Remarks

I think the easiest would be to require a passkey that is synced by the user and a user can have only one active passkey per application. Otherwise you run into the same complexity with device and user keys as in proposal A.

Same as in Proposal A we need to decide if the public key of the passkey should be stored on chain or if it's fine to trust the server to be honest. Or could be up to the developer using the SDK.

Not sure how solid it is, but the Passkey part has been built before:

- https://github.com/mylofi/webauthn-local-client
- https://github.com/mylofi/local-data-lock (not sure if it's 100% secure, but the future PRF extension of Passkeys will be - we could use this method temporarily)

## Proposal C: Metamask Snaps

While not feasible at the moment, Metamask Snaps could be a great way to handle identity. The user would use the Wallet to sign in an be done.

### Sign up

- [UI] Click sign up
- Key pair is generated
- [UI] Sign with your wallet
- The keypair is stored encrypted in the Wallet

### Sign in with another browser/device

- [UI] Click sign in
- [UI] Sign with your wallet
- The keypair is decrypted in the Wallet

### Remarks

This is the most user friendly approach, but would require lock-in to Metamask.

Optionally a recovery key could be created, but probably better to leave it up to the user to manage the wallet properly. Depending on how Snaps work the encrypted key might have to be backed up by the user.

Resource: https://docs.metamask.io/snaps/features/data-storage/
