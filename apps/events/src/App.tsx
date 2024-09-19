import { hello } from "graph-framework";
import sodium, { KeyPair } from "libsodium-wrappers";
import { useState } from "react";
import { useYjsSync } from "secsync-react-yjs";
import { createStore } from "tinybase";
import { createLocalPersister } from "tinybase/persisters/persister-browser";
import { createYjsPersister } from "tinybase/persisters/persister-yjs";
import {
  Provider,
  useCreatePersister,
  useCreateStore,
} from "tinybase/ui-react";
import { Inspector } from "tinybase/ui-react-inspector";
import * as Yjs from "yjs";
import { EventsPage } from "./components/events-page";

const websocketEndpoint = "ws://localhost:3030";

export function App() {
  const spaceId = "abc";
  const spaceKey = sodium.from_base64(
    "Wzrx2kLy6kd3FBqcNOOwaYQ2S1My9zofdX49CL-k_ko"
  );

  const store = useCreateStore(() => {
    // Create the TinyBase Store and initialize the Store's data
    return createStore();
  });

  useCreatePersister(
    store,
    (store) =>
      createLocalPersister(store, "events", (error) => {
        console.log("LocalPersister Error:", error);
      }),
    [],
    async (persister) => {
      await persister.startAutoLoad();
      await persister.startAutoSave();
    }
  );

  useCreatePersister(
    store,
    (store) =>
      createYjsPersister(store, yDoc, undefined, (error) => {
        console.log("YjsPersister Error:", error);
      }),
    [],
    async (persister) => {
      await persister.startAutoLoad();
      await persister.startAutoSave();
    }
  );

  const [yDoc] = useState(() => {
    return new Yjs.Doc();
  });

  const [authorKeyPair] = useState<KeyPair>(() => {
    return sodium.crypto_sign_keypair();
  });

  useYjsSync({
    yDoc,
    // pendingChanges: initialData.pendingChanges,
    // // callback to store the pending changes in
    // onPendingChangesUpdated: (allChanges) => {
    //   getDocumentStorage().documentPendingChangesStorage.set(
    //     documentId,
    //     serialize(allChanges)
    //   );
    // },
    documentId: spaceId,
    signatureKeyPair: authorKeyPair,
    websocketEndpoint,
    websocketSessionKey: "your-secret-session-key",
    getNewSnapshotData: async ({ id }) => {
      return {
        data: Yjs.encodeStateAsUpdateV2(yDoc),
        key: spaceKey,
        publicData: {},
      };
    },
    getSnapshotKey: async () => {
      return spaceKey;
    },
    shouldSendSnapshot: ({ snapshotUpdatesCount }) => {
      // create a new snapshot if the active snapshot has more than 100 updates
      return snapshotUpdatesCount > 100;
    },
    isValidClient: async (signingPublicKey: string) => {
      return true;
    },
    sodium,
    logging: "debug",
  });

  return (
    <Provider store={store}>
      <>
        <p>{hello()}</p>
        <EventsPage yDoc={yDoc} />
      </>
      <Inspector />
    </Provider>
  );
}
