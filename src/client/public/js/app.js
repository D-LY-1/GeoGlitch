import { MapManager } from './features/map-manager.js';
import { WebsocketClient } from './core/websocket.client.js';
import { WebRTCService } from './core/webrtc.service.js';

class App {
  /**
   * Constructs the App instance.
   * It creates instances for managing the map, the WebSocket connection, and WebRTC services.
   * It then initializes the application and sets up UI event listeners.
   */
  constructor() {
    this.mapManager = new MapManager();
    this.wsClient = new WebsocketClient(this.mapManager, undefined, () => this.setupGeolocation());
    this.webRTCService = new WebRTCService(this.wsClient);
    this.initialize();
    this.setupUIListeners();
  }

  /**
   * Initializes the application.
   * This method initializes the map, connects to the WebSocket server,
   * and sets up geolocation tracking.
   */
  async initialize() {
    await this.mapManager.initMap();
    this.wsClient.connect('wss://damien.leroy.caen.mds-project.fr');
    this.setupGeolocation();
  }

  /**
   * Initializes WebRTC services.
   * It obtains the local media stream and sets up event listeners for toggling audio/video.
   */
  async initializeWebRTC() {
    await this.webRTCService.init();

    document.getElementById('toggleVideo').addEventListener('click', () => {
        this.webRTCService.toggleVideo();
    });
    document.getElementById('toggleAudio').addEventListener('click', () => {
        this.webRTCService.toggleAudio();
    });
  }

  /**
   * Sets up geolocation tracking using the browser's geolocation API.
   * It uses watchPosition to continuously update the user's position.
   */
  setupGeolocation() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => this.handlePositionUpdate(position),
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true }
      );
    }
  }

  /**
   * Handles position updates from the geolocation API.
   * It sends the position to the server and updates the local map marker.
   * If the userId is not defined yet, it logs a warning and does not update the marker.
   * @param {GeolocationPosition} position - The position object provided by the geolocation API.
   */
  handlePositionUpdate(position) {
    const pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };
    this.wsClient.sendPosition(pos);
    if (!this.wsClient.userId) {
      console.warn("UserId not defined, position update ignored");
      return;
    }
    this.mapManager.updateUserMarker(this.wsClient.userId, pos);
  }

  /**
   * Sets up UI event listeners.
   * In this case, it adds a click listener to the "joinConference" button
   * to initialize the WebRTC connection and disable the button afterward.
   */
  setupUIListeners() {
    document.getElementById('joinConference').addEventListener('click', () => {
      this.initializeWebRTC();
      document.getElementById('joinConference').disabled = true;
    });
  }
}

document.addEventListener('DOMContentLoaded', () => window.app = new App());
