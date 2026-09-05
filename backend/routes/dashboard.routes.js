const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/dashboard.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.use(protect);
router.get("/", authorize("admin", "hr_manager", "hr_payroll_user", "hr_payroll_manager"), getDashboard);

module.exports = router;