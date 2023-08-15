import { Socket } from "socket.io";
import { Game } from "./game";

declare global {
  interface ServerToClientEvents {
    board: (board: Game["board"]) => void;
    "game start": (room: Game["room"]) => void;
  }

  interface ClientToServerEvents {
    turn: (turn: string) => void;
    "join game": (this: SocketType) => void;
  }

  interface InterServerEvents {
    ping: () => void;
  }

  interface SocketData {}

  type SocketType = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;
}
