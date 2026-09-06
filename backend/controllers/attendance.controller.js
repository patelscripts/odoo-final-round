const Attendance = require("../models/Attendance");

const calcWorkedHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut) - new Date(checkIn);
  return +(ms / (1000 * 60 * 60)).toFixed(2);
};

exports.createAttendance = async (req, res) => {
  try {
    const { checkIn, checkOut } = req.body;
    const workedHours = calcWorkedHours(checkIn, checkOut);
    const status = !checkOut ? "missing_checkout" : workedHours > 9 ? "overtime" : "present";
    const attendance = await Attendance.create({ ...req.body, workedHours, status });
    res.status(201).json(attendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const filter = {};
    if (req.query.employee) filter.employee = req.query.employee;
    if (req.query.status) filter.status = req.query.status;
    const records = await Attendance.find(filter)
      .populate("employee", "name department")
      .sort("-date");
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAttendanceById = async (req, res) => {
  try {
    const record = await Attendance.findById(req.params.id).populate("employee", "name");
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const existing = await Attendance.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Record not found" });

    const checkIn = req.body.checkIn || existing.checkIn;
    const checkOut = req.body.checkOut || existing.checkOut;
    const workedHours = calcWorkedHours(checkIn, checkOut);

    const record = await Attendance.findByIdAndUpdate(
      req.params.id,
      { ...req.body, workedHours, isManualCorrection: true, correctedBy: req.user._id },
      { new: true, runValidators: true }
    );
    res.json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Attendance record deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkIn = async (req, res) => {
  try {
    if (!req.user.employee) {
      return res.status(400).json({ message: "Your account is not linked to an employee profile yet." });
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const existing = await Attendance.findOne({
      employee: req.user.employee,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existing?.checkIn && !existing.checkOut) {
      return res.status(400).json({ message: "You are already checked in." });
    }
    if (existing?.checkOut) {
      return res.status(400).json({ message: "Today's attendance is already completed." });
    }

    const attendance = await Attendance.create({
      employee: req.user.employee,
      date: now,
      checkIn: now,
      status: "missing_checkout",
    });
    res.status(201).json(attendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    if (!req.user.employee) {
      return res.status(400).json({ message: "Your account is not linked to an employee profile yet." });
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const attendance = await Attendance.findOne({
      employee: req.user.employee,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!attendance?.checkIn) return res.status(400).json({ message: "Check in before checking out." });
    if (attendance.checkOut) return res.status(400).json({ message: "You are already checked out." });

    attendance.checkOut = now;
    attendance.workedHours = calcWorkedHours(attendance.checkIn, now);
    attendance.status = attendance.workedHours > 9 ? "overtime" : "present";
    await attendance.save();
    res.json(attendance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};