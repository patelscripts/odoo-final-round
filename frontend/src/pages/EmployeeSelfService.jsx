import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getEmployee, getEmployeeAttendance, getEmployeeTimeOff } from "../services/employeeService";
import { getPayslips } from "../services/payrollService";
import { createRequest, getTypes } from "../services/timeoffService";
import { formatDate } from "../utils/dateHelpers";
import formatCurrency from "../utils/formatCurrency";
import PageHeader from "../components/common/PageHeader";
import { Briefcase, Clock, CalendarCheck, Wallet } from "lucide-react";

const sectionDetails = {
  dashboard: { title: "My Dashboard", description: "A quick overview of your work." },
  profile: { title: "My Profile", description: "View your employee information." },
  attendance: { title: "My Attendance", description: "Review your attendance records." },
  timeoff: { title: "My Time Off", description: "Review your leave requests." },
  payslips: { title: "My Payslips", description: "View your salary slips." },
};

export default function EmployeeSelfService({ section }) {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [items, setItems] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [timeOff, setTimeOff] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [error, setError] = useState("");
  const [types, setTypes] = useState([]);
  const [formData, setFormData] = useState({ timeOffType: "", startDate: "", endDate: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const details = sectionDetails[section];

  const loadTimeOff = () => getEmployeeTimeOff(user.employee).then((response) => setItems(response.data || []));

  useEffect(() => {
    if (!user?.employee) {
      setError("Your account is not linked to an employee profile yet.");
      return;
    }

    if (section === "dashboard") {
      Promise.all([
        getEmployee(user.employee),
        getEmployeeAttendance(user.employee),
        getEmployeeTimeOff(user.employee),
        getPayslips({ employee: user.employee }),
      ])
        .then(([empRes, attRes, toRes, paySlipRes]) => {
          setEmployee(empRes.data);
          setAttendance(attRes.data || []);
          setTimeOff(toRes.data || []);
          setPayslips(paySlipRes.data || []);
        })
        .catch((err) => setError(err.response?.data?.message || "Could not load your dashboard."));
      return;
    }

    const load = section === "profile"
      ? getEmployee(user.employee).then((response) => setEmployee(response.data))
      : section === "attendance"
        ? getEmployeeAttendance(user.employee).then((response) => setItems(response.data || []))
        : section === "timeoff"
          ? loadTimeOff()
          : getPayslips({ employee: user.employee }).then((response) => setItems(response.data || []));

    load.catch((requestError) => {
      setError(requestError.response?.data?.message || "Could not load your information.");
    });

    if (section === "timeoff") {
      getTypes().then((res) => setTypes(res.data || [])).catch(() => {});
    }
  }, [section, user?.employee]);

  const calcDuration = (start, end) => {
    if (!start || !end) return 0;
    const diff = new Date(end) - new Date(start);
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      const duration = calcDuration(formData.startDate, formData.endDate);
      await createRequest({
        employee: user.employee,
        timeOffType: formData.timeOffType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        duration,
        reason: formData.reason,
      });
      setFormData({ timeOffType: "", startDate: "", endDate: "", reason: "" });
      loadTimeOff();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const presentDays = attendance.filter((a) => a.status === "present").length;
  const pendingRequests = timeOff.filter((t) => t.status === "pending").length;
  const approvedRequests = timeOff.filter((t) => t.status === "approved").length;
  const latestPayslip = payslips[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader title={details.title} description={details.description} />
      {error && <div className="card text-warning text-sm">{error}</div>}

      {!error && section === "dashboard" && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard icon={Briefcase} label="Department" value={employee?.department || "-"} />
            <StatCard icon={Clock} label="Days present" value={presentDays} />
            <StatCard
              icon={CalendarCheck}
              label="Approved leaves"
              value={approvedRequests}
              sub={pendingRequests ? `${pendingRequests} pending` : null}
            />
            <StatCard
              icon={Wallet}
              label="Latest net salary"
              value={latestPayslip ? formatCurrency(latestPayslip.netSalary) : "-"}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-base mb-4">Recent attendance</h3>
              {attendance.length === 0 ? (
                <p className="text-sm text-ink-muted">No attendance records yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {attendance.slice(0, 5).map((a) => (
                    <div key={a._id} className="py-2.5 flex justify-between text-sm">
                      <span className="text-ink-muted">{formatDate(a.date)}</span>
                      <span className="capitalize">{a.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="text-base mb-4">Recent time-off requests</h3>
              {timeOff.length === 0 ? (
                <p className="text-sm text-ink-muted">No requests yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {timeOff.slice(0, 5).map((t) => (
                    <div key={t._id} className="py-2.5 flex justify-between text-sm">
                      <span className="text-ink-muted">
                        {formatDate(t.startDate)} – {formatDate(t.endDate)}
                      </span>
                      <span className="capitalize">{t.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!error && section === "profile" && employee && (
        <div className="card space-y-3 max-w-2xl">
          <Info label="Name" value={employee.name} />
          <Info label="Email" value={employee.email} />
          <Info label="Department" value={employee.department} />
          <Info label="Job position" value={employee.jobPosition} />
          <Info label="Status" value={employee.status} />
        </div>
      )}

      {!error && section === "attendance" && (
        <RecordList items={items} empty="No attendance records found." render={(item) => `${formatDate(item.date)} · ${item.status} · ${item.workedHours || 0} hours`} />
      )}

      {!error && section === "timeoff" && (
        <div className="space-y-6 max-w-2xl">
          <div className="card">
            <h3 className="text-base mb-4">Request time off</h3>
            {formError && (
              <div className="mb-4 px-4 py-3 rounded-md bg-warning/10 border border-warning/30 text-sm text-warning">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Leave type</label>
                <select
                  required
                  value={formData.timeOffType}
                  onChange={(e) => setFormData({ ...formData, timeOffType: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select type</option>
                  {types.map((t) => (
                    <option key={t._id} value={t._id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Start date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">End date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Reason (optional)</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="input-field"
                  placeholder="Brief reason"
                />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary text-sm disabled:opacity-60">
                {submitting ? "Submitting..." : "Submit request"}
              </button>
            </form>
          </div>

          <RecordList items={items} empty="No time-off requests found." render={(item) => `${formatDate(item.startDate)} to ${formatDate(item.endDate)} · ${item.status}`} />
        </div>
      )}

      {!error && section === "payslips" && (
        <RecordList items={items} empty="No payslips found." render={(item) => `${formatDate(item.periodStart)} · ${formatCurrency(item.netSalary)}`} />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="card">
      <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center mb-4">
        <Icon className="text-primary" size={18} />
      </div>
      <p className="text-sm text-ink-muted mb-1">{label}</p>
      <p className="text-xl font-heading font-medium text-ink">{value}</p>
      {sub && <p className="text-xs text-warning mt-1">{sub}</p>}
    </div>
  );
}

function Info({ label, value }) {
  return <div className="flex flex-wrap justify-between gap-2 border-b border-border pb-2 text-sm"><span className="text-ink-muted">{label}</span><span>{value || "-"}</span></div>;
}

function RecordList({ items, empty, render }) {
  return <div className="card divide-y divide-border max-w-3xl">{items.length ? items.map((item) => <div className="py-3 text-sm" key={item._id}>{render(item)}</div>) : <p className="text-sm text-ink-muted">{empty}</p>}</div>;
}