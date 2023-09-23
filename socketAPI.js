import { Server } from "socket.io";

export default function (server) {

    const io = new Server(server);

    io.on('connection', (socket) => {
        console.log('A client connected');
 
        socket.on('chat message', (message) => {
          console.log('Received message:', message.data);
          io.emit('chat message', message); // Broadcast the message to all connected clients
        });
 
        socket.on('disconnect', () => {
          console.log('A client disconnected');
        });

        socket.on('determine3choices', (message) => {

        })

      });

    return io;
}

