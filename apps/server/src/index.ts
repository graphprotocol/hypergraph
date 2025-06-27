import { Connect, Identity, Inboxes, Messages, SpaceEvents, Utils } from '@graphprotocol/hypergraph';
import { bytesToHex, randomBytes } from '@noble/hashes/utils.js';
import cors from 'cors';
import { Effect, Exit, Schema } from 'effect';
import express, { type Request, type Response } from 'express';
import { parse } from 'node:url';
import WebSocket, { WebSocketServer } from 'ws';
import { addAppIdentityToSpaces } from './handlers/add-app-identity-to-spaces.js';
import { applySpaceEvent } from './handlers/applySpaceEvent.js';
import { createAppIdentity } from './handlers/create-app-identity.js';
import { createSpace } from './handlers/create-space.js';
import { createAccountInbox } from './handlers/createAccountInbox.js';
import { createAccountInboxMessage } from './handlers/createAccountInboxMessage.js';
import { createIdentity } from './handlers/createIdentity.js';
import { createSpaceInboxMessage } from './handlers/createSpaceInboxMessage.js';
import { createUpdate } from './handlers/createUpdate.js';
import { findAppIdentity } from './handlers/find-app-identity.js';
import { getAppIdentityBySessionToken } from './handlers/get-app-identity-by-session-token.js';
import { getAccountInbox } from './handlers/getAccountInbox.js';
import { type GetIdentityResult, getConnectIdentity } from './handlers/getConnectIdentity.js';
import { getLatestAccountInboxMessages } from './handlers/getLatestAccountInboxMessages.js';
import { getLatestSpaceInboxMessages } from './handlers/getLatestSpaceInboxMessages.js';
import { getSpace } from './handlers/getSpace.js';
import { getSpaceInbox } from './handlers/getSpaceInbox.js';
import { isSignerForAccount } from './handlers/is-signer-for-account.js';
import { listAccountInboxes } from './handlers/list-account-inboxes.js';
import { listPublicAccountInboxes } from './handlers/list-public-account-inboxes.js';
import { listSpacesByAccount } from './handlers/list-spaces-by-account.js';
import { listInvitations } from './handlers/listInvitations.js';
import { listPublicSpaceInboxes } from './handlers/listPublicSpaceInboxes.js';
import { listSpacesByAppIdentity } from './handlers/listSpacesByAppIdentity.js';
import { getAddressByPrivyToken } from './utils/get-address-by-privy-token.js';

interface CustomWebSocket extends WebSocket {
  accountAddress: string;
  appIdentityAddress: string;
  subscribedSpaces: Set<string>;
}

const decodeRequestMessage = Schema.decodeUnknownEither(Messages.RequestMessage);

const webSocketServer = new WebSocketServer({ noServer: true });
const PORT = process.env.PORT !== undefined ? Number.parseInt(process.env.PORT) : 3030;
const app = express();
const CHAIN = process.env.HYPERGRAPH_CHAIN === 'geogenesis' ? Connect.GEOGENESIS : Connect.GEO_TESTNET;
const RPC_URL = process.env.HYPERGRAPH_RPC_URL ?? CHAIN.rpcUrls.default.http[0];

type AuthenticatedRequest = Request & { accountAddress?: string };

async function verifyAuth(req: AuthenticatedRequest, res: Response, next: (err?: Error) => void) {
  const auth = req.headers.authorization;
  if (!auth) {
    res.status(401).send('Unauthorized');
    return;
  }
  try {
    const sessionToken = auth.split(' ')[1];
    const { accountAddress } = await getAppIdentityBySessionToken({ sessionToken });
    req.accountAddress = accountAddress;
    next();
  } catch (error) {
    res.status(401).send('Unauthorized');
    return;
  }
}

app.use(express.json({ limit: '2mb' }));

app.use(cors());

app.get('/', (_req, res) => {
  res.send('Server is running (v0.0.8)');
});

app.get('/connect/spaces', async (req, res) => {
  console.log('GET connect/spaces');
  try {
    const idToken = req.headers['privy-id-token'];
    const accountAddress = req.headers['account-address'] as string;
    const signerAddress = await getAddressByPrivyToken(idToken);
    if (!(await isSignerForAccount(signerAddress, accountAddress))) {
      res.status(401).send('Unauthorized');
      return;
    }
    const spaces = await listSpacesByAccount({ accountAddress });
    const spaceResults = spaces.map((space) => ({
      id: space.id,
      infoContent: Utils.bytesToHex(space.infoContent),
      infoAuthorAddress: space.infoAuthorAddress,
      infoSignatureHex: space.infoSignatureHex,
      infoSignatureRecovery: space.infoSignatureRecovery,
      name: space.name, // TODO: remove this field and use infoContent instead
      appIdentities: space.appIdentities.map((appIdentity) => ({
        appId: appIdentity.appId,
        address: appIdentity.address,
      })),
      keyBoxes: space.keys
        .filter((key) => key.keyBoxes.length > 0)
        .map((key) => {
          return {
            id: key.id,
            ciphertext: key.keyBoxes[0].ciphertext,
            nonce: key.keyBoxes[0].nonce,
            authorPublicKey: key.keyBoxes[0].authorPublicKey,
          };
        }),
    }));
    res.status(200).json({ spaces: spaceResults });
  } catch (error) {
    console.error('Error listing spaces:', error);
    if (error instanceof Error && error.message === 'No Privy ID token provided') {
      res.status(401).json({ message: 'Unauthorized' });
    } else if (error instanceof Error && error.message === 'Missing Privy configuration') {
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  }
});

app.post('/connect/spaces', async (req, res) => {
  console.log('POST connect/spaces');
  try {
    const idToken = req.headers['privy-id-token'];
    const message = Schema.decodeUnknownSync(Messages.RequestConnectCreateSpaceEvent)(req.body);
    const accountAddress = message.accountAddress;
    const signerAddress = await getAddressByPrivyToken(idToken);
    if (!(await isSignerForAccount(signerAddress, accountAddress))) {
      res.status(401).send('Unauthorized');
      return;
    }
    const space = await createSpace({
      accountAddress,
      event: message.event,
      keyBox: message.keyBox,
      infoContent: Utils.hexToBytes(message.infoContent),
      infoSignatureHex: message.infoSignature.hex,
      infoSignatureRecovery: message.infoSignature.recovery,
      name: message.name, // TODO: remove this field and use infoContent instead
    });
    res.status(200).json({ space });
  } catch (error) {
    console.error('Error creating space:', error);
    if (error instanceof Error && error.message === 'No Privy ID token provided') {
      res.status(401).json({ message: 'Unauthorized' });
    } else if (error instanceof Error && error.message === 'Missing Privy configuration') {
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  }
});

app.post('/connect/add-app-identity-to-spaces', async (req, res) => {
  console.log('POST connect/add-app-identity-to-spaces');
  try {
    const idToken = req.headers['privy-id-token'];

    const signerAddress = await getAddressByPrivyToken(idToken);
    const message = Schema.decodeUnknownSync(Messages.RequestConnectAddAppIdentityToSpaces)(req.body);
    if (!(await isSignerForAccount(signerAddress, message.accountAddress))) {
      res.status(401).send('Unauthorized');
      return;
    }
    const space = await addAppIdentityToSpaces({
      accountAddress: message.accountAddress,
      appIdentityAddress: message.appIdentityAddress,
      spacesInput: message.spacesInput,
    });
    res.status(200).json({ space });
  } catch (error) {
    console.error('Error creating space:', error);
    if (error instanceof Error && error.message === 'No Privy ID token provided') {
      res.status(401).json({ message: 'Unauthorized' });
    } else if (error instanceof Error && error.message === 'Missing Privy configuration') {
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  }
});

app.post('/connect/identity', async (req, res) => {
  console.log('POST connect/identity');
  try {
    const idToken = req.headers['privy-id-token'];
    const signerAddress = await getAddressByPrivyToken(idToken);
    const message = Schema.decodeUnknownSync(Messages.RequestConnectCreateIdentity)(req.body);
    const accountAddress = message.keyBox.accountAddress;

    if (signerAddress !== message.keyBox.signer) {
      res.status(401).send('Unauthorized');
      return;
    }
    if (
      !(await Identity.verifyIdentityOwnership(
        accountAddress,
        message.signaturePublicKey,
        message.accountProof,
        message.keyProof,
        CHAIN,
        RPC_URL,
      ))
    ) {
      console.log('Ownership proof is invalid');
      res.status(401).send('Unauthorized');
      return;
    }
    console.log('Ownership proof is valid');

    try {
      await createIdentity({
        signerAddress,
        accountAddress,
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
        accountAddress,
      };
      res.status(400).send(outgoingMessage);
      return;
    }
    const outgoingMessage: Messages.ResponseConnectCreateIdentity = {
      success: true,
    };
    res.status(200).send(outgoingMessage);
  } catch (error) {
    console.error('Error creating identity:', error);
    if (error instanceof Error && error.message === 'No Privy ID token provided') {
      res.status(401).json({ message: 'Unauthorized' });
    } else if (error instanceof Error && error.message === 'Missing Privy configuration') {
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  }
});

app.get('/connect/identity/encrypted', async (req, res) => {
  console.log('GET connect/identity/encrypted');
  try {
    const idToken = req.headers['privy-id-token'];
    const signerAddress = await getAddressByPrivyToken(idToken);
    const accountAddress = req.headers['account-address'] as string;
    if (!(await isSignerForAccount(signerAddress, accountAddress))) {
      res.status(401).send('Unauthorized');
      return;
    }
    const identity = await getConnectIdentity({ accountAddress });
    const outgoingMessage: Messages.ResponseIdentityEncrypted = {
      keyBox: {
        accountAddress,
        ciphertext: identity.ciphertext,
        nonce: identity.nonce,
        signer: signerAddress,
      },
    };
    res.status(200).send(outgoingMessage);
  } catch (error) {
    console.error('Error creating space:', error);
    if (error instanceof Error && error.message === 'No Privy ID token provided') {
      res.status(401).json({ message: 'Unauthorized' });
    } else if (error instanceof Error && error.message === 'Missing Privy configuration') {
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  }
});

app.get('/connect/app-identity/:appId', async (req, res) => {
  console.log('GET connect/app-identity/:appId');
  try {
    const idToken = req.headers['privy-id-token'];
    const signerAddress = await getAddressByPrivyToken(idToken);
    const accountAddress = req.headers['account-address'] as string;
    if (!(await isSignerForAccount(signerAddress, accountAddress))) {
      res.status(401).send('Unauthorized');
      return;
    }
    const appId = req.params.appId;
    const appIdentity = await findAppIdentity({ accountAddress, appId });
    if (!appIdentity) {
      console.log('App identity not found');
      res.status(404).json({ message: 'App identity not found' });
      return;
    }
    console.log('App identity found');
    res.status(200).json({ appIdentity });
  } catch (error) {
    console.error('Error getting app identity:', error);
    if (error instanceof Error && error.message === 'No Privy ID token provided') {
      res.status(401).json({ message: 'Unauthorized' });
    } else if (error instanceof Error && error.message === 'Missing Privy configuration') {
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  }
});

app.post('/connect/app-identity', async (req, res) => {
  console.log('POST connect/app-identity');
  try {
    const idToken = req.headers['privy-id-token'];
    const signerAddress = await getAddressByPrivyToken(idToken);
    const message = Schema.decodeUnknownSync(Messages.RequestConnectCreateAppIdentity)(req.body);
    const accountAddress = message.accountAddress;
    if (!(await isSignerForAccount(signerAddress, accountAddress))) {
      console.log('Signer address is not the signer for the account');
      res.status(401).send('Unauthorized');
      return;
    }
    const sessionToken = bytesToHex(randomBytes(32));
    const sessionTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
    const appIdentity = await createAppIdentity({
      accountAddress,
      appId: message.appId,
      address: message.address,
      ciphertext: message.ciphertext,
      nonce: message.nonce,
      signaturePublicKey: message.signaturePublicKey,
      encryptionPublicKey: message.encryptionPublicKey,
      accountProof: message.accountProof,
      keyProof: message.keyProof,
      sessionToken,
      sessionTokenExpires,
    });
    res.status(200).json({ appIdentity });
  } catch (error) {
    console.error('Error creating app identity:', error);
    if (error instanceof Error && error.message === 'No Privy ID token provided') {
      res.status(401).json({ message: 'Unauthorized' });
    } else if (error instanceof Error && error.message === 'Missing Privy configuration') {
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  }
});

app.get('/whoami', async (req, res) => {
  console.log('GET whoami');
  const sessionToken = req.headers.authorization?.split(' ')[1];
  if (!sessionToken) {
    res.status(401).send('Unauthorized');
    return;
  }
  try {
    const { accountAddress } = await getAppIdentityBySessionToken({ sessionToken });
    res.status(200).send(accountAddress);
  } catch (error) {
    res.status(401).send('Unauthorized');
  }
});

app.get('/identity', async (req, res) => {
  console.log('GET identity');
  const accountAddress = req.query.accountAddress as string;
  if (!accountAddress) {
    res.status(400).send('No accountAddress');
    return;
  }
  try {
    const identity = await getConnectIdentity({ accountAddress });
    const outgoingMessage: Messages.ResponseIdentity = {
      accountAddress,
      signaturePublicKey: identity.signaturePublicKey,
      encryptionPublicKey: identity.encryptionPublicKey,
      accountProof: identity.accountProof,
      keyProof: identity.keyProof,
    };
    res.status(200).send(outgoingMessage);
  } catch (error) {
    const outgoingMessage: Messages.ResponseIdentityNotFoundError = {
      accountAddress,
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
      if (!message.signature || !message.authorAccountAddress) {
        res.status(400).send({ error: 'Signature and authorAccountAddress required' });
        return;
      }
      break;
    case 'anonymous':
      if (message.signature || message.authorAccountAddress) {
        res.status(400).send({ error: 'Signature and authorAccountAddress not allowed' });
        return;
      }
      break;
    case 'optional_auth':
      if (
        (message.signature && !message.authorAccountAddress) ||
        (!message.signature && message.authorAccountAddress)
      ) {
        res.status(400).send({ error: 'Signature and authorAccountAddress must be provided together' });
        return;
      }
      break;
    default:
      // This shouldn't happen
      res.status(500).send({ error: 'Unknown auth policy' });
      return;
  }

  if (message.signature && message.authorAccountAddress) {
    // Recover the public key from the signature
    const authorPublicKey = Inboxes.recoverSpaceInboxMessageSigner(message, spaceId, inboxId);

    // Check if this public key corresponds to a user's identity
    let authorIdentity: GetIdentityResult;
    try {
      authorIdentity = await getConnectIdentity({ connectSignaturePublicKey: authorPublicKey });
    } catch (error) {
      res.status(403).send({ error: 'Not authorized to post to this inbox' });
      return;
    }
    if (authorIdentity.accountAddress !== message.authorAccountAddress) {
      res.status(403).send({ error: 'Not authorized to post to this inbox' });
      return;
    }
  }
  const createdMessage = await createSpaceInboxMessage({ spaceId, inboxId, message });
  res.status(200).send({});
  broadcastSpaceInboxMessage({ spaceId, inboxId, message: createdMessage });
});

app.get('/accounts/:accountAddress/inboxes', async (req, res) => {
  console.log('GET accounts/:accountAddress/inboxes');
  const accountAddress = req.params.accountAddress;
  const inboxes = await listPublicAccountInboxes({ accountAddress });
  const outgoingMessage: Messages.ResponseListAccountInboxesPublic = {
    inboxes,
  };
  res.status(200).send(outgoingMessage);
});

app.get('/accounts/:accountAddress/inboxes/:inboxId', async (req, res) => {
  console.log('GET accounts/:accountAddress/inboxes/:inboxId');
  const accountAddress = req.params.accountAddress;
  const inboxId = req.params.inboxId;
  const inbox = await getAccountInbox({ accountAddress, inboxId });
  const outgoingMessage: Messages.ResponseAccountInboxPublic = {
    inbox,
  };
  res.status(200).send(outgoingMessage);
});

app.post('/accounts/:accountAddress/inboxes/:inboxId/messages', async (req, res) => {
  console.log('POST accounts/:accountAddress/inboxes/:inboxId/messages');
  const accountAddress = req.params.accountAddress;
  const inboxId = req.params.inboxId;
  const message = Schema.decodeUnknownSync(Messages.RequestCreateAccountInboxMessage)(req.body);
  let accountInbox: Messages.AccountInboxPublic;
  try {
    accountInbox = await getAccountInbox({ accountAddress, inboxId });
  } catch (error) {
    res.status(404).send({ error: 'Inbox not found' });
    return;
  }

  switch (accountInbox.authPolicy) {
    case 'requires_auth':
      if (!message.signature || !message.authorAccountAddress) {
        res.status(400).send({ error: 'Signature and authorAccountAddress required' });
        return;
      }
      break;
    case 'anonymous':
      if (message.signature || message.authorAccountAddress) {
        res.status(400).send({ error: 'Signature and authorAccountAddress not allowed' });
        return;
      }
      break;
    case 'optional_auth':
      if (
        (message.signature && !message.authorAccountAddress) ||
        (!message.signature && message.authorAccountAddress)
      ) {
        res.status(400).send({ error: 'Signature and authorAccountAddress must be provided together' });
        return;
      }
      break;
    default:
      // This shouldn't happen
      res.status(500).send({ error: 'Unknown auth policy' });
      return;
  }
  if (message.signature && message.authorAccountAddress) {
    // Recover the public key from the signature
    const authorPublicKey = Inboxes.recoverAccountInboxMessageSigner(message, accountAddress, inboxId);

    // Check if this public key corresponds to a user's identity
    let authorIdentity: GetIdentityResult;
    try {
      authorIdentity = await getConnectIdentity({ connectSignaturePublicKey: authorPublicKey });
    } catch (error) {
      res.status(403).send({ error: 'Not authorized to post to this inbox' });
      return;
    }
    if (authorIdentity.accountAddress !== message.authorAccountAddress) {
      res.status(403).send({ error: 'Not authorized to post to this inbox' });
      return;
    }
  }
  const createdMessage = await createAccountInboxMessage({ accountAddress, inboxId, message });
  res.status(200).send({});
  broadcastAccountInboxMessage({ accountAddress, inboxId, message: createdMessage });
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
    if (client.readyState === WebSocket.OPEN && client.accountAddress === inbox.accountAddress) {
      client.send(Messages.serialize(outgoingMessage));
    }
  }
}

function broadcastAccountInboxMessage({
  accountAddress,
  inboxId,
  message,
}: { accountAddress: string; inboxId: string; message: Messages.InboxMessage }) {
  const outgoingMessage: Messages.ResponseAccountInboxMessage = {
    type: 'account-inbox-message',
    accountAddress,
    inboxId,
    message,
  };
  for (const client of webSocketServer.clients as Set<CustomWebSocket>) {
    if (client.readyState === WebSocket.OPEN && client.accountAddress === accountAddress) {
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
  let accountAddress: string;
  let appIdentityAddress: string;
  try {
    const result = await getAppIdentityBySessionToken({ sessionToken: params.query.token });
    accountAddress = result.accountAddress;
    webSocket.accountAddress = result.accountAddress;
    appIdentityAddress = result.address;
    webSocket.appIdentityAddress = result.address;
  } catch (error) {
    console.log('Invalid token');
    webSocket.close();
    return;
  }
  console.log('Account Address:', accountAddress);
  webSocket.subscribedSpaces = new Set();

  console.log('Connection established', accountAddress);
  webSocket.on('message', async (message) => {
    const rawData = Messages.deserialize(message.toString());
    const result = decodeRequestMessage(rawData);
    if (result._tag === 'Right') {
      const data = result.right;
      switch (data.type) {
        case 'subscribe-space': {
          const space = await getSpace({ accountAddress, spaceId: data.id });
          const outgoingMessage: Messages.ResponseSpace = {
            ...space,
            type: 'space',
          };
          webSocket.subscribedSpaces.add(data.id);
          webSocket.send(Messages.serialize(outgoingMessage));
          break;
        }
        case 'list-spaces': {
          const spaces = await listSpacesByAppIdentity({ appIdentityAddress });
          const outgoingMessage: Messages.ResponseListSpaces = { type: 'list-spaces', spaces: spaces };
          webSocket.send(Messages.serialize(outgoingMessage));
          break;
        }
        case 'list-invitations': {
          const invitations = await listInvitations({ accountAddress });
          const outgoingMessage: Messages.ResponseListInvitations = {
            type: 'list-invitations',
            invitations: invitations,
          };
          webSocket.send(Messages.serialize(outgoingMessage));
          break;
        }
        case 'create-space-event': {
          const getVerifiedIdentity = (accountAddressToFetch: string) => {
            console.log(
              'TODO getVerifiedIdentity should work for app identities',
              accountAddressToFetch,
              accountAddress,
            );
            if (accountAddressToFetch !== accountAddress) {
              return Effect.fail(new Identity.InvalidIdentityError());
            }

            return Effect.gen(function* () {
              const identity = yield* Effect.tryPromise({
                try: () => getConnectIdentity({ accountAddress: accountAddressToFetch }),
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
            const space = await createSpace({
              accountAddress,
              event: data.event,
              keyBox: data.keyBox,
              infoContent: new Uint8Array(),
              infoSignatureHex: '',
              infoSignatureRecovery: 0,
              name: data.name,
            });
            const spaceWithEvents = await getSpace({ accountAddress, spaceId: space.id });
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
            accountAddress,
            spaceId: data.spaceId,
            event: data.event,
            keyBoxes: data.keyBoxes.map((keyBox) => keyBox),
          });
          const spaceWithEvents = await getSpace({ accountAddress, spaceId: data.spaceId });
          // TODO send back confirmation instead of the entire space
          const outgoingMessage: Messages.ResponseSpace = {
            ...spaceWithEvents,
            type: 'space',
          };
          webSocket.send(Messages.serialize(outgoingMessage));
          for (const client of webSocketServer.clients as Set<CustomWebSocket>) {
            if (
              client.readyState === WebSocket.OPEN &&
              client.accountAddress === data.event.transaction.inviteeAccountAddress
            ) {
              const invitations = await listInvitations({ accountAddress: client.accountAddress });
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
          await applySpaceEvent({ accountAddress, spaceId: data.spaceId, event: data.event, keyBoxes: [] });
          const spaceWithEvents = await getSpace({ accountAddress, spaceId: data.spaceId });
          const outgoingMessage: Messages.ResponseSpace = {
            ...spaceWithEvents,
            type: 'space',
          };
          webSocket.send(Messages.serialize(outgoingMessage));
          broadcastSpaceEvents({ spaceId: data.spaceId, event: data.event, currentClient: webSocket });
          break;
        }
        case 'create-space-inbox-event': {
          await applySpaceEvent({ accountAddress, spaceId: data.spaceId, event: data.event, keyBoxes: [] });
          const spaceWithEvents = await getSpace({ accountAddress, spaceId: data.spaceId });
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
            // Check that the signature is valid for the corresponding accountAddress
            if (data.accountAddress !== accountAddress) {
              throw new Error('Invalid accountAddress');
            }
            const signer = Inboxes.recoverAccountInboxCreatorKey(data);
            const signerAccount = await getConnectIdentity({ connectSignaturePublicKey: signer });
            if (signerAccount.accountAddress !== accountAddress) {
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
            await getSpace({ accountAddress, spaceId: data.spaceId });
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
            await getAccountInbox({ accountAddress, inboxId: data.inboxId });
            const messages = await getLatestAccountInboxMessages({
              inboxId: data.inboxId,
              since: data.since,
            });
            const outgoingMessage: Messages.ResponseAccountInboxMessages = {
              type: 'account-inbox-messages',
              accountAddress,
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
          const inboxes = await listAccountInboxes({ accountAddress });
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
            // belonging to this accountAddress
            const signer = Messages.recoverUpdateMessageSigner(data);
            const identity = await getConnectIdentity({ connectSignaturePublicKey: signer });
            if (identity.accountAddress !== accountAddress) {
              throw new Error('Invalid signature');
            }
            const update = await createUpdate({
              accountAddress,
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
                    accountAddress,
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
