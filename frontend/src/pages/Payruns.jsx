import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import { AsyncState } from "../components/common/AsyncState";
import { getPayruns, createPayrun } from "../services/payrollService";
import { getEmployees } from "../services/employeeService";
import { getSalaryStructures } from "../services/salaryStructureService";
import { formatDate } from "../utils/dateHelpers";

export default function Payruns() {
  const [items, setItems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [structures, setStructures] = useState([]);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    salaryStructure: "",
    periodStart: "",
    periodEnd: "",
    employees: [],
  });

  const load = () =>
    getPayruns()
      .then((r) => setItems(r.data?.data || r.data || []))
      .catch((e) => setError(e.response?.data?.message || "Could not load payruns."));

  useEffect(() => {
    load();
    getEmployees().then((r) => setEmployees(r.data || [])).catch(() => setEmployees([]));
    getSalaryStructures().then((r) => setStructures(r.data || [])).catch(() => setStructures([]));
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleEmployee = (id) => {
    setForm((prev) => ({
      ...prev,
      employees: prev.employees.includes(id)
        ? prev.employees.filter((x) => x !== id)
        : [...prev.employees, id],
    }));
  };

  const submit = async () => {
    try {
      await createPayrun(form);
      setStep(0);
      setForm({ name: "", salaryStructure: "", periodStart: "", periodEnd: "", employees: [] });
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not create payrun.");
    }
  };

  return (
    <>
      <PageHeader
        title="Payruns"
        description="Create, compute, validate, and pay monthly payroll."
        action={<button className="btn-primary" onClick={() => setStep(1)}>Create payrun</button>}
      />
      <AsyncState error={error} />
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[560px]">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3">Name</th>
              <th className="pb-3">Period</th>
              <th className="pb-3">Status</th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr className="table-row" key={i._id}>
                <td className="py-3">{i.name}</td>
                <td className="py-3">{formatDate(i.periodStart)} to {formatDate(i.periodEnd)}</td>
                <td className="py-3 capitalize">{i.status}</td>
                <td className="py-3 text-right">
                  <Link className="text-primary" to={`/payroll/payruns/${i._id}`}>Open</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <p className="py-8 text-center text-sm text-ink-muted">No payruns found.</p>}
      </div>
      {step > 0 && (
        <div className="fixed inset-0 bg-ink/30 z-20 flex items-end sm:items-center justify-center p-0 sm:p-5">
          <div className="card w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <h2 className="text-2xl mb-5">Create payrun · Step {step} of 2</h2>
            {step === 1 ? (
              <div className="space-y-4">
                <Field name="name" label="Payrun name" value={form.name} onChange={change} />
                <label className="block">
                  <span className="block text-sm font-medium mb-1.5">Salary structure</span>
                  <select className="input-field" name="salaryStructure" value={form.salaryStructure} onChange={change} required>
                    <option value="">Select…</option>
                    {structures.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </label>
                <Field name="periodStart" label="Period start" type="date" value={form.periodStart} onChange={change} />
                <Field name="periodEnd" label="Period end" type="date" value={form.periodEnd} onChange={change} />
                <button className="btn-primary" onClick={() => setStep(2)}>Next: choose employees</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {employees.map((p) => (
                    <label key={p._id} className="flex gap-2 text-sm border border-border rounded-md px-3 py-2">
                      <input type="checkbox" checked={form.employees.includes(p._id)} onChange={() => toggleEmployee(p._id)} />
                      {p.name} · {p.department}
                    </label>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                  <button className="btn-primary" onClick={submit} disabled={!form.employees.length}>Create payrun</button>
                </div>
              </div>
            )}
            <button className="block mt-4 text-sm text-ink-muted" onClick={() => setStep(0)}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ name, label, type = "text", value, onChange }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      <input className="input-field" name={name} type={type} value={value} onChange={onChange} required />
    </label>
  );
}
