import {
  ComponentPropsWithoutRef,
  Dispatch,
  FC,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { SocketType } from "../App";
import useDarkMode from "../hooks/useDarkMode";

type Props = {
  board: string[][];
  gameOver: boolean;
  socket: SocketType;
  winIndxs?: number[][];
  setMyTurn: Dispatch<
    React.SetStateAction<{
      outcome: string;
      winIndxs?: number[][];
    }>
  >;
} & ComponentPropsWithoutRef<"canvas">;

const Board: FC<Props> = ({
  board,
  gameOver,
  socket,
  winIndxs,
  setMyTurn,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasRect, setCanvasRect] = useState<DOMRect>();
  const [colorMode] = useDarkMode();
  useEffect(() => {
    const rect = canvasRef?.current?.getBoundingClientRect();
    if (!rect) return;
    setCanvasRect(rect);
  }, [canvasRef]);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !canvasRect) return;
    const width = canvasRect.width;
    const height = canvasRect.height;
    const cellWidth = width / board.length;
    const cellHeight = height / board.length;

    ctx.strokeStyle = "rgb(75 85 99)";
    ctx.lineWidth = colorMode == "dark" ? 1 : 0.4;
    ctx.fillStyle = colorMode == "dark" ? "rgb(209 213 219)" : "black";
    for (let i = 1; i < board.length; i++) {
      ctx.beginPath();
      ctx.moveTo(cellWidth * i, 0);
      ctx.lineTo(cellWidth * i, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, cellHeight * i);
      ctx.lineTo(width, cellHeight * i);
      ctx.stroke();
    }

    ctx.textAlign = "center";
    ctx.font = "24px sans-serif";
    ctx.textBaseline = "middle";

    for (let i = 0; i < board.length; i++) {
      const row = board[i];
      for (let k = 0; k < row.length; k++) {
        const cell = row[k];
        ctx.fillText(
          cell,
          k * cellWidth + cellWidth / 2,
          i * cellHeight + cellHeight / 2
        );
      }
    }

    if (winIndxs) {
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(
        cellWidth * winIndxs[0][1] + cellWidth / 2,
        cellHeight * winIndxs[0][0] + cellHeight / 2
      );
      ctx.lineTo(
        cellWidth * winIndxs[1][1] + cellWidth / 2,
        cellHeight * winIndxs[1][0] + cellHeight / 2
      );
      ctx.stroke();
    }
  }, [canvasRef, canvasRect, board, winIndxs, colorMode]);

  const handleClick: MouseEventHandler = (e) => {
    if (!canvasRect || gameOver) return;
    const width = canvasRect.width;
    const height = canvasRect.height;
    const pos = {
      x: e.clientX - canvasRect.left,
      y: e.clientY - canvasRect.top,
    };
    const cellIndex = {
      x: Math.floor((pos.x / width) * board.length),
      y: Math.floor((pos.y / height) * board.length),
    };

    if (board[cellIndex.y][cellIndex.x] != "") return;
    else {
      socket.emit("turn", cellIndex.y * 3 + cellIndex.x);
      setMyTurn({ outcome: "Waiting for another player to move" });
    }
  };

  return (
    <canvas ref={canvasRef} onClick={handleClick} {...props}>
      Board
    </canvas>
  );
};

export default Board;
