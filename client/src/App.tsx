import io from "socket.io-client";
import { ConnectionState } from "./components/ConnectionState";
import useSocket from "./hooks/useSocket";
import Home from "./pages/Home";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import TicTacToe from "./pages/TicTacToe";

export const socket = io();

function App() {
    return (
        <BrowserRouter>
            <main>
                <Routes>
                    <Route path="/" element={<Home socket={socket} />}></Route>
                    <Route
                        path="/tictactoe"
                        element={<TicTacToe socket={socket} />}
                    ></Route>
                </Routes>
            </main>
        </BrowserRouter>
    );
}

export default App;
