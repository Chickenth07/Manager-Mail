import http from "http";
import { Server } from "socket.io";
import app from "./app.js";   // ✅ IMPORT app.js

const server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

export default server;