const express = require("express");
const router = express.Router();
const {
  createStructure, getStructures, getStructureById, updateStructure, deleteStructure,
} = require("../controllers/salaryStructure.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.use(protect);

router.post("/", authorize("admin", "hr_payroll_manager"), createStructure);
router.get("/", getStructures);
router.get("/:id", getStructureById);
router.put("/:id", authorize("admin", "hr_payroll_manager"), updateStructure);
router.delete("/:id", authorize("admin", "hr_payroll_manager"), deleteStructure);

module.exports = router;