import { useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import { AsyncState } from "../components/common/AsyncState";
import {
  createSalaryStructure,
  deleteSalaryStructure,
  getSalaryStructures,
  updateSalaryStructure,
} from "../services/salaryStructureService";
import { getSalaryRules } from "../services/salaryRuleService";

export default function SalaryStructures() {
  const [items, setItems] = useState([]);
  const [rules, setRules] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", isActive: true, salaryRules: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([getSalaryStructures(), getSalaryRules()])
      .then(([s, r]) => {
        setItems(s.data || []);
        setRules(r.data || []);
      })
      .catch((e) => setError(e.response?.data?.message || "Could not load structures."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing?._id) await updateSalaryStructure(editing._id, form);
      else await createSalaryStructure(form);
      setOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save structure.");
    }
  };

  return (
    <>
      <PageHeader
        title="Salary Structures"
        description="Group salary rules into active payroll structures."
        action={
          <button
            className="btn-primary cursor-pointer mr-2"
            onClick={() => {
              setEditing(null);
              setForm({ name: "", isActive: true, salaryRules: [] });
              setOpen(true);
            }}
          >
            Add structure
          </button>
        }
      />
      <AsyncState loading={loading} error={error} />
      {!loading && (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm min-w-130">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3">Name</th>
                <th className="pb-3">Rules</th>
                <th className="pb-3">Active</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr className="table-row" key={item._id}>
                  <td className="py-3">{item.name}</td>
                  <td className="py-3">{item.salaryRules?.length || 0}</td>
                  <td className="py-3">{item.isActive ? "Yes" : "No"}</td>
                  <td className="py-3 text-right">
                    <button
                      className="text-primary mr-3"
                      onClick={() => {
                        setEditing(item);
                        setForm({
                          name: item.name,
                          isActive: item.isActive !== false,
                          salaryRules: (item.salaryRules || []).map((r) => r._id || r),
                        });
                        setOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-warning"
                      onClick={async () => {
                        if (!window.confirm("Delete this structure?")) return;
                        await deleteSalaryStructure(item._id);
                        load();
                      }}
                    >
                      Archive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!items.length && <p className="py-8 text-center text-sm text-ink-muted">No records found.</p>}
        </div>
      )}
      {open && (
        <div className="fixed inset-0 bg-ink/30 z-50 flex items-start sm:items-center justify-center p-4 sm:p-5">
          <form className="card w-full max-w-2xl max-h-[92vh] overflow-y-auto mt-4 sm:mt-0" onSubmit={submit}>
            <h2 className="text-2xl mb-5">{editing ? "Edit" : "Add"} structure</h2>
            <label className="block mb-4">
              <span className="block text-sm font-medium mb-1.5">Structure name</span>
              <input className="input-field" value={form.name} required onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="flex items-center gap-2 mb-6 text-sm">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              <span>Active structure</span>
            </label>
            <fieldset className="mb-6">
              <legend className="text-sm font-medium mb-2">Salary rules</legend>
              {rules.length ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {rules.map((rule) => {
                    const checked = form.salaryRules.includes(rule._id);
                    return (
                      <label key={rule._id} className="border border-border rounded-md px-3 py-3 text-sm flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setForm({
                              ...form,
                              salaryRules: checked
                                ? form.salaryRules.filter((id) => id !== rule._id)
                                : [...form.salaryRules, rule._id],
                            })
                          }
                        />
                        <span>
                          <span className="block font-medium">{rule.name}</span>
                          <span className="text-xs text-ink-muted">{rule.code} · {rule.category}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-ink-muted">No salary rules available. Create one first.</p>
              )}
            </fieldset>
            <div className="flex justify-end gap-3">
              <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn-primary">Save</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
