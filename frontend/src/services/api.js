const API_BASE = "/api/v1";

// Auth Token Storage Helpers
export function getStoredToken() {
  return localStorage.getItem("finpilot_token");
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem("finpilot_token", token);
  } else {
    localStorage.removeItem("finpilot_token");
  }
}

export function getStoredUser() {
  const userStr = localStorage.getItem("finpilot_user");
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem("finpilot_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("finpilot_user");
  }
}

function getAuthHeaders(isJson = true) {
  const headers = {};
  if (isJson) {
    headers["Content-Type"] = "application/json";
  }
  const token = getStoredToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// Authentication API
export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid login credentials.");
  }
  const data = await res.json();
  setStoredToken(data.access_token);
  setStoredUser(data.user);
  return data;
}

export async function registerUser(userData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Registration failed.");
  }
  const data = await res.json();
  setStoredToken(data.access_token);
  setStoredUser(data.user);
  return data;
}

export async function demoLogin() {
  const res = await fetch(`${API_BASE}/auth/demo-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Demo login failed.");
  }
  const data = await res.json();
  setStoredToken(data.access_token);
  setStoredUser(data.user);
  return data;
}

export async function getCurrentUser() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Not authenticated");
  const user = await res.json();
  setStoredUser(user);
  return user;
}

export function logoutUser() {
  setStoredToken(null);
  setStoredUser(null);
}

// Financial Analytics & Transactions
export async function fetchOverview() {
  const res = await fetch(`${API_BASE}/analytics/overview`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load overview data");
  return res.json();
}

export async function fetchCategoryBreakdown() {
  const res = await fetch(`${API_BASE}/analytics/categories`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load category breakdown");
  return res.json();
}

export async function fetchCashflowTrends() {
  const res = await fetch(`${API_BASE}/analytics/cashflow`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load cashflow trends");
  return res.json();
}

export async function fetchForecast() {
  const res = await fetch(`${API_BASE}/analytics/forecast`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load forecast");
  return res.json();
}

export async function fetchAnomalies() {
  const res = await fetch(`${API_BASE}/analytics/anomalies`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load anomalies");
  return res.json();
}

export async function fetchHealthScore() {
  const res = await fetch(`${API_BASE}/health-score`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load health score");
  return res.json();
}

export async function fetchBudgets() {
  const res = await fetch(`${API_BASE}/planning/budgets`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load budgets");
  return res.json();
}

export async function createOrUpdateBudget(categoryName, monthlyLimit) {
  const res = await fetch(`${API_BASE}/planning/budgets`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ category_name: categoryName, monthly_limit: monthlyLimit }),
  });
  if (!res.ok) throw new Error("Failed to update budget");
  return res.json();
}

export async function fetchGoals() {
  const res = await fetch(`${API_BASE}/planning/goals`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load goals");
  return res.json();
}

export async function createGoal(goalData) {
  const res = await fetch(`${API_BASE}/planning/goals`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(goalData),
  });
  if (!res.ok) throw new Error("Failed to create goal");
  return res.json();
}

export async function updateGoalDeposit(goalId, newAmount) {
  const res = await fetch(`${API_BASE}/planning/goals/${goalId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ current_amount: newAmount }),
  });
  if (!res.ok) throw new Error("Failed to deposit to goal");
  return res.json();
}

export async function fetchTransactions(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/transactions?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load transactions");
  return res.json();
}

export async function uploadBankStatement(file) {
  const formData = new FormData();
  formData.append("file", file);
  const headers = getAuthHeaders(false); // No Content-Type header so browser sets multipart boundary

  const res = await fetch(`${API_BASE}/transactions/upload`, {
    method: "POST",
    headers,
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
    headers: getAuthHeaders(),
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) throw new Error("Failed to send chat message");
  return res.json();
}

export async function resetDemoData() {
  const res = await fetch(`${API_BASE}/reports/reset-demo`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to reset demo dataset");
  return res.json();
}

export async function fetchReportSummary() {
  const res = await fetch(`${API_BASE}/reports/summary`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load report summary");
  return res.json();
}
