import api from "./api";

/** Removes empty filter values so they are not sent as ?keyword= */
const clean = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v != null),
  );

/** Items are sent as multipart/form-data because they may carry an image file. */
const toFormData = (values, imageFile, removeImage = false) => {
  const fd = new FormData();
  Object.entries(values).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") fd.append(k, v);
  });
  if (imageFile) fd.append("image", imageFile);
  if (removeImage) fd.append("removeImage", "true");
  return fd;
};

const itemService = {
  // params: { type, status, category, keyword, location }
  list: (params) =>
    api.get("/api/items", { params: clean(params) }).then((r) => r.data),
  get: (id) => api.get(`/api/items/${id}`).then((r) => r.data),
  myReports: () => api.get("/api/items/my-reports").then((r) => r.data),
  reportLost: (values, image) =>
    api.post("/api/items/lost", toFormData(values, image)).then((r) => r.data),
  reportFound: (values, image) =>
    api.post("/api/items/found", toFormData(values, image)).then((r) => r.data),
  update: (id, values, image, removeImage) =>
    api
      .put(`/api/items/${id}`, toFormData(values, image, removeImage))
      .then((r) => r.data),
  updateStatus: (id, status) =>
    api.patch(`/api/items/${id}/status`, { status }).then((r) => r.data),
  remove: (id) => api.delete(`/api/items/${id}`).then((r) => r.data),
};

export default itemService;


