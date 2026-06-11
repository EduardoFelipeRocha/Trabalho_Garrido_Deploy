export class CreateTicketUseCase {
  constructor({ ticketRepository, ticketFactory, priorityStrategy, eventPublisher }) {
    this.ticketRepository = ticketRepository;
    this.ticketFactory = ticketFactory;
    this.priorityStrategy = priorityStrategy;
    this.eventPublisher = eventPublisher;
  }

  async execute(input) {
    const priority = this.priorityStrategy.calculate({
      baseSeverity: input.category.baseSeverity,
      description: input.description
    });

    const ticket = this.ticketFactory.create({
      categoryId: input.category.id,
      description: input.description,
      citizenEmail: input.citizenEmail,
      district: input.district,
      priority
    });

    await this.ticketRepository.save(ticket);
    await this.eventPublisher.publish("ticket.created", ticket);

    return ticket;
  }
}
