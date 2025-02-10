import {
  getActiveUsers,
  getUser
} from "../services/user.api.js";

export class MapManager {
  constructor() {
    this.map = null;
    this.markers = new Map();
  }

  async initMap() {
    try {
      this.map = L.map('map').setView([48.866667, 2.333333], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      return this.map;
    } catch (error) {
      console.error('Erreur Leaflet:', error);
      throw error;
    }
  }

  updateUserMarker(userId, position) {
    this.updateMarker(userId, position);
  }

  async updateMarker(userId, position) {
    if (this.markers.has(userId)) {
      this.markers.get(userId).setLatLng(position);
    } else {
      const users = await getActiveUsers();
      const userObj = users.find(user => user.userId === userId);
      if (!userObj) return;
    
      const marker = L.marker(position)
        .addTo(this.map)
        .bindPopup(`
          <b>${userObj.nickname}</b><br>
          ID: ${userId}
        `)
        .on('click', () => {
          this.map.setView(position, this.map.getZoom());
        });
  
      console.log("*************** this.markers: ",this.markers)
      this.markers.set(userId, marker);
    }
  }

  removeUserMarker(userId) {
    if (this.markers.has(userId)) {
      this.map.removeLayer(this.markers.get(userId));
      this.markers.delete(userId);
    }
  }

  focusOnUser(userId) {
    console.log(userId)
    console.log(this.markers)

    if (this.markers.has(userId)) {
      const marker = this.markers.get(userId);
      this.map.setView(marker.getLatLng(), this.map.getZoom());
      marker.openPopup();
    }
  }
}