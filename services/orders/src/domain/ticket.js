export class Ticket {
  constructor({ id, categoryId, description, citizenEmail, district, priority, status, createdAt }) {
    if (!id || !categoryId || !description || !citizenEmail || !district) {
      throw new Error("Ticket requires id, category, description, citizen email and district.");
    }

    if (!citizenEmail.includes("@")) {
      throw new Error("Citizen email is invalid.");
    }

    if (!Number.isInteger(priority) || priority < 1 || priority > 5) {
      throw new Error("Priority must be an integer from 1 to 5.");
    }

    this.id = id;
    this.categoryId = categoryId;
    this.description = description;
    this.citizenEmail = citizenEmail;
    this.district = district;
    this.priority = priority;
    this.status = status ?? "OPEN";
    this.createdAt = createdAt ?? new Date().toISOString();
  }
}
