const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ noServer: true });

const docs = new Map();

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', (ws, request) => {
  const roomName = new URL(request.url, 'http://localhost').pathname.slice(1) || 'default-room';
  
  if (!docs.has(roomName)) {
    docs.set(roomName, new Set());
  }
  
  const room = docs.get(roomName);
  room.add(ws);
  
  console.log(`Client connected to room: ${roomName}`);
  
  ws.on('message', (message) => {
    room.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });
  
  ws.on('close', () => {
    room.delete(ws);
    console.log(`Client disconnected from room: ${roomName}`);
  });
});

   const port = process.env.PORT || 1234;
   server.listen(port, '0.0.0.0', () => {
     console.log(`Server running on port ${port}`);
   });