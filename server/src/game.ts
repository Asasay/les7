import { io } from ".";
import logger from "./logger";

export abstract class Game {
  static openedGameSession: Game | null;
  player1: Player;
  player2!: Player;
  room: string;
  board!: Player["badge"][];
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
    this.player2.socket.once("turn", this.handleTurn(this.player2, this));
  }
  private handleTurn = (player: Player, game: TicTacToe) => (turn: string) => {
    const anotherPlayer = game.anotherPlayer(player);
    game.board[Number(turn)] = player.badge;
    io.to(game.room).emit("board", game.board);
    anotherPlayer.socket.once("turn", game.handleTurn(anotherPlayer, game));
  };
  constructor(socket: SocketType) {
    super(socket, "TicTacToe-");
    this.board = new Array(9).fill("");
  }
}

type Player = {
  socket: SocketType;
  badge: "X" | "O" | "";
};
