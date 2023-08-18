import { useEffect, useState } from "react";
import { SocketType } from "../App";

const useConnectionStatus = (socket: SocketType) => {
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });
    socket.on("disconnect", () => setIsConnected(false));
    return () => {
      socket.off();
    };
  }, []);

  return isConnected;
};

export default useConnectionStatus;
