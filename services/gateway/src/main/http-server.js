import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { GatewayFacade } from "../application/gateway-facade.js";
import { HttpCategoryClient } from "../infrastructure/http-category-client.js";
import { HttpNotificationClient } from "../infrastructure/http-notification-client.js";
import { HttpTicketClient } from "../infrastructure/http-ticket-client.js";

const facade = new GatewayFacade({
  categoryClient: new HttpCategoryClient(process.env.CATALOG_URL ?? "http://localhost:3001"),
  ticketClient: new HttpTicketClient(process.env.ORDERS_URL ?? "http://localhost:3002"),
  notificationClient: new HttpNotificationClient(process.env.NOTIFICATIONS_URL ?? "http://localhost:3003")
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
