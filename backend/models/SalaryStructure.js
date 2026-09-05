const mongoose = require("mongoose");

const salaryStructureSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    salaryRules: [{ type: mongoose.Schema.Types.ObjectId, ref: "SalaryRule" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalaryStructure", salaryStructureSchema);