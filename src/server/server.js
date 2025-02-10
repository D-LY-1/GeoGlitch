import http from 'http';
import app from './app.js';
import { WebsocketController } from './controllers/websocket.controller.js';
import { WebSocketServer } from 'ws';
import { UserService } from './services/user.service.js';

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const userService = UserService.getInstance();

const wss = new WebSocketServer({ server });
new WebsocketController(wss, userService);


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server listening on wss://damien.leroy.caen.mds-project.fr`);
});