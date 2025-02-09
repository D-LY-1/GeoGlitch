export class UserService {
  static #instance = null;

  constructor() {
    if(UserService.#instance)
      throw new Error("Utilisez UserService.getInstance()");

    this.users = new Map();
    this.nicknames = new Set();
    UserService.#instance = this;
  }

  static getInstance(){
    if(!UserService.#instance)
      UserService.#instance = new UserService();
    return UserService.#instance;
  }

  addUser(userId, ws, nickname) {
    if (this.nicknames.has(nickname)) {
      throw new Error('Nickname already taken');
    }
    
    this.users.set(userId, {
      ws,
      nickname,
      position: null,
      connected: true,
      lastUpdate: Date.now()
    });
    
    this.nicknames.add(nickname);
  }

  getActiveUsers() {
    return Array.from(this.users.entries()).map(([id, user]) => ({
      id,
      nickname: user.nickname,
      position: user.position,
      connected: user.connected
    }));
  }

  updatePosition(userId, position) {
    const user = this.users.get(userId);
    if (user) {
      user.position = position;
      user.lastUpdate = Date.now();
    }
  }

  removeUser(userId) {
    const user = this.users.get(userId);
    if (user) {
      this.nicknames.delete(user.nickname);
      this.users.delete(userId);
    }
  }

  validatePosition(position) {
    const { lat, lng } = position;
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }
}