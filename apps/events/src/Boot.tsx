import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ready } from "libsodium-wrappers";
import { useEffect, useState } from "react";

import { routeTree } from "./routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function Boot() {
  // only return the App component when the libsodium-wrappers is ready
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    ready.then(() => {
      setIsReady(true);
    });
  }, []);

  return isReady ? <RouterProvider router={router} /> : null;
}
