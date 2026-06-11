export class RegisterTicketNotificationUseCase {
  constructor({ notificationFactory, notificationRepository }) {
    this.notificationFactory = notificationFactory;
    this.notificationRepository = notificationRepository;
  }

  async execute(event) {
    if (event.type === "ticket.created") {
      const notification = this.notificationFactory.fromTicketCreated(event.payload);
      await this.notificationRepository.save(notification);
      return notification;
    }

    if (event.type === "ticket.updated") {
      const notification = this.notificationFactory.fromTicketUpdated(event.payload);
      await this.notificationRepository.save(notification);
      return notification;
    }

    return null;
  }
}
