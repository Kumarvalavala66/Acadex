const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("access_token");
}

async function request(endpoint, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = "Something went wrong.";

    try {
      const data = await response.json();

      if (Array.isArray(data.detail)) {
        message = data.detail
          .map((error) => `${error.loc?.join(".")}: ${error.msg}`)
          .join(", ");
      } else {
        message = data.detail || message;
      }
    } catch {}

    throw new Error(message);
  }

  return response.json();
}

// ==================== AUTH ====================

export function loginUser(credentials) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function registerUser(name, username, password, device = "Other") {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, username, password, device }),
  });
}

// ==================== TASKS ====================

export function getTasks() {
  return request("/tasks/");
}

export function createTask(task) {
  return request("/tasks/", {
    method: "POST",
    body: JSON.stringify(task),
  });
}

export function updateTask(taskId, task) {
  return request(`/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(task),
  });
}

export function updateTaskStatus(taskId, status) {
  return request(`/tasks/${taskId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteTask(taskId) {
  return request(`/tasks/${taskId}`, {
    method: "DELETE",
  });
}

// ==================== EXAMS ====================

export function getExamSchedule() {
  return request("/exams/schedule");
}

export function getExamResults() {
  return request("/exams/results");
}

export function createExamResult(result) {
  return request("/exams/results", {
    method: "POST",
    body: JSON.stringify(result),
  });
}

export function updateExamResult(resultId, result) {
  return request(`/exams/results/${resultId}`, {
    method: "PUT",
    body: JSON.stringify(result),
  });
}

export function deleteExamResult(resultId) {
  return request(`/exams/results/${resultId}`, {
    method: "DELETE",
  });
}
// ==================== HOLIDAYS ====================

export function getPublicHolidays() {
  return request("/holidays");
}
// ============================================================
// LEARNING
// ============================================================

export function getLearningTasks() {
  return request("/learning/tasks");
}

export function createLearningTask(task) {
  return request("/learning/tasks", {
    method: "POST",
    body: JSON.stringify(task),
  });
}

export function updateLearningTask(taskId, task) {
  return request(`/learning/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(task),
  });
}

export function deleteLearningTask(taskId) {
  return request(`/learning/tasks/${taskId}`, {
    method: "DELETE",
  });
}

export function getDiaryEntries() {
  return request("/learning/diary");
}

export function createDiaryEntry(entry) {
  return request("/learning/diary", {
    method: "POST",
    body: JSON.stringify(entry),
  });
}

export function updateDiaryEntry(entryId, entry) {
  return request(`/learning/diary/${entryId}`, {
    method: "PUT",
    body: JSON.stringify(entry),
  });
}

export function deleteDiaryEntry(entryId) {
  return request(`/learning/diary/${entryId}`, {
    method: "DELETE",
  });
}

export function getLearningProgress() {
  return request("/learning/progress");
}

export function getProfile() {
  return request("/auth/me");
}

export function getCurrentUser() {
  return getProfile();
}

export function updateProfile(profile) {
  return request("/auth/me", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

export function changePassword(passwordData) {
  return request("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(passwordData),
  });
}
