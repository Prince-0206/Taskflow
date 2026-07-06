const jwt = require("jsonwebtoken");

let ioInstance = null;

// Maps a userId -> Set of socket ids, so we can push notifications
// directly to a specific person regardless of which project room they're in.
const userSockets = new Map();

function initSocket(io) {
  ioInstance = io;

  // Authenticate every socket connection using the same JWT used for the REST API.
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication error: no token"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const { userId } = socket;

    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
    userSockets.get(userId).add(socket.id);

    // Personal room, used for direct notifications
    socket.join(`user:${userId}`);

    socket.on("joinProject", (projectId) => {
      socket.join(`project:${projectId}`);
    });

    socket.on("leaveProject", (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    socket.on("disconnect", () => {
      const set = userSockets.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) userSockets.delete(userId);
      }
    });
  });
}

function emitToProject(projectId, event, payload) {
  if (!ioInstance) return;
  ioInstance.to(`project:${projectId}`).emit(event, payload);
}

function emitToUser(userId, event, payload) {
  if (!ioInstance) return;
  ioInstance.to(`user:${userId}`).emit(event, payload);
}

module.exports = { initSocket, emitToProject, emitToUser };
