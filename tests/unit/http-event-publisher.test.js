import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import { HttpEventPublisher } from "../../services/orders/src/infrastructure/http-event-publisher.js";

describe("HttpEventPublisher", () => {
  it("ignores network errors when publishing events", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock.fn(async () => {
      throw new Error("fetch failed");
    });

    try {
      const publisher = new HttpEventPublisher("http://localhost:3003");
      await assert.doesNotReject(() => publisher.publish("ticket.created", { id: "1" }));
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
