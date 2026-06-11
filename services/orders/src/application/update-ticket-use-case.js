export class UpdateTicketUseCase {
  constructor({ ticketRepository, eventPublisher }) {
    this.ticketRepository = ticketRepository;
    this.eventPublisher = eventPublisher;
  }

  async execute(ticketId, input) {
    const ticket = await this.ticketRepository.findById(ticketId);

    if (!ticket) {
      throw new Error("Ticket not found.");
    }

    if (input.priority !== undefined) {
      ticket.changePriority(Number(input.priority));
    }

    if (input.status === "DONE") {
      ticket.finish();
    }

    await this.ticketRepository.update(ticket);
    await this.eventPublisher.publish("ticket.updated", ticket);

    return ticket;
  }
}
