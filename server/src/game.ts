import { SocketType, io } from ".";
import logger from "./logger";

export abstract class Game {
  static openedGameSession: Game | null;
  player1: Player;
  player2!: Player;
  room: string;
  board: unknown;
  constructor(socket: SocketType, roomPrefix: string) {
    this.room = roomPrefix + socket.id;
    this.player1 = { socket };
    const ctor = this.constructor as typeof TicTacToe | typeof BattleShips;
    ctor.openedGameSession = this;
    this.player1.socket.once(
      "leave game",
      this.leaveGame(this.player1.socket, this.room, ctor)
    );
  }
  join(socket: SocketType): Game {
    socket.join(this.room);
    this.player2 = { socket };
    this.player1.socket.join(this.room);

    const ctor = this.constructor as typeof TicTacToe | typeof BattleShips;
    ctor.openedGameSession = null;
    this.player2.socket.once(
      "leave game",
      this.leaveGame(this.player2.socket, this.room, ctor)
    );
    return this;
  }

  private leaveGame =
    (
      socket: SocketType,
      room: Game["room"],
      derivedCtor: typeof TicTacToe | typeof BattleShips
    ) =>
    () => {
      logger.info(socket.id + " left " + room);
      socket.leave(derivedCtor.name);
      socket.leave(room);
      if (
        derivedCtor.openedGameSession &&
        derivedCtor.openedGameSession.player1.socket == socket
      ) {
        derivedCtor.openedGameSession = null;
      }

      socket.once("join game", function joinGame(this: SocketType) {
        this.join(derivedCtor.name);
        if (!derivedCtor.openedGameSession) new derivedCtor(this);
        else {
          const game = derivedCtor.openedGameSession.join(this);
          game.start();
        }
      });
    };

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
  declare player1: TicTacToePlayer;
  declare player2: TicTacToePlayer;
  board: TicTacToePlayer["badge"][][];
  constructor(socket: SocketType) {
    super(socket, "TicTacToe-");

    this.player1.badge = "X";
    this.board = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
  }

  join(socket: SocketType): Game {
    super.join(socket);
    this.player2.badge = "O";
    return this;
  }

  start(): void {
    super.start();
    this.player1.socket.to(this.room).emit("your turn");
    this.player2.socket.once("turn", this.handleTurn(this.player2, this));
  }

  private handleTurn =
    (player: TicTacToePlayer, game: TicTacToe) => (turn: number) => {
      const anotherPlayer = game.anotherPlayer(player) as TicTacToePlayer;
      game.board[Math.floor(turn / 3)][turn % 3] = player.badge;
      io.to(game.room).emit("board", game.board);
      const outcome = this.checkOutcome(player.badge);
      if (outcome) {
        io.to(game.room).emit("game over", outcome);
      } else {
        player.socket.to(game.room).emit("your turn");
        anotherPlayer.socket.once("turn", game.handleTurn(anotherPlayer, game));
      }
    };

  private checkOutcome = (badge: TicTacToePlayer["badge"]) => {
    //rows
    for (let i = 0; i < 3; i++) {
      if (
        this.board[i][0] == badge &&
        this.board[i][1] == badge &&
        this.board[i][2] == badge
      )
        return {
          outcome: `Player ${badge} won!`,
          winIndxs: [
            [i, 0],
            [i, 2],
          ],
        };
    }
    //cols
    for (let i = 0; i < 3; i++) {
      if (
        this.board[0][i] == badge &&
        this.board[1][i] == badge &&
        this.board[2][i] == badge
      )
        return {
          outcome: `Player ${badge} won!`,
          winIndxs: [
            [0, i],
            [2, i],
          ],
        };
    }
    //across
    if (
      this.board[0][0] == badge &&
      this.board[1][1] == badge &&
      this.board[2][2] == badge
    )
      return {
        outcome: `Player ${badge} won!`,
        winIndxs: [
          [0, 0],
          [2, 2],
        ],
      };
    else if (
      this.board[2][0] == badge &&
      this.board[1][1] == badge &&
      this.board[0][2] == badge
    )
      return {
        outcome: `Player ${badge} won!`,
        winIndxs: [
          [2, 0],
          [0, 2],
        ],
      };

    if (!this.board.flat().includes("")) return { outcome: "Draw" };
    else return false;
  };
}

type Player = {
  socket: SocketType;
};

type TicTacToePlayer = Player & {
  badge: "X" | "O" | "";
};

type BattleShipsPlayer = Player & {
  badge: "X" | "O" | "";
};

// class Board {
//   constructor() {
//     return []
//   }
// }

class BattleShips extends Game {
  board: BattleShipsPlayer["badge"][][];
  constructor(socket: SocketType) {
    super(socket, "TicTacToe-");
    this.board = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
  }
}
