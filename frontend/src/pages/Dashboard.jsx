import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getDashboard } from "../services/dashboardService";
import formatCurrency from "../utils/formatCurrency";
import PageHeader from "../components/common/PageHeader";
import { AsyncState } from "../components/common/AsyncState";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard()
      .then((r) => setData(r.data))
      .catch((e) => setError(e.response?.data?.message || "Could not load dashboard."));
  }, []);

  const k = data?.kpis || {};
  const a = data?.attendanceOverview || {};
  const salaryData = data?.charts?.salaryCostByDepartment || [];
  const trendData = data?.charts?.monthlyTrend || [];

  return (
    <>
      <PageHeader title="Dashboard" description="A clear view of your people, attendance, and payroll." />
      <AsyncState loading={!data && !error} error={error} />
      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-7">
            {[
              ["Total net salary paid", formatCurrency(k.totalNetSalaryPaid)],
              ["Payslips generated", k.payslipsGenerated],
              ["Average salary", formatCurrency(k.averageSalary)],
              ["Approved time off", k.approvedTimeOff],
            ].map(([label, value]) => (
              <div className="card" key={label}>
                <p className="text-sm">{label}</p>
                <div className="num text-2xl mt-3">{value ?? 0}</div>
              </div>
            ))}
          </div>
          <div className="grid gap-5 xl:grid-cols-2 mb-5">
            <ChartCard title="Salary cost by department" empty={!salaryData.length}>
              <BarChart data={salaryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartCard>
            <ChartCard title="Monthly net salary trend" empty={!trendData.length}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="var(--color-primary)" strokeWidth={2} />
              </LineChart>
            </ChartCard>
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <section className="card">
              <h2 className="text-xl mb-4">Attendance overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(a).map(([label, value]) => (
                  <div key={label} className="border border-border rounded-md p-3">
                    <div className="num text-xl">{value}</div>
                    <p className="text-xs capitalize mt-1">{label.replaceAll(/([A-Z])/g, " $1")}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="card">
              <h2 className="text-xl mb-4">Alerts & warnings</h2>
              {data.alerts?.length ? (
                data.alerts.map((item) => (
                  <div className="table-row py-3" key={item._id}>
                    <div className="font-medium text-sm">{item.name}</div>
                    <p className="text-sm">{item.warnings?.join(", ")}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm">No payroll warnings right now.</p>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}

function ChartCard({ title, children, empty }) {
  return (
    <section className="card">
      <h2 className="text-xl mb-4">{title}</h2>
      <div className="h-64">
        {empty ? (
          <p className="text-sm">No chart data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
