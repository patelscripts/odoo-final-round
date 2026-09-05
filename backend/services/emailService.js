const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendPayslipEmail = async (toEmail, employeeName, pdfBuffer) => {
  await transporter.sendMail({
    from: `"PeoplePay360" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Your Payslip",
    text: `Hi ${employeeName}, please find attached your payslip.`,
    attachments: [
      {
        filename: "payslip.pdf",
        content: pdfBuffer,
      },
    ],
  });
};