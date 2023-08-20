import io, { Socket } from "socket.io-client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import React from "react";

const Home = React.lazy(() => import("./pages/Home"));
const TicTacToe = React.lazy(() => import("./pages/TicTacToe"));

export const socket: SocketType = io();

export type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;
interface ServerToClientEvents {
  "game start": () => void;
  board: (board: string[][]) => void;
  "your turn": () => void;
  "game over": (outcome: { outcome: string; winIndxs: number[][] }) => void;
}
interface ClientToServerEvents {
  usersOnline: (...args: string[]) => Promise<number>;
  "username:get": () => Promise<{ username: string }>;
  "username:set": (username: string) => void;
  "join game": () => void;
  turn: (turn: number) => void;
}

function App() {
  return (
    <BrowserRouter>
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <React.Suspense fallback={<>...</>}>
                <Home socket={socket} />
              </React.Suspense>
            }
          ></Route>
          <Route
            path="/tictactoe"
            element={
              <React.Suspense fallback={<>...</>}>
                <TicTacToe socket={socket} />
              </React.Suspense>
            }
          ></Route>
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
