export default class MapManager {
  constructor() {
    this.map = null;
    this.markers = new Map();
  }

  async initMap() {
    try {
      this.map = L.map('map')
                  .setView([48.866667, 2.333333], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);
    } catch (error) {
      console.error('Erreur Leaflet:', error);
      throw error;
    }
  }

  updateUserMarker(userId, position) {
    console.log("==========")
    console.log("updateUserMarker")
    if (this.markers.has(userId)) {
      console.log("check IF")
      console.log(this.markers)
      this.markers.get(userId).setLatLng(position);
    } else {
      console.log("check ELSE")
      const marker = L.marker(position).addTo(this.map)
        .bindPopup(`<b>${nickname}</b><br>ID: ${userId}`)
        .on('click', () => {
          this.map.setView(position, this.map.getZoom());
        });
      this.markers.set(userId, marker);
      console.log(this.markers)
    }
  }

  removeUserMarker(userId) {
    if (this.markers.has(userId)) {
      const marker = this.markers.get(userId);
      this.map.removeLayer(marker);
      this.markers.delete(userId);
    }
  }

  focusOnUser(userId) {
    console.log("focusOnUser")
    console.log("markers length: ",this.markers)
    for(const [key, value] of this.markers.entries()) {
      console.log("MARKER: ",marker)
    }

    if (this.markers.has(userId)) {
      console.log("HAS USER ",userId)
      const marker = this.markers.get(userId);
      this.map.setView(marker.getLatLng(), this.map.getZoom());
      marker.openPopup();
    }
  }
}
