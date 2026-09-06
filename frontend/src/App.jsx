import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import Home from "./pages/Home";
import Layout from "./components/common/Layout";
import { useAuth } from "./hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import EmployeeList from "./pages/Employees/EmployeeList";
import EmployeeForm from "./pages/Employees/EmployeeForm";
import EmployeeDetail from "./pages/EmployeeDetail";
import ContractList from "./pages/Contracts/ContractList";
import ContractForm from "./pages/Contracts/ContractForm";
import Schedules from "./pages/Schedules";
import Attendance from "./pages/Attendance";
import TimeOffTypes from "./pages/TimeOffTypes";
import Allocations from "./pages/Allocations";
import Requests from "./pages/Requests";
import SalaryRules from "./pages/SalaryRules";
import SalaryStructures from "./pages/SalaryStructures";
import Payruns from "./pages/Payruns";
import PayrunDetail from "./pages/PayrunDetail";
import Payslips from "./pages/Payslips";
import PendingApprovals from "./pages/PendingApprovals";
import EmployeeSelfService from "./pages/EmployeeSelfService";

function GuestOnly({ children }) {
  const { token, user } = useAuth();
  if (token) return <Navigate to={user?.role === "employee" ? "/my/dashboard" : "/dashboard"} replace />;
  return children;
}

function ProtectedRoute() {
  const { token, user } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role === "employee" && !location.pathname.startsWith("/my/")) {
    return <Navigate to="/my/dashboard" replace />;
  }
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={
          <GuestOnly>
            <Login />
          </GuestOnly>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestOnly>
            <Signup />
          </GuestOnly>
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/employees/new" element={<EmployeeForm />} />
        <Route path="/employees/:id/edit" element={<EmployeeForm />} />
        <Route path="/employees/:id" element={<EmployeeDetail />} />
        <Route path="/contracts" element={<ContractList />} />
        <Route path="/contracts/new" element={<ContractForm />} />
        <Route path="/contracts/:id/edit" element={<ContractForm />} />
        <Route path="/schedules" element={<Schedules />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/timeoff/types" element={<TimeOffTypes />} />
        <Route path="/timeoff/allocations" element={<Allocations />} />
        <Route path="/timeoff/requests" element={<Requests />} />
        <Route path="/payroll/salary-rules" element={<SalaryRules />} />
        <Route path="/payroll/salary-structures" element={<SalaryStructures />} />
        <Route path="/payroll/payruns" element={<Payruns />} />
        <Route path="/payroll/payruns/:id" element={<PayrunDetail />} />
        <Route path="/payroll/payslips" element={<Payslips />} />
        <Route path="/admin/pending-approvals" element={<PendingApprovals />} />
        <Route path="/my/dashboard" element={<EmployeeSelfService section="dashboard" />} />
        <Route path="/my/profile" element={<EmployeeSelfService section="profile" />} />
        <Route path="/my/attendance" element={<EmployeeSelfService section="attendance" />} />
        <Route path="/my/timeoff" element={<EmployeeSelfService section="timeoff" />} />
        <Route path="/my/payslips" element={<EmployeeSelfService section="payslips" />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;