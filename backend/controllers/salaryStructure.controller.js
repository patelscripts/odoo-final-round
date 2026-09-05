const SalaryStructure = require("../models/SalaryStructure");

exports.createStructure = async (req, res) => {
  try {
    const structure = await SalaryStructure.create(req.body);
    res.status(201).json(structure);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getStructures = async (req, res) => {
  try {
    const structures = await SalaryStructure.find().populate("salaryRules");
    res.json(structures);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStructureById = async (req, res) => {
  try {
    const structure = await SalaryStructure.findById(req.params.id).populate("salaryRules");
    if (!structure) return res.status(404).json({ message: "Structure not found" });
    res.json(structure);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStructure = async (req, res) => {
  try {
    const structure = await SalaryStructure.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!structure) return res.status(404).json({ message: "Structure not found" });
    res.json(structure);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteStructure = async (req, res) => {
  try {
    const structure = await SalaryStructure.findByIdAndDelete(req.params.id);
    if (!structure) return res.status(404).json({ message: "Structure not found" });
    res.json({ message: "Structure deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};