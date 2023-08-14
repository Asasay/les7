import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import session from "express-session";
import sqlite from "better-sqlite3";
import "dotenv/config";
import logger from "./logger";

const app = express();
const httpServer = createServer(app);
const io = new Server<
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
app.use(express.static(__dirname + "/public"));
app.get("/*", (req, res) => {
  res.sendFile("index.html");
});

const joinGame: ClientToServerEvents["join game"] = function () {
  logger.debug(this.id + " requested to join a game");
  // join queue
  if (playersAwaiting.length == 0) {
    this.data.gamingRoom = {
      name: "tictac-" + this.id,
      sockets: [this],
      board: new Array(9).fill(""),
    };
    this.data.sign = "X";
    this.join(this.data.gamingRoom.name);
    playersAwaiting.push(this);
  }
  // join waiting player
  else {
    const awaitingPlayer = playersAwaiting.pop();
    if (awaitingPlayer == undefined) return;
    const room = awaitingPlayer.data.gamingRoom;
    room.sockets.push(this);
    gamingRooms.push(room);
    this.join(room.name);
    this.data.gamingRoom = room;
    this.data.sign = "O";
    // start game
    io.to(room.name).emit("game start", room.name);
    logger.info("Game started in room: " + room.name);
    this.once("turn", handleTurn);
  }
};

const handleTurn: ClientToServerEvents["turn"] = function (turn) {
  const gamingRoom = this.data.gamingRoom;
  const anotherPlayerSocket = gamingRoom.sockets.filter(
    (socket) => socket.id != this.id
  )[0];

  logger.info("Player " + this.id + " made a move " + turn);
  gamingRoom.board[Number(turn)] = this.data.sign;
  logger.info(gamingRoom.board);
  io.to(gamingRoom.name).emit("board", gamingRoom.board);
  anotherPlayerSocket.once("turn", handleTurn);
};

const playersAwaiting: SocketType[] = [];
const gamingRooms: SocketData["gamingRoom"][] = [];

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    if (playersAwaiting.includes(socket)) playersAwaiting.pop();
    logger.info(socket.id + " disconnected");
  });
  logger.info("Connected sockets: " + [...io.of("/").adapter.sids.keys()]);
  socket.once("join game", joinGame);
});

// io.of("/").adapter.on("create-room", (room) => {
//   logger.debug(`room "${room}" was created`);
// });

// io.of("/").adapter.on("join-room", (room, id) => {
//   logger.debug(`socket ${id} has joined room "${room}"`);
//   logger.debug("Gaming rooms: " + gamingRooms.map((r) => r.name));
// });

httpServer.listen(port, () => {
  logger.info(`⚡️[server]: Server is running at port: ${port}`);
});
