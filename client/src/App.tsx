import io from "socket.io-client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import React from "react";

const Home = React.lazy(() => import("./pages/Home"));
const TicTacToe = React.lazy(() => import("./pages/TicTacToe"));

export const socket = io();

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
