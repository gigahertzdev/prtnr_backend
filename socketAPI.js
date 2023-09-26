import { Server } from "socket.io";

export default function (server) {

    const io = new Server(server);
    let mapEmail2socket = {};

    io.on('connection', (socket) => {
        console.log('A client connected');
 
        socket.on('mapEmail2socket', (data) => {
          console.log('Received message:', data.email);
          mapEmail2socket[data.email] = socket.id;
        });
 
        socket.on('disconnect', () => {
          console.log('A client disconnected');
        });

        socket.on('new 3choices', (data) => {
          console.log(data)
          io.to(mapEmail2socket[data.to]).emit('chat message', {}); // Broadcast the message to all connected clients
        })

        socket.on('sendOrder', (data) => {
          io.to(mapEmail2socket[data.to]).emit('sendOrder', {});
        })

      });

    return io;
}

