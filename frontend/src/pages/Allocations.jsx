import ResourcePage from "../components/common/ResourcePage";
import { getAllocations, createAllocation, updateAllocation } from "../services/timeoffService";
import { getEmployees } from "../services/employeeService";
import { getTypes } from "../services/timeoffService";

const service = { list: getAllocations, create: createAllocation, update: updateAllocation };

export default function Allocations() {
  return (
    <ResourcePage
      title="Allocations"
      description="See allocated, taken, and remaining employee balances."
      addLabel="Add allocation"
      service={service}
      transform={(data) => ({
        ...data,
        allocated: Number(data.allocated),
        taken: Number(data.taken || 0),
      })}
      fields={[
        { key: "employee", label: "Employee", type: "select", required: true, loadOptions: getEmployees },
        { key: "timeOffType", label: "Leave type", type: "select", required: true, loadOptions: getTypes },
        { key: "allocated", label: "Allocated days", type: "number", required: true },
        { key: "taken", label: "Taken days", type: "number" },
        { key: "validFrom", label: "Valid from", type: "date" },
        { key: "validTo", label: "Valid to", type: "date" },
        { key: "status", label: "Status", type: "select", options: ["pending", "approved", "refused"] },
      ]}
      columns={[
        { key: "employee", label: "Employee" },
        { key: "timeOffType", label: "Leave type" },
        { key: "allocated", label: "Allocated" },
        { key: "taken", label: "Taken" },
        { key: "remaining", label: "Remaining", render: (i) => Number(i.remaining ?? Number(i.allocated || 0) - Number(i.taken || 0)) },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
