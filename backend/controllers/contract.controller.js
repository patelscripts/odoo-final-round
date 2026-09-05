const Contract = require("../models/Contract");

exports.createContract = async (req, res) => {
  try {
    const contract = await Contract.create(req.body);
    res.status(201).json(contract);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getContracts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.employee) filter.employee = req.query.employee;
    const contracts = await Contract.find(filter)
      .populate("employee", "name")
      .populate("salaryStructure", "name")
      .sort("-startDate");
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate("employee", "name")
      .populate("salaryStructure");
    if (!contract) return res.status(404).json({ message: "Contract not found" });
    res.json(contract);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateContract = async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!contract) return res.status(404).json({ message: "Contract not found" });
    res.json(contract);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );
    if (!contract) return res.status(404).json({ message: "Contract not found" });
    res.json({ message: "Contract cancelled", contract });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};