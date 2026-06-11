const api = {
  async get(path) {
    const response = await fetch(path);
    return parseResponse(response);
  },

  async post(path, body) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    return parseResponse(response);
  }
};

const state = {
  categories: [],
  tickets: [],
  notifications: []
};

const elements = {
  apiStatus: document.querySelector("#apiStatus"),
  categoryId: document.querySelector("#categoryId"),
  ticketForm: document.querySelector("#ticketForm"),
  formFeedback: document.querySelector("#formFeedback"),
  ticketList: document.querySelector("#ticketList"),
  notificationList: document.querySelector("#notificationList"),
  ticketCount: document.querySelector("#ticketCount"),
  criticalCount: document.querySelector("#criticalCount"),
  notificationCount: document.querySelector("#notificationCount"),
  refreshButton: document.querySelector("#refreshButton")
};

elements.ticketForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setFeedback("Salvando chamado...");

  const formData = new FormData(elements.ticketForm);

  try {
    await api.post("/tickets", {
      categoryId: formData.get("categoryId"),
      district: formData.get("district"),
      citizenEmail: formData.get("citizenEmail"),
      description: formData.get("description")
    });

    elements.ticketForm.reset();
    setFeedback("Chamado criado e notificacao registrada.");
    await loadDashboard();
  } catch (error) {
    setFeedback(error.message, true);
  }
});

elements.refreshButton.addEventListener("click", loadDashboard);

loadDashboard();

async function loadDashboard() {
  const results = await Promise.allSettled([
    api.get("/categories"),
    api.get("/tickets"),
    api.get("/notifications")
  ]);

  const [categoriesResult, ticketsResult, notificationsResult] = results;
  const errors = results
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason.message);

  state.categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  state.tickets = ticketsResult.status === "fulfilled" ? ticketsResult.value : [];
  state.notifications = notificationsResult.status === "fulfilled" ? notificationsResult.value : [];

  renderCategories();
  renderTickets();
  renderNotifications();
  renderMetrics();

  if (errors.length > 0) {
    elements.apiStatus.textContent = "API parcial";
    elements.apiStatus.className = "status error";
    setFeedback(`${errors[0]} Abra /diagnostics para detalhes.`, true);
    return;
  }

  elements.apiStatus.textContent = "API online";
  elements.apiStatus.className = "status ok";
  setFeedback("");
}

function renderCategories() {
  elements.categoryId.innerHTML = state.categories
    .map((category) => `<option value="${category.id}">${category.name}</option>`)
    .join("");
}

function renderTickets() {
  if (state.tickets.length === 0) {
    elements.ticketList.innerHTML = '<div class="empty">Nenhum chamado registrado ainda.</div>';
    return;
  }

  elements.ticketList.innerHTML = state.tickets.map((ticket) => {
    const category = state.categories.find((item) => item.id === ticket.categoryId);
    const priorityClass = ticket.priority >= 5 ? "high" : ticket.priority >= 3 ? "medium" : "";

    return `
      <article class="ticket">
        <div class="ticket-header">
          <div>
            <strong>${escapeHtml(category?.name ?? ticket.categoryId)}</strong>
            <p>${escapeHtml(ticket.description)}</p>
          </div>
          <span class="chip ${priorityClass}">Prioridade ${ticket.priority}</span>
        </div>
        <div class="meta">
          <span class="chip">${escapeHtml(ticket.district)}</span>
          <span class="chip">${escapeHtml(ticket.status)}</span>
          <span class="chip">${formatDate(ticket.createdAt)}</span>
        </div>
      </article>
    `;
  }).join("");
}

function renderNotifications() {
  if (state.notifications.length === 0) {
    elements.notificationList.innerHTML = '<div class="empty">Nenhuma notificacao registrada.</div>';
    return;
  }

  elements.notificationList.innerHTML = state.notifications.map((notification) => `
    <article class="notification">
      <strong>${escapeHtml(notification.recipient)}</strong>
      <p>${escapeHtml(notification.message)}</p>
      <div class="meta">
        <span class="chip">${escapeHtml(notification.type)}</span>
        <span class="chip">${formatDate(notification.createdAt)}</span>
      </div>
    </article>
  `).join("");
}

function renderMetrics() {
  elements.ticketCount.textContent = state.tickets.length;
  elements.criticalCount.textContent = state.tickets.filter((ticket) => ticket.priority >= 5).length;
  elements.notificationCount.textContent = state.notifications.length;
}

function setFeedback(message, isError = false) {
  elements.formFeedback.textContent = message;
  elements.formFeedback.className = isError ? "feedback error" : "feedback";
}

async function parseResponse(response) {
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.message ?? "Erro ao consultar API.");
  }

  return body;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
