import { Category } from "../domain/category.js";

export class SupabaseCategoryRepository {
  constructor(supabaseClient) {
    this.supabaseClient = supabaseClient;
  }

  async findAll() {
    const rows = await this.supabaseClient.findAll("categories", "id.asc");
    return rows.map(toCategory);
  }

  async findById(categoryId) {
    const row = await this.supabaseClient.findById("categories", categoryId);
    return row ? toCategory(row) : null;
  }
}

function toCategory(row) {
  return new Category({
    id: row.id,
    name: row.name,
    baseSeverity: row.base_severity
  });
}
