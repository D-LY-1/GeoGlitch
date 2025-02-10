import { randomUUID } from 'crypto';

export class UserService {
  // Private static instance to enforce singleton pattern.
  static #instance = null;

  /**
   * Constructor for the UserService.
   * Initializes the users map and the nicknames set.
   * Throws an error if an instance already exists.
   */
  constructor() {
    if (UserService.#instance)
      throw new Error("Use UserService.getInstance()");

    this.users = new Map();
    this.nicknames = new Set();
    UserService.#instance = this;
  }

  /**
   * Returns the singleton instance of the UserService.
   * @returns {UserService} The instance of UserService.
   */
  static getInstance(){
    if (!UserService.#instance)
      UserService.#instance = new UserService();
    return UserService.#instance;
  }

  /**
   * Adds a new user to the service.
   * Generates a unique userId, stores the user's WebSocket connection, nickname, 
   * and initializes their position and status.
   * Throws an error if the nickname is already taken.
   * @param {WebSocket} ws - The user's WebSocket connection.
   * @param {string} nickname - The user's nickname.
   * @returns {string} The generated userId.
   */
  addUser(ws, nickname) {
    if (this.nicknames.has(nickname)) {
      throw new Error('Nickname already taken');
    }
    const userId = randomUUID();
    
    this.users.set(userId, {
      ws,
      nickname,
      position: null,    // Position will be updated later.
      connected: true,
      lastUpdate: Date.now()
    });
    
    this.nicknames.add(nickname);
    return userId;
  }

  /**
   * Retrieves a list of active users.
   * Returns an array of user objects, each containing userId, nickname, and position.
   * @returns {Array} Array of active user objects.
   */
  getActiveUsers() {
    return Array.from(this.users.entries()).map(([userId, user]) => ({
      userId,
      nickname: user.nickname,
      position: user.position
    }));
  }

  /**
   * Updates the position of a given user.
   * If the user exists, their position and last update timestamp are updated.
   * @param {string} userId - The identifier of the user.
   * @param {Object} position - The new position object (e.g., { lat, lng, accuracy }).
   */
  updatePosition(userId, position) {
    const user = this.users.get(userId);
    if (user) {
      user.position = position;
      user.lastUpdate = Date.now();
    }
  }

  /**
   * Removes a user from the service.
   * Deletes the user from the internal map and frees their nickname.
   * @param {string} userId - The identifier of the user to remove.
   */
  removeUser(userId) {
    const user = this.users.get(userId);
    if (user) {
      this.nicknames.delete(user.nickname);
      this.users.delete(userId);
    }
  }

  /**
   * Validates a given position object.
   * Checks that latitude and longitude fall within acceptable ranges.
   * @param {Object} position - The position object with lat and lng properties.
   * @returns {boolean} True if the position is valid; otherwise, false.
   */
  validatePosition(position) {
    const { lat, lng } = position;
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }
}
