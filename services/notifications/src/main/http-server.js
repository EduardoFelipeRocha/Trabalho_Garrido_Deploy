import http from "node:http";
import { ListNotificationsUseCase } from "../application/list-notifications-use-case.js";
import { RegisterTicketNotificationUseCase } from "../application/register-ticket-notification-use-case.js";
import { NotificationFactory } from "../domain/notification-factory.js";
import { InMemoryNotificationRepository } from "../infrastructure/in-memory-notification-repository.js";
import { SupabaseNotificationRepository } from "../infrastructure/supabase-notification-repository.js";
import { UuidIdGenerator } from "../infrastructure/uuid-id-generator.js";
import { SupabaseRestClient } from "../../../shared/supabase-rest-client.js";

const supabaseClient = new SupabaseRestClient({
  url: process.env.SUPABASE_URL,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
});
const repository = supabaseClient.enabled
  ? new SupabaseNotificationRepository(supabaseClient)
  : new InMemoryNotificationRepository();
const registerNotification = new RegisterTicketNotificationUseCase({
  notificationFactory: new NotificationFactory(new UuidIdGenerator()),
  notificationRepository: repository
});
const listNotifications = new ListNotificationsUseCase(repository);
const port = Number(process.env.PORT ?? 3003);

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
    if (request.method === "GET" && request.url === "/notifications") {
      sendJson(response, 200, await listNotifications.execute());
      return;
    }

    if (request.method === "POST" && request.url === "/events") {
      const notification = await registerNotification.execute(await readBody(request));
      sendJson(response, notification ? 201 : 202, notification ?? { message: "Event ignored." });
      return;
    }

    sendJson(response, 404, { message: "Route not found." });
  } catch (error) {
    sendJson(response, 400, { message: error.message });
  }
});

server.listen(port, () => {
  console.log(`notifications service running on ${port} using ${supabaseClient.enabled ? "supabase" : "memory"}`);
});
