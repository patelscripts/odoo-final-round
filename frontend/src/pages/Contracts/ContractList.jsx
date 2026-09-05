import { Link } from "react-router-dom";
import ResourcePage from "../../components/common/ResourcePage";
import { getContracts, createContract, updateContract, deleteContract } from "../../services/contractService";
import { getEmployees } from "../../services/employeeService";
import { getSalaryStructures } from "../../services/salaryStructureService";
import formatCurrency from "../../utils/formatCurrency";

const service = { list: getContracts, create: createContract, update: updateContract, remove: deleteContract };

export default function ContractList() {
  return (
    <ResourcePage
      title="Contracts"
      description="Track employee agreements, wages, and active terms."
      extraAction={
        <Link to="/contracts/new" className="btn-secondary">
          Full form
        </Link>
      }
      service={service}
      transform={(data) => ({
        ...data,
        wage: Number(data.wage),
        endDate: data.endDate || undefined,
        salaryStructure: data.salaryStructure || undefined,
      })}
      fields={[
        { key: "employee", label: "Employee", type: "select", required: true, loadOptions: getEmployees },
        { key: "startDate", label: "Start date", type: "date", required: true },
        { key: "endDate", label: "End date", type: "date" },
        { key: "department", label: "Department" },
        { key: "jobPosition", label: "Job position" },
        { key: "wage", label: "Wage", type: "number", required: true },
        { key: "salaryStructure", label: "Salary structure", type: "select", loadOptions: getSalaryStructures },
        { key: "status", label: "Status", type: "select", options: ["draft", "active", "expired", "cancelled"] },
      ]}
      columns={[
        { key: "employee", label: "Employee" },
        { key: "department", label: "Department" },
        { key: "wage", label: "Wage", render: (i) => formatCurrency(i.wage) },
        { key: "status", label: "Status" },
        {
          key: "open",
          label: "",
          render: (i) => (
            <Link className="text-primary" to={`/contracts/${i._id}/edit`}>
              Open form
            </Link>
          ),
        },
      ]}
    />
  );
}
