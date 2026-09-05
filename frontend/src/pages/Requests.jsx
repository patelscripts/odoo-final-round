import { useEffect, useState } from "react";
import ResourcePage from "../components/common/ResourcePage";
import { createRequest, decideRequest, getRequests } from "../services/timeoffService";
import { getEmployees } from "../services/employeeService";
import { getTypes } from "../services/timeoffService";
import { formatDate } from "../utils/dateHelpers";

const service = {
  list: getRequests,
  create: createRequest,
  update: () => Promise.resolve(),
};

export default function Requests() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const loadPending = () => {
    getRequests()
      .then((r) => setItems(r.data || []))
      .catch((e) => setError(e.response?.data?.message || "Could not load requests."));
  };

  useEffect(loadPending, []);

  const decide = async (id, decision) => {
    try {
      await decideRequest(id, { decision });
      loadPending();
    } catch (e) {
      setError(e.response?.data?.message || "Could not update request.");
    }
  };

  return (
    <>
      <ResourcePage
        title="Requests"
        description="Review leave requests and submit new ones."
        addLabel="Add request"
        service={service}
        transform={(data) => ({
          ...data,
          duration: Math.max(
            1,
            Math.ceil((new Date(data.endDate) - new Date(data.startDate)) / 86400000) + 1
          ),
        })}
        fields={[
          { key: "employee", label: "Employee", type: "select", required: true, loadOptions: getEmployees },
          { key: "timeOffType", label: "Leave type", type: "select", required: true, loadOptions: getTypes },
          { key: "startDate", label: "Start date", type: "date", required: true },
          { key: "endDate", label: "End date", type: "date", required: true },
          { key: "reason", label: "Reason", type: "textarea", wide: true },
        ]}
        columns={[
          { key: "employee", label: "Employee" },
          { key: "timeOffType", label: "Type" },
          { key: "startDate", label: "From", render: (i) => formatDate(i.startDate) },
          { key: "endDate", label: "To", render: (i) => formatDate(i.endDate) },
          { key: "status", label: "Status" },
        ]}
      />
      <div className="card mt-5">
        <h2 className="text-xl mb-3">Manager decisions</h2>
        {error && <p className="text-warning text-sm mb-3">{error}</p>}
        {items.filter((i) => i.status === "pending").map((i) => (
          <div className="table-row py-3 flex flex-col sm:flex-row sm:justify-between gap-2" key={i._id}>
            <span>
              {i.employee?.name || i.employee} · {formatDate(i.startDate)} – {formatDate(i.endDate)}
            </span>
            <span>
              <button className="text-primary mr-4" onClick={() => decide(i._id, "approved")}>
                Approve
              </button>
              <button className="text-warning" onClick={() => decide(i._id, "refused")}>
                Refuse
              </button>
            </span>
          </div>
        ))}
        {!items.filter((i) => i.status === "pending").length && (
          <p className="text-sm">No pending requests.</p>
        )}
      </div>
    </>
  );
}
