const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Employee = require("../models/Employee");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, password required" });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    await User.create({ name, email, password, role: "employee" });

    res.status(201).json({
      message: "Account created. Please wait for admin approval before signing in.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.isApproved && user.role !== "admin") {
      return res.status(403).json({ message: "Your account is pending admin approval" });
    }

    if (user.role === "employee" && !user.employee) {
      let employee = await Employee.findOne({ email: user.email });
      if (!employee) {
        employee = await Employee.create({
          name: user.name,
          email: user.email,
          department: "Unassigned",
          jobPosition: "Employee",
          dateOfJoining: new Date(),
        });
      }
      user.employee = employee._id;
      await User.findByIdAndUpdate(user._id, { employee: employee._id });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employee: user.employee,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};

// ---- Admin-only: manage pending users ----

exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ isApproved: false }).select("-password").sort("-createdAt");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const { role, employeeId } = req.body;
    const validRoles = ["admin", "hr_manager", "hr_payroll_user", "hr_payroll_manager", "employee"];
    const update = { isApproved: true };
    if (role && validRoles.includes(role)) update.role = role;

    if (employeeId) {
      if (!mongoose.Types.ObjectId.isValid(employeeId)) {
        return res.status(400).json({ message: "Invalid employee ID" });
      }
      const employee = await Employee.findById(employeeId);
      if (!employee) return res.status(404).json({ message: "Employee not found" });
      const linkedUser = await User.findOne({ employee: employeeId, _id: { $ne: req.params.id } });
      if (linkedUser) {
        return res.status(400).json({ message: "Employee is already linked to another user" });
      }
      update.employee = employeeId;
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true })
      .select("-password")
      .populate("employee");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUnlinkedEmployees = async (req, res) => {
  try {
    const linkedEmployeeIds = await User.find({ employee: { $ne: null } }).distinct("employee");
    const employees = await Employee.find({ _id: { $nin: linkedEmployeeIds } })
      .select("name email department jobPosition")
      .sort("name");
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User rejected and removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};