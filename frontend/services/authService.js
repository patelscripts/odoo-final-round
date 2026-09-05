import api from "./api";

export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const getMe = () => api.get("/auth/me");

export const getPendingUsers = () => api.get("/auth/pending-users");
export const approveUser = (id, role) => api.put(`/auth/approve/${id}`, { role });
export const rejectUser = (id) => api.delete(`/auth/reject/${id}`);