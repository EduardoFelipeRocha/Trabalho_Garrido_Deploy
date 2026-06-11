export class GatewayFacade {
  constructor({ categoryClient, ticketClient }) {
    this.categoryClient = categoryClient;
    this.ticketClient = ticketClient;
  }

  async createTicket(input) {
    const category = await this.categoryClient.getById(input.categoryId);

    return this.ticketClient.create({
      category,
      description: input.description,
      citizenEmail: input.citizenEmail,
      district: input.district
    });
  }

  async listCategories() {
    return this.categoryClient.findAll();
  }

  async listTickets() {
    return this.ticketClient.findAll();
  }
}
