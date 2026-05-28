const { getIo } = require('../config/socket');

const emitIncidentCreated = (payload) => {
  const io = getIo();
  io.to('admin').emit('incident:new', payload);
};

module.exports = {
  emitIncidentCreated
};