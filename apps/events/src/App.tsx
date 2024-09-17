import { hello } from "graph-framework";
import sodium, { KeyPair } from "libsodium-wrappers";
import { useState } from "react";
import { useYjsSync } from "secsync-react-yjs";
import { createStore } from "tinybase";
import { Provider, useCreateStore } from "tinybase/ui-react";
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

  const [yDoc] = useState(() => {
    return new Yjs.Doc();
  });

  // useEffect(() => {
  //   const persister = createYjsPersister(store, yDoc);

  //   const run = async () => {
  //     await persister.startAutoLoad();
  //     await persister.startAutoSave();
  //   };
  //   run();
  // }, []);

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
        {/* <Button
          onClick={() => {
            console.log("clicked");
            store.setValues({ employees: 3, open: true });
          }}
        >
          Click me
        </Button> */}
        <EventsPage yDoc={yDoc} />
      </>
      <Inspector />
    </Provider>
  );
}
