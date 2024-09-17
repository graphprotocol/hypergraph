import * as trpcExpress from "@trpc/server/adapters/express";
import cors, { CorsOptions } from "cors";
import "dotenv/config";
import express from "express";
import { createWebSocketConnection } from "secsync-server";
import { WebSocketServer } from "ws";
import { createSnapshot } from "./db/createSnapshot.js";
import { createUpdate } from "./db/createUpdate.js";
import { getDocumentData } from "./db/getDocumentData.js";
import { appRouter } from "./trpc/appRouter.js";
import { createContext } from "./utils/trpc/trpc.js";

const webSocketServer = new WebSocketServer({ noServer: true });
const PORT = process.env.PORT !== undefined ? parseInt(process.env.PORT) : 3030;
const app = express();

app.use(express.json());

const corsOptions: CorsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "TODO production url"
      : "http://localhost:8081",
  credentials: true,
};

app.use(cors(corsOptions));

export type AppRouter = typeof appRouter;

app.use(
  "/api",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.get("/", (_req, res) => {
  res.send(`Server is running`);
});

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

webSocketServer.on(
  "connection",
  createWebSocketConnection({
    getDocument: getDocumentData,
    createSnapshot: createSnapshot,
    createUpdate: createUpdate,
    // @ts-expect-error
    hasAccess: async ({ documentId, websocketSessionKey, connection }) => {
      return true;
    },
    hasBroadcastAccess: async ({ documentId, websocketSessionKeys }) =>
      websocketSessionKeys.map(() => true),
    logging: "error",
  })
);

server.on("upgrade", async (request, socket, head) => {
  webSocketServer.handleUpgrade(request, socket, head, (currentSocket) => {
    webSocketServer.emit("connection", currentSocket, request);
  });
});
