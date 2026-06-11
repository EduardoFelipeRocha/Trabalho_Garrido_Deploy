import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CreateTicketUseCase } from "../../services/orders/src/application/create-ticket-use-case.js";
import { TicketFactory } from "../../services/orders/src/domain/ticket-factory.js";
import { SeverityPriorityStrategy } from "../../services/orders/src/domain/severity-priority-strategy.js";
import { InMemoryTicketRepository } from "../../services/orders/src/infrastructure/in-memory-ticket-repository.js";

describe("CreateTicketUseCase", () => {
  it("saves a ticket and publishes a created event", async () => {
    const repository = new InMemoryTicketRepository();
    const publishedEvents = [];
    const useCase = new CreateTicketUseCase({
      ticketRepository: repository,
      ticketFactory: new TicketFactory({ nextId: () => "ticket-1" }),
      priorityStrategy: new SeverityPriorityStrategy(),
      eventPublisher: {
        publish: async (type, payload) => publishedEvents.push({ type, payload })
      }
    });

    const ticket = await useCase.execute({
      category: { id: "pothole", baseSeverity: 4 },
      description: "Buraco com risco de acidente",
      citizenEmail: "ana@example.com",
      district: "Centro"
    });

    assert.equal(ticket.id, "ticket-1");
    assert.equal(ticket.priority, 5);
    assert.deepEqual(await repository.findAll(), [ticket]);
    assert.equal(publishedEvents[0].type, "ticket.created");
    assert.equal(publishedEvents[0].payload, ticket);
  });
});
