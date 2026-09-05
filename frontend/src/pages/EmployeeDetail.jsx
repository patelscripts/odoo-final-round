import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import { AsyncState } from "../components/common/AsyncState";
import {
  getEmployee,
  getEmployeeAttendance,
  getEmployeeContracts,
  getEmployeeTimeOff,
} from "../services/employeeService";
import { formatDate } from "../utils/dateHelpers";
import formatCurrency from "../utils/formatCurrency";

export default function EmployeeDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [timeoff, setTimeoff] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getEmployee(id),
      getEmployeeContracts(id),
      getEmployeeAttendance(id),
      getEmployeeTimeOff(id),
    ])
      .then(([employee, c, a, t]) => {
        setItem(employee.data);
        setContracts(c.data || []);
        setAttendance(a.data || []);
        setTimeoff(t.data || []);
      })
      .catch((e) => setError(e.response?.data?.message || "Could not load employee."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <PageHeader
        title={item?.name || "Employee"}
        description={item?.jobPosition || "Employee profile"}
        action={
          item && (
            <Link to={`/employees/${id}/edit`} className="btn-primary">
              Edit
            </Link>
          )
        }
      />
      <AsyncState loading={loading} error={error} />
      {item && (
        <div className="grid gap-5">
          <div className="card grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Fact label="Department" value={item.department} />
            <Fact label="Email" value={item.email} />
            <Fact label="Status" value={item.status} />
            <Fact label="Joined" value={formatDate(item.dateOfJoining)} />
            <Fact label="Manager" value={item.manager?.name || "—"} />
            <Fact label="Schedule" value={item.workingSchedule?.name || "—"} />
            <Fact label="Phone" value={item.phone || "—"} />
            <Fact label="Bank" value={item.bankDetails?.bankName || "—"} />
          </div>
          <Section title="Contracts">
            {contracts.length ? contracts.map((c) => (
              <div className="table-row py-3 flex justify-between gap-3" key={c._id}>
                <span>{formatDate(c.startDate)} · {c.status}</span>
                <span className="num">{formatCurrency(c.wage)}</span>
              </div>
            )) : <p className="text-sm">No contracts yet.</p>}
          </Section>
          <div className="grid gap-5 xl:grid-cols-2">
            <Section title="Attendance">
              {attendance.slice(0, 8).map((a) => (
                <div className="table-row py-3 flex justify-between gap-3" key={a._id}>
                  <span>{formatDate(a.date)}</span>
                  <span className="capitalize">{a.status} · {a.workedHours || 0}h</span>
                </div>
              ))}
              {!attendance.length && <p className="text-sm">No attendance records.</p>}
            </Section>
            <Section title="Time off">
              {timeoff.slice(0, 8).map((t) => (
                <div className="table-row py-3 flex justify-between gap-3" key={t._id}>
                  <span>{formatDate(t.startDate)} – {formatDate(t.endDate)}</span>
                  <span className="capitalize">{t.status}</span>
                </div>
              ))}
              {!timeoff.length && <p className="text-sm">No leave requests.</p>}
            </Section>
          </div>
        </div>
      )}
    </>
  );
}

function Fact({ label, value }) {
  return (
    <div>
      <p className="text-sm">{label}</p>
      <div className="capitalize">{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="card">
      <h2 className="text-xl mb-4">{title}</h2>
      {children}
    </section>
  );
}
