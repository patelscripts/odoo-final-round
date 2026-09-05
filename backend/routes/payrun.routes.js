const express = require("express");
const router = express.Router();
const {
  createPayrun, getPayruns, getPayrunById,
  computePayrun, validatePayrun, markPaid,
} = require("../controllers/payrun.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.use(protect);
router.use(authorize("admin", "hr_payroll_user", "hr_payroll_manager"));

router.post("/", createPayrun);
router.get("/", getPayruns);
router.get("/:id", getPayrunById);
router.put("/:id/compute", computePayrun);
router.put("/:id/validate", validatePayrun);
router.put("/:id/mark-paid", markPaid);

module.exports = router;