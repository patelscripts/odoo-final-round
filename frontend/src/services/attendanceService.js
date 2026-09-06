import api from "./api";
import resource from "./resourceService";

const x = resource("/attendance");
export const getAttendance = x.list;
export const createAttendance = x.create;
export const updateAttendance = x.update;
export const deleteAttendance = x.remove;
export const checkIn = () => api.post("/attendance/me/check-in");
export const checkOut = () => api.post("/attendance/me/check-out");
