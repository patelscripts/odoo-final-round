const SalaryRule = require("../models/SalaryRule");

exports.createRule = async (req, res) => {
  try {
    const rule = await SalaryRule.create(req.body);
    res.status(201).json(rule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getRules = async (req, res) => {
  try {
    const rules = await SalaryRule.find().sort("sequence");
    res.json(rules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRuleById = async (req, res) => {
  try {
    const rule = await SalaryRule.findById(req.params.id);
    if (!rule) return res.status(404).json({ message: "Rule not found" });
    res.json(rule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRule = async (req, res) => {
  try {
    const rule = await SalaryRule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!rule) return res.status(404).json({ message: "Rule not found" });
    res.json(rule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteRule = async (req, res) => {
  try {
    const rule = await SalaryRule.findByIdAndDelete(req.params.id);
    if (!rule) return res.status(404).json({ message: "Rule not found" });
    res.json({ message: "Rule deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};