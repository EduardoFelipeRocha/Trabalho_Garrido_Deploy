import http from "node:http";
import { GatewayFacade } from "../application/gateway-facade.js";
import { HttpCategoryClient } from "../infrastructure/http-category-client.js";
import { HttpTicketClient } from "../infrastructure/http-ticket-client.js";

const facade = new GatewayFacade({
  categoryClient: new HttpCategoryClient(process.env.CATALOG_URL ?? "http://localhost:3001"),
  ticketClient: new HttpTicketClient(process.env.ORDERS_URL ?? "http://localhost:3002")
});
const port = Number(process.env.PORT ?? 3000);

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
    if (request.method === "GET" && request.url === "/health") {
      sendJson(response, 200, { status: "ok" });
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
