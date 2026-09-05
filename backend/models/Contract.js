const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    startDate: { type: Date, required: true },
    endDate: Date, // null = ongoing
    department: String,
    jobPosition: String,
    wage: { type: Number, required: true },
    salaryStructure: { type: mongoose.Schema.Types.ObjectId, ref: "SalaryStructure" },
    status: { type: String, enum: ["draft", "active", "expired", "cancelled"], default: "draft" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contract", contractSchema);