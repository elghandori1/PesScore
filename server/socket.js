/**
 * Socket.IO: user rooms and real-time emit to a user by id.
 * Clients join room "user:{userId}" via joinRoom.
 */
let _io;

function init(io) {
  _io = io;
  io.on('connection', (socket) => {
    socket.on('joinRoom', (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });
  });
}

function emitToUser(userId, event, data) {
  if (_io && userId) _io.to(`user:${userId}`).emit(event, data || {});
}

module.exports = { init, emitToUser };
