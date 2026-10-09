// Add these functions to frontend/src/services/api.js

export function getProfile() {
  return request("/auth/me");
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
