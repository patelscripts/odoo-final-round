const express = require("express");
const router = express.Router();
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeeContracts,
  getEmployeeAttendance,
  getEmployeeTimeOff,
  getMyProfile,
  getMyAttendance,
  getMyTimeOff,
} = require("../controllers/employee.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.use(protect);

router.post("/", authorize("admin", "hr_manager"), createEmployee);
router.get("/", getEmployees);
router.get("/:id", getEmployeeById);
router.put("/:id", authorize("admin", "hr_manager"), updateEmployee);
router.delete("/:id", authorize("admin", "hr_manager"), deleteEmployee);

router.get("/:id/contracts", getEmployeeContracts);
router.get("/:id/attendance", getEmployeeAttendance);
router.get("/:id/timeoff", getEmployeeTimeOff);

router.get("/me/profile", getMyProfile);
router.get("/me/attendance", getMyAttendance);
router.get("/me/timeoff", getMyTimeOff);

module.exports = router;