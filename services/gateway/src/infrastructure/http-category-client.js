export class HttpCategoryClient {
  constructor(baseUrl) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
  }

  async findAll() {
    try {
      const response = await fetch(`${this.baseUrl}/categories`);
      return parseResponse(response);
    } catch {
      return defaultCategories();
    }
  }

  async getById(categoryId) {
    try {
      const response = await fetch(`${this.baseUrl}/categories/${categoryId}`);
      return parseResponse(response);
    } catch {
      const category = defaultCategories().find((item) => item.id === categoryId);

      if (!category) {
        throw new Error("Category not found.");
      }

      return category;
    }
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

function defaultCategories() {
  return [
    { id: "pothole", name: "Buraco em via", baseSeverity: 4 },
    { id: "lighting", name: "Iluminacao publica", baseSeverity: 3 },
    { id: "waste", name: "Descarte irregular", baseSeverity: 2 },
    { id: "flood", name: "Alagamento", baseSeverity: 5 }
  ];
}
