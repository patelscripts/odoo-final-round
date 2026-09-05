import { useState, useEffect } from "react";
import { Check, X, Clock } from "lucide-react";
import {
  getPendingUsers,
  getUnlinkedEmployees,
  approveUser,
  rejectUser,
} from "../services/authService";

const ROLES = [
  { value: "employee", label: "Employee" },
  { value: "hr_manager", label: "HR Manager" },
  { value: "hr_payroll_user", label: "HR Payroll User" },
  { value: "hr_payroll_manager", label: "HR Payroll Manager" },
];

export default function PendingApprovals() {
  const [users, setUsers] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [selectedEmployees, setSelectedEmployees] = useState({});
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const [{ data }, { data: unlinkedEmployees }] = await Promise.all([
        getPendingUsers(),
        getUnlinkedEmployees(),
      ]);
      setUsers(data);
      setEmployees(unlinkedEmployees);
      const roleMap = {};
      data.forEach((u) => (roleMap[u._id] = "employee"));
      setSelectedRoles(roleMap);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load pending users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await approveUser(id, selectedRoles[id], selectedEmployees[id] || undefined);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve user");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    setActionId(id);
    try {
      await rejectUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject user");
    } finally {
      setActionId(null);
    }
  };

  if (loading) return <div className="p-8 text-ink-muted">Loading pending approvals...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl mb-2">Pending approvals</h2>
      <p className="text-sm mb-8">
        New signups wait here until you assign a role and approve them.
      </p>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-md bg-warning/10 border border-warning/30 text-sm text-warning">
          {error}
        </div>
      )}

      {users.length === 0 ? (
        <div className="card text-center py-12">
          <Clock className="mx-auto mb-3 text-ink-muted" size={28} />
          <p className="text-sm">No pending signups right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user._id} className="card flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-base mb-0.5">{user.name}</h3>
                <p className="text-sm">{user.email}</p>
                <p className="text-xs text-ink-muted mt-1">
                  Signed up {new Date(user.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-sm">
                  <span className="sr-only">Role</span>
                  <select
                    value={selectedRoles[user._id]}
                    onChange={(e) =>
                      setSelectedRoles({ ...selectedRoles, [user._id]: e.target.value })
                    }
                    className="input-field text-sm py-2"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm">
                  <span className="sr-only">Link to employee (optional)</span>
                  <select
                    value={selectedEmployees[user._id] || ""}
                    onChange={(e) =>
                      setSelectedEmployees({ ...selectedEmployees, [user._id]: e.target.value })
                    }
                    className="input-field text-sm py-2"
                  >
                    <option value="">Link to employee (optional)</option>
                    {employees.map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  onClick={() => handleApprove(user._id)}
                  disabled={actionId === user._id}
                  className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-60"
                >
                  <Check size={15} /> Approve
                </button>

                <button
                  onClick={() => handleReject(user._id)}
                  disabled={actionId === user._id}
                  className="btn-secondary text-sm flex items-center gap-1.5 disabled:opacity-60"
                >
                  <X size={15} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}