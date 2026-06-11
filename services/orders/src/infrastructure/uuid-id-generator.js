import crypto from "node:crypto";

export class UuidIdGenerator {
  nextId() {
    return crypto.randomUUID();
  }
}
