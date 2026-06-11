import { Category } from "../domain/category.js";

export class InMemoryCategoryRepository {
  constructor() {
    this.categories = [
      new Category({ id: "pothole", name: "Buraco em via", baseSeverity: 4 }),
      new Category({ id: "lighting", name: "Iluminacao publica", baseSeverity: 3 }),
      new Category({ id: "waste", name: "Descarte irregular", baseSeverity: 2 }),
      new Category({ id: "flood", name: "Alagamento", baseSeverity: 5 }),
      new Category({ id: "other", name: "Outros / Avulso", baseSeverity: 2 })
    ];
  }

  async findAll() {
    return [...this.categories];
  }

  async findById(categoryId) {
    return this.categories.find((category) => category.id === categoryId) ?? null;
  }
}
