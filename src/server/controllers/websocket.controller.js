import { WS_EVENTS } from '../config/constants.js';
import WebSocket from 'ws';

export class WebsocketController {
  constructor(wss, userService) {
    this.wss = wss;
    this.userService = userService;
    this.initialize();
  }

  initialize() {
    this.wss.on(WS_EVENTS.CONNECTION, (ws) => {
      this.handleConnection(ws);
      this.setupPingPong(ws);
    });
  }

  setupPingPong(ws) {
    ws.isAlive = true;
    ws.on('pong', () => ws.isAlive = true);
    
    const interval = setInterval(() => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    }, 30_000);

    ws.on('close', () => clearInterval(interval));
  }

  handleConnection(ws) {
    console.log('Nouveau client connecté');
    ws.on('message', (message) => this.handleMessage(ws, message));
    ws.on('close', () => this.handleDisconnect(ws));
  }

  handleDisconnect(ws) {
    const userId = this.findUserIdByWs(ws);
    if (userId) {
      this.userService.removeUser(userId);
      this.broadcastUserList();
    }
    console.log('Client déconnecté');
  }

  findUserIdByWs(ws) {
    for (const [userId, user] of this.userService.users) {
      if (user.ws === ws) {
        return userId;
      }
    }
    return null;
  }

  handleMessage(ws, message) {
    try {
      const data = JSON.parse(message);
      console.log('Message reçu :', data);

      if (!data.type) {
        console.error('Message type is missing');
        return;
      }
      
      switch (data.type) {
        case 'register':
          if (!data.nickname) {
            console.error('Nickname is missing');
            return;
          }
          const userId = this.userService.addUser(ws, data.nickname);
          ws.send(JSON.stringify({ type: 'registered', userId }));
          this.broadcastUserList();
          break;
        case 'positionUpdate':
          this.userService.updatePosition(data.userId, data.position);
          this.broadcast({
            type: 'positionUpdate',
            userId: data.userId,
            position: data.position
          });
          this.broadcastUserList();
          break;
      }
    } catch (error) {
      console.error('Erreur lors du traitement du message :', error);
    }
  }

  broadcastUserList() {
    const users = this.userService.getActiveUsers().map(user => ({
      userId: user.userId,
      nickname: user.nickname,
      position: user.position,
      connected: user.connected
    }));
    
    this.broadcast({
      type: 'userUpdate',
      users
    });
  }

  broadcast(message) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}