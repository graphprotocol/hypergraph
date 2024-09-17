import { hello } from "graph-framework";
import { useEffect } from "react";
import { createStore } from "tinybase";
import { Provider, useCreateStore } from "tinybase/ui-react";
import { Inspector } from "tinybase/ui-react-inspector";
import { EventsPage } from "./components/events-page";

export function App() {
  const store = useCreateStore(() => {
    // Create the TinyBase Store and initialize the Store's data
    return createStore()
      .setTable("spaces", {
        abc: { name: "GeoBrowser" },
      })
      .setTable("events", {
        "6ea749ab": {
          name: "Tech Conference 2023",
          date: "2023-09-15",
          location: "San Francisco, CA",
          description:
            "Join us for the biggest tech conference of the year, featuring keynote speakers from leading tech companies.",
        },
        ef9ae3d7: {
          name: "Music Festival",
          date: "2023-10-01",
          location: "Austin, TX",
          description:
            "A three-day music extravaganza featuring top artists from around the world.",
        },
        "607f12a6": {
          name: "Food & Wine Expo",
          date: "2023-11-05",
          location: "New York, NY",
          description:
            "Explore culinary delights and fine wines from renowned chefs and vintners.",
        },
      });
  });

  useEffect(() => {
    const listenerId = store.addTablesListener((a, b) =>
      console.log("Tables changed!", a, b)
    );
    return () => {
      store.delListener(listenerId);
    };
  }, []);

  return (
    <Provider store={store}>
      <>
        <p>{hello()}</p>
        <EventsPage />
      </>
      <Inspector />
    </Provider>
  );
}
