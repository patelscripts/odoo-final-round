import api from "./api";

export const getPayruns = () => api.get("/payruns");
export const getPayrun = (id) => api.get(`/payruns/${id}`);
export const createPayrun = (d) => api.post("/payruns", d);
export const computePayrun = (id) => api.put(`/payruns/${id}/compute`);
export const validatePayrun = (id) => api.put(`/payruns/${id}/validate`);
export const markPaid = (id) => api.put(`/payruns/${id}/mark-paid`);
export const getPayslips = (params) => api.get("/payslips", { params });
export const getPayslip = (id) => api.get(`/payslips/${id}`);
export const printPayslip = (id) => api.get(`/payslips/${id}/print`, { responseType: "blob" });
export const sendPayslips = (id) => api.post(`/payslips/payrun/${id}/send`);
export const getMyPayslips = () => api.get("/payslips/me/list");
