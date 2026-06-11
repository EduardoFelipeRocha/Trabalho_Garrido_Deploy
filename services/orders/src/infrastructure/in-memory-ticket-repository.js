export class InMemoryTicketRepository {
  constructor() {
    this.tickets = [];
  }

  async save(ticket) {
    this.tickets.push(ticket);
  }

  async update(ticket) {
    const index = this.tickets.findIndex((item) => item.id === ticket.id);

    if (index === -1) {
      throw new Error("Ticket not found.");
    }

    this.tickets[index] = ticket;
  }

  async findAll() {
    return [...this.tickets];
  }

  async findById(ticketId) {
    return this.tickets.find((ticket) => ticket.id === ticketId) ?? null;
  }
}
