import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data)     => api.post("/auth/register", data),
  login:    (data)     => api.post("/auth/login", data),
  me:       ()         => api.get("/auth/me"),
  updateMe: (data)     => api.patch("/auth/me", data),
};

// ── Predictions ───────────────────────────────────────────────────────────────
export const predictAPI = {
  submit:  (data)      => api.post("/predict", data),
  history: (page = 1)  => api.get(`/predict/history?page=${page}&limit=10`),
  stats:   ()          => api.get("/predict/stats"),
  getOne:  (id)        => api.get(`/predict/${id}`),
  delete:  (id)        => api.delete(`/predict/${id}`),
};

export default api;
