export class InMemoryTicketRepository {
  constructor() {
    this.tickets = [];
  }

  async save(ticket) {
    this.tickets.push(ticket);
  }

  async findAll() {
    return [...this.tickets];
  }
}
