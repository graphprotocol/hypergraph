import { Identity, Inboxes, Messages, SpaceEvents, Utils } from '@graphprotocol/hypergraph';
import cors from 'cors';
import { Effect, Exit, Schema } from 'effect';
import express, { type Request, type Response } from 'express';
import { parse } from 'node:url';
import { SiweMessage } from 'siwe';
import type { Hex } from 'viem';
import WebSocket, { WebSocketServer } from 'ws';
import { applySpaceEvent } from './handlers/applySpaceEvent.js';
import { createAccountInbox } from './handlers/createAccountInbox.js';
import { createAccountInboxMessage } from './handlers/createAccountInboxMessage.js';
import { createIdentity } from './handlers/createIdentity.js';
import { createSpace } from './handlers/createSpace.js';
import { createSpaceInboxMessage } from './handlers/createSpaceInboxMessage.js';
import { createUpdate } from './handlers/createUpdate.js';
import { getAccountInbox } from './handlers/getAccountInbox.js';
import { type GetIdentityResult, getIdentity } from './handlers/getIdentity.js';
import { getLatestAccountInboxMessages } from './handlers/getLatestAccountInboxMessages.js';
import { getLatestSpaceInboxMessages } from './handlers/getLatestSpaceInboxMessages.js';
import { getSpace } from './handlers/getSpace.js';
import { getSpaceInbox } from './handlers/getSpaceInbox.js';
import { listAccountInboxes } from './handlers/listAccountInboxes.js';
import { listInvitations } from './handlers/listInvitations.js';
import { listPublicAccountInboxes } from './handlers/listPublicAccountInboxes.js';
import { listPublicSpaceInboxes } from './handlers/listPublicSpaceInboxes.js';
import { listSpaces } from './handlers/listSpaces.js';
import { createSessionNonce, getSessionNonce } from './handlers/sessionNonce.js';
import { createSessionToken, getAccountIdBySessionToken } from './handlers/sessionToken.js';
import { tmpInitAccount } from './handlers/tmpInitAccount.js';

interface CustomWebSocket extends WebSocket {
  accountId: string;
  subscribedSpaces: Set<string>;
}

const decodeRequestMessage = Schema.decodeUnknownEither(Messages.RequestMessage);

tmpInitAccount({
  accountId: '0x098B742F2696AFC37724887cf999e1cFdB8f4b55',
  walletPrivateKey: '0x995e23bda072ea9a1972eb3998a9adf9a902509488277dfa05edeb952fe114b1',
  sessionToken: '0xdeadbeef1',
  signaturePublicKey: '0x0262701b2eb1b6b37ad03e24445dfcad1b91309199e43017b657ce2604417c12f5',
  signaturePrivateKey: '0x88bb6f20de8dc1787c722dc847f4cf3d00285b8955445f23c483d1237fe85366',
  encryptionPublicKey: '0x595e1a6b0bb346d83bc382998943d2e6d9210fd341bc8b9f41a7229eede27240',
});
tmpInitAccount({
  accountId: '0x560436B2d3EE2d464D2756b7ebd6880CC5146614',
  walletPrivateKey: '0x437383005314f94f4a2777daef6538226922204316780e2cdc9efa47c22cc841',
  sessionToken: '0xdeadbeef2',
  signaturePublicKey: '0x03bf5d2a1badf15387b08a007d1a9a13a9bfd6e1c56f681e251514d9ba10b57462',
  signaturePrivateKey: '0x1eee32d3bc202dcb5d17c3b1454fb541d2290cb941860735408f1bfe39e7bc15',
  encryptionPublicKey: '0x0f4e22dc85167597af85cba85988770cd77c25d317f2b14a1f49a54efcbfae3f',
});
tmpInitAccount({
  accountId: '0xd909b84c934f24F7c65dfa51be6b11e4c6eabB47',
  walletPrivateKey: '0xfc54beb70cb2d3b9a461ff2de7f8182758bd747181f02f2ae488e32b7dcefe1c',
  sessionToken: '0xdeadbeef3',
  signaturePublicKey: '0x0351460706cf386282d9b6ebee2ccdcb9ba61194fd024345e53037f3036242e6a2',
  signaturePrivateKey: '0x434518a2c9a665a7c20da086232c818b6c1592e2edfeecab29a40cf5925ca8fe',
  encryptionPublicKey: '0xd494144358a610604c4ab453b442d014f2843772eed19be155dd9fc55fe8a332',
});

const webSocketServer = new WebSocketServer({ noServer: true });
const PORT = process.env.PORT !== undefined ? Number.parseInt(process.env.PORT) : 3030;
const app = express();

type AuthenticatedRequest = Request & { accountId?: string };

async function verifyAuth(req: AuthenticatedRequest, res: Response, next: (err?: Error) => void) {
  const auth = req.headers.authorization;
  if (!auth) {
    res.status(401).send('Unauthorized');
    return;
  }
  try {
    const sessionToken = auth.split(' ')[1];
    const accountId = await getAccountIdBySessionToken({ sessionToken });
    req.accountId = accountId;
    next();
  } catch (error) {
    res.status(401).send('Unauthorized');
    return;
  }
}

app.use(express.json());

app.use(cors());

app.get('/', (_req, res) => {
  res.send('Server is running');
});

app.post('/login/nonce', async (req, res) => {
  console.log('POST login/nonce');
  const message = Schema.decodeUnknownSync(Messages.RequestLoginNonce)(req.body);
  const accountId = message.accountId;
  const sessionNonce = await createSessionNonce({ accountId });
  const outgoingMessage: Messages.ResponseLoginNonce = {
    sessionNonce,
  };
  res.status(200).send(outgoingMessage);
});

app.post('/login/with-signing-key', async (req, res) => {
  console.log('POST login/with-signing-key');
  try {
    const message = Schema.decodeUnknownSync(Messages.RequestLoginWithSigningKey)(req.body);
    const accountId = message.accountId;

    // getIdentity will throw if it doesn't exist
    const identity = await getIdentity({ signaturePublicKey: message.publicKey });
    if (identity.accountId !== accountId) {
      res.status(401).send('Unauthorized');
      return;
    }
    const siweObject = new SiweMessage(message.message);
    if (siweObject.address !== Utils.publicKeyToAddress(message.publicKey)) {
      res.status(401).send('Unauthorized');
      return;
    }
    const nonce = await getSessionNonce({ accountId });
    const { data: siweMessage } = await siweObject.verify({ signature: message.signature, nonce });
    if (!siweMessage.expirationTime) {
      res.status(400).send('Expiration time not set');
      return;
    }
    const sessionTokenExpires = new Date(siweMessage.expirationTime);
    const sessionToken = await createSessionToken({ accountId, sessionTokenExpires });
    const outgoingMessage: Messages.ResponseLogin = {
      sessionToken,
    };
    res.status(200).send(outgoingMessage);
  } catch (error) {
    res.status(401).send('Unauthorized');
    return;
  }
});

app.post('/login', async (req, res) => {
  console.log('POST login');
  try {
    const message = Schema.decodeUnknownSync(Messages.RequestLogin)(req.body);
    const accountId = message.accountId;
    const nonce = await getSessionNonce({ accountId });
    const siweObject = new SiweMessage(message.message);
    if (siweObject.address !== accountId) {
      res.status(401).send('Unauthorized');
      return;
    }
    const { data: siweMessage } = await siweObject.verify({ signature: message.signature, nonce });
    if (!siweMessage.expirationTime) {
      res.status(400).send('Expiration time not set');
      return;
    }
    const sessionTokenExpires = new Date(siweMessage.expirationTime);
    const sessionToken = await createSessionToken({ accountId, sessionTokenExpires });
    const outgoingMessage: Messages.ResponseLogin = {
      sessionToken,
    };
    res.status(200).send(outgoingMessage);
  } catch (error) {
    res.status(401).send('Unauthorized');
    return;
  }
});

app.post('/identity', async (req, res) => {
  console.log('POST identity');
  const message = Schema.decodeUnknownSync(Messages.RequestCreateIdentity)(req.body);
  const accountId = message.keyBox.accountId;

  const nonce = await getSessionNonce({ accountId });
  const siweObject = new SiweMessage(message.message);
  const signatureAddress = Utils.publicKeyToAddress(message.signaturePublicKey as Hex);
  if (siweObject.address !== signatureAddress) {
    console.log('Address mismatch');
    res.status(401).send('Unauthorized');
    return;
  }
  const { data: siweMessage } = await siweObject.verify({ signature: message.signature, nonce });
  if (!siweMessage.expirationTime) {
    res.status(400).send('Expiration time not set');
    return;
  }
  if (
    !Identity.verifyIdentityOwnership(accountId, message.signaturePublicKey, message.accountProof, message.keyProof)
  ) {
    console.log('Ownership proof is invalid');
    res.status(401).send('Unauthorized');
    return;
  }
  try {
    await createIdentity({
      accountId,
      ciphertext: message.keyBox.ciphertext,
      nonce: message.keyBox.nonce,
      signaturePublicKey: message.signaturePublicKey,
      encryptionPublicKey: message.encryptionPublicKey,
      accountProof: message.accountProof,
      keyProof: message.keyProof,
    });
  } catch (error) {
    console.log('Error creating identity: ', error);
    const outgoingMessage: Messages.ResponseIdentityExistsError = {
      accountId,
    };
    res.status(400).send(outgoingMessage);
    return;
  }
  const sessionTokenExpires = new Date(siweMessage.expirationTime);
  const sessionToken = await createSessionToken({ accountId, sessionTokenExpires });
  const outgoingMessage: Messages.ResponseCreateIdentity = {
    sessionToken,
  };
  res.status(200).send(outgoingMessage);
});

app.get('/whoami', async (req, res) => {
  console.log('GET whoami');
  const sessionToken = req.headers.authorization?.split(' ')[1];
  if (!sessionToken) {
    res.status(401).send('Unauthorized');
    return;
  }
  try {
    const accountId = await getAccountIdBySessionToken({ sessionToken });
    res.status(200).send(accountId);
  } catch (error) {
    res.status(401).send('Unauthorized');
  }
});

app.get('/identity/encrypted', verifyAuth, async (req: AuthenticatedRequest, res) => {
  console.log('GET identity/encrypted');
  const accountId = req.accountId;
  if (!accountId) {
    // This shouldn't really happen
    throw new Error('No accountId after auth?');
  }
  try {
    const identity = await getIdentity({ accountId });
    const outgoingMessage: Messages.ResponseIdentityEncrypted = {
      keyBox: {
        accountId,
        ciphertext: identity.ciphertext,
        nonce: identity.nonce,
      },
    };
    res.status(200).send(outgoingMessage);
  } catch (error) {
    const outgoingMessage: Messages.ResponseIdentityNotFoundError = {
      accountId,
    };
    res.status(404).send(outgoingMessage);
  }
});

app.get('/identity', async (req, res) => {
  console.log('GET identity');
  const accountId = req.query.accountId as string;
  if (!accountId) {
    res.status(400).send('No accountId');
    return;
  }
  try {
    const identity = await getIdentity({ accountId });
    const outgoingMessage: Messages.ResponseIdentity = {
      accountId,
      signaturePublicKey: identity.signaturePublicKey,
      encryptionPublicKey: identity.encryptionPublicKey,
      accountProof: identity.accountProof,
      keyProof: identity.keyProof,
    };
    res.status(200).send(outgoingMessage);
  } catch (error) {
    const outgoingMessage: Messages.ResponseIdentityNotFoundError = {
      accountId,
    };
    res.status(404).send(outgoingMessage);
  }
});

app.get('/spaces/:spaceId/inboxes', async (req, res) => {
  console.log('GET spaces/:spaceId/inboxes');
  const spaceId = req.params.spaceId;
  const inboxes = await listPublicSpaceInboxes({ spaceId });
  const outgoingMessage: Messages.ResponseListSpaceInboxesPublic = {
    inboxes,
  };
  res.status(200).send(outgoingMessage);
});

app.get('/spaces/:spaceId/inboxes/:inboxId', async (req, res) => {
  console.log('GET spaces/:spaceId/inboxes/:inboxId');
  const spaceId = req.params.spaceId;
  const inboxId = req.params.inboxId;
  const inbox = await getSpaceInbox({ spaceId, inboxId });
  const outgoingMessage: Messages.ResponseSpaceInboxPublic = {
    inbox,
  };
  res.status(200).send(outgoingMessage);
});

app.post('/spaces/:spaceId/inboxes/:inboxId/messages', async (req, res) => {
  console.log('POST spaces/:spaceId/inboxes/:inboxId/messages');
  const spaceId = req.params.spaceId;
  const inboxId = req.params.inboxId;
  const message = Schema.decodeUnknownSync(Messages.RequestCreateSpaceInboxMessage)(req.body);
  let spaceInbox: Messages.SpaceInboxPublic;
  try {
    spaceInbox = await getSpaceInbox({ spaceId, inboxId });
  } catch (error) {
    res.status(404).send({ error: 'Inbox not found' });
    return;
  }

  switch (spaceInbox.authPolicy) {
    case 'requires_auth':
      if (!message.signature || !message.authorAccountId) {
        res.status(400).send({ error: 'Signature and authorAccountId required' });
        return;
      }
      break;
    case 'anonymous':
      if (message.signature || message.authorAccountId) {
        res.status(400).send({ error: 'Signature and authorAccountId not allowed' });
        return;
      }
      break;
    case 'optional_auth':
      if ((message.signature && !message.authorAccountId) || (!message.signature && message.authorAccountId)) {
        res.status(400).send({ error: 'Signature and authorAccountId must be provided together' });
        return;
      }
      break;
    default:
      // This shouldn't happen
      res.status(500).send({ error: 'Unknown auth policy' });
      return;
  }

  if (message.signature && message.authorAccountId) {
    // Recover the public key from the signature
    const authorPublicKey = Inboxes.recoverSpaceInboxMessageSigner(message, spaceId, inboxId);

    // Check if this public key corresponds to a user's identity
    let authorIdentity: GetIdentityResult;
    try {
      authorIdentity = await getIdentity({ signaturePublicKey: authorPublicKey });
    } catch (error) {
      res.status(403).send({ error: 'Not authorized to post to this inbox' });
      return;
    }
    if (authorIdentity.accountId !== message.authorAccountId) {
      res.status(403).send({ error: 'Not authorized to post to this inbox' });
      return;
    }
  }
  const createdMessage = await createSpaceInboxMessage({ spaceId, inboxId, message });
  res.status(200).send({});
  broadcastSpaceInboxMessage({ spaceId, inboxId, message: createdMessage });
});

app.get('/accounts/:accountId/inboxes', async (req, res) => {
  console.log('GET accounts/:accountId/inboxes');
  const accountId = req.params.accountId;
  const inboxes = await listPublicAccountInboxes({ accountId });
  const outgoingMessage: Messages.ResponseListAccountInboxesPublic = {
    inboxes,
  };
  res.status(200).send(outgoingMessage);
});

app.get('/accounts/:accountId/inboxes/:inboxId', async (req, res) => {
  console.log('GET accounts/:accountId/inboxes/:inboxId');
  const accountId = req.params.accountId;
  const inboxId = req.params.inboxId;
  const inbox = await getAccountInbox({ accountId, inboxId });
  const outgoingMessage: Messages.ResponseAccountInboxPublic = {
    inbox,
  };
  res.status(200).send(outgoingMessage);
});

app.post('/accounts/:accountId/inboxes/:inboxId/messages', async (req, res) => {
  console.log('POST accounts/:accountId/inboxes/:inboxId/messages');
  const accountId = req.params.accountId;
  const inboxId = req.params.inboxId;
  const message = Schema.decodeUnknownSync(Messages.RequestCreateAccountInboxMessage)(req.body);
  let accountInbox: Messages.AccountInboxPublic;
  try {
    accountInbox = await getAccountInbox({ accountId, inboxId });
  } catch (error) {
    res.status(404).send({ error: 'Inbox not found' });
    return;
  }

  switch (accountInbox.authPolicy) {
    case 'requires_auth':
      if (!message.signature || !message.authorAccountId) {
        res.status(400).send({ error: 'Signature and authorAccountId required' });
        return;
      }
      break;
    case 'anonymous':
      if (message.signature || message.authorAccountId) {
        res.status(400).send({ error: 'Signature and authorAccountId not allowed' });
        return;
      }
      break;
    case 'optional_auth':
      if ((message.signature && !message.authorAccountId) || (!message.signature && message.authorAccountId)) {
        res.status(400).send({ error: 'Signature and authorAccountId must be provided together' });
        return;
      }
      break;
    default:
      // This shouldn't happen
      res.status(500).send({ error: 'Unknown auth policy' });
      return;
  }
  if (message.signature && message.authorAccountId) {
    // Recover the public key from the signature
    const authorPublicKey = Inboxes.recoverAccountInboxMessageSigner(message, accountId, inboxId);

    // Check if this public key corresponds to a user's identity
    let authorIdentity: GetIdentityResult;
    try {
      authorIdentity = await getIdentity({ signaturePublicKey: authorPublicKey });
    } catch (error) {
      res.status(403).send({ error: 'Not authorized to post to this inbox' });
      return;
    }
    if (authorIdentity.accountId !== message.authorAccountId) {
      res.status(403).send({ error: 'Not authorized to post to this inbox' });
      return;
    }
  }
  const createdMessage = await createAccountInboxMessage({ accountId, inboxId, message });
  res.status(200).send({});
  broadcastAccountInboxMessage({ accountId, inboxId, message: createdMessage });
});

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

function broadcastSpaceEvents({
  spaceId,
  event,
  currentClient,
}: { spaceId: string; event: SpaceEvents.SpaceEvent; currentClient: CustomWebSocket }) {
  for (const client of webSocketServer.clients as Set<CustomWebSocket>) {
    if (currentClient === client) continue;

    const outgoingMessage: Messages.ResponseSpaceEvent = {
      type: 'space-event',
      spaceId,
      event,
    };
    if (client.readyState === WebSocket.OPEN && client.subscribedSpaces.has(spaceId)) {
      client.send(Messages.serialize(outgoingMessage));
    }
  }
}

function broadcastUpdates({
  spaceId,
  updates,
  currentClient,
}: { spaceId: string; updates: Messages.Updates; currentClient: CustomWebSocket }) {
  for (const client of webSocketServer.clients as Set<CustomWebSocket>) {
    if (currentClient === client) continue;

    const outgoingMessage: Messages.ResponseUpdatesNotification = {
      type: 'updates-notification',
      updates,
      spaceId,
    };
    if (client.readyState === WebSocket.OPEN && client.subscribedSpaces.has(spaceId)) {
      client.send(Messages.serialize(outgoingMessage));
    }
  }
}

function broadcastSpaceInboxMessage({
  spaceId,
  inboxId,
  message,
}: { spaceId: string; inboxId: string; message: Messages.InboxMessage }) {
  const outgoingMessage: Messages.ResponseSpaceInboxMessage = {
    type: 'space-inbox-message',
    spaceId,
    inboxId,
    message,
  };
  for (const client of webSocketServer.clients as Set<CustomWebSocket>) {
    if (client.readyState === WebSocket.OPEN && client.subscribedSpaces.has(spaceId)) {
      client.send(Messages.serialize(outgoingMessage));
    }
  }
}

function broadcastAccountInbox({ inbox }: { inbox: Messages.AccountInboxPublic }) {
  const outgoingMessage: Messages.ResponseAccountInbox = {
    type: 'account-inbox',
    inbox,
  };
  for (const client of webSocketServer.clients as Set<CustomWebSocket>) {
    if (client.readyState === WebSocket.OPEN && client.accountId === inbox.accountId) {
      client.send(Messages.serialize(outgoingMessage));
    }
  }
}

function broadcastAccountInboxMessage({
  accountId,
  inboxId,
  message,
}: { accountId: string; inboxId: string; message: Messages.InboxMessage }) {
  const outgoingMessage: Messages.ResponseAccountInboxMessage = {
    type: 'account-inbox-message',
    accountId,
    inboxId,
    message,
  };
  for (const client of webSocketServer.clients as Set<CustomWebSocket>) {
    if (client.readyState === WebSocket.OPEN && client.accountId === accountId) {
      client.send(Messages.serialize(outgoingMessage));
    }
  }
}

webSocketServer.on('connection', async (webSocket: CustomWebSocket, request: Request) => {
  console.log('WS connection');
  const params = parse(request.url, true);
  if (!params.query.token || typeof params.query.token !== 'string') {
    console.log('No token');
    webSocket.close();
    return;
  }
  let accountId: string;
  try {
    accountId = await getAccountIdBySessionToken({ sessionToken: params.query.token });
    webSocket.accountId = accountId;
  } catch (error) {
    console.log('Invalid token');
    webSocket.close();
    return;
  }
  console.log('Account ID:', accountId);
  webSocket.subscribedSpaces = new Set();

  console.log('Connection established', accountId);
  webSocket.on('message', async (message) => {
    const rawData = Messages.deserialize(message.toString());
    const result = decodeRequestMessage(rawData);
    if (result._tag === 'Right') {
      const data = result.right;
      switch (data.type) {
        case 'subscribe-space': {
          const space = await getSpace({ accountId, spaceId: data.id });
          const outgoingMessage: Messages.ResponseSpace = {
            ...space,
            type: 'space',
          };
          webSocket.subscribedSpaces.add(data.id);
          webSocket.send(Messages.serialize(outgoingMessage));
          break;
        }
        case 'list-spaces': {
          const spaces = await listSpaces({ accountId });
          const outgoingMessage: Messages.ResponseListSpaces = { type: 'list-spaces', spaces: spaces };
          webSocket.send(Messages.serialize(outgoingMessage));
          break;
        }
        case 'list-invitations': {
          const invitations = await listInvitations({ accountId });
          const outgoingMessage: Messages.ResponseListInvitations = {
            type: 'list-invitations',
            invitations: invitations,
          };
          webSocket.send(Messages.serialize(outgoingMessage));
          break;
        }
        case 'create-space-event': {
          const getVerifiedIdentity = (accountIdToFetch: string) => {
            if (accountIdToFetch !== accountId) {
              return Effect.fail(new Identity.InvalidIdentityError());
            }

            return Effect.gen(function* () {
              const identity = yield* Effect.tryPromise({
                try: () => getIdentity({ accountId: accountIdToFetch }),
                catch: () => new Identity.InvalidIdentityError(),
              });
              return identity;
            });
          };

          const applyEventResult = await Effect.runPromiseExit(
            SpaceEvents.applyEvent({
              event: data.event,
              state: undefined,
              getVerifiedIdentity,
            }),
          );
          if (Exit.isSuccess(applyEventResult)) {
            const space = await createSpace({ accountId, event: data.event, keyBox: data.keyBox, keyId: data.keyId });
            const spaceWithEvents = await getSpace({ accountId, spaceId: space.id });
            const outgoingMessage: Messages.ResponseSpace = {
              ...spaceWithEvents,
              type: 'space',
            };
            webSocket.send(Messages.serialize(outgoingMessage));
          } else {
            console.log('Failed to apply create space event');
            console.log(applyEventResult);
          }
          // TODO send back error
          break;
        }
        case 'create-invitation-event': {
          await applySpaceEvent({
            accountId,
            spaceId: data.spaceId,
            event: data.event,
            keyBoxes: data.keyBoxes.map((keyBox) => keyBox),
          });
          const spaceWithEvents = await getSpace({ accountId, spaceId: data.spaceId });
          // TODO send back confirmation instead of the entire space
          const outgoingMessage: Messages.ResponseSpace = {
            ...spaceWithEvents,
            type: 'space',
          };
          webSocket.send(Messages.serialize(outgoingMessage));
          for (const client of webSocketServer.clients as Set<CustomWebSocket>) {
            if (client.readyState === WebSocket.OPEN && client.accountId === data.event.transaction.inviteeAccountId) {
              const invitations = await listInvitations({ accountId: client.accountId });
              const outgoingMessage: Messages.ResponseListInvitations = {
                type: 'list-invitations',
                invitations: invitations,
              };
              // for now sending the entire list of invitations to the client - we could send only a single one
              client.send(Messages.serialize(outgoingMessage));
            }
          }

          broadcastSpaceEvents({ spaceId: data.spaceId, event: data.event, currentClient: webSocket });
          break;
        }
        case 'accept-invitation-event': {
          await applySpaceEvent({ accountId, spaceId: data.spaceId, event: data.event, keyBoxes: [] });
          const spaceWithEvents = await getSpace({ accountId, spaceId: data.spaceId });
          const outgoingMessage: Messages.ResponseSpace = {
            ...spaceWithEvents,
            type: 'space',
          };
          webSocket.send(Messages.serialize(outgoingMessage));
          broadcastSpaceEvents({ spaceId: data.spaceId, event: data.event, currentClient: webSocket });
          break;
        }
        case 'create-space-inbox-event': {
          await applySpaceEvent({ accountId, spaceId: data.spaceId, event: data.event, keyBoxes: [] });
          const spaceWithEvents = await getSpace({ accountId, spaceId: data.spaceId });
          // TODO send back confirmation instead of the entire space
          const outgoingMessage: Messages.ResponseSpace = {
            ...spaceWithEvents,
            type: 'space',
          };
          webSocket.send(Messages.serialize(outgoingMessage));
          broadcastSpaceEvents({ spaceId: data.spaceId, event: data.event, currentClient: webSocket });
          break;
        }
        case 'create-account-inbox': {
          try {
            // Check that the signature is valid for the corresponding accountId
            if (data.accountId !== accountId) {
              throw new Error('Invalid accountId');
            }
            const signer = Inboxes.recoverAccountInboxCreatorKey(data);
            const signerAccount = await getIdentity({ signaturePublicKey: signer });
            if (signerAccount.accountId !== accountId) {
              throw new Error('Invalid signature');
            }
            // Create the inbox (if it doesn't exist)
            await createAccountInbox(data);
            // Broadcast the inbox to other clients from the same account
            broadcastAccountInbox({ inbox: data });
          } catch (error) {
            console.error('Error creating account inbox:', error);
            return;
          }
          break;
        }
        case 'get-latest-space-inbox-messages': {
          try {
            // Check that the user has access to this space
            await getSpace({ accountId, spaceId: data.spaceId });
            const messages = await getLatestSpaceInboxMessages({
              inboxId: data.inboxId,
              since: data.since,
            });
            const outgoingMessage: Messages.ResponseSpaceInboxMessages = {
              type: 'space-inbox-messages',
              spaceId: data.spaceId,
              inboxId: data.inboxId,
              messages,
            };
            webSocket.send(Messages.serialize(outgoingMessage));
          } catch (error) {
            console.error('Error getting latest space inbox messages:', error);
            return;
          }
          break;
        }
        case 'get-latest-account-inbox-messages': {
          try {
            // Check that the user has access to this inbox
            await getAccountInbox({ accountId, inboxId: data.inboxId });
            const messages = await getLatestAccountInboxMessages({
              inboxId: data.inboxId,
              since: data.since,
            });
            const outgoingMessage: Messages.ResponseAccountInboxMessages = {
              type: 'account-inbox-messages',
              accountId,
              inboxId: data.inboxId,
              messages,
            };
            webSocket.send(Messages.serialize(outgoingMessage));
          } catch (error) {
            console.error('Error getting latest account inbox messages:', error);
            return;
          }
          break;
        }
        case 'get-account-inboxes': {
          const inboxes = await listAccountInboxes({ accountId });
          const outgoingMessage: Messages.ResponseAccountInboxes = {
            type: 'account-inboxes',
            inboxes,
          };
          webSocket.send(Messages.serialize(outgoingMessage));
          break;
        }
        case 'create-update': {
          try {
            // Check that the update was signed by a valid identity
            // belonging to this accountId
            const signer = Messages.recoverUpdateMessageSigner(data);
            const identity = await getIdentity({ signaturePublicKey: signer });
            if (identity.accountId !== accountId) {
              throw new Error('Invalid signature');
            }
            const update = await createUpdate({
              accountId,
              spaceId: data.spaceId,
              update: data.update,
              signatureHex: data.signature.hex,
              signatureRecovery: data.signature.recovery,
              updateId: data.updateId,
            });
            const outgoingMessage: Messages.ResponseUpdateConfirmed = {
              type: 'update-confirmed',
              updateId: data.updateId,
              clock: update.clock,
              spaceId: data.spaceId,
            };
            webSocket.send(Messages.serialize(outgoingMessage));

            broadcastUpdates({
              spaceId: data.spaceId,
              updates: {
                updates: [
                  {
                    accountId,
                    update: data.update,
                    signature: data.signature,
                    updateId: data.updateId,
                  },
                ],
                firstUpdateClock: update.clock,
                lastUpdateClock: update.clock,
              },
              currentClient: webSocket,
            });
          } catch (err) {
            console.error('Error creating update:', err);
          }
          break;
        }
        default:
          Utils.assertExhaustive(data);
          break;
      }
    }
  });
  webSocket.on('close', () => {
    console.log('Connection closed');
  });
});

server.on('upgrade', async (request, socket, head) => {
  webSocketServer.handleUpgrade(request, socket, head, (currentSocket) => {
    webSocketServer.emit('connection', currentSocket, request);
  });
});
