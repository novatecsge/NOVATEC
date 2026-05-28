let ioInstance = null;

const setIo = (io) => {
  ioInstance = io;
};

const getIo = () => {
  if (!ioInstance) {
    throw new Error('Socket.IO no ha sido inicializado');
  }
  return ioInstance;
};

module.exports = {
  setIo,
  getIo
};