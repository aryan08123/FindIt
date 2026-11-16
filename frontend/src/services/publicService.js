import api from "./api";

const publicService = {
  stats: () => api.get("/api/public/stats").then((r) => r.data),
  recentItems: () => api.get("/api/public/recent-items").then((r) => r.data),
  categories: () => api.get("/api/public/categories").then((r) => r.data),
};

export default publicService;

