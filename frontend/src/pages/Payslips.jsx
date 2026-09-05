import { useEffect, useState } from "react";
import { getPayslips, getPayslip, printPayslip } from "../services/payrollService";
import PageHeader from "../components/common/PageHeader";
import formatCurrency from "../utils/formatCurrency";
import { formatDate } from "../utils/dateHelpers";

export default function Payslips() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getPayslips()
      .then((r) => setItems(r.data?.data || r.data || []))
      .catch((e) => setError(e.response?.data?.message || "Could not load payslips."));
  }, []);

  const detail = (id) =>
    getPayslip(id)
      .then((r) => setSelected(r.data))
      .catch((e) => setError(e.response?.data?.message || "Could not load payslip."));

  const print = async (id) => {
    const r = await printPayslip(id);
    const url = URL.createObjectURL(r.data);
    window.open(url, "_blank");
  };

  return (
    <>
      <PageHeader title="Payslips" description="Inspect salary breakdowns and print employee payslips." />
      {error && <div className="card text-warning mb-5">{error}</div>}
      <div className="grid gap-5 xl:grid-cols-[1fr_1.3fr]">
        <div className="card divide-y divide-border">
          {items.map((i) => (
            <button className="w-full text-left py-3" key={i._id} onClick={() => detail(i._id)}>
              <div className="font-medium">{i.employee?.name || i.employee}</div>
              <div className="text-sm text-ink-muted">
                {formatDate(i.periodStart)} · {formatCurrency(i.netSalary)}
              </div>
            </button>
          ))}
          {!items.length && <p className="text-sm text-ink-muted">No payslips found.</p>}
        </div>
        {selected ? (
          <div className="card">
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div>
                <h2 className="text-2xl">Salary breakdown</h2>
                <p className="text-sm">{selected.employee?.name || selected.employee}</p>
              </div>
              <button className="btn-secondary" onClick={() => print(selected._id)}>Print</button>
            </div>
            <div className="mt-6 space-y-2">
              {selected.breakdown?.map((rule) => (
                <div className="flex justify-between table-row py-2" key={rule.code}>
                  <span>{rule.name || rule.code}</span>
                  <span className="num">{formatCurrency(rule.amount)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-5 pt-4 flex justify-between font-medium">
              <span>Gross / Net</span>
              <span className="num">
                {formatCurrency(selected.grossSalary)} / {formatCurrency(selected.netSalary)}
              </span>
            </div>
          </div>
        ) : (
          <div className="card text-sm text-ink-muted">Select a payslip to see its rule-by-rule breakdown.</div>
        )}
      </div>
    </>
  );
}
