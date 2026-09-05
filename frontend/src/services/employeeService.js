import api from "./api";
import resource from "./resourceService";

const x = resource("/employees");
export const getEmployees = x.list;
export const getEmployee = x.get;
export const createEmployee = x.create;
export const updateEmployee = x.update;
export const deleteEmployee = x.remove;
export const getEmployeeContracts = (id) => api.get(`/employees/${id}/contracts`);
export const getEmployeeAttendance = (id) => api.get(`/employees/${id}/attendance`);
export const getEmployeeTimeOff = (id) => api.get(`/employees/${id}/timeoff`);
