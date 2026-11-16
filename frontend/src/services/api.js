import axios from "axios";
import { API_BASE } from "../utils/helpers";
import { tokenStore } from "../utils/storage";

const api = axios.create({ baseURL: API_BASE, timeout: 20000 });

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// An expired or invalid token on a protected call sends the user back to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    if (
      status === 401 &&
      !url.includes("/api/auth/login") &&
      tokenStore.get()
    ) {
      tokenStore.clear();
      window.location.assign("/login?expired=1");
    }
    return Promise.reject(error);
  },
);

export default api;

