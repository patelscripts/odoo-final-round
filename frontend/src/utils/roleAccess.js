export const canAccessPayroll = (role) =>
  ["admin", "hr_payroll_user", "hr_payroll_manager"].includes(role);

export const canManageSalaryConfig = (role) =>
  ["admin", "hr_payroll_manager"].includes(role);

export const canManageHR = (role) =>
  ["admin", "hr_manager", "hr_payroll_user", "hr_payroll_manager"].includes(role);

export const isAdmin = (role) => role === "admin";

export const isEmployeeOnly = (role) => role === "employee";