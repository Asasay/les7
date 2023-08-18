import { useEffect, useState } from "react";
import { SocketType } from "../App";

const TicTacToe = ({ socket }: { socket: SocketType }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [myTurn, setMyTurn] = useState("Waiting for another player to move");
  const [board, setBoard] = useState<string[][]>(() => [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ]);

  useEffect(() => {
    socket.emit("join game");
    socket.once("game start", () => setGameStarted(true));
    socket.on("board", (board) => setBoard(board));
    socket.on("your turn", () => setMyTurn("Your turn!"));
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
          <div className="grid grid-cols-3 grid-rows-3  border border-gray-400  text-2xl text-gray-900 dark:border-gray-600 dark:text-gray-200">
            {board.flatMap((innerArray, i) =>
              innerArray.map((cell, k) => (
                <button
                  className="min-h-[100px] min-w-[100px] border border-gray-400 dark:border-gray-600 dark:bg-gray-800"
                  key={i * 3 + k}
                  onClick={() => {
                    if (board[i][k] != "" || gameOver) return;
                    else {
                      socket.emit("turn", i * 3 + k);
                      setMyTurn("Waiting for another player to move");
                    }
                  }}
                >
                  {cell}
                </button>
              ))
            )}
          </div>
          <p className="mt-3 text-lg text-gray-900 dark:text-gray-300">
            {myTurn}
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
