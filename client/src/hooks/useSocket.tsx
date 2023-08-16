import { DefaultEventsMap } from "@socket.io/component-emitter";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

const useSocket = (socket: Socket<DefaultEventsMap, DefaultEventsMap>) => {
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

export default useSocket;
