import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import { computePayrun, getPayrun, markPaid, sendPayslips, validatePayrun } from "../services/payrollService";
import formatCurrency from "../utils/formatCurrency";
import { formatDate } from "../utils/dateHelpers";

export default function PayrunDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = () =>
    getPayrun(id)
      .then((r) => setItem(r.data))
      .catch((e) => setError(e.response?.data?.message || "Could not load payrun."));

  useEffect(() => {
    load();
  }, [id]);

  const action = (fn) =>
    fn(id)
      .then((res) => {
        setNotice(res.data?.message || "Done.");
        return load();
      })
      .catch((e) => setError(e.response?.data?.message || "Action failed."));

  const payslips = item?.payslips || [];

  return (
    <>
      <PageHeader
        title={item?.name || "Payrun detail"}
        description={item?.status ? `Status: ${item.status}` : "Loading…"}
        action={
          <div className="flex flex-wrap gap-2">
            <Link to="/payroll/payruns" className="btn-secondary">Back</Link>
            <button className="btn-secondary" onClick={() => action(computePayrun)}>Compute</button>
            <button className="btn-secondary" onClick={() => action(validatePayrun)}>Validate</button>
            <button className="btn-primary" onClick={() => action(markPaid)}>Mark paid</button>
            <button className="btn-secondary" onClick={() => action(sendPayslips)}>Send payslips</button>
          </div>
        }
      />
      {error && <div className="card text-warning mb-5">{error}</div>}
      {notice && <div className="card mb-5 text-sm">{notice}</div>}
      <div className="grid gap-5">
        <section className="card grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-sm">Period</p>
            <div>{formatDate(item?.periodStart)} – {formatDate(item?.periodEnd)}</div>
          </div>
          <div>
            <p className="text-sm">Structure</p>
            <div>{item?.salaryStructure?.name || item?.salaryStructure || "—"}</div>
          </div>
          <div>
            <p className="text-sm">Employees</p>
            <div>{item?.employees?.length || 0}</div>
          </div>
        </section>
        <section className="card">
          <h2 className="text-xl mb-4">Generated payslips</h2>
          {payslips.map((p) => (
            <div className="table-row py-3 flex justify-between" key={p._id}>
              <span>{p.employee?.name || p.employee}</span>
              <span className="num">{formatCurrency(p.netSalary)}</span>
            </div>
          ))}
          {!payslips.length && <p className="text-sm">No payslips yet. Compute this payrun first.</p>}
          {item?.warnings?.length > 0 && (
            <div className="mt-5 border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
              {item.warnings.join(" · ")}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
