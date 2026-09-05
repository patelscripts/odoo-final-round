import ResourcePage from "../components/common/ResourcePage";
import { getSalaryRules, createSalaryRule, updateSalaryRule, deleteSalaryRule } from "../services/salaryRuleService";

const service = {
  list: getSalaryRules,
  create: createSalaryRule,
  update: updateSalaryRule,
  remove: deleteSalaryRule,
};

export default function SalaryRules() {
  return (
    <ResourcePage
      title="Salary Rules"
      description="Configure the calculations behind every payslip."
      addLabel="Add salary rule"
      service={service}
      transform={(data) => ({
        ...data,
        sequence: Number(data.sequence),
        amount: data.amount === "" ? undefined : Number(data.amount),
        percentageValue: data.percentageValue === "" ? undefined : Number(data.percentageValue),
      })}
      fields={[
        { key: "name", label: "Name", required: true },
        { key: "code", label: "Code", required: true },
        { key: "category", label: "Category", type: "select", options: ["basic", "allowance", "deduction", "gross", "net"], required: true },
        { key: "sequence", label: "Sequence", type: "number", required: true },
        { key: "computationType", label: "Computation type", type: "select", options: ["fixed", "percentage", "formula"], required: true },
        { key: "amount", label: "Fixed amount", type: "number" },
        { key: "percentageOf", label: "Percentage of (rule code)" },
        { key: "percentageValue", label: "Percentage", type: "number" },
        { key: "formula", label: "Formula", type: "textarea", wide: true },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "code", label: "Code" },
        { key: "category", label: "Category" },
        { key: "computationType", label: "Calculation" },
      ]}
    />
  );
}
