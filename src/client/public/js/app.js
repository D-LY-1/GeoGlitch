import {MapManager} from './features/map-manager.js';
import {WebsocketClient} from './core/websocket.client.js';

class App {
  constructor() {
    this.userId = this.generateUserId();
    this.mapManager = new MapManager();
    this.wsClient = new WebsocketClient(this.mapManager);
    this.retryCount = 0;
    this.maxRetries = 3;
    this.initialize();
  }

  generateUserId() {
    return Math.random().toString(36).substr(2, 9);
  }

  async initialize() {
    try {
      await this.mapManager.initMap();
      this.wsClient.connect();
      this.setupGeolocation();
    } catch (error) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Tentative ${this.retryCount}/${this.maxRetries}`);
        setTimeout(() => this.initialize(), 1000 * this.retryCount);
      } else {
        console.error('Échec après plusieurs tentatives:', error);
      }
    }
  }

  setupGeolocation() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => this.handlePositionUpdate(position),
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true }
      );
    }
  }

  handlePositionUpdate(position) {
    const pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };
    this.wsClient.sendPosition(pos);
    this.mapManager.updateUserMarker(this.userId, pos);
  }
}

document.addEventListener('DOMContentLoaded', () => new App());