export class RegisterTicketNotificationUseCase {
  constructor({ notificationFactory, notificationRepository }) {
    this.notificationFactory = notificationFactory;
    this.notificationRepository = notificationRepository;
  }

  async execute(event) {
    if (event.type !== "ticket.created") {
      return null;
    }

    const notification = this.notificationFactory.fromTicketCreated(event.payload);
    await this.notificationRepository.save(notification);
    return notification;
  }
}
