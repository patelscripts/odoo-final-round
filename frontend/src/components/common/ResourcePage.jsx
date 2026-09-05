import { useEffect, useState } from "react";
import PageHeader from "./PageHeader";
import { AsyncState } from "./AsyncState";
import { formatDate } from "../../utils/dateHelpers";

const value = (item, key) => {
  const v = item?.[key];
  if (v && typeof v === "object") return v.name || v.code || v._id;
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return v;
};

const fieldValue = (field, initial) => {
  const v = initial?.[field.key];
  if (field.type === "pattern") return Array.isArray(v) ? v : [];
  if (field.type === "checkbox") return Boolean(v ?? field.default);
  if (v && typeof v === "object") {
    if (Array.isArray(v)) {
      if (field.type === "pattern") return v;
      return v.map((x) => x._id || x).join(",");
    }
    if (field.type === "json") return JSON.stringify(v, null, 2);
    return v._id || "";
  }
  if ((field.type === "date" || field.type === "datetime-local") && v) {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "";
    if (field.type === "date") return d.toISOString().slice(0, 10);
    return d.toISOString().slice(0, 16);
  }
  return v ?? field.default ?? "";
};

export default function ResourcePage({
  title,
  description,
  service,
  fields,
  columns,
  actions = true,
  transform,
  addLabel,
  extraAction,
  searchKeys,
  searchPlaceholder = "Search records...",
}) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    service
      .list()
      .then((r) => setItems(Array.isArray(r.data) ? r.data : r.data?.data || r.data?.items || []))
      .catch((e) => setError(e.response?.data?.message || "Could not load records."))
      .finally(() => setLoading(false));
  };

  const visibleItems = searchKeys
    ? items.filter((item) =>
        searchKeys.some((key) => String(value(item, key) || "").toLowerCase().includes(search.toLowerCase()))
      )
    : items;

  useEffect(() => {
    load();
  }, []);

  const submit = async (data) => {
    try {
      const payload = transform ? transform(data) : data;
      if (editing?._id) await service.update(editing._id, payload);
      else await service.create(payload);
      setOpen(false);
      setEditing(null);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not save record.");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Archive this record?")) return;
    try {
      await service.remove(id);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not archive record.");
    }
  };

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        action={
          <div className="flex flex-wrap gap-2">
            {extraAction}
            {actions && (
              <button
                className="btn-primary"
                onClick={() => {
                  setEditing(null);
                  setOpen(true);
                }}
              >
                {addLabel || `Add ${title.replace(/s$/, "")}`}
              </button>
            )}
          </div>
        }
      />
      <AsyncState loading={loading} error={error} />
      {!loading && (
        <div className="card overflow-x-auto">
          {searchKeys && (
            <div className="mb-5 max-w-md">
              <label className="sr-only" htmlFor={`${title}-search`}>{searchPlaceholder}</label>
              <input
                id={`${title}-search`}
                className="input-field"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
              />
            </div>
          )}
          <table className="w-full text-left text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border">
                {columns.map((c) => (
                  <th className="pb-3 pr-4 font-medium text-ink-muted" key={c.key}>
                    {c.label}
                  </th>
                ))}
                {actions && <th className="pb-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => (
                <tr className="table-row" key={item._id}>
                  {columns.map((c) => (
                    <td className="py-3 pr-4" key={c.key}>
                      {c.render
                        ? c.render(item)
                        : c.type === "date"
                          ? formatDate(value(item, c.key))
                          : value(item, c.key) || "—"}
                    </td>
                  ))}
                  {actions && (
                    <td className="py-3 text-right whitespace-nowrap">
                      <button
                        className="text-primary mr-3"
                        onClick={() => {
                          setEditing(item);
                          setOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      {service.remove && (
                        <button className="text-warning" onClick={() => remove(item._id)}>
                          Archive
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!visibleItems.length && (
            <p className="py-8 text-center text-sm text-ink-muted">
              {items.length ? "No matching records found." : "No records found."}
            </p>
          )}
        </div>
      )}
      {open && (
        <FormModal
          title={`${editing ? "Edit" : "Add"} ${title.replace(/s$/, "")}`}
          fields={fields}
          initial={editing}
          onClose={() => setOpen(false)}
          onSubmit={submit}
        />
      )}
    </>
  );
}

function FormModal({ title, fields, initial, onClose, onSubmit }) {
  const [form, setForm] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.key, fieldValue(f, initial)]))
  );
  const [optionMap, setOptionMap] = useState({});

  useEffect(() => {
    fields.forEach((f) => {
      if (!f.loadOptions) return;
      f.loadOptions()
        .then((r) => {
          const list = Array.isArray(r.data) ? r.data : r.data?.data || [];
          setOptionMap((prev) => ({ ...prev, [f.key]: list }));
        })
        .catch(() => setOptionMap((prev) => ({ ...prev, [f.key]: [] })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 bg-ink/30 z-20 flex items-start sm:items-center justify-center p-4 sm:p-5">
      <div className="card w-full max-w-2xl max-h-[calc(100vh-2rem)] sm:max-h-[92vh] overflow-y-auto rounded-lg mt-4 sm:mt-0">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl sm:text-2xl">{title}</h2>
          <button onClick={onClose} className="text-ink-muted">
            Close
          </button>
        </div>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
        >
          {fields.map((f) => (
            <label className={f.wide ? "sm:col-span-2" : ""} key={f.key}>
              <span className="block text-sm font-medium mb-1.5">{f.label}</span>
              {f.type === "select" ? (
                <select
                  className="input-field"
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  required={f.required}
                >
                  <option value="">{f.required ? "Select…" : "Optional"}</option>
                  {(optionMap[f.key] || f.options || []).map((o) => {
                    const opt = typeof o === "object" ? o : { value: o, label: o };
                    return (
                      <option key={opt.value || opt._id || opt} value={opt.value || opt._id || opt}>
                        {opt.label || opt.name || opt}
                      </option>
                    );
                  })}
                </select>
              ) : f.type === "checkbox" ? (
                <input
                  type="checkbox"
                  checked={!!form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                />
              ) : f.type === "textarea" || f.type === "json" ? (
                <textarea
                  className="input-field min-h-24"
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              ) : f.type === "pattern" ? (
                <PatternEditor
                  value={form[f.key]}
                  onChange={(pattern) => setForm({ ...form, [f.key]: pattern })}
                />
              ) : (
                <input
                  className="input-field"
                  type={f.type || "text"}
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  required={f.required}
                />
              )}
            </label>
          ))}
          <div className="sm:col-span-2 flex justify-end gap-3 mt-3">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function PatternEditor({ value, onChange }) {
  const rows = DAYS.map((day) => {
    const existing = (Array.isArray(value) ? value : []).find((d) => d.day === day);
    return existing || { day, startTime: "", endTime: "", breakMinutes: 60 };
  });

  const update = (day, patch) => {
    onChange(rows.map((row) => (row.day === day ? { ...row, ...patch } : row)));
  };

  return (
    <div className="overflow-x-auto border border-border rounded-md">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-ink-muted">
            <th className="p-2 text-left">Day</th>
            <th className="p-2 text-left">Start</th>
            <th className="p-2 text-left">End</th>
            <th className="p-2 text-left">Break</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.day} className="table-row">
              <td className="p-2">{row.day}</td>
              <td className="p-2">
                <input
                  type="time"
                  className="input-field"
                  value={row.startTime || ""}
                  onChange={(e) => update(row.day, { startTime: e.target.value })}
                />
              </td>
              <td className="p-2">
                <input
                  type="time"
                  className="input-field"
                  value={row.endTime || ""}
                  onChange={(e) => update(row.day, { endTime: e.target.value })}
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  className="input-field"
                  value={row.breakMinutes ?? 60}
                  onChange={(e) => update(row.day, { breakMinutes: Number(e.target.value) })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
