const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://flipkart-backend-k4x7.onrender.com";

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}
