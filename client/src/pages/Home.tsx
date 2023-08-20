import { Link } from "react-router-dom";
import { ConnectionManager } from "../components/ConnectionManager";
import { ConnectionState } from "../components/ConnectionState";
import useConnectionStatus from "../hooks/useConnectionStatus";
import { ReactComponent as TicTacLogo } from "../images/tictactoe_icon.svg";
import { useEffect, useState } from "react";
import { SocketType } from "../App";

const Home = ({ socket }: { socket: SocketType }) => {
  const isConnected = useConnectionStatus(socket);
  const [username, setUsername] = useState<string>("");
  const [ticTacOnline, setTicTacOnline] = useState(0);

  useEffect(() => {
    socket.emitWithAck("username:get").then((res) => setUsername(res.username));
  });

  useEffect(() => {
    const getOnline = () => {
      socket
        .emitWithAck("usersOnline", "TicTacToe")
        .then((res) => setTicTacOnline(res));
    };
    getOnline();
    const interval = setInterval(getOnline, 10000);
    return () => clearInterval(interval);
  });

  return (
    <div>
      <p className="mb-4 text-center text-sm font-extralight text-gray-400">
        People online: {ticTacOnline}
      </p>
      <Link to={"/tictactoe"} className="mb-8 block text-center">
        <TicTacLogo className="inline-block h-52 w-auto duration-200 hover:scale-105 dark:fill-gray-300" />
      </Link>

      <label
        htmlFor="website-admin"
        className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300"
      >
        Username
      </label>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const usernameInput = document.getElementById(
            "username-text"
          ) as HTMLInputElement | null;
          if (usernameInput) {
            usernameInput.value = "";
            usernameInput.blur();
          }
          socket.emit("username:set", username);
        }}
        className="mb-6 flex"
      >
        <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-300">
          @
        </span>
        <input
          type="text"
          id="username-text"
          className="block w-full min-w-0 flex-1 rounded-none border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
          placeholder={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="submit"
          value={"SET"}
          className="inline-flex  cursor-pointer items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-200 px-3 text-sm text-gray-900 transition-colors active:bg-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-300 dark:active:bg-gray-500"
        />
      </form>

      <ConnectionState isConnected={isConnected} />
      <ConnectionManager socket={socket} />
    </div>
  );
};

export default Home;
