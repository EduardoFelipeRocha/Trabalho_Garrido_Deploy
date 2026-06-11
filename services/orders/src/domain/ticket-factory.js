import { Ticket } from "./ticket.js";

export class TicketFactory {
  constructor(idGenerator) {
    this.idGenerator = idGenerator;
  }

  create({ categoryId, description, citizenEmail, district, priority }) {
    return new Ticket({
      id: this.idGenerator.nextId(),
      categoryId,
      description,
      citizenEmail,
      district,
      priority,
      status: "OPEN"
    });
  }
}
