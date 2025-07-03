## Connect App

When authenticating with the Connect app, the app will send a callback url to the server. An attacker could intercept this callback url and redirect the user to a malicious site.

This could be mitigated by introducing an server‐side “registration” step for with the callback url and nonce directly from the app.

Alternatively a full OAuth2 flow would solve the issue.

## Space Info

When decrypting the space info (name), there is currently no signature verification.

## Responses

All responses in the sync server should be typed and encoded to avoid exposing data that is not intended to be exposed.

## Verifying the app identity in Connect

Instead of trusting the server with the app identity address each app-identity should be signed or the address should be stored in the ciphertext containing private keys.

## Sign app identity attached to spaces

The information that for an app identity that is attached 
to a space should be signed and verified instead of trusting the sync-server.

## The Privy App Id should be stored only in .env files

Currently the frontend doesn't use the env var.

## Authenticate callback URL design

The callback URL should be able to define a `#` instead of `?` for improved security

## Session tokens

There should be multiple sessions with different session tokens so the user can logout and invalidate the session token without invalidating the other sessions.

## Disabled Signature Verification

Signature verification is currently temporarily disabled when switching to the Connect app authentication flow.