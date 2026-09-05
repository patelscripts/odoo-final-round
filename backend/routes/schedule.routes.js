const express = require("express");
const router = express.Router();
const {
  createSchedule,
  getSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
} = require("../controllers/schedule.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.use(protect);

router.post("/", authorize("admin", "hr_manager"), createSchedule);
router.get("/", getSchedules);
router.get("/:id", getScheduleById);
router.put("/:id", authorize("admin", "hr_manager"), updateSchedule);
router.delete("/:id", authorize("admin", "hr_manager"), deleteSchedule);

module.exports = router;