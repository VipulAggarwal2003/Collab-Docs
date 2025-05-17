import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import Connection from './database/db.js';
import { getDocument, updateDocument } from './controller/doc-controller.js';
import path from "path";
const app = express();
const server = http.createServer(app);

Connection(); // Connect to MongoDB

const io = new Server(server, {
  cors: {
    origin: "https://collab-docs-3lbo.onrender.com",
    methods: ["GET", "POST"],
    credentials: true
  },
  
});

app.use(cors({
  origin: "https://collab-docs-3lbo.onrender.com",
  credentials: true
}));

io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  socket.on('get-document', async (documentId) => {
    console.log('📥 get-document:', documentId);

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

if(process.env.NODE_ENV === "production"){
   const dirPath = path.resolve();
   app.use(express.static("./client/build"));
   app.get('*',(req,res)=>{
     res.sendFile(path.resolve(dirPath,'./client/build','index.html'));
   })
}
const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

