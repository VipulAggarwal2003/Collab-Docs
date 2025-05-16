// import { Server } from "socket.io";

// import Connection from "./database/db.js";

// import { getDocument, updateDocument } from "./controller/doc-controller.js";

// const PORT = 9000;

// Connection();

// const io = new Server(PORT, {
//   cors: {
//     origin: "https://collab-docs-3lbo.onrender.com",
//     methods: ["GET", "POST"],
//     credentials:true
//   },
// });

// io.on("connection", (socket) => {
//   socket.on("get-document", async (documentId) => {
//     const document = await getDocument(documentId);
//     socket.join(documentId);
//     socket.emit("load-document", document.data);

//     socket.on("send-changes", (delta) => {
//       socket.broadcast.to(documentId).emit("receive-changes", delta);
//     });

//     socket.on("save-document", async (data) => {
//       await updateDocument(documentId, data);
//     });
//   });
// });

import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

import Connection from "./database/db.js";
import { getDocument, updateDocument } from "./controller/doc-controller.js";

const app = express();
const PORT = 9000;

// Middleware
app.use(cors({
  origin: "https://collab-docs-3lbo.onrender.com", // your frontend URL
  methods: ["GET", "POST"],
  credentials: true
}));

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const io = new Server(server, {
  cors: {
    origin: "https://collab-docs-3lbo.onrender.com", // your frontend URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to DB
Connection();

// WebSocket logic
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("get-document", async (documentId) => {
    const document = await getDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await updateDocument(documentId, data);
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
