import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { UpdateTicketUseCase } from "../../services/orders/src/application/update-ticket-use-case.js";
import { TicketFactory } from "../../services/orders/src/domain/ticket-factory.js";
import { InMemoryTicketRepository } from "../../services/orders/src/infrastructure/in-memory-ticket-repository.js";

describe("UpdateTicketUseCase", () => {
  it("changes priority, finishes a ticket and publishes an update event", async () => {
    const repository = new InMemoryTicketRepository();
    const ticket = new TicketFactory({ nextId: () => "ticket-1" }).create({
      categoryId: "pothole",
      description: "Buraco grande",
      citizenEmail: "ana@example.com",
      district: "Centro",
      priority: 4
    });
    const publishedEvents = [];
    await repository.save(ticket);

    const useCase = new UpdateTicketUseCase({
      ticketRepository: repository,
      eventPublisher: {
        publish: async (type, payload) => publishedEvents.push({ type, payload })
      }
    });

    const updatedTicket = await useCase.execute("ticket-1", {
      priority: 2,
      status: "DONE"
    });

    assert.equal(updatedTicket.priority, 2);
    assert.equal(updatedTicket.status, "DONE");
    assert.equal(publishedEvents[0].type, "ticket.updated");
  });
});
