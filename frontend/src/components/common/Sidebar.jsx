import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  CalendarDays,
  Clock3,
  Umbrella,
  WalletCards,
  ChevronDown,
} from "lucide-react";

const groups = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Employees", "/employees", Users],
  ["Contracts", "/contracts", FileText],
  ["Schedules", "/schedules", CalendarDays],
  ["Attendance", "/attendance", Clock3],
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm ${
    isActive
      ? "bg-primary-light text-primary font-medium"
      : "text-ink-muted hover:bg-primary-light hover:text-primary"
  }`;

export default function Sidebar({ open, onClose }) {
  return (
    <aside
      className={`w-64 shrink-0 border-r border-border bg-surface min-h-screen p-5 z-30
        fixed inset-y-0 left-0 transition-transform lg:static lg:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="px-3 pb-8">
        <span className="font-heading text-2xl font-semibold">
          PeoplePay<span className="text-primary">360</span>
        </span>
      </div>
      <nav className="space-y-1" onClick={onClose}>
        {groups.map(([label, to, Icon]) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
        <details open className="group pt-2">
          <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5 text-sm text-ink-muted">
            <Umbrella size={18} />
            Time Off
            <ChevronDown size={15} className="ml-auto" />
          </summary>
          <div className="ml-5 space-y-1 border-l border-border pl-3">
            <NavLink to="/timeoff/types" className={linkClass}>
              Leave Types
            </NavLink>
            <NavLink to="/timeoff/allocations" className={linkClass}>
              Allocations
            </NavLink>
            <NavLink to="/timeoff/requests" className={linkClass}>
              Requests
            </NavLink>
          </div>
        </details>
        <details open className="group">
          <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-2.5 text-sm text-ink-muted">
            <WalletCards size={18} />
            Payroll
            <ChevronDown size={15} className="ml-auto" />
          </summary>
          <div className="ml-5 space-y-1 border-l border-border pl-3">
            <NavLink to="/payroll/salary-rules" className={linkClass}>
              Salary Rules
            </NavLink>
            <NavLink to="/payroll/salary-structures" className={linkClass}>
              Salary Structures
            </NavLink>
            <NavLink to="/payroll/payruns" className={linkClass}>
              Payruns
            </NavLink>
            <NavLink to="/payroll/payslips" className={linkClass}>
              Payslips
            </NavLink>
          </div>
        </details>
      </nav>
    </aside>
  );
}
