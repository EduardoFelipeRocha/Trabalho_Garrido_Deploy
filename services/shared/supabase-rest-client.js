export class SupabaseRestClient {
  constructor({ url, serviceRoleKey }) {
    this.url = normalizeSupabaseUrl(url);
    this.serviceRoleKey = serviceRoleKey;
  }

  get enabled() {
    return Boolean(this.url && this.serviceRoleKey);
  }

  async findAll(table, orderBy = "created_at.desc") {
    const response = await this.request(`${table}?select=*&order=${orderBy}`);
    return response.json();
  }

  async findById(table, id) {
    const response = await this.request(`${table}?id=eq.${encodeURIComponent(id)}&select=*&limit=1`);
    const rows = await response.json();
    return rows[0] ?? null;
  }

  async insert(table, row) {
    const response = await this.request(table, {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(row)
    });
    const rows = await response.json();
    return rows[0];
  }

  async updateById(table, id, patch) {
    const response = await this.request(`${table}?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(patch)
    });
    const rows = await response.json();
    return rows[0];
  }

  async request(path, options = {}) {
    const response = await fetch(`${this.url}/rest/v1/${path}`, {
      ...options,
      headers: {
        apikey: this.serviceRoleKey,
        authorization: `Bearer ${this.serviceRoleKey}`,
        "content-type": "application/json",
        ...options.headers
      }
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Supabase error: ${message}`);
    }

    return response;
  }
}

function normalizeSupabaseUrl(url) {
  if (!url) {
    return "";
  }

  const sanitizedUrl = url.replace(/^\/\//, "postgres://").replace(/\/$/, "");

  try {
    const parsedUrl = new URL(sanitizedUrl);
    const projectRefMatch = parsedUrl.hostname.match(/^db\.([^.]+)\.supabase\.co$/);

    if (projectRefMatch) {
      return `https://${projectRefMatch[1]}.supabase.co`;
    }

    return `${parsedUrl.protocol}//${parsedUrl.host}`;
  } catch {
    return sanitizedUrl;
  }
}
