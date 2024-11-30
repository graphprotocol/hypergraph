import { cbor } from '@automerge/automerge-repo';
import {
  BrowserWebSocketClientAdapter,
  type FromClientMessage,
  type FromServerMessage,
} from '@automerge/automerge-repo-network-websocket';

export class TestAdapter extends BrowserWebSocketClientAdapter {
  constructor(url: string) {
    console.log('TEST ADAPTER constructor', url);
    super(url);
  }

  async receiveMessage(messageBytes: Uint8Array) {
    // clone messageBytes
    const messageBytesClone = messageBytes.slice();
    const message: FromServerMessage = cbor.decode(new Uint8Array(messageBytesClone));
    console.log('TEST ADAPTER message', message);

    super.receiveMessage(messageBytes);
  }

  send(message: FromClientMessage) {
    console.log('TEST ADAPTER send', message);
    super.send(message);
  }
}
