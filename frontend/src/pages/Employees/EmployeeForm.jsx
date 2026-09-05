import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import { AsyncState } from "../../components/common/AsyncState";
import {
  createEmployee,
  getEmployee,
  getEmployees,
  updateEmployee,
} from "../../services/employeeService";
import { getSchedules } from "../../services/scheduleService";

const empty = {
  name: "",
  email: "",
  phone: "",
  department: "",
  jobPosition: "",
  manager: "",
  workingSchedule: "",
  dateOfJoining: "",
  status: "active",
  accountNumber: "",
  ifsc: "",
  bankName: "",
};

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [people, setPeople] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    getEmployees().then((r) => setPeople(r.data || [])).catch(() => setPeople([]));
    getSchedules().then((r) => setSchedules(r.data || [])).catch(() => setSchedules([]));
    if (!id) return;
    getEmployee(id)
      .then((r) => {
        const e = r.data;
        setForm({
          name: e.name || "",
          email: e.email || "",
          phone: e.phone || "",
          department: e.department || "",
          jobPosition: e.jobPosition || "",
          manager: e.manager?._id || e.manager || "",
          workingSchedule: e.workingSchedule?._id || e.workingSchedule || "",
          dateOfJoining: e.dateOfJoining ? String(e.dateOfJoining).slice(0, 10) : "",
          status: e.status || "active",
          accountNumber: e.bankDetails?.accountNumber || "",
          ifsc: e.bankDetails?.ifsc || "",
          bankName: e.bankDetails?.bankName || "",
        });
      })
      .catch((e) => setError(e.response?.data?.message || "Could not load employee."))
      .finally(() => setLoading(false));
  }, [id]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      department: form.department,
      jobPosition: form.jobPosition,
      manager: form.manager || undefined,
      workingSchedule: form.workingSchedule || undefined,
      dateOfJoining: form.dateOfJoining,
      status: form.status,
      bankDetails: {
        accountNumber: form.accountNumber,
        ifsc: form.ifsc,
        bankName: form.bankName,
      },
    };
    try {
      if (id) await updateEmployee(id, payload);
      else await createEmployee(payload);
      navigate("/employees");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save employee.");
    }
  };

  return (
    <>
      <PageHeader
        title={id ? "Edit employee" : "Add employee"}
        description="Keep one complete record for each person."
        action={
          <Link to="/employees" className="btn-secondary">
            Back to list
          </Link>
        }
      />
      <AsyncState loading={loading} error={error} />
      {!loading && (
        <form className="card grid gap-4 sm:grid-cols-2" onSubmit={submit}>
          <Field label="Name" name="name" value={form.name} onChange={change} required />
          <Field label="Email" name="email" type="email" value={form.email} onChange={change} required />
          <Field label="Phone" name="phone" value={form.phone} onChange={change} />
          <Field label="Department" name="department" value={form.department} onChange={change} required />
          <Field label="Job position" name="jobPosition" value={form.jobPosition} onChange={change} required />
          <label>
            <span className="block text-sm font-medium mb-1.5">Manager</span>
            <select className="input-field" name="manager" value={form.manager} onChange={change}>
              <option value="">None</option>
              {people.filter((p) => p._id !== id).map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="block text-sm font-medium mb-1.5">Working schedule</span>
            <select className="input-field" name="workingSchedule" value={form.workingSchedule} onChange={change}>
              <option value="">Select…</option>
              {schedules.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </label>
          <Field label="Date of joining" name="dateOfJoining" type="date" value={form.dateOfJoining} onChange={change} required />
          <label>
            <span className="block text-sm font-medium mb-1.5">Status</span>
            <select className="input-field" name="status" value={form.status} onChange={change}>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </label>
          <Field label="Bank name" name="bankName" value={form.bankName} onChange={change} />
          <Field label="Account number" name="accountNumber" value={form.accountNumber} onChange={change} />
          <Field label="IFSC" name="ifsc" value={form.ifsc} onChange={change} />
          <div className="sm:col-span-2 flex justify-end gap-3">
            <Link to="/employees" className="btn-secondary">Cancel</Link>
            <button className="btn-primary">Save employee</button>
          </div>
        </form>
      )}
    </>
  );
}

function Field({ label, ...props }) {
  return (
    <label>
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      <input className="input-field" {...props} />
    </label>
  );
}
