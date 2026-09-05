const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    department: { type: String, required: true },
    jobPosition: { type: String, required: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    workingSchedule: { type: mongoose.Schema.Types.ObjectId, ref: "WorkingSchedule" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    dateOfJoining: { type: Date, required: true },
    profileImage: String,
    bankDetails: {
      accountNumber: String,
      ifsc: String,
      bankName: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);