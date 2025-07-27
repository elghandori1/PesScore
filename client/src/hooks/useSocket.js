import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const useSocket = (userId) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const socket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
    });

    socketRef.current = socket;

    // Join private room
    socket.emit("joinRoom", userId);

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return socketRef;
};

export default useSocket;