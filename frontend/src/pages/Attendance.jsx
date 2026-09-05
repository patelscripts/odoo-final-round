import ResourcePage from "../components/common/ResourcePage";
import { getAttendance, createAttendance, updateAttendance, deleteAttendance } from "../services/attendanceService";
import { getEmployees } from "../services/employeeService";
import { formatDate } from "../utils/dateHelpers";

const service = { list: getAttendance, create: createAttendance, update: updateAttendance, remove: deleteAttendance };

export default function Attendance() {
  return (
    <ResourcePage
      title="Attendance"
      description="Review time records and record manual corrections."
      addLabel="Add attendance"
      service={service}
      fields={[
        { key: "employee", label: "Employee", type: "select", required: true, loadOptions: getEmployees },
        { key: "date", label: "Date", type: "date", required: true },
        { key: "checkIn", label: "Check in", type: "datetime-local" },
        { key: "checkOut", label: "Check out", type: "datetime-local" },
        { key: "status", label: "Status", type: "select", options: ["present", "absent", "late", "overtime", "missing_checkout"] },
        { key: "isManualCorrection", label: "Manual correction", type: "checkbox" },
      ]}
      columns={[
        { key: "employee", label: "Employee" },
        { key: "date", label: "Date", render: (i) => formatDate(i.date) },
        { key: "workedHours", label: "Worked hours" },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
