# Invitations

2 different routes:

## Flow 1: Adding someone by there public profile

- Search for the person
- The profile (name - meant to be real name ENS for username) will have accounts (wallet - could be on a different chain) associated with it
- Send them invite (syncserver url, space id, lockbox for the spacekey with encrypted for the public key of the account, account id which must match the public key, account public key)

Note: You might set a minimum price to send you an invite to a space (celebrities).

## Flow 2: URI-based invitation

- Create an invite URI (contains a secret)
- Share the URI with the person (must contain a hash segment for the secret so the server can't read it)
- The person opens the URI and can add themselves to the space
