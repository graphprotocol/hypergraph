import { createRoot } from "react-dom/client";
import { Boot } from "./Boot.js";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <Boot />
  // </StrictMode>
);
