# Key Agreement for Spaces

It's easy to create an initial key with a group of people and then share it. Once it leaked or if someone is removed from the group it's best practice to rotate the key.

## Proposal A: MLS

MLS is a relatively new standard that has been designed over years and is not used in dozens of projects (Cisco, Discord https://discord.com/blog/meet-dave-e2ee-for-audio-video). It's a protocol that is designed to be secure and scalable. It's a bit more complex than the other options but it's very secure and can even be post-quantum secure when picking the right algorithms.

Downside is that it requires a system to order the events of when a new device/user got added to a group. Usually this is done by a server. We could do so as well. Alternatively we could implement this in a blockchain.

One other downside is that there is no out of the Box JavaScript version:

- OpenMLS builds to WASM, but has no JS bindings:
  - https://github.com/openmls/openmls
  - https://github.com/openmls/openmls/issues/487
- AWS implementation has wasm support, but didn't see JS bindings: https://github.com/awslabs/mls-rs

Implementations: https://github.com/mlswg/mls-implementations/blob/main/implementation_list.md
Spec: https://datatracker.ietf.org/doc/rfc9420/

## Proposal B: Implement DCGKA

DCGKA is fully decentralized key agreement algorithm: https://eprint.iacr.org/2020/1281. Currently multiple teams implementing it, but so far no one has every deployed it.

It was developed by Martin Kleppmann, Matthew Weidner and others

## Proposal C: Implement a custom solution

This can be relatively simple:

- Create a new key
- Encrypt the key for ever user public key that should have access
- Store all of them on the server

This would require a central server again to trust telling everyone that a key rotation happened and ideally block syncs that happened with an old key. We also could use a blockchain to store the information that a new key rotation took place. That would be more secure since the server can't betray the users.

This is what I did in Serenity since OpenMLS was far away from being standardized when I started. Instead of a blockchain I used a signature chain to ensure the integrity over time.
