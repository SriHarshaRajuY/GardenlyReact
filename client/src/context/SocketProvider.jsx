import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { SocketContext } from "./SocketContext";

export default function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const configuredUrl = import.meta.env.VITE_BACKEND_URL?.trim();
    const backendUrl = configuredUrl || window.location.origin;
    const newSocket = io(backendUrl, { withCredentials: true });
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
