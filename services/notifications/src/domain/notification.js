export class Notification {
  constructor({ id, type, recipient, message, createdAt }) {
    if (!id || !type || !recipient || !message) {
      throw new Error("Notification requires id, type, recipient and message.");
    }

    this.id = id;
    this.type = type;
    this.recipient = recipient;
    this.message = message;
    this.createdAt = createdAt ?? new Date().toISOString();
  }
}
