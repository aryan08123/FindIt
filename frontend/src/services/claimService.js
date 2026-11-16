import api from "./api";

const claimService = {
  submit: (itemId, data) => api.post(`/api/claims/${itemId}`, data).then((r) => r.data),
  myClaims: () => api.get("/api/claims/my-claims").then((r) => r.data),
  // admin
  all: (status) =>
    api.get("/api/claims", { params: status ? { status } : {} }).then((r) => r.data),
  get: (id) => api.get(`/api/claims/${id}`).then((r) => r.data),
  approve: (id, remarks) => api.patch(`/api/claims/${id}/approve`, { remarks }).then((r) => r.data),
  reject: (id, remarks) => api.patch(`/api/claims/${id}/reject`, { remarks }).then((r) => r.data),
};

export default claimService;

