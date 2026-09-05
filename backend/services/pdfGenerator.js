const PDFDocument = require("pdfkit");

exports.generatePayslipPDF = (payslip) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // Header
      doc.fontSize(20).text("PeoplePay360", { align: "center" });
      doc.fontSize(14).text("Payslip", { align: "center" });
      doc.moveDown(1.5);

      // Employee & Period Info
      doc.fontSize(11);
      doc.text(`Employee: ${payslip.employee?.name || "-"}`);
      doc.text(`Payrun: ${payslip.payrun?.name || "-"}`);
      doc.text(
        `Period: ${new Date(payslip.periodStart).toLocaleDateString()} - ${new Date(
          payslip.periodEnd
        ).toLocaleDateString()}`
      );
      doc.text(`Status: ${payslip.status}`);
      doc.moveDown(1);

      // Breakdown Table Header
      doc.fontSize(12).text("Salary Breakdown", { underline: true });
      doc.moveDown(0.5);

      const startX = 50;
      let y = doc.y;
      doc.fontSize(10);
      doc.text("Component", startX, y);
      doc.text("Category", startX + 200, y);
      doc.text("Amount", startX + 350, y);
      y += 15;
      doc.moveTo(startX, y).lineTo(550, y).stroke();
      y += 8;

      payslip.breakdown.forEach((item) => {
        doc.text(item.name, startX, y);
        doc.text(item.category, startX + 200, y);
        doc.text(`Rs. ${item.amount.toFixed(2)}`, startX + 350, y);
        y += 18;
      });

      y += 10;
      doc.moveTo(startX, y).lineTo(550, y).stroke();
      y += 10;

      doc.fontSize(11).text(`Gross Salary: Rs. ${payslip.grossSalary.toFixed(2)}`, startX, y);
      y += 16;
      doc.text(`Total Deductions: Rs. ${payslip.totalDeductions.toFixed(2)}`, startX, y);
      y += 16;
      doc.fontSize(13).text(`Net Salary: Rs. ${payslip.netSalary.toFixed(2)}`, startX, y, {
        underline: true,
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};