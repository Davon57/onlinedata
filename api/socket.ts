import { Server, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';

export interface Message {
  id: string;
  roomId: string;
  content: string;
  timestamp: number;
}

// In-memory store
const rooms = new Map<string, Message[]>();

export function setupSocket(server: HTTPServer) {
  const io = new Server(server, {
    cors: {
      origin: '*', // Allow all origins for dev
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
      
      const history = rooms.get(roomId) || [];
      socket.emit('history', history);
    });

    socket.on('new_message', (data: { roomId: string; content: string }) => {
      const { roomId, content } = data;
      
      const message: Message = {
        id: Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
        roomId,
        content,
        timestamp: Date.now()
      };

      if (!rooms.has(roomId)) {
        rooms.set(roomId, []);
      }
      const history = rooms.get(roomId)!;
      history.push(message);
      
      // limit history size to 100 messages per room to prevent memory leak
      if (history.length > 100) {
        history.shift();
      }

      // Broadcast to everyone in the room
      io.to(roomId).emit('new_message', message);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}
