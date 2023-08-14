import { Link, useNavigate } from "react-router-dom";
import { Socket } from "socket.io-client";
import { ConnectionManager } from "../components/ConnectionManager";
import { ConnectionState } from "../components/ConnectionState";
import useSocket from "../hooks/useSocket";
import TicTacLogo from "../images/tictactoe_icon.svg";

const Home = ({ socket }: { socket: Socket }) => {
  const navigate = useNavigate();
  const isConnected = useSocket(socket);

  const handleClick = (e) => {
    navigate("/tictactoe");
  };
  return (
    <div>
      <Link to={"/tictactoe"}>
        <img
          src={TicTacLogo}
          alt="Tic-Tac-Toe logo"
          className="h-52 hover:scale-105 duration-200"
        />
      </Link>

      <button onClick={() => navigate("/tictactoe")}></button>
      <ConnectionState isConnected={isConnected} />
      <ConnectionManager socket={socket} />
    </div>
  );
};

export default Home;
