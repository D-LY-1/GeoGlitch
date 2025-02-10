import { getActiveUsers, getUser } from "../services/user.api.js";

export class MapManager {
  constructor() {
    this.map = null;
    this.markers = new Map();
  }

  /**
   * Initializes the Leaflet map.
   * Creates the map, sets its initial view, and adds the OpenStreetMap tile layer.
   * @returns {Promise<Object>} The initialized map instance.
   */
  async initMap() {
    try {
      this.map = L.map('map').setView([48.866667, 2.333333], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);

      return this.map;
    } catch (error) {
      console.error('Leaflet error:', error);
      throw error;
    }
  }

  /**
   * Updates the marker for a given user.
   * This is a simple wrapper that calls updateMarker.
   * @param {string} userId - The identifier of the user.
   * @param {Object} position - The position object (latitude, longitude, accuracy).
   */
  updateUserMarker(userId, position) {
    this.updateMarker(userId, position);
  }

  /**
   * Creates or updates a marker for a user on the map.
   * If a marker for the user already exists, its position is updated.
   * Otherwise, the function fetches the active users, finds the corresponding user,
   * and creates a new marker with a popup displaying the user's nickname and ID.
   * @param {string} userId - The identifier of the user.
   * @param {Object} position - The position object containing latitude and longitude.
   */
  async updateMarker(userId, position) {
    if (this.markers.has(userId)) {
      // Update the marker's position if it already exists.
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

      this.markers.set(userId, marker);
    }
  }

  /**
   * Removes the marker associated with a given userId from the map.
   * @param {string} userId - The identifier of the user.
   */
  removeUserMarker(userId) {
    if (this.markers.has(userId)) {
      this.map.removeLayer(this.markers.get(userId));
      this.markers.delete(userId);
    }
  }

  /**
   * Focuses the map view on the marker associated with the given userId.
   * Opens the marker's popup if found.
   * @param {string} userId - The identifier of the user.
   */
  focusOnUser(userId) {
    if (this.markers.has(userId)) {
      const marker = this.markers.get(userId);
      this.map.setView(marker.getLatLng(), this.map.getZoom());
      marker.openPopup();
    }
  }
}
