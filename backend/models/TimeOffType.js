const mongoose = require("mongoose");

const timeOffTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    unit: { type: String, enum: ["days", "hours"], default: "days" },
    requiresAllocation: { type: Boolean, default: true },
    requiresApproval: { type: Boolean, default: true },
    affectsPayroll: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TimeOffType", timeOffTypeSchema);