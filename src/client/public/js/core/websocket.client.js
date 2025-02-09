import { updateActiveUsersList } from "../ui/activeUsers.js";
import { updateCurrentUser } from "../ui/currentUser.js";

export class WebsocketClient {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.userId = crypto.randomUUID();
    this.nickname = null;
  }

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

  setNickname() {
    this.nickname = prompt('Entrez votre pseudonyme:') || 
                   `User_${Math.random().toString(36).substr(2, 5)}`;
    
    updateCurrentUser(this.userId, this.nickname);
  }

  registerUser() {
    this.send({
      type: 'register',
      userId: this.userId,
      nickname: this.nickname
    });
  }

  sendPosition(position) {
    this.send({
      type: 'positionUpdate',
      userId: this.userId,
      position
    });
  }

  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      switch (message.type) {
        case 'userUpdate':
          updateActiveUsersList();
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

  handleDisconnect() {
    console.log('Déconnecté.');
  }

  send(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}