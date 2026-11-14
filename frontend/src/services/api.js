const API_BASE = "http://localhost:8000/api/v1";

export async function fetchOverview() {
  const res = await fetch(`${API_BASE}/analytics/overview`);
  if (!res.ok) throw new Error("Failed to load overview data");
  return res.json();
}

export async function fetchCategoryBreakdown() {
  const res = await fetch(`${API_BASE}/analytics/categories`);
  if (!res.ok) throw new Error("Failed to load category breakdown");
  return res.json();
}

export async function fetchCashflowTrends() {
  const res = await fetch(`${API_BASE}/analytics/cashflow`);
  if (!res.ok) throw new Error("Failed to load cashflow trends");
  return res.json();
}

export async function fetchForecast() {
  const res = await fetch(`${API_BASE}/analytics/forecast`);
  if (!res.ok) throw new Error("Failed to load forecast");
  return res.json();
}

export async function fetchAnomalies() {
  const res = await fetch(`${API_BASE}/analytics/anomalies`);
  if (!res.ok) throw new Error("Failed to load anomalies");
  return res.json();
}

export async function fetchHealthScore() {
  const res = await fetch(`${API_BASE}/health-score`);
  if (!res.ok) throw new Error("Failed to load health score");
  return res.json();
}

export async function fetchBudgets() {
  const res = await fetch(`${API_BASE}/planning/budgets`);
  if (!res.ok) throw new Error("Failed to load budgets");
  return res.json();
}

export async function createOrUpdateBudget(categoryName, monthlyLimit) {
  const res = await fetch(`${API_BASE}/planning/budgets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category_name: categoryName, monthly_limit: monthlyLimit }),
  });
  if (!res.ok) throw new Error("Failed to update budget");
  return res.json();
}

export async function fetchGoals() {
  const res = await fetch(`${API_BASE}/planning/goals`);
  if (!res.ok) throw new Error("Failed to load goals");
  return res.json();
}

export async function createGoal(goalData) {
  const res = await fetch(`${API_BASE}/planning/goals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(goalData),
  });
  if (!res.ok) throw new Error("Failed to create goal");
  return res.json();
}

export async function updateGoalDeposit(goalId, newAmount) {
  const res = await fetch(`${API_BASE}/planning/goals/${goalId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ current_amount: newAmount }),
  });
  if (!res.ok) throw new Error("Failed to deposit to goal");
  return res.json();
}

export async function fetchTransactions(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/transactions?${query}`);
  if (!res.ok) throw new Error("Failed to load transactions");
  return res.json();
}

export async function uploadBankStatement(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/transactions/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Statement upload and parsing failed.");
  }
  return res.json();
}

export async function sendChatMessage(message, history = []) {
  const res = await fetch(`${API_BASE}/advisor/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) throw new Error("Failed to send chat message");
  return res.json();
}

export async function resetDemoData() {
  const res = await fetch(`${API_BASE}/reports/reset-demo`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to reset demo dataset");
  return res.json();
}

export async function fetchReportSummary() {
  const res = await fetch(`${API_BASE}/reports/summary`);
  if (!res.ok) throw new Error("Failed to load report summary");
  return res.json();
}
