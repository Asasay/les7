import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

const TicTacToe = ({ socket }: { socket: Socket }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [board, setBoard] = useState(() => new Array(9).fill(""));

  useEffect(() => {
    socket.emit("join game");
    socket.once("game start", () => setGameStarted(true));
    socket.on("board", (board) => setBoard(board));
    return () => {
      socket.off();
    };
  }, []);

  {
    if (gameStarted)
      return (
        <div>
          <div className="grid grid-cols-3 grid-rows-3 border border-black">
            {board.map((el, i) => (
              <button
                className="border border-black min-h-[100px] min-w-[100px] text-2xl"
                key={i}
                onClick={() => {
                  if (board[i] != "") return;
                  else socket.emit("turn", i);
                }}
              >
                {el}
              </button>
            ))}
          </div>
          <p className="text-lg  mt-3">{"Your turn!"}</p>
        </div>
      );
    else
      return (
        <div>
          <div className="absolute right-1/2 bottom-1/2  transform translate-x-1/2 translate-y-1/2 ">
            <div className="border-t-transparent border-solid animate-spin  rounded-full border-blue-400 border-8 h-32 w-32"></div>
          </div>
          <p className="relative top-32 text-lg font-bold">
            Waiting for anyone to join...
          </p>
        </div>
      );
  }
};

export default TicTacToe;
