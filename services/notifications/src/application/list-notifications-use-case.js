export class ListNotificationsUseCase {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute() {
    return this.notificationRepository.findAll();
  }
}
