import { WS_EVENTS } from '../config/constants.js';
import WebSocket from 'ws';

export class WebsocketController {
  /**
   * Constructs a new WebsocketController.
   * @param {WebSocketServer} wss - The WebSocket server instance.
   * @param {UserService} userService - The user service for managing connected users.
   */
  constructor(wss, userService) {
    this.wss = wss;
    this.userService = userService;
    this.initialize();
  }

  /**
   * Initializes the WebSocket server by listening for new connections.
   * For each connection, it sets up the connection handler and ping-pong mechanism.
   */
  initialize() {
    this.wss.on(WS_EVENTS.CONNECTION, (ws) => {
      this.handleConnection(ws);
      this.setupPingPong(ws);
    });
  }

  /**
   * Sets up a ping-pong mechanism on the given WebSocket connection to detect dead clients.
   * Sends periodic pings and terminates the connection if no pong response is received.
   * @param {WebSocket} ws - The WebSocket connection.
   */
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

  /**
   * Handles a new WebSocket connection.
   * Sets up listeners for incoming messages and connection close events.
   * @param {WebSocket} ws - The new WebSocket connection.
   */
  handleConnection(ws) {
    console.log('New client connected');
    ws.on('message', (message) => this.handleMessage(ws, message));
    ws.on('close', () => this.handleDisconnect(ws));
  }

  /**
   * Handles disconnection of a WebSocket connection.
   * Removes the disconnected user from the user service and broadcasts the updated user list.
   * @param {WebSocket} ws - The WebSocket connection that has closed.
   */
  handleDisconnect(ws) {
    const userId = this.findUserIdByWs(ws);
    if (userId) {
      this.userService.removeUser(userId);
      this.broadcastUserList();
    }
    console.log('Client disconnected');
  }

  /**
   * Finds the user ID associated with a given WebSocket connection.
   * @param {WebSocket} ws - The WebSocket connection.
   * @returns {string|null} The user ID if found; otherwise, null.
   */
  findUserIdByWs(ws) {
    for (const [userId, user] of this.userService.users) {
      if (user.ws === ws) {
        return userId;
      }
    }
    return null;
  }

  /**
   * Handles an incoming message from a WebSocket client.
   * Depending on the message type, it processes registration or position updates.
   * @param {WebSocket} ws - The WebSocket connection from which the message was received.
   * @param {string} message - The JSON-encoded message.
   */
  handleMessage(ws, message) {
    try {
      const data = JSON.parse(message);
      console.log('Message received:', data);

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
          
          // Add the new user and send back the generated userId
          const userId = this.userService.addUser(ws, data.nickname);
          ws.send(JSON.stringify({ type: 'registered', userId }));
          this.broadcastUserList();
          break;
        case 'positionUpdate':
          // Update the user's position and broadcast the update to all clients
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
      console.error('Error processing message:', error);
    }
  }

  /**
   * Broadcasts the updated list of active users to all connected clients.
   * Each user object includes the userId, nickname, position, and connection status.
   */
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

  /**
   * Broadcasts a message to all connected WebSocket clients.
   * @param {Object} message - The message object to send.
   */
  broadcast(message) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}
