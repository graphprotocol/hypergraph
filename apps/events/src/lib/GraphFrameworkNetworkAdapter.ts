import { uuid } from '@automerge/automerge';
import { NetworkAdapter } from '@automerge/automerge-repo';
import type { Message, PeerId, PeerMetadata } from '@automerge/automerge-repo/slim';
import { hexToBytes } from '@noble/hashes/utils';
import * as Schema from 'effect/Schema';
import { type RequestCreateUpdate, ResponseMessage, deserialize, encryptMessage, serialize } from 'graph-framework';

const decodeResponseMessage = Schema.decodeUnknownEither(ResponseMessage);

export class GraphFrameworkNetworkAdapter extends NetworkAdapter {
  webSocket?: WebSocket;
  spaceId?: string;
  setUpdatesInFlight?: (callback: (updatesInFlight: string[]) => string[]) => void;
  spaceKey?: string;

  setWebSocket(websocket: WebSocket) {
    this.webSocket = websocket;
    this.webSocket.addEventListener('message', this.onMessage);
  }

  setSpaceValues({
    spaceId,
    spaceKey,
    setUpdatesInFlight,
  }: {
    spaceId: string;
    spaceKey: string;
    setUpdatesInFlight: (callback: (updatesInFlight: string[]) => string[]) => void;
  }) {
    this.spaceId = spaceId;
    this.spaceKey = spaceKey;
    this.setUpdatesInFlight = setUpdatesInFlight;
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
    if (!this.webSocket || !this.spaceKey || !this.spaceId || !this.setUpdatesInFlight) {
      console.error('WebSocket, spaceKey, and spaceId must be set before sending a message');
      return;
    }
    console.log('send', message);

    const ephemeralId = uuid();
    this.setUpdatesInFlight((updatesInFlight) => [...updatesInFlight, ephemeralId]);

    const nonceAndCiphertext = encryptMessage({
      message: new Uint8Array([0]),
      secretKey: hexToBytes(this.spaceKey),
    });

    const messageToSend: RequestCreateUpdate = {
      type: 'create-update',
      ephemeralId,
      update: nonceAndCiphertext,
      spaceId: this.spaceId,
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
          // setSpaces((spaces) =>
          //   spaces.map((space) => {
          //     if (space.id === response.spaceId && space.lastUpdateClock + 1 === response.clock) {
          //       return { ...space, lastUpdateClock: response.clock };
          //     }
          //     return space;
          //   }),
          // );
          // setUpdatesInFlight((updatesInFlight) => updatesInFlight.filter((id) => id !== response.ephemeralId));
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
