import http from "node:http";
import { CreateTicketUseCase } from "../application/create-ticket-use-case.js";
import { ListTicketsUseCase } from "../application/list-tickets-use-case.js";
import { UpdateTicketUseCase } from "../application/update-ticket-use-case.js";
import { SeverityPriorityStrategy } from "../domain/severity-priority-strategy.js";
import { TicketFactory } from "../domain/ticket-factory.js";
import { HttpEventPublisher } from "../infrastructure/http-event-publisher.js";
import { InMemoryTicketRepository } from "../infrastructure/in-memory-ticket-repository.js";
import { SupabaseTicketRepository } from "../infrastructure/supabase-ticket-repository.js";
import { UuidIdGenerator } from "../infrastructure/uuid-id-generator.js";
import { SupabaseRestClient } from "../../../shared/supabase-rest-client.js";

const supabaseClient = new SupabaseRestClient({
  url: process.env.SUPABASE_URL,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
});
const repository = supabaseClient.enabled
  ? new SupabaseTicketRepository(supabaseClient)
  : new InMemoryTicketRepository();
const createTicket = new CreateTicketUseCase({
  ticketRepository: repository,
  ticketFactory: new TicketFactory(new UuidIdGenerator()),
  priorityStrategy: new SeverityPriorityStrategy(),
  eventPublisher: new HttpEventPublisher(process.env.NOTIFICATIONS_URL)
});
const listTickets = new ListTicketsUseCase(repository);
const updateTicket = new UpdateTicketUseCase({
  ticketRepository: repository,
  eventPublisher: new HttpEventPublisher(process.env.NOTIFICATIONS_URL)
});
const port = Number(process.env.PORT ?? 3002);

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => resolve(body ? JSON.parse(body) : {}));
    request.on("error", reject);
  });
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "GET" && url.pathname === "/tickets") {
      sendJson(response, 200, await listTickets.execute());
      return;
    }

    if (request.method === "POST" && url.pathname === "/tickets") {
      const body = await readBody(request);
      sendJson(response, 201, await createTicket.execute(body));
      return;
    }

    const ticketMatch = url.pathname.match(/^\/tickets\/([^/]+)$/);
    if (request.method === "PATCH" && ticketMatch) {
      sendJson(response, 200, await updateTicket.execute(ticketMatch[1], await readBody(request)));
      return;
    }

    sendJson(response, 404, { message: "Route not found." });
  } catch (error) {
    sendJson(response, 400, { message: error.message });
  }
});

server.listen(port, () => {
  console.log(`orders service running on ${port} using ${supabaseClient.enabled ? "supabase" : "memory"}`);
});
