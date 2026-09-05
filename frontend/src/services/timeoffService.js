import api from "./api";

const crud = (p) => ({
  list: () => api.get(p),
  create: (d) => api.post(p, d),
  update: (id, d) => api.put(`${p}/${id}`, d),
  remove: (id) => api.delete(`${p}/${id}`),
});

const types = crud("/timeoff/types");
const allocations = crud("/timeoff/allocations");
const requests = crud("/timeoff/requests");

export const getTypes = types.list;
export const createType = types.create;
export const updateType = types.update;
export const deleteType = types.remove;

export const getAllocations = allocations.list;
export const createAllocation = allocations.create;
export const updateAllocation = allocations.update;

export const getRequests = requests.list;
export const createRequest = requests.create;
export const decideRequest = (id, data) => api.put(`/timeoff/requests/${id}/decide`, data);
