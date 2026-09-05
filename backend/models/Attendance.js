const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: Date, required: true },
    checkIn: Date,
    checkOut: Date,
    workedHours: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["present", "absent", "late", "overtime", "missing_checkout"],
      default: "present",
    },
    isManualCorrection: { type: Boolean, default: false },
    correctedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);