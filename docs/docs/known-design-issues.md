## Connect App

Currently when authenticating with the Conncet app, the app will send a callback url to the server. An attacker could intercept this callback url and redirect the user to a malicious site.

This could be mitigated by introducing an server‐side “registration” step for with the callback url and nonce directly from the app.

Alternatively a full OAuth2 flow would solve the issue.

## Space Info

Currently when decrypting the space info (name), there is no verification of the signature.

## Responses

All responses in the sync server should be typed and encoded to avoid exposing data that is not intended to be exposed.

## Verifying the app identity in Connect

Instead of trusting the server with the app identity address either each app-identity should be signed or the address also be stored in the ciphertext containing private keys.

## Sign app identity attached to spaces

Instead of trusting the sync-server the information that a app identity is attached to a space should be signed and verified.

## The Privy App Id should be stored only in .env files

Currently the frontend doesn't use the env var.

## Authenticate callback URL design

The callback URL should be able to define a `#` instead of `?` for improved security

## Session tokens

There should be multiple sessions with different session tokens so the user can logout and invalidate the session token without invalidating the other sessions.

## Disabled Signature Verification

When switching to the Connect App authentication we temporaryily disabled signature verfication.