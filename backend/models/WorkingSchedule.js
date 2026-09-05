const mongoose = require("mongoose");

const dayPatternSchema = new mongoose.Schema(
  {
    day: { type: String, enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], required: true },
    startTime: String,
    endTime: String,  
    breakMinutes: { type: Number, default: 60 },
  },
  { _id: false }
);

const workingScheduleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["full_time", "part_time", "shift"], default: "full_time" },
    pattern: [dayPatternSchema],
    totalWeeklyHours: { type: Number, default: 0 }, // auto-calculated
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkingSchedule", workingScheduleSchema);