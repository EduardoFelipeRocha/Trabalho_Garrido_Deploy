export class GatewayFacade {
  constructor({
    categoryClient,
    ticketClient,
    notificationClient,
    fallbackCreateTicket,
    fallbackUpdateTicket,
    fallbackListTickets,
    fallbackListNotifications,
    notificationRecorder
  }) {
    this.categoryClient = categoryClient;
    this.ticketClient = ticketClient;
    this.notificationClient = notificationClient;
    this.fallbackCreateTicket = fallbackCreateTicket;
    this.fallbackUpdateTicket = fallbackUpdateTicket;
    this.fallbackListTickets = fallbackListTickets;
    this.fallbackListNotifications = fallbackListNotifications;
    this.notificationRecorder = notificationRecorder;
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
      const ticket = await this.ticketClient.create(payload);
      await this.notificationRecorder.recordCreated(ticket, "orders");
      return ticket;
    } catch {
      const ticket = await this.fallbackCreateTicket.execute(payload);
      await this.notificationRecorder.recordCreated(ticket, "gateway");
      return ticket;
    }
  }

  async updateTicket(ticketId, input) {
    try {
      const ticket = await this.ticketClient.update(ticketId, input);
      await this.notificationRecorder.recordUpdated(ticket, "orders");
      return ticket;
    } catch {
      const ticket = await this.fallbackUpdateTicket.execute(ticketId, input);
      await this.notificationRecorder.recordUpdated(ticket, "gateway");
      return ticket;
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
