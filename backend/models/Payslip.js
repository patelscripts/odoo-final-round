const mongoose = require("mongoose");

const ruleBreakdownSchema = new mongoose.Schema(
  {
    code: String,
    name: String,
    category: String,
    amount: Number,
  },
  { _id: false }
);

const payslipSchema = new mongoose.Schema(
  {
    payrun: { type: mongoose.Schema.Types.ObjectId, ref: "Payrun", required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    contract: { type: mongoose.Schema.Types.ObjectId, ref: "Contract", required: true },
    salaryStructure: { type: mongoose.Schema.Types.ObjectId, ref: "SalaryStructure", required: true },
    periodStart: Date,
    periodEnd: Date,
    workedDays: Number,
    breakdown: [ruleBreakdownSchema],
    grossSalary: Number,
    totalDeductions: Number,
    netSalary: Number,
    status: { type: String, enum: ["draft", "computed", "validated", "paid"], default: "draft" },
    pdfUrl: String,
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payslip", payslipSchema);