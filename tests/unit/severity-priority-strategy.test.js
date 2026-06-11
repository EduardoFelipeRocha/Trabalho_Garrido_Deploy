import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SeverityPriorityStrategy } from "../../services/orders/src/domain/severity-priority-strategy.js";

describe("SeverityPriorityStrategy", () => {
  it("increases priority when the description has emergency signals", () => {
    const strategy = new SeverityPriorityStrategy();

    const priority = strategy.calculate({
      baseSeverity: 4,
      description: "Buraco com risco de acidente perto da escola"
    });

    assert.equal(priority, 5);
  });

  it("keeps priority inside the maximum limit", () => {
    const strategy = new SeverityPriorityStrategy();

    const priority = strategy.calculate({
      baseSeverity: 5,
      description: "Alagamento perto do hospital"
    });

    assert.equal(priority, 5);
  });
});
