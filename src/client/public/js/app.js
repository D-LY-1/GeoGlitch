import { MapManager } from './features/map-manager.js';
import { WebsocketClient } from './core/websocket.client.js';
import { WebRTCService} from './core/webrtc.service.js'

class App {
  constructor() {
    this.mapManager = new MapManager();
    this.wsClient = new WebsocketClient(this.mapManager);    
    this.webRTCService = new WebRTCService(this.wsClient);
    this.initialize();
    this.setupUIListeners();
  }

  async initialize() {
    await this.mapManager.initMap();
    this.wsClient.connect();
    this.setupGeolocation();
  }

  async initializeWebRTC() {
    await this.webRTCService.init();
    
    document.getElementById('toggleVideo').addEventListener('click', () => {
        this.webRTCService.toggleVideo();
    });
    
    document.getElementById('toggleAudio').addEventListener('click', () => {
        this.webRTCService.toggleAudio();
    });
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
    console.log("AAA")
    if (!this.wsClient.userId) {
      console.warn("UserId non défini, mise à jour de la position ignorée");
      return;
    }
    this.mapManager.updateUserMarker(this.wsClient.userId, pos);
  }

  setupUIListeners() {
    document.getElementById('joinConference').addEventListener('click', () => {
      this.initializeWebRTC();
      document.getElementById('joinConference').disabled = true;
    });
  }
}

document.addEventListener('DOMContentLoaded', () => window.app = new App());