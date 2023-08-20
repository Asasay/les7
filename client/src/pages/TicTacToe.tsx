import { useEffect, useState } from "react";
import { SocketType } from "../App";
import Board from "../components/Board";

const TicTacToe = ({ socket }: { socket: SocketType }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [myTurn, setMyTurn] = useState<{
    outcome: string;
    winIndxs?: number[][];
  }>({ outcome: "Waiting for another player to move" });
  const [board, setBoard] = useState<string[][]>(() => [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ]);

  useEffect(() => {
    socket.emit("join game");
    socket.once("game start", () => setGameStarted(true));
    socket.on("board", (board) => setBoard(board));
    socket.on("your turn", () => setMyTurn({ outcome: "Your turn!" }));
    socket.on("game over", (outcome) => {
      setMyTurn(outcome);
      setGameOver(true);
    });
    return () => {
      socket.off();
    };
  }, []);

  {
    if (gameStarted)
      return (
        <div>
          <Board
            board={board}
            gameOver={gameOver}
            socket={socket}
            winIndxs={myTurn.winIndxs}
            setMyTurn={setMyTurn}
            height="300px"
            width="300px"
            className="border box-content border-gray-400 dark:border-gray-600 dark:bg-gray-800"
          />
          <p className="mt-3 text-lg text-gray-900 dark:text-gray-300">
            {myTurn.outcome}
          </p>
        </div>
      );
    else
      return (
        <div>
          <div className="absolute bottom-1/2 right-1/2  translate-x-1/2 translate-y-1/2">
            <div className="h-32 w-32 animate-spin  rounded-full border-8 border-solid border-blue-400 border-t-transparent"></div>
          </div>
          <p className="relative top-32 text-lg font-bold text-gray-900 dark:text-gray-300">
            Waiting for anyone to join...
          </p>
        </div>
      );
  }
};

export default TicTacToe;
