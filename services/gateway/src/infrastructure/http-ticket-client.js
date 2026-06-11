export class HttpTicketClient {
  constructor(baseUrl) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
  }

  async findAll() {
    const response = await fetch(`${this.baseUrl}/tickets`);
    return parseResponse(response);
  }

  async create(input) {
    const response = await fetch(`${this.baseUrl}/tickets`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input)
    });
    return parseResponse(response);
  }

  async update(ticketId, input) {
    const response = await fetch(`${this.baseUrl}/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input)
    });
    return parseResponse(response);
  }
}

function normalizeBaseUrl(baseUrl) {
  return baseUrl.startsWith("http") ? baseUrl : `http://${baseUrl}`;
}

async function parseResponse(response) {
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.message ?? "Orders service error.");
  }

  return body;
}
