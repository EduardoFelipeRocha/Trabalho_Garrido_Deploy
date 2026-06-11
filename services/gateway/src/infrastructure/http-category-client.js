export class HttpCategoryClient {
  constructor(baseUrl) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
  }

  async findAll() {
    const response = await fetch(`${this.baseUrl}/categories`);
    return parseResponse(response);
  }

  async getById(categoryId) {
    const response = await fetch(`${this.baseUrl}/categories/${categoryId}`);
    return parseResponse(response);
  }
}

function normalizeBaseUrl(baseUrl) {
  return baseUrl.startsWith("http") ? baseUrl : `http://${baseUrl}`;
}

async function parseResponse(response) {
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.message ?? "Catalog service error.");
  }

  return body;
}
