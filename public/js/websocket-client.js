import MapManager from './map-manager.js';
import { faker } from 'https://cdn.skypack.dev/@faker-js/faker';

export default class WebsocketClient {
  constructor() {
    this.userId = null;
    this.nickname = null;
    this.ws = null;
    this.mapManager = new MapManager();
  }

  connect() {
    this.nickname = prompt('Entrez votre pseudonyme:');
    if (!this.nickname)
      this.nickname = `${faker.person.firstName()} ${faker.person.lastName()}`;

    this.ws = new WebSocket('ws://localhost:3000');

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.userId = crypto.randomUUID();
      this.send({
        type: 'register',
        userId: this.userId,
        nickname: this.nickname
      });
      document.getElementById('userId').textContent = this.userId;
      document.getElementById('nickname').textContent = this.nickname;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
  }

  sendPosition(position) {
    this.send({
      type: 'positionUpdate',
      userId: this.userId,
      position
    });
  }

  send(message) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  handleMessage(data) {
    switch (data.type) {
      case 'userUpdate':
        this.updateUserList(data.users);
        break;
      case 'positionUpdate':
        if (data.userId !== this.userId) {
          this.mapManager.updateUserMarker(data.userId, data.position);
        }
        break;
    }
  }

  // updateUserList(users) {
  //   const list = document.getElementById('usersList');
  //   list.innerHTML = users
  //     .map(user => {
  //       const status = user.connected ? '📍 En ligne' : '⚫ Hors ligne';
  //       const position = user.position
  //         ? `(${user.position.lat.toFixed(4)}, ${user.position.lng.toFixed(4)})`
  //         : '';
  //       return `<li onclick="window.wsClient.focusOnUser('${user.id}')"
  //               style="cursor: pointer;">
  //               ${user.nickname} ${position} - ${status}
  //               </li>`;
  //     })
  //     .join('');
  // }

  updateUserList(users) {
    const list = document.getElementById('usersList');
    list.innerHTML = ''; // Réinitialiser la liste des utilisateurs
  
    users.forEach((user) => {
      const status = user.connected ? '📍 En ligne' : '⚫ Hors ligne';
      const position = user.position
        ? `(${user.position.lat.toFixed(4)}, ${user.position.lng.toFixed(4)})`
        : '';
  
      // Créer un élément de liste
      const listItem = document.createElement('li');
      listItem.textContent = `${user.nickname} ${position} - ${status}`;
      listItem.style.cursor = 'pointer';
  
      // Ajouter un gestionnaire d'événement
      listItem.addEventListener('click', () => {
        this.focusOnUser(user.id);
      });
  
      list.appendChild(listItem);
    });
  }
  

  focusOnUser(userId) {
    this.mapManager.focusOnUser(userId);
  }
}