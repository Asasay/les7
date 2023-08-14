import { Socket } from "socket.io";

declare global {
  interface ServerToClientEvents {
    board: (board: SocketData.gamingRoom.board) => void;
    "game start": (roomName: SocketData["gamingRoom"]["name"]) => void;
  }

  interface ClientToServerEvents {
    turn: (this: SocketType, turn: string) => void;
    "join game": (this: SocketType) => void;
  }

  interface InterServerEvents {
    ping: () => void;
  }

  interface SocketData {
    gamingRoom: {
      name: string;
      sockets: SocketType[];
      board: SocketData["sign"][];
    };
    sign: "X" | "O" | "";
  }

  type SocketType = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >;
}
