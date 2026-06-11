import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TicketFactory } from "../../services/orders/src/domain/ticket-factory.js";

describe("TicketFactory", () => {
  it("creates a valid open ticket", () => {
    const factory = new TicketFactory({ nextId: () => "ticket-1" });

    const ticket = factory.create({
      categoryId: "pothole",
      description: "Buraco grande na avenida",
      citizenEmail: "ana@example.com",
      district: "Centro",
      priority: 4
    });

    assert.equal(ticket.id, "ticket-1");
    assert.equal(ticket.status, "OPEN");
    assert.equal(ticket.priority, 4);
  });

  it("rejects an invalid citizen email", () => {
    const factory = new TicketFactory({ nextId: () => "ticket-1" });

    assert.throws(() => {
      factory.create({
        categoryId: "pothole",
        description: "Buraco grande na avenida",
        citizenEmail: "email-invalido",
        district: "Centro",
        priority: 4
      });
    }, /email is invalid/);
  });
});
