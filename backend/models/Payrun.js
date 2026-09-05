const mongoose = require("mongoose");

const payrunSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    salaryStructure: { type: mongoose.Schema.Types.ObjectId, ref: "SalaryStructure", required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
    status: {
      type: String,
      enum: ["draft", "computed", "validated", "paid"],
      default: "draft",
    },
    warnings: [String],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payrun", payrunSchema);