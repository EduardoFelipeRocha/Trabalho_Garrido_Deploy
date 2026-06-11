import http from "node:http";
import { GetCategoryUseCase } from "../application/get-category-use-case.js";
import { ListCategoriesUseCase } from "../application/list-categories-use-case.js";
import { InMemoryCategoryRepository } from "../infrastructure/in-memory-category-repository.js";
import { SupabaseCategoryRepository } from "../infrastructure/supabase-category-repository.js";
import { SupabaseRestClient } from "../../../shared/supabase-rest-client.js";

const supabaseClient = new SupabaseRestClient({
  url: process.env.SUPABASE_URL,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
});
const repository = supabaseClient.enabled
  ? new SupabaseCategoryRepository(supabaseClient)
  : new InMemoryCategoryRepository();
const listCategories = new ListCategoriesUseCase(repository);
const getCategory = new GetCategoryUseCase(repository);
const port = Number(process.env.PORT ?? 3001);

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { "content-type": "application/json" });
  response.end(JSON.stringify(body));
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "GET" && request.url === "/categories") {
      sendJson(response, 200, await listCategories.execute());
      return;
    }

    const match = request.url.match(/^\/categories\/([^/]+)$/);
    if (request.method === "GET" && match) {
      sendJson(response, 200, await getCategory.execute(match[1]));
      return;
    }

    sendJson(response, 404, { message: "Route not found." });
  } catch (error) {
    sendJson(response, error.message === "Category not found." ? 404 : 500, { message: error.message });
  }
});

server.listen(port, () => {
  console.log(`catalog service running on ${port} using ${supabaseClient.enabled ? "supabase" : "memory"}`);
});
