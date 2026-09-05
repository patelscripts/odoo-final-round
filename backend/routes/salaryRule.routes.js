const express = require("express");
const router = express.Router();
const {
  createRule, getRules, getRuleById, updateRule, deleteRule,
} = require("../controllers/salaryRule.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.use(protect);

router.post("/", authorize("admin", "hr_payroll_manager"), createRule);
router.get("/", getRules);
router.get("/:id", getRuleById);
router.put("/:id", authorize("admin", "hr_payroll_manager"), updateRule);
router.delete("/:id", authorize("admin", "hr_payroll_manager"), deleteRule);

module.exports = router;