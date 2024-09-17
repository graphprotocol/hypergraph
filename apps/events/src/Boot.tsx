import { ready } from "libsodium-wrappers";
import { useEffect, useState } from "react";
import { App } from "./App.js";

export function Boot() {
  // only return the App component when the libsodium-wrappers is ready
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    ready.then(() => {
      setIsReady(true);
    });
  }, []);

  return isReady ? <App /> : null;
}
