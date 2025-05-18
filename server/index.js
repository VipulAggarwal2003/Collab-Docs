import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import Connection from './database/db.js';
import { getDocument, updateDocument } from './controller/doc-controller.js';
import path from "path";
const app = express();
const server = http.createServer(app);
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config()
Connection(); // Connect to MongoDB

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ['websocket']
});

app.use(cors({
  origin: "*"
}));

io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  socket.on('get-document', async (documentId) => {
      if (!documentId) {
    console.error(" Missing documentId from client. Disconnecting socket:", socket.id);
    socket.disconnect(true);
    return;
  }

    const document = await getDocument(documentId);
    socket.join(documentId);
    socket.emit('load-document', document.data);

    socket.on('send-changes', (delta) => {
      socket.broadcast.to(documentId).emit('receive-changes', delta);
    });

    socket.on('save-document', async (data) => {

      await updateDocument(documentId, data);
    });
  });
});

// ---------------- deployment code ----------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



if(process.env.NODE_ENV === "production"){

  app.use(express.static(path.join(__dirname, "client", "build")));
  app.get("*", (req, res) => {
  console.log("Params:", req.params);     // usually empty
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  })
 
}
const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

