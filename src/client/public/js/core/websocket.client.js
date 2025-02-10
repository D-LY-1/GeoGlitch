import { updateActiveUsersList } from "../ui/activeUsers.js";
import { updateCurrentUser } from "../ui/currentUser.js";

export class WebsocketClient {
  /**
   * Constructs a new WebsocketClient instance.
   * @param {MapManager} mapManager - The MapManager instance for updating map markers.
   * @param {WebRTCService} webRTCService - The WebRTCService instance for handling media streams.
   */
  constructor(mapManager, webRTCService, onRegistered) {
    this.mapManager = mapManager;
    this.webRTCService = webRTCService;
    this.userId = null; // Will be set upon registration
    this.nickname = null;
    this.onRegistered = onRegistered;
  }

  /**
   * Connects to the WebSocket server at the given URL.
   * Prompts for a nickname, registers the user, and sets up message and disconnect handlers.
   * @param {string} url - The WebSocket URL.
   * @returns {Promise} Resolves when the connection is established.
   */
  async connect(url) {
    return new Promise((resolve, reject) => {
      this.setNickname();
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.registerUser();
        resolve();
      };

      this.ws.onmessage = (event) => this.handleMessage(event.data);
      this.ws.onclose = () => this.handleDisconnect();
    });
  }

  /**
   * Prompts the user for a nickname and updates the current user display.
   */
  setNickname() {
    this.nickname = prompt('Entrez votre pseudonyme:') || `User_${Math.random().toString(36).substr(2, 5)}`;
    updateCurrentUser(this.userId, this.nickname);
  }

  /**
   * Sends a registration message with the user's nickname to the server.
   */
  registerUser() {
    this.send({
      type: 'register',
      nickname: this.nickname
    });
  }

  /**
   * Sends a position update message to the server.
   * @param {Object} position - An object containing latitude, longitude, and accuracy.
   */
  sendPosition(position) {
    this.send({
      type: 'positionUpdate',
      userId: this.userId,
      position
    });
  }

  /**
   * Handles incoming messages from the WebSocket server.
   * Processes 'registered', 'userUpdate', and 'positionUpdate' message types.
   * @param {string} data - The raw JSON message received from the server.
   */
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      switch (message.type) {
        case 'registered':
          this.userId = message.userId;
          updateCurrentUser(this.userId, this.nickname);
          if (this.onRegistered) {
            this.onRegistered();
          }
          break;
        case 'userUpdate':
          updateActiveUsersList(message.users);
          message.users.forEach(user => {
            if (user.position) {
              window.app.mapManager.updateUserMarker(user.userId, user.position);
            }
          });
          break;
        case 'positionUpdate':
          if (message.userId !== this.userId) {
            this.mapManager.updateUserMarker(message.userId, message.position);
          }
          break;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  /**
   * Handles the WebSocket disconnection event.
   */
  handleDisconnect() {
    console.log('Déconnecté.');
  }

  /**
   * Sends a message to the server via WebSocket if the connection is open.
   * @param {Object} message - The message object to send.
   */
  send(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}