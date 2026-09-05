const mongoose = require("mongoose");

const timeOffAllocationSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    timeOffType: { type: mongoose.Schema.Types.ObjectId, ref: "TimeOffType", required: true },
    allocated: { type: Number, required: true },
    taken: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
    validFrom: Date,
    validTo: Date,
    status: { type: String, enum: ["pending", "approved", "refused"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TimeOffAllocation", timeOffAllocationSchema);