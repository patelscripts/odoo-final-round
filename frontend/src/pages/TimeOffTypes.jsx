import ResourcePage from "../components/common/ResourcePage";
import { getTypes, createType, updateType, deleteType } from "../services/timeoffService";

const service = { list: getTypes, create: createType, update: updateType, remove: deleteType };

export default function TimeOffTypes() {
  return (
    <ResourcePage
      title="Leave Types"
      description="Define the leave options employees can request."
      addLabel="Add leave type"
      service={service}
      fields={[
        { key: "name", label: "Name", required: true },
        { key: "unit", label: "Unit", type: "select", options: ["days", "hours"] },
        { key: "requiresAllocation", label: "Requires allocation", type: "checkbox", default: true },
        { key: "requiresApproval", label: "Requires approval", type: "checkbox", default: true },
        { key: "affectsPayroll", label: "Affects payroll", type: "checkbox", default: true },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "unit", label: "Unit" },
        { key: "requiresApproval", label: "Approval" },
        { key: "affectsPayroll", label: "Payroll" },
      ]}
    />
  );
}
