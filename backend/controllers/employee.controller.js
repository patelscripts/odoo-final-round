const Employee = require("../models/Employee");

const parseBankDetails = (value) => {
  if (!value) return undefined;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return { bankName: value };
    }
  }
  return value;
};

exports.createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create({
      ...req.body,
      bankDetails: parseBankDetails(req.body.bankDetails),
      manager: req.body.manager || undefined,
      workingSchedule: req.body.workingSchedule || undefined,
    });
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("manager", "name")
      .populate("workingSchedule", "name");
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate("manager", "name")
      .populate("workingSchedule");
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      bankDetails: parseBankDetails(req.body.bankDetails) ?? req.body.bankDetails,
      manager: req.body.manager || undefined,
      workingSchedule: req.body.workingSchedule || undefined,
    };
    const employee = await Employee.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { status: "inactive" },
      { new: true }
    );
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "Employee archived", employee });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Smart-button style: related records
exports.getEmployeeContracts = async (req, res) => {
  const Contract = require("../models/Contract");
  const contracts = await Contract.find({ employee: req.params.id }).sort("-startDate");
  res.json(contracts);
};

exports.getEmployeeAttendance = async (req, res) => {
  const Attendance = require("../models/Attendance");
  const attendance = await Attendance.find({ employee: req.params.id }).sort("-date");
  res.json(attendance);
};

exports.getEmployeeTimeOff = async (req, res) => {
  const TimeOffRequest = require("../models/TimeOffRequest");
  const requests = await TimeOffRequest.find({ employee: req.params.id }).sort("-startDate");
  res.json(requests);
};

exports.getMyProfile = async (req, res) => {
  if (!req.user.employee) {
    return res.status(404).json({ message: "Your account is not linked to an employee profile yet." });
  }
  const employee = await Employee.findById(req.user.employee).populate("manager", "name").populate("workingSchedule");
  res.json(employee);
};

exports.getMyAttendance = async (req, res) => {
  if (!req.user.employee) return res.json([]);
  const Attendance = require("../models/Attendance");
  const records = await Attendance.find({ employee: req.user.employee }).sort("-date");
  res.json(records);
};

exports.getMyTimeOff = async (req, res) => {
  if (!req.user.employee) return res.json([]);
  const TimeOffRequest = require("../models/TimeOffRequest");
  const requests = await TimeOffRequest.find({ employee: req.user.employee }).sort("-startDate");
  res.json(requests);
};