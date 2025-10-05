import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
    }
  });

  io.on('connection', (socket) => {
    try {
      console.log('A new client connected:', socket.id);

      socket.on("newMessage", (newMsg) => {
        console.log("New message received:", newMsg);
        setMessages((prev) => [...prev, newMsg]);
      });

      socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
      });
    } catch (error) {
      console.error("Error in the WebSocket connection:", error);
    }
  });

  return io;
};

export { io };
