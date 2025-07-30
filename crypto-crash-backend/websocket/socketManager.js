
function setSocketInstance(io) {
  ioInstance = io;
}

function emitToAll(event, payload) {
  if (ioInstance) {
    ioInstance.emit(event, payload);
  }
}

function emitToUser(socketId, payload) {
  if (ioInstance) {
    ioInstance.to(socketId).emit("broadcast", payload);
  }
}

module.exports = {
  setSocketInstance,
  emitToAll,
  emitToUser,
};
