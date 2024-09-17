import { hello } from "graph-framework";
import { Page } from "./components/app-events-page";

export function App() {
  return (
    <>
      <p>{hello()}</p>

      <Page />
    </>
  );
}
