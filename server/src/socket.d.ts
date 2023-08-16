import { Socket } from "socket.io";
import { Game } from "./game";

declare global {
  interface ServerToClientEvents {
    board: (board: Game["board"]) => void;
    "game start": (room: Game["room"]) => void;
    "game over": (outcome: string) => void;
    "your turn": () => void;
  }

  interface ClientToServerEvents {
    turn: (turn: number) => void;
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
