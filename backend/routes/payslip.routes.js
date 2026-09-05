const express = require("express");
const router = express.Router();
const {
  getPayslips, getPayslipById, printPayslip, sendPayslips, getMyPayslips,
} = require("../controllers/payslip.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.use(protect);

router.get("/", getPayslips);
router.get("/:id", getPayslipById);
router.get("/:id/print", printPayslip);
router.post(
  "/payrun/:payrunId/send",
  authorize("admin", "hr_payroll_user", "hr_payroll_manager"),
  sendPayslips
);
router.get("/me/list", getMyPayslips);

module.exports = router;