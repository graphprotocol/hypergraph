import { uuid } from '@automerge/automerge';
import { NetworkAdapter } from '@automerge/automerge-repo';
import type { DocumentId, Message, PeerId, PeerMetadata, SyncMessage } from '@automerge/automerge-repo/slim';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { Effect, Exit } from 'effect';
import * as Schema from 'effect/Schema';
import {
  type RequestCreateUpdate,
  ResponseMessage,
  type SpaceEvent,
  type SpaceState,
  type Updates,
  applyEvent,
  decryptKey,
  decryptMessage,
  deserialize,
  encryptMessage,
  serialize,
} from 'graph-framework';
import { store } from './store';

const decodeResponseMessage = Schema.decodeUnknownEither(ResponseMessage);

export class GraphFrameworkNetworkAdapter extends NetworkAdapter {
  webSocket?: WebSocket;
  remotePeerId = 'graph-sync-server' as PeerId;

  setWebSocket(websocket: WebSocket) {
    this.webSocket = websocket;
    this.webSocket.addEventListener('message', this.onMessage);
  }

  isReady() {
    console.log('isReady');
    return true;
  }

  whenReady() {
    console.log('whenReady');
    return Promise.resolve();
  }

  connect(peerId: PeerId, _peerMetadata?: PeerMetadata) {
    this.peerId = peerId;

    this.emit('peer-candidate', { peerId: this.remotePeerId, peerMetadata: {} });
  }

  send = (message: Message) => {
    if (!this.webSocket) {
      console.error('WebSocket must be set before sending a message');
      return;
    }
    if (!message.data) {
      console.warn('Message data must be set before sending a message', message);
      return;
    }
    if (message.targetId === this.peerId) {
      console.warn('Message targetId is the peerId');
      return;
    }
    console.log('send', this.peerId, message.targetId, message);

    try {
      const storeState = store.getSnapshot();
      const space = storeState.context.spaces[0];

      const ephemeralId = uuid();

      const nonceAndCiphertext = encryptMessage({
        message: message.data,
        secretKey: hexToBytes(space.keys[0].key),
      });

      const messageToSend: RequestCreateUpdate = {
        type: 'create-update',
        ephemeralId,
        update: nonceAndCiphertext,
        spaceId: space.id,
      };
      this.webSocket.send(serialize(messageToSend));
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  onMessage = async (event: MessageEvent) => {
    const data = deserialize(event.data);
    const message = decodeResponseMessage(data);
    if (message._tag === 'Right') {
      const response = message.right;
      switch (response.type) {
        case 'space': {
          let state: SpaceState | undefined = undefined;

          for (const event of response.events) {
            const applyEventResult = await Effect.runPromiseExit(applyEvent({ state: undefined, event }));
            if (Exit.isSuccess(applyEventResult)) {
              state = applyEventResult.value;
            }
          }

          const newState = state as SpaceState;

          const storeState = store.getSnapshot();

          const keys = response.keyBoxes.map((keyBox) => {
            const key = decryptKey({
              keyBoxCiphertext: hexToBytes(keyBox.ciphertext),
              keyBoxNonce: hexToBytes(keyBox.nonce),
              publicKey: hexToBytes(keyBox.authorPublicKey),
              privateKey: hexToBytes(storeState.context.encryptionPrivateKey),
            });
            return { id: keyBox.id, key: bytesToHex(key) };
          });

          store.send({
            type: 'setSpace',
            spaceId: response.id,
            updates: response.updates as Updates,
            events: response.events as SpaceEvent[],
            spaceState: newState,
            keys,
          });

          if (response.updates && this.peerId) {
            const updates = response.updates?.updates.map((update) => {
              return decryptMessage({
                nonceAndCiphertext: update,
                secretKey: hexToBytes(keys[0].key),
              });
            });

            for (const update of updates) {
              const message: SyncMessage = {
                type: 'sync',
                senderId: this.remotePeerId,
                targetId: this.peerId,
                data: update,
                documentId: storeState.context.automergeDocumentId as DocumentId,
              };
              this.emit('message', message);
            }

            store.send({
              type: 'applyUpdate',
              spaceId: response.id,
              firstUpdateClock: response.updates?.firstUpdateClock,
              lastUpdateClock: response.updates?.lastUpdateClock,
            });
          }
          break;
        }
        case 'update-confirmed': {
          store.send({
            type: 'removeUpdateInFlight',
            ephemeralId: response.ephemeralId,
          });
          store.send({
            type: 'updateConfirmed',
            spaceId: response.spaceId,
            clock: response.clock,
          });
          break;
        }
        case 'updates-notification': {
          // setSpaces((spaces) =>
          //   spaces.map((space) => {
          //     if (space.id === response.spaceId) {
          //       let lastUpdateClock = space.lastUpdateClock;
          //       if (response.updates.firstUpdateClock === space.lastUpdateClock + 1) {
          //         lastUpdateClock = response.updates.lastUpdateClock;
          //       } else {
          //         // TODO request missing updates from server
          //       }

          //       const newUpdates = (response.updates ? response.updates.updates : []).map((encryptedUpdate) => {
          //         return decryptMessage({
          //           nonceAndCiphertext: encryptedUpdate,
          //           secretKey: hexToBytes(space.keys[0].key),
          //         });
          //       });

          //       return {
          //         ...space,
          //         updates: [...space.updates, ...newUpdates],
          //         lastUpdateClock,
          //       };
          //     }
          //     return space;
          //   }),
          // );

          store.send({
            type: 'applyUpdate',
            spaceId: response.spaceId,
            firstUpdateClock: response.updates.firstUpdateClock,
            lastUpdateClock: response.updates.lastUpdateClock,
          });
          break;
        }
      }
    }
  };

  disconnect() {
    console.log('disconnect');
  }

  receiveMessage(messageBytes: Uint8Array) {
    // decode message
    console.log('receiveMessage', messageBytes);

    // this.emit('message', messageBytes);
  }
}
