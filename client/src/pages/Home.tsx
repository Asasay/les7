import { Link, useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";
import { ConnectionManager } from "../components/ConnectionManager";
import { ConnectionState } from "../components/ConnectionState";
import useSocket from "../hooks/useSocket";
import TicTacLogo from "../images/tictactoe_icon.svg";

const Home = ({ socket }: { socket: Socket }) => {
  const navigate = useNavigate();
  const isConnected = useSocket(socket);

  return (
    <div>
      <Link to={"/tictactoe"} className="block text-center">
        <img
          src={TicTacLogo}
          alt="Tic-Tac-Toe logo"
          className="inline-block h-52 duration-200 hover:scale-105"
        />
      </Link>

      <button onClick={() => navigate("/tictactoe")}></button>
      <ConnectionState isConnected={isConnected} />
      <ConnectionManager socket={socket} />
    </div>
  );
};

export default Home;
