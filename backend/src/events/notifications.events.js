const { getIo } = require('../config/socket');

const emitNotificationToUser = (userId, payload) => {
  const io = getIo();
  io.to(`users:${userId}`).emit('notification:new', payload);
};

module.exports = {
  emitNotificationToUser
};