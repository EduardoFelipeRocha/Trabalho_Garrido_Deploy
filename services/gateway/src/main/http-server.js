import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { CreateTicketUseCase } from "../../../orders/src/application/create-ticket-use-case.js";
import { ListTicketsUseCase } from "../../../orders/src/application/list-tickets-use-case.js";
import { SeverityPriorityStrategy } from "../../../orders/src/domain/severity-priority-strategy.js";
import { TicketFactory } from "../../../orders/src/domain/ticket-factory.js";
import { HttpEventPublisher } from "../../../orders/src/infrastructure/http-event-publisher.js";
import { InMemoryTicketRepository } from "../../../orders/src/infrastructure/in-memory-ticket-repository.js";
import { SupabaseTicketRepository } from "../../../orders/src/infrastructure/supabase-ticket-repository.js";
import { UuidIdGenerator } from "../../../orders/src/infrastructure/uuid-id-generator.js";
import { SupabaseRestClient } from "../../../shared/supabase-rest-client.js";
import { GatewayFacade } from "../application/gateway-facade.js";
import { HttpCategoryClient } from "../infrastructure/http-category-client.js";
import { HttpNotificationClient } from "../infrastructure/http-notification-client.js";
import { HttpTicketClient } from "../infrastructure/http-ticket-client.js";

const supabaseClient = new SupabaseRestClient({
  url: process.env.SUPABASE_URL,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
});
const fallbackTicketRepository = supabaseClient.enabled
  ? new SupabaseTicketRepository(supabaseClient)
  : new InMemoryTicketRepository();
const fallbackCreateTicket = new CreateTicketUseCase({
  ticketRepository: fallbackTicketRepository,
  ticketFactory: new TicketFactory(new UuidIdGenerator()),
  priorityStrategy: new SeverityPriorityStrategy(),
  eventPublisher: new HttpEventPublisher(process.env.NOTIFICATIONS_URL)
});
const fallbackListTickets = new ListTicketsUseCase(fallbackTicketRepository);
const fallbackListNotifications = {
  async execute() {
    return [];
  }
};
const facade = new GatewayFacade({
  categoryClient: new HttpCategoryClient(process.env.CATALOG_URL ?? "http://localhost:3001"),
  ticketClient: new HttpTicketClient(process.env.ORDERS_URL ?? "http://localhost:3002"),
  notificationClient: new HttpNotificationClient(process.env.NOTIFICATIONS_URL ?? "http://localhost:3003"),
  fallbackCreateTicket,
  fallbackListTickets,
  fallbackListNotifications
});
const port = Number(process.env.PORT ?? 3000);
const publicDir = join(process.cwd(), "services", "gateway", "public");

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

async function checkUpstream(name, url) {
  try {
    const response = await fetch(url);
    const body = await response.text();

    return {
      name,
      url,
      ok: response.ok,
      status: response.status,
      sample: body.slice(0, 180)
    };
  } catch (error) {
    return {
      name,
      url,
      ok: false,
      error: error.message
    };
  }
}

async function sendStatic(response, pathname) {
  const filePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const safePath = join(publicDir, filePath);
  const content = await readFile(safePath);
  const contentType = getContentType(extname(safePath));

  response.writeHead(200, { "content-type": contentType });
  response.end(content);
}

function getContentType(extension) {
  const contentTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".svg": "image/svg+xml"
  };

  return contentTypes[extension] ?? "application/octet-stream";
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "GET" && (url.pathname === "/" || url.pathname.startsWith("/assets/"))) {
      await sendStatic(response, url.pathname);
      return;
    }

    if (request.method === "GET" && request.url === "/health") {
      sendJson(response, 200, { status: "ok" });
      return;
    }

    if (request.method === "GET" && request.url === "/diagnostics") {
      const diagnostics = await Promise.all([
        checkUpstream("catalog", `${facade.categoryClient.baseUrl}/categories`),
        checkUpstream("orders", `${facade.ticketClient.baseUrl}/tickets`),
        checkUpstream("notifications", `${facade.notificationClient.baseUrl}/notifications`)
      ]);

      sendJson(response, 200, {
        status: diagnostics.every((item) => item.ok) ? "ok" : "degraded",
        services: diagnostics
      });
      return;
    }

    if (request.method === "GET" && request.url === "/categories") {
      sendJson(response, 200, await facade.listCategories());
      return;
    }

    if (request.method === "GET" && request.url === "/tickets") {
      sendJson(response, 200, await facade.listTickets());
      return;
    }

    if (request.method === "GET" && request.url === "/notifications") {
      sendJson(response, 200, await facade.listNotifications());
      return;
    }

    if (request.method === "POST" && request.url === "/tickets") {
      sendJson(response, 201, await facade.createTicket(await readBody(request)));
      return;
    }

    sendJson(response, 404, { message: "Route not found." });
  } catch (error) {
    sendJson(response, 400, { message: error.message });
  }
});

server.listen(port, () => {
  console.log(`gateway service running on ${port}`);
});
