const TimeOffType = require("../models/TimeOffType");
const TimeOffAllocation = require("../models/TimeOffAllocation");
const TimeOffRequest = require("../models/TimeOffRequest");

// ---- Time Off Types ----
exports.createType = async (req, res) => {
  try {
    const type = await TimeOffType.create(req.body);
    res.status(201).json(type);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getTypes = async (req, res) => {
  try {
    const types = await TimeOffType.find();
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateType = async (req, res) => {
  try {
    const type = await TimeOffType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!type) return res.status(404).json({ message: "Type not found" });
    res.json(type);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteType = async (req, res) => {
  try {
    const type = await TimeOffType.findByIdAndDelete(req.params.id);
    if (!type) return res.status(404).json({ message: "Type not found" });
    res.json({ message: "Time off type deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---- Allocations ----
exports.createAllocation = async (req, res) => {
  try {
    const { allocated } = req.body;
    const allocation = await TimeOffAllocation.create({
      ...req.body,
      remaining: allocated,
    });
    res.status(201).json(allocation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllocations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.employee) filter.employee = req.query.employee;
    const allocations = await TimeOffAllocation.find(filter)
      .populate("employee", "name")
      .populate("timeOffType", "name unit");
    res.json(allocations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAllocation = async (req, res) => {
  try {
    const allocation = await TimeOffAllocation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!allocation) return res.status(404).json({ message: "Allocation not found" });
    res.json(allocation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ---- Requests ----
exports.createRequest = async (req, res) => {
  try {
    const { startDate, endDate, duration } = req.body;
    const days =
      duration ||
      Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000) + 1);
    const request = await TimeOffRequest.create({ ...req.body, duration: days });
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.query.employee) filter.employee = req.query.employee;
    if (req.query.status) filter.status = req.query.status;
    const requests = await TimeOffRequest.find(filter)
      .populate("employee", "name")
      .populate("timeOffType", "name unit")
      .sort("-startDate");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve/Refuse — core business logic: deduct from allocation
exports.decideRequest = async (req, res) => {
  try {
    const decision = req.body.decision || req.body.status;
    if (!["approved", "refused"].includes(decision)) {
      return res.status(400).json({ message: "Invalid decision" });
    }

    const request = await TimeOffRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already decided" });
    }

    request.status = decision;
    request.approvedBy = req.user._id;
    await request.save();

    if (decision === "approved") {
      const allocation = await TimeOffAllocation.findOne({
        employee: request.employee,
        timeOffType: request.timeOffType,
        status: "approved",
      }).sort("-validTo");

      if (allocation) {
        allocation.taken += request.duration;
        allocation.remaining = Math.max(allocation.allocated - allocation.taken, 0);
        await allocation.save();
      }
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};