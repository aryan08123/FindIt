import api from "./api";

const authService = {
  register: (data) => api.post("/api/auth/register", data).then((r) => r.data),
  login: (email, password) => api.post("/api/auth/login", { email, password }).then((r) => r.data),
  me: () => api.get("/api/auth/me").then((r) => r.data),
};

export default authService;

