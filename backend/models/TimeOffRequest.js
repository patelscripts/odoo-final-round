const mongoose = require("mongoose");

const timeOffRequestSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    timeOffType: { type: mongoose.Schema.Types.ObjectId, ref: "TimeOffType", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    duration: { type: Number, required: true },
    status: { type: String, enum: ["pending", "approved", "refused"], default: "pending" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("TimeOffRequest", timeOffRequestSchema);