import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import { AsyncState } from "../../components/common/AsyncState";
import { createContract, getContract, updateContract } from "../../services/contractService";
import { getEmployees } from "../../services/employeeService";
import { getSalaryStructures } from "../../services/salaryStructureService";

const empty = {
  employee: "",
  startDate: "",
  endDate: "",
  department: "",
  jobPosition: "",
  wage: "",
  salaryStructure: "",
  status: "draft",
};

export default function ContractForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [employees, setEmployees] = useState([]);
  const [structures, setStructures] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    getEmployees().then((r) => setEmployees(r.data || [])).catch(() => setEmployees([]));
    getSalaryStructures().then((r) => setStructures(r.data || [])).catch(() => setStructures([]));
    if (!id) return;
    getContract(id)
      .then((r) => {
        const c = r.data;
        setForm({
          employee: c.employee?._id || c.employee || "",
          startDate: c.startDate ? String(c.startDate).slice(0, 10) : "",
          endDate: c.endDate ? String(c.endDate).slice(0, 10) : "",
          department: c.department || "",
          jobPosition: c.jobPosition || "",
          wage: c.wage ?? "",
          salaryStructure: c.salaryStructure?._id || c.salaryStructure || "",
          status: c.status || "draft",
        });
      })
      .catch((e) => setError(e.response?.data?.message || e.message || "Could not load contract."))
      .finally(() => setLoading(false));
  }, [id]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      wage: Number(form.wage),
      endDate: form.endDate || undefined,
      salaryStructure: form.salaryStructure || undefined,
    };
    try {
      if (id) await updateContract(id, payload);
      else await createContract(payload);
      navigate("/contracts");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save contract.");
    }
  };

  return (
    <>
      <PageHeader
        title={id ? "Edit contract" : "Add contract"}
        description="Attach wage, dates, and a salary structure to an employee."
        action={<Link to="/contracts" className="btn-secondary">Back to list</Link>}
      />
      <AsyncState loading={loading} error={error} />
      {!loading && (
        <form className="card grid gap-4 sm:grid-cols-2" onSubmit={submit}>
          <label>
            <span className="block text-sm font-medium mb-1.5">Employee</span>
            <select className="input-field" name="employee" value={form.employee} onChange={change} required>
              <option value="">Select…</option>
              {employees.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </label>
          <label>
            <span className="block text-sm font-medium mb-1.5">Salary structure</span>
            <select className="input-field" name="salaryStructure" value={form.salaryStructure} onChange={change}>
              <option value="">Select…</option>
              {structures.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </label>
          <Field label="Start date" name="startDate" type="date" value={form.startDate} onChange={change} required />
          <Field label="End date" name="endDate" type="date" value={form.endDate} onChange={change} />
          <Field label="Department" name="department" value={form.department} onChange={change} />
          <Field label="Job position" name="jobPosition" value={form.jobPosition} onChange={change} />
          <Field label="Wage" name="wage" type="number" value={form.wage} onChange={change} required />
          <label>
            <span className="block text-sm font-medium mb-1.5">Status</span>
            <select className="input-field" name="status" value={form.status} onChange={change}>
              {["draft", "active", "expired", "cancelled"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <div className="sm:col-span-2 flex justify-end gap-3">
            <Link to="/contracts" className="btn-secondary">Cancel</Link>
            <button className="btn-primary">Save contract</button>
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
