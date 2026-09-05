const Payslip = require("../models/Payslip");
const { generatePayslipPDF } = require("../services/pdfGenerator");
const { sendPayslipEmail } = require("../services/emailService");

exports.getPayslips = async (req, res) => {
  try {
    const filter = {};
    if (req.query.payrun) filter.payrun = req.query.payrun;
    if (req.query.employee) filter.employee = req.query.employee;
    const payslips = await Payslip.find(filter)
      .populate("employee", "name email")
      .populate("payrun", "name periodStart periodEnd");
    res.json(payslips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPayslipById = async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id)
      .populate("employee", "name email department")
      .populate("payrun", "name")
      .populate("contract", "wage startDate")
      .populate("salaryStructure", "name");
    if (!payslip) return res.status(404).json({ message: "Payslip not found" });
    res.json(payslip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.printPayslip = async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id)
      .populate("employee", "name email")
      .populate("payrun", "name");
    if (!payslip) return res.status(404).json({ message: "Payslip not found" });

    const pdfBuffer = await generatePayslipPDF(payslip);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=payslip-${payslip._id}.pdf`,
    });
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// bulk send from parent payrun
exports.sendPayslips = async (req, res) => {
  try {
    const payslips = await Payslip.find({ payrun: req.params.payrunId }).populate("employee", "name email");
    for (const payslip of payslips) {
      const pdfBuffer = await generatePayslipPDF(payslip);
      await sendPayslipEmail(payslip.employee.email, payslip.employee.name, pdfBuffer);
      payslip.emailSent = true;
      await payslip.save();
    }
    res.json({ message: `${payslips.length} payslips sent` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyPayslips = async (req, res) => {
  if (!req.user.employee) return res.json([]);
  const payslips = await Payslip.find({ employee: req.user.employee })
    .populate("payrun", "name periodStart periodEnd")
    .sort("-periodStart");
  res.json(payslips);
};