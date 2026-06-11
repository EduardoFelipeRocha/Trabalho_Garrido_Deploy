import { Notification } from "./notification.js";

export class NotificationFactory {
  constructor(idGenerator) {
    this.idGenerator = idGenerator;
  }

  fromTicketCreated(ticket) {
    return new Notification({
      id: this.idGenerator.nextId(),
      type: "EMAIL",
      recipient: ticket.citizenEmail,
      message: `Chamado ${ticket.id} recebido com prioridade ${ticket.priority}.`
    });
  }
}
