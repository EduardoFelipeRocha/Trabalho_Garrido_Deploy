export class HttpNotificationClient {
  constructor(baseUrl) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
  }

  async findAll() {
    const response = await fetch(`${this.baseUrl}/notifications`);
    return parseResponse(response);
  }
}

function normalizeBaseUrl(baseUrl) {
  return baseUrl.startsWith("http") ? baseUrl : `http://${baseUrl}`;
}

async function parseResponse(response) {
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.message ?? "Notifications service error.");
  }

  return body;
}
