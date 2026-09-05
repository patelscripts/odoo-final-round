const WorkingSchedule = require("../models/WorkingSchedule");

const calcWeeklyHours = (pattern) => {
  let total = 0;
  pattern.forEach((day) => {
    const [sh, sm] = day.startTime.split(":").map(Number);
    const [eh, em] = day.endTime.split(":").map(Number);
    const minutes = (eh * 60 + em) - (sh * 60 + sm) - (day.breakMinutes || 0);
    total += Math.max(minutes, 0);
  });
  return +(total / 60).toFixed(2);
};

exports.createSchedule = async (req, res) => {
  try {
    const totalWeeklyHours = calcWeeklyHours(req.body.pattern || []);
    const schedule = await WorkingSchedule.create({ ...req.body, totalWeeklyHours });
    res.status(201).json(schedule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getSchedules = async (req, res) => {
  try {
    const schedules = await WorkingSchedule.find();
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getScheduleById = async (req, res) => {
  try {
    const schedule = await WorkingSchedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: "Schedule not found" });
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const totalWeeklyHours = req.body.pattern
      ? calcWeeklyHours(req.body.pattern)
      : undefined;
    const update = totalWeeklyHours !== undefined ? { ...req.body, totalWeeklyHours } : req.body;
    const schedule = await WorkingSchedule.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!schedule) return res.status(404).json({ message: "Schedule not found" });
    res.json(schedule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await WorkingSchedule.findByIdAndDelete(req.params.id);
    if (!schedule) return res.status(404).json({ message: "Schedule not found" });
    res.json({ message: "Schedule deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};