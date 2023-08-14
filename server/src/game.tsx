export class Game {
  public static openedGameSessions = [];
  player1;
  player2;

  constructor(socket: SocketType) {
    this.player1 = socket;
  }
}

export class TicTacToe extends Game {
  constructor(socket: SocketType) {
    super(socket);
  }
}

if (TicTacToe.openedGameSessions.length == 0) TicTacToe.join(thisSocket);
else new TicTacToe(thisSocket);
