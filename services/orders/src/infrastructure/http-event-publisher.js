export class HttpEventPublisher {
  constructor(baseUrl) {
    this.baseUrl = baseUrl ? normalizeBaseUrl(baseUrl) : "";
  }

  async publish(type, payload) {
    if (!this.baseUrl) {
      return;
    }

    try {
      await fetch(`${this.baseUrl}/events`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type, payload })
      });
    } catch {
      return;
    }
  }
}

function normalizeBaseUrl(baseUrl) {
  return baseUrl.startsWith("http") ? baseUrl : `http://${baseUrl}`;
}
