import { deserialize } from "@/lib/deserialize";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { serialize } from "@/lib/serialize";
import { createFileRoute, redirect } from "@tanstack/react-router";
import sodium, { KeyPair } from "libsodium-wrappers";
import { useEffect, useState } from "react";
import { useYjsSync } from "secsync-react-yjs";
import { createStore } from "tinybase";
import { createYjsPersister } from "tinybase/persisters/persister-yjs";
import {
  Provider,
  useCreatePersister,
  useCreateStore,
} from "tinybase/ui-react";
import { Inspector } from "tinybase/ui-react-inspector";
import * as Yjs from "yjs";
import { EventsPage } from "../../components/events-page";

const websocketEndpoint = "ws://localhost:3030";

export const Route = createFileRoute("/space/$spaceId")({
  component: SpaceWithKey,
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({
        to: "/login",
        search: {
          // Use the current location to power a redirect after login
          // (Do not use `router.state.resolvedLocation` as it can
          // potentially lag behind the actual current location)
          redirect: location.href,
        },
      });
    }
  },
});

function SpaceWithKey() {
  const { spaceId } = Route.useParams();
  // ensuring the Space component is unmounted and remounted when the spaceId changes
  // this is needed since secsync and possibly tinybase don't handle the spaceId change well
  return <Space key={spaceId} />;
}

export function Space() {
  const { spaceId } = Route.useParams();
  const spaceKey = sodium.from_base64(
    "Wzrx2kLy6kd3FBqcNOOwaYQ2S1My9zofdX49CL-k_ko"
  );

  const store = useCreateStore(() => {
    // Create the TinyBase Store and initialize the Store's data
    return createStore().setTablesSchema({
      events: {
        name: { type: "string" },
        date: { type: "string" },
        location: { type: "string" },
        description: { type: "string" },
      },
    });
  });

  const [{ yDoc, pendingChanges }] = useState(() => {
    console.log("create new yDoc");
    const yDoc = new Yjs.Doc();

    // load full document
    const serializedDoc = localStorage.getItem(`space:state:${spaceId}`);
    if (serializedDoc) {
      console.log("load serializedDoc", serializedDoc);
      Yjs.applyUpdateV2(yDoc, deserialize(serializedDoc));
    }

    // loads the pendingChanges from localStorage
    const pendingChanges = localStorage.getItem(`space:pending:${spaceId}`);

    return {
      yDoc,
      pendingChanges: pendingChanges ? deserialize(pendingChanges) : [],
    };
  });

  // update the document in localStorage after every change (could be debounced)
  useEffect(() => {
    const onUpdate = () => {
      console.log("persist to localstorage");
      const fullYDoc = Yjs.encodeStateAsUpdateV2(yDoc);
      localStorage.setItem(`space:state:${spaceId}`, serialize(fullYDoc));
    };
    yDoc.on("updateV2", onUpdate);

    return () => {
      yDoc.off("updateV2", onUpdate);
    };
  }, []);

  useCreatePersister(
    store,
    (store) =>
      createYjsPersister(store, yDoc, "space", (error) => {
        console.log("YjsPersister Error:", error);
      }),
    [],
    async (persister) => {
      // must be called before startAutoLoad to avoid a loading error in case the document is empty
      await persister.startAutoLoad();
      await persister.startAutoSave();
    }
  );

  const [authorKeyPair] = useState<KeyPair>(() => {
    return sodium.crypto_sign_keypair();
  });

  useYjsSync({
    yDoc,
    pendingChanges,
    // callback to store the pending changes in
    onPendingChangesUpdated: (allChanges) => {
      localStorage.setItem(`space:pending:${spaceId}`, serialize(allChanges));
    },
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
        <EventsPage yDoc={yDoc} spaceId={spaceId} />
      </>
      <Inspector />
    </Provider>
  );
}
