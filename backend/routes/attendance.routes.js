const express = require("express");
const router = express.Router();
const {
  createAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
} = require("../controllers/attendance.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.use(protect);

router.post("/", createAttendance); // employee can log own attendance
router.get("/", getAttendance);
router.get("/:id", getAttendanceById);
router.put("/:id", authorize("admin", "hr_manager"), updateAttendance);
router.delete("/:id", authorize("admin", "hr_manager"), deleteAttendance);

module.exports = router;