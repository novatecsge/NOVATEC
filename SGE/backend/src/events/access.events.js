const { getIo } = require('../config/socket');

const emitAccessEntry = (payload) => {
  const io = getIo();
  io.to('admin').emit('access:entry', payload);
  io.to('guards').emit('access:entry', payload);
  io.to(`users:${payload.userId}`).emit('access:entry', payload);
};

const emitAccessExit = (payload) => {
  const io = getIo();
  io.to('admin').emit('access:exit', payload);
  io.to('guards').emit('access:exit', payload);
  io.to(`users:${payload.userId}`).emit('access:exit', payload);
};

module.exports = {
  emitAccessEntry,
  emitAccessExit
};