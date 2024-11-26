import { uuid } from '@automerge/automerge';
import { NetworkAdapter } from '@automerge/automerge-repo';
import type { Message, PeerId, PeerMetadata } from '@automerge/automerge-repo/slim';
import { hexToBytes } from '@noble/hashes/utils';
import { type RequestCreateUpdate, encryptMessage, serialize } from 'graph-framework';

export class GraphFrameworkNetworkAdapter extends NetworkAdapter {
  webSocket?: WebSocket;
  spaceId?: string;
  setUpdatesInFlight?: (callback: (updatesInFlight: string[]) => string[]) => void;
  spaceKey?: string;

  setWebSocket(websocket: WebSocket) {
    this.webSocket = websocket;
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

  disconnect() {
    console.log('disconnect');
  }

  receiveMessage(messageBytes: Uint8Array) {
    // decode message
    console.log('receiveMessage', messageBytes);

    // this.emit('message', messageBytes);
  }
}
