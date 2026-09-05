const mongoose = require("mongoose");

const salaryRuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // "BASIC", "HRA", "PF"
    category: {
      type: String,
      enum: ["basic", "allowance", "deduction", "gross", "net"],
      required: true,
    },
    sequence: { type: Number, required: true }, // execution order
    computationType: { type: String, enum: ["fixed", "percentage", "formula"], required: true },
    amount: Number,       // for fixed
    percentageOf: String, // "BASIC" (refers to another rule's code)
    percentageValue: Number,
    formula: String,      //"BASIC * 0.4 - PF"
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalaryRule", salaryRuleSchema);