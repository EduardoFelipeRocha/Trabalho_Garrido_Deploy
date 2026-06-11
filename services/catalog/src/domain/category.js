export class Category {
  constructor({ id, name, baseSeverity }) {
    if (!id || !name) {
      throw new Error("Category requires id and name.");
    }

    if (!Number.isInteger(baseSeverity) || baseSeverity < 1 || baseSeverity > 5) {
      throw new Error("Category severity must be an integer from 1 to 5.");
    }

    this.id = id;
    this.name = name;
    this.baseSeverity = baseSeverity;
  }
}
