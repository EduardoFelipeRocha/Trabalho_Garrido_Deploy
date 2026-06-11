import { Notification } from "../domain/notification.js";

export class SupabaseNotificationRepository {
  constructor(supabaseClient) {
    this.supabaseClient = supabaseClient;
  }

  async save(notification) {
    await this.supabaseClient.insert("notifications", {
      id: notification.id,
      type: notification.type,
      recipient: notification.recipient,
      message: notification.message,
      created_at: notification.createdAt
    });
  }

  async findAll() {
    const rows = await this.supabaseClient.findAll("notifications");
    return rows.map(toNotification);
  }
}

function toNotification(row) {
  return new Notification({
    id: row.id,
    type: row.type,
    recipient: row.recipient,
    message: row.message,
    createdAt: row.created_at
  });
}
