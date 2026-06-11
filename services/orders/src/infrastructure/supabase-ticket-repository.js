import { Ticket } from "../domain/ticket.js";

export class SupabaseTicketRepository {
  constructor(supabaseClient) {
    this.supabaseClient = supabaseClient;
  }

  async save(ticket) {
    await this.supabaseClient.insert("tickets", {
      id: ticket.id,
      category_id: ticket.categoryId,
      description: ticket.description,
      citizen_email: ticket.citizenEmail,
      district: ticket.district,
      priority: ticket.priority,
      status: ticket.status,
      created_at: ticket.createdAt
    });
  }

  async findAll() {
    const rows = await this.supabaseClient.findAll("tickets");
    return rows.map(toTicket);
  }
}

function toTicket(row) {
  return new Ticket({
    id: row.id,
    categoryId: row.category_id,
    description: row.description,
    citizenEmail: row.citizen_email,
    district: row.district,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at
  });
}
