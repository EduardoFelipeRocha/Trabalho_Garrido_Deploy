import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GatewayFacade } from "../../services/gateway/src/application/gateway-facade.js";

describe("GatewayFacade", () => {
  it("loads category before creating the ticket", async () => {
    const calls = [];
    const facade = new GatewayFacade({
      categoryClient: {
        getById: async (categoryId) => {
          calls.push(`category:${categoryId}`);
          return { id: categoryId, baseSeverity: 4 };
        }
      },
      ticketClient: {
        create: async (input) => {
          calls.push(`ticket:${input.category.id}`);
          return { id: "ticket-1", ...input };
        }
      },
      notificationClient: {
        findAll: async () => []
      },
      fallbackCreateTicket: {
        execute: async () => {
          throw new Error("Fallback should not be called.");
        }
      },
      fallbackListTickets: {
        execute: async () => []
      },
      fallbackListNotifications: {
        execute: async () => []
      }
    });

    const ticket = await facade.createTicket({
      categoryId: "pothole",
      description: "Buraco grande",
      citizenEmail: "ana@example.com",
      district: "Centro"
    });

    assert.equal(ticket.id, "ticket-1");
    assert.deepEqual(calls, ["category:pothole", "ticket:pothole"]);
  });

  it("uses fallback creation when orders service is unavailable", async () => {
    const facade = new GatewayFacade({
      categoryClient: {
        getById: async (categoryId) => ({ id: categoryId, baseSeverity: 4 })
      },
      ticketClient: {
        create: async () => {
          throw new Error("fetch failed");
        }
      },
      notificationClient: {
        findAll: async () => []
      },
      fallbackCreateTicket: {
        execute: async (input) => ({ id: "fallback-ticket", ...input })
      },
      fallbackListTickets: {
        execute: async () => []
      },
      fallbackListNotifications: {
        execute: async () => []
      }
    });

    const ticket = await facade.createTicket({
      categoryId: "pothole",
      description: "Buraco grande",
      citizenEmail: "ana@example.com",
      district: "Centro"
    });

    assert.equal(ticket.id, "fallback-ticket");
  });

  it("uses fallback lists when upstream services are unavailable", async () => {
    const facade = new GatewayFacade({
      categoryClient: {
        getById: async (categoryId) => ({ id: categoryId, baseSeverity: 4 })
      },
      ticketClient: {
        findAll: async () => {
          throw new Error("fetch failed");
        }
      },
      notificationClient: {
        findAll: async () => {
          throw new Error("fetch failed");
        }
      },
      fallbackCreateTicket: {
        execute: async (input) => ({ id: "fallback-ticket", ...input })
      },
      fallbackListTickets: {
        execute: async () => [{ id: "ticket-1" }]
      },
      fallbackListNotifications: {
        execute: async () => []
      }
    });

    assert.deepEqual(await facade.listTickets(), [{ id: "ticket-1" }]);
    assert.deepEqual(await facade.listNotifications(), []);
  });
});
