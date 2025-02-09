export class UserService {
  constructor() {
    this.users = new Map();
  }

  addUser(userId, ws, nickname) {
    this.users.set(userId, {
      ws,
      nickname,
      position: null,
      connected: true,
      lastUpdate: Date.now()
    });
  }

  updatePosition(userId, position) {
    const user = this.users.get(userId);
    if (user) {
      user.position = position;
      user.lastUpdate = Date.now();
    }
  }

  removeUser(userId) {
    this.users.delete(userId);
  }

  getActiveUsers() {
    return Array.from(this.users.entries()).map(([id, data]) => ({
      id,
      ...data
    }));
  }
}