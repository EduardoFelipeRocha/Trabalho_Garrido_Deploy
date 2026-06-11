import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { CreateTicketUseCase } from "../../services/orders/src/application/create-ticket-use-case.js";
import { TicketFactory } from "../../services/orders/src/domain/ticket-factory.js";
import { SeverityPriorityStrategy } from "../../services/orders/src/domain/severity-priority-strategy.js";
import { InMemoryTicketRepository } from "../../services/orders/src/infrastructure/in-memory-ticket-repository.js";

const feature = await readFile(new URL("./features/ticket.feature", import.meta.url), "utf8");
const scenarios = feature.split("\n\n").filter((block) => block.trim().startsWith("Scenario:"));

for (const scenario of scenarios) {
  const context = { publishedEvents: [] };

  for (const line of scenario.split("\n").map((step) => step.trim()).filter(Boolean)) {
    await runStep(line, context);
  }

  console.log(`BDD ok: ${scenario.split("\n")[0].replace("Scenario: ", "")}`);
}

async function runStep(step, context) {
  if (step.startsWith("Scenario:")) {
    return;
  }

  const categoryMatch = step.match(/^Given a categoria "(.+)" com severidade (\d)$/);
  if (categoryMatch) {
    context.category = {
      id: categoryMatch[1],
      baseSeverity: Number(categoryMatch[2])
    };
    return;
  }

  const registerMatch = step.match(/^When o cidadao registra "(.+)"$/);
  if (registerMatch) {
    const repository = new InMemoryTicketRepository();
    const useCase = new CreateTicketUseCase({
      ticketRepository: repository,
      ticketFactory: new TicketFactory({ nextId: () => "ticket-bdd" }),
      priorityStrategy: new SeverityPriorityStrategy(),
      eventPublisher: {
        publish: async (type, payload) => context.publishedEvents.push({ type, payload })
      }
    });

    context.ticket = await useCase.execute({
      category: context.category,
      description: registerMatch[1],
      citizenEmail: "cidadao@example.com",
      district: "Centro"
    });
    return;
  }

  const priorityMatch = step.match(/^Then o chamado deve ser criado com prioridade (\d)$/);
  if (priorityMatch) {
    assert.equal(context.ticket.priority, Number(priorityMatch[1]));
    return;
  }

  if (step === "And uma notificacao deve ser publicada") {
    assert.equal(context.publishedEvents.length, 1);
    assert.equal(context.publishedEvents[0].type, "ticket.created");
    return;
  }

  throw new Error(`Step not implemented: ${step}`);
}
