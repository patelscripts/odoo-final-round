import { Link } from "react-router-dom";
import ResourcePage from "../../components/common/ResourcePage";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from "../../services/employeeService";
import { getSchedules } from "../../services/scheduleService";

const service = {
  list: getEmployees,
  create: createEmployee,
  update: updateEmployee,
  remove: deleteEmployee,
};

const parseBank = (value) => {
  if (!value) return undefined;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return { bankName: value };
  }
};

export default function EmployeeList() {
  return (
    <ResourcePage
      title="Employees"
      description="Manage your people directory and employment status."
      service={service}
      extraAction={
        <Link to="/employees/new" className="btn-secondary">
          Full form
        </Link>
      }
      searchKeys={["name", "email", "department", "jobPosition", "status"]}
      searchPlaceholder="Search employees by name, email, department..."
      transform={(data) => ({
        ...data,
        bankDetails: parseBank(data.bankDetails),
        manager: data.manager || undefined,
        workingSchedule: data.workingSchedule || undefined,
      })}
      fields={[
        { key: "name", label: "Name", required: true },
        { key: "email", label: "Email", type: "email", required: true },
        { key: "phone", label: "Phone" },
        { key: "department", label: "Department", required: true },
        { key: "jobPosition", label: "Job position", required: true },
        { key: "manager", label: "Manager", type: "select", loadOptions: getEmployees },
        { key: "workingSchedule", label: "Working schedule", type: "select", loadOptions: getSchedules },
        { key: "dateOfJoining", label: "Date of joining", type: "date", required: true },
        { key: "status", label: "Status", type: "select", options: ["active", "inactive"] },
        { key: "bankDetails", label: "Bank details (JSON)", type: "json", wide: true },
      ]}
      columns={[
        {
          key: "name",
          label: "Name",
          render: (item) => (
            <Link className="font-medium" to={`/employees/${item._id}`}>
              {item.name}
            </Link>
          ),
        },
        { key: "department", label: "Department" },
        { key: "jobPosition", label: "Job position" },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
