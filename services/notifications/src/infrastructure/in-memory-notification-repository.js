export class InMemoryNotificationRepository {
  constructor() {
    this.notifications = [];
  }

  async save(notification) {
    this.notifications.push(notification);
  }

  async findAll() {
    return [...this.notifications];
  }
}
