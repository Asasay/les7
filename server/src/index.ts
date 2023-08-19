import express from "express";
import compression from "compression";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import session, { Session } from "express-session";
import sqlite from "better-sqlite3";
import logger from "./logger";
import { Game, TicTacToe } from "./game";
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
  secret: "MhrVqZ62tymqHm3iRalh5xfoQwKSe6yD",
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
app.use(compression());
app.use(express.static(__dirname + "/public"));
app.get("*", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
  socket.on("username:get", (callback) => {
    const sessionId = socket.request.session.id;
    const savedUsername = socket.request.session.username;
    callback({
      username: savedUsername ? savedUsername : sessionId,
    });
  });

  socket.on("username:set", (name) => {
    socket.request.session.username = name;
    socket.request.session.save();
  });

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

httpServer.listen(port, () => {
  logger.info(`⚡️[server]: Server is running at port: ${port}`);
});

declare module "http" {
  interface IncomingMessage {
    cookieHolder?: string;
    session: Session & {
      username: string;
    };
  }
}

interface ServerToClientEvents {
  board: (board: Game["board"]) => void;
  "game start": (room: Game["room"]) => void;
  "game over": (outcome: { outcome: string; winIndxs?: number[][] }) => void;
  "your turn": () => void;
}

interface ClientToServerEvents {
  turn: (turn: number) => void;
  "join game": (this: SocketType) => void;
  "username:get": (
    callback: ({ username }: { username: string }) => void
  ) => void;
  "username:set": (name: string) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {}

export type SocketType = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
