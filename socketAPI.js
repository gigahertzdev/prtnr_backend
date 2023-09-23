const socketIO = require('socket.io');

export default function (server) {

    const io = socketIO(server);

    io.on('connection', (socket) => {
        console.log('A client connected');
 
        socket.on('chat message', (message) => {
          console.log('Received message:', message);
          io.emit('chat message', message); // Broadcast the message to all connected clients
        });
 
        socket.on('disconnect', () => {
          console.log('A client disconnected');
        });
      });

    return io;
}

