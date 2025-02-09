import http from 'http';
import app from './app.js';
import { WebsocketController } from './controllers/websocket.controller.js';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const wss = new WebSocketServer({ server });
new WebsocketController(wss);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server listening on ws://localhost:${PORT}`);
});