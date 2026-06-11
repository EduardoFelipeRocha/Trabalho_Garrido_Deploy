export class GatewayFacade {
  constructor({ categoryClient, ticketClient, notificationClient, fallbackCreateTicket }) {
    this.categoryClient = categoryClient;
    this.ticketClient = ticketClient;
    this.notificationClient = notificationClient;
    this.fallbackCreateTicket = fallbackCreateTicket;
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
    return this.ticketClient.findAll();
  }

  async listNotifications() {
    return this.notificationClient.findAll();
  }
}
