export class TicketNotificationRecorder {
  constructor({ notificationServiceUrl, notificationRepository, notificationFactory }) {
    this.notificationServiceUrl = notificationServiceUrl ? normalizeBaseUrl(notificationServiceUrl) : "";
    this.notificationRepository = notificationRepository;
    this.notificationFactory = notificationFactory;
  }

  async recordCreated(ticket, source) {
    await this.record("ticket.created", ticket, source, () => this.notificationFactory.fromTicketCreated(ticket));
  }

  async recordUpdated(ticket, source) {
    await this.record("ticket.updated", ticket, source, () => this.notificationFactory.fromTicketUpdated(ticket));
  }

  async record(type, ticket, source, createFallbackNotification) {
    if (source === "orders" && await this.isNotificationServiceAvailable()) {
      return;
    }

    if (await this.publishToNotificationService(type, ticket)) {
      return;
    }

    await this.notificationRepository.save(createFallbackNotification());
  }

  async isNotificationServiceAvailable() {
    if (!this.notificationServiceUrl) {
      return false;
    }

    try {
      const response = await fetch(`${this.notificationServiceUrl}/notifications`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async publishToNotificationService(type, payload) {
    if (!this.notificationServiceUrl) {
      return false;
    }

    try {
      const response = await fetch(`${this.notificationServiceUrl}/events`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type, payload })
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

function normalizeBaseUrl(baseUrl) {
  return baseUrl.startsWith("http") ? baseUrl : `http://${baseUrl}`;
}
