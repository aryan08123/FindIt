import api from "./api";

const adminService = {
  dashboard: () => api.get("/api/admin/dashboard").then((r) => r.data),
  users: () => api.get("/api/admin/users").then((r) => r.data),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`).then((r) => r.data),
  reports: () => api.get("/api/admin/reports").then((r) => r.data),
};

export default adminService;

