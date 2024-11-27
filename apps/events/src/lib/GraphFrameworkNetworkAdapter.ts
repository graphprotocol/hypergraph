import { uuid } from '@automerge/automerge';
import { NetworkAdapter } from '@automerge/automerge-repo';
import type { Message, PeerId, PeerMetadata } from '@automerge/automerge-repo/slim';
import { hexToBytes } from '@noble/hashes/utils';
import * as Schema from 'effect/Schema';
import { type RequestCreateUpdate, ResponseMessage, deserialize, encryptMessage, serialize } from 'graph-framework';
import { store } from './store';

const decodeResponseMessage = Schema.decodeUnknownEither(ResponseMessage);

export class GraphFrameworkNetworkAdapter extends NetworkAdapter {
  webSocket?: WebSocket;

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

  connect(_peerId: PeerId, _peerMetadata?: PeerMetadata) {
    console.log('connect', _peerId, _peerMetadata);
    const remotePeerId = 'graph-sync-server' as PeerId;

    this.emit('peer-candidate', { peerId: remotePeerId, peerMetadata: {} });
  }

  send(message: Message) {
    console.log('send', message);
    if (!this.webSocket) {
      console.error('WebSocket must be set before sending a message');
      return;
    }
    // get spaceId, spaceId for DocumentId
    const storeState = store.getSnapshot();
    const space = storeState.context.spaces[0];

    const ephemeralId = uuid();

    const nonceAndCiphertext = encryptMessage({
      message: new Uint8Array([0]),
      secretKey: hexToBytes(space.keys[0].key),
    });

    const messageToSend: RequestCreateUpdate = {
      type: 'create-update',
      ephemeralId,
      update: nonceAndCiphertext,
      spaceId: space.id,
    };
    this.webSocket.send(serialize(messageToSend));
  }

  async onMessage(event: MessageEvent) {
    const data = deserialize(event.data);
    const message = decodeResponseMessage(data);
    if (message._tag === 'Right') {
      const response = message.right;
      switch (response.type) {
        case 'space': {
          break;
        }
        case 'update-confirmed': {
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
          break;
        }
      }
    }
  }

  disconnect() {
    console.log('disconnect');
  }

  receiveMessage(messageBytes: Uint8Array) {
    // decode message
    console.log('receiveMessage', messageBytes);

    // this.emit('message', messageBytes);
  }
}
