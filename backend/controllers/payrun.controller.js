const Payrun = require("../models/Payrun");
const Payslip = require("../models/Payslip");
const SalaryStructure = require("../models/SalaryStructure");
const { resolveActiveContract } = require("../services/contractResolver");
const { computeSalary } = require("../services/payrollEngine");

// Step 1 + 2: create payrun with scope + selected employees
exports.createPayrun = async (req, res) => {
  try {
    const { name, salaryStructure, periodStart, periodEnd, employees } = req.body;
    if (!name || !salaryStructure || !periodStart || !periodEnd || !employees?.length) {
      return res.status(400).json({ message: "Missing required payrun fields" });
    }
    const payrun = await Payrun.create({
      name, salaryStructure, periodStart, periodEnd, employees,
      createdBy: req.user._id,
    });
    res.status(201).json(payrun);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getPayruns = async (req, res) => {
  try {
    const payruns = await Payrun.find()
      .populate("salaryStructure", "name")
      .populate("employees", "name")
      .sort("-createdAt");
    res.json(payruns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPayrunById = async (req, res) => {
  try {
    const payrun = await Payrun.findById(req.params.id)
      .populate("salaryStructure")
      .populate("employees", "name department");
    if (!payrun) return res.status(404).json({ message: "Payrun not found" });
    res.json(payrun);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Compute: generates payslips for each employee using resolved contract
exports.computePayrun = async (req, res) => {
  try {
    const payrun = await Payrun.findById(req.params.id).populate("salaryStructure");
    if (!payrun) return res.status(404).json({ message: "Payrun not found" });

    const structure = await SalaryStructure.findById(payrun.salaryStructure._id).populate("salaryRules");
    const warnings = [];
    await Payslip.deleteMany({ payrun: payrun._id }); // recompute clean

    for (const employeeId of payrun.employees) {
      const contract = await resolveActiveContract(employeeId, payrun.periodStart, payrun.periodEnd);
      if (!contract) {
        warnings.push(`No active contract found for employee ${employeeId}`);
        continue;
      }

      const { breakdown, grossSalary, totalDeductions, netSalary } = computeSalary(
        structure.salaryRules,
        contract.wage
      );

      await Payslip.create({
        payrun: payrun._id,
        employee: employeeId,
        contract: contract._id,
        salaryStructure: structure._id,
        periodStart: payrun.periodStart,
        periodEnd: payrun.periodEnd,
        breakdown,
        grossSalary,
        totalDeductions,
        netSalary,
        status: "computed",
      });
    }

    // duplicate payslip check
    const existingCount = await Payslip.countDocuments({ payrun: payrun._id });
    if (existingCount !== payrun.employees.length) {
      warnings.push("Some employees were skipped due to missing contracts");
    }

    payrun.status = "computed";
    payrun.warnings = warnings;
    await payrun.save();

    res.json({ message: "Payrun computed", warnings, payrun });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.validatePayrun = async (req, res) => {
  try {
    const payrun = await Payrun.findById(req.params.id);
    if (!payrun) return res.status(404).json({ message: "Payrun not found" });
    if (payrun.status !== "computed") {
      return res.status(400).json({ message: "Payrun must be computed before validation" });
    }
    payrun.status = "validated";
    await payrun.save();
    await Payslip.updateMany({ payrun: payrun._id }, { status: "validated" });
    res.json({ message: "Payrun validated", payrun });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markPaid = async (req, res) => {
  try {
    const payrun = await Payrun.findById(req.params.id);
    if (!payrun) return res.status(404).json({ message: "Payrun not found" });
    if (payrun.status !== "validated") {
      return res.status(400).json({ message: "Payrun must be validated before marking paid" });
    }
    payrun.status = "paid";
    await payrun.save();
    await Payslip.updateMany({ payrun: payrun._id }, { status: "paid" });
    res.json({ message: "Payrun marked as paid", payrun });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};