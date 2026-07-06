require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const { initSocket } = require("./socket/socket");
const { protect } = require("./middleware/auth");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", protect, projectRoutes);
app.use("/api/notifications", protect, notificationRoutes);

// 404 handler
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Global error handler (fallback)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

// Socket.io
initSocket(io);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`TaskFlow API running on port ${PORT}`);
  });
});
