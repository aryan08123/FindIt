export const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

/** Turns a stored path like /uploads/abc.jpg into a full URL (or null when there is no image). */
export const imageSrc = (path) => (path ? `${API_BASE}${path}` : null);

/** Formats "2026-11-13" or "2026-11-13T10:20:30" as "13 Nov 2026". */
export const formatDate = (value) => {
  if (!value) return "—";
  const [y, m, d] = String(value).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/** Best human-readable message from a failed Axios call. */
export const errorMessage = (err, fallback = "Something went wrong. Please try again.") => {
  if (err?.request && !err?.response) {
    return "Cannot reach the server. Please check that the backend is running.";
  }
  const data = err?.response?.data;
  if (data?.fieldErrors) {
    const first = Object.values(data.fieldErrors)[0];
    if (first) return first;
  }
  return data?.message || fallback;
};

/** Field-level validation errors sent by the backend: { fieldName: "message" }. */
export const fieldErrorsOf = (err) => err?.response?.data?.fieldErrors || {};

export const todayISO = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

