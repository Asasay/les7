import { SocketType, io } from ".";
import logger from "./logger";

export abstract class Game {
  static openedGameSession: Game | null;
  player1: Player;
  player2!: Player;
  room: string;
  board!: Player["badge"][][];
  constructor(socket: SocketType, roomPrefix: string) {
    this.player1 = { socket, badge: "O" };
    this.room = roomPrefix + this.player1.socket.id;
    const ctor = this.constructor as typeof Game;
    ctor.openedGameSession = this;
  }
  join(socket: SocketType): Game {
    this.player2 = { socket, badge: "X" };
    socket.join(this.room);
    this.player1.socket.join(this.room);
    const ctor = this.constructor as typeof Game;
    ctor.openedGameSession = null;
    return this;
  }
  start(): void {
    if (this.player1.socket && this.player2.socket) {
      io.to(this.room).emit("game start", this.room);
      logger.info("Game started in room: " + this.room);
      // this.player1.once("turn", handleTurn)
    } else logger.warn("Game failed to start: not enough players");
  }
  protected anotherPlayer(player: Player): Player {
    if (player.socket.id == this.player1.socket.id) return this.player2;
    else return this.player1;
  }
}

export class TicTacToe extends Game {
  start(): void {
    super.start();
    this.player1.socket.to(this.room).emit("your turn");
    this.player2.socket.once("turn", this.handleTurn(this.player2, this));
  }
  private handleTurn = (player: Player, game: TicTacToe) => (turn: number) => {
    const anotherPlayer = game.anotherPlayer(player);
    game.board[Math.floor(turn / 3)][turn % 3] = player.badge;
    io.to(game.room).emit("board", game.board);
    const outcome = this.checkOutcome(player.badge);
    if (outcome) io.to(game.room).emit("game over", outcome);
    else {
      player.socket.to(game.room).emit("your turn");
      anotherPlayer.socket.once("turn", game.handleTurn(anotherPlayer, game));
    }
  };

  private checkOutcome = (badge: Player["badge"]) => {
    if (!this.board.flat().includes("")) return "Draw";
    //rows
    for (let i = 0; i < 3; i++) {
      if (
        this.board[i][0] == badge &&
        this.board[i][1] == badge &&
        this.board[i][2] == badge
      )
        return `Player ${badge} won!`;
    }
    //cols
    for (let i = 0; i < 3; i++) {
      if (
        this.board[0][i] == badge &&
        this.board[1][i] == badge &&
        this.board[2][i] == badge
      )
        return `Player ${badge} won!`;
    }
    //across
    if (
      this.board[0][0] == badge &&
      this.board[1][1] == badge &&
      this.board[2][2] == badge
    )
      return `Player ${badge} won!`;
    else if (
      this.board[2][0] == badge &&
      this.board[1][1] == badge &&
      this.board[0][2] == badge
    )
      return `Player ${badge} won!`;
    else return false;
  };
  constructor(socket: SocketType) {
    super(socket, "TicTacToe-");
    this.board = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
  }
}

type Player = {
  socket: SocketType;
  badge: "X" | "O" | "";
};
