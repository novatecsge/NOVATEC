const { getIo } = require('../config/socket');

const emitReservationCreated = ({ reservationId, userId, parkingSpaceId, status }) => {
  const io = getIo();
  io.to('admin').emit('reservation:new', { reservationId, userId, parkingSpaceId, status });
  io.to(`users:${userId}`).emit('reservation:new', { reservationId, userId, parkingSpaceId, status });
};

const emitSpaceUpdate = ({ parkingSpaceId, status }) => {
  const io = getIo();
  io.to('admin').emit('space:update', { parkingSpaceId, status });
  io.to('guards').emit('space:update', { parkingSpaceId, status });
};

const emitDashboardUpdate = (payload) => {
  const io = getIo();
  io.to('admin').emit('dashboard:update', payload);
};

module.exports = {
  emitReservationCreated,
  emitSpaceUpdate,
  emitDashboardUpdate
};