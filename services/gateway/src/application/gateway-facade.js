export class GatewayFacade {
  constructor({
    categoryClient,
    ticketClient,
    notificationClient,
    fallbackCreateTicket,
    fallbackListTickets,
    fallbackListNotifications
  }) {
    this.categoryClient = categoryClient;
    this.ticketClient = ticketClient;
    this.notificationClient = notificationClient;
    this.fallbackCreateTicket = fallbackCreateTicket;
    this.fallbackListTickets = fallbackListTickets;
    this.fallbackListNotifications = fallbackListNotifications;
  }

  async createTicket(input) {
    const category = await this.categoryClient.getById(input.categoryId);

    const payload = {
      category,
      description: input.description,
      citizenEmail: input.citizenEmail,
      district: input.district
    };

    try {
      return await this.ticketClient.create(payload);
    } catch {
      return this.fallbackCreateTicket.execute(payload);
    }
  }

  async listCategories() {
    return this.categoryClient.findAll();
  }

  async listTickets() {
    try {
      return await this.ticketClient.findAll();
    } catch {
      return this.fallbackListTickets.execute();
    }
  }

  async listNotifications() {
    try {
      return await this.notificationClient.findAll();
    } catch {
      return this.fallbackListNotifications.execute();
    }
  }
}
