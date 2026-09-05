import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Clock,
  CalendarCheck,
  Wallet,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { canAccessPayroll, canManageHR, isAdmin, isEmployeeOnly } from "../../utils/roleAccess";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-colors ${
    isActive ? "bg-primary-light text-primary font-medium" : "text-ink-muted hover:bg-primary-light/60 hover:text-ink"
  }`;

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const role = user?.role;

  // Employee gets a completely different, minimal sidebar
  if (isEmployeeOnly(role)) {
    return (
      <aside
        className={`w-64 shrink-0 border-r border-border bg-surface p-4 flex flex-col gap-1
          fixed inset-x-auto top-16 bottom-0 left-0 z-30 overflow-y-auto transition-transform lg:static lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}`}
        onClick={onClose}
      >
        <NavLink to="/my/dashboard" className={linkClass}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to="/my/profile" className={linkClass}>
          <Users size={18} /> My Profile
        </NavLink>
        <NavLink to="/my/attendance" className={linkClass}>
          <Clock size={18} /> My Attendance
        </NavLink>
        <NavLink to="/my/timeoff" className={linkClass}>
          <CalendarCheck size={18} /> My Time Off
        </NavLink>
        <NavLink to="/my/payslips" className={linkClass}>
          <FileText size={18} /> My Payslips
        </NavLink>
      </aside>
    );
  }

  return (
    <aside
      className={`w-64 shrink-0 border-r border-border bg-surface p-4 flex flex-col gap-1
        fixed inset-x-auto top-16 bottom-0 left-0 z-30 overflow-y-auto transition-transform lg:static lg:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      onClick={onClose}
    >
      <NavLink to="/dashboard" className={linkClass}>
        <LayoutDashboard size={18} /> Dashboard
      </NavLink>

      {canManageHR(role) && (
        <>
          <NavLink to="/employees" className={linkClass}>
            <Users size={18} /> Employees
          </NavLink>
          <NavLink to="/contracts" className={linkClass}>
            <FileText size={18} /> Contracts
          </NavLink>
          <NavLink to="/schedules" className={linkClass}>
            <Clock size={18} /> Schedules
          </NavLink>
          <NavLink to="/attendance" className={linkClass}>
            <Clock size={18} /> Attendance
          </NavLink>
          <NavLink to="/timeoff/requests" className={linkClass}>
            <CalendarCheck size={18} /> Time Off
          </NavLink>
        </>
      )}

      {canAccessPayroll(role) && (
        <>
          <div className="mt-3 mb-1 px-4 text-xs text-ink-muted">Payroll</div>
          <NavLink to="/payroll/salary-structures" className={linkClass}>
            <Wallet size={18} /> Salary Structures
          </NavLink>
          <NavLink to="/payroll/payruns" className={linkClass}>
            <Wallet size={18} /> Payruns
          </NavLink>
          <NavLink to="/payroll/payslips" className={linkClass}>
            <FileText size={18} /> Payslips
          </NavLink>
        </>
      )}

      {isAdmin(role) && (
        <>
          <div className="mt-3 mb-1 px-4 text-xs text-ink-muted">Admin</div>
          <NavLink to="/admin/pending-approvals" className={linkClass}>
            <UserCheck size={18} /> Pending Approvals
          </NavLink>
        </>
      )}
    </aside>
  );
}