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
});
