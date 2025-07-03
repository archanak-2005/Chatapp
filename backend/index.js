import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);
app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// user => socket.id
let userToSocket = new Map();

// socket.id => user
let socketToUser = new Map();

io.on("connection", (socket) => {
  console.log("🟢 New connection:", socket.id);

  // User joins with username
  socket.on("join", (username) => {
    userToSocket.set(username, socket.id);
    socketToUser.set(socket.id, username);
    console.log(`👤 ${username} connected`);
  });

  // Send private message to another user
  socket.on("privateMessage", ({ to, from, message }) => {
    const receiverSocketId = userToSocket.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("privateMessage", {
        from,
        message,
        time: new Date().toLocaleTimeString()
      });

      // Also send to sender for their own UI
      socket.emit("privateMessage", {
        from,
        message,
        time: new Date().toLocaleTimeString()
      });
    }
  });

  socket.on("disconnect", () => {
    const user = socketToUser.get(socket.id);
    userToSocket.delete(user);
    socketToUser.delete(socket.id);
    console.log(`🔴 ${user} disconnected`);
  });
});

server.listen(3001, () => {
  console.log("✅ Server running at http://localhost:3001");
});
