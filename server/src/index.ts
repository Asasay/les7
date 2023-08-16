import express from "express";
import compression from "compression";
import { createServer } from "http";
import { Server } from "socket.io";
import session from "express-session";
import sqlite from "better-sqlite3";
import logger from "./logger";
import { TicTacToe } from "./game";
import "dotenv/config";

const app = express();
const httpServer = createServer(app);
export const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer);

const port = process.env.SERVER_PORT;
const SqliteStore = require("better-sqlite3-session-store")(session);
const db = new sqlite("sessions.db", {});
const sessionMiddleware = session({
  secret: "changeit",
  store: new SqliteStore({
    client: db,
    expired: {
      clear: true,
      intervalMs: 900000, //ms = 15min
    },
  }),

  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 60 * 15 * 1000 },
});

io.engine.use(sessionMiddleware);
app.use(compression({ level: 1 }));
app.use(express.static(__dirname + "/public"));
app.get("*", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    if (
      TicTacToe.openedGameSession &&
      TicTacToe.openedGameSession.player1.socket == socket
    )
      TicTacToe.openedGameSession = null;
    logger.info(socket.id + " disconnected");
  });
  logger.info("Connected sockets: " + [...io.of("/").adapter.sids.keys()]);

  socket.once("join game", function joinGame() {
    if (!TicTacToe.openedGameSession) new TicTacToe(this);
    else {
      const game = TicTacToe.openedGameSession.join(this);
      game.start();
    }
  });
});

io.of("/").adapter.on("create-room", (room) => {
  logger.debug(`room "${room}" was created`);
});

io.of("/").adapter.on("join-room", (room, id) => {
  logger.debug(`socket ${id} has joined room "${room}"`);
});

httpServer.listen(port, () => {
  logger.info(`⚡️[server]: Server is running at port: ${port}`);
});
