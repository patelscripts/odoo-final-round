const express = require("express");
const router = express.Router();
const {
  createType, getTypes, updateType, deleteType,
  createAllocation, getAllocations, updateAllocation,
  createRequest, getRequests, decideRequest,
} = require("../controllers/timeoff.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.use(protect);

// Types
router.post("/types", authorize("admin", "hr_manager"), createType);
router.get("/types", getTypes);
router.put("/types/:id", authorize("admin", "hr_manager"), updateType);
router.delete("/types/:id", authorize("admin", "hr_manager"), deleteType);

// Allocations
router.post("/allocations", authorize("admin", "hr_manager"), createAllocation);
router.get("/allocations", getAllocations);
router.put("/allocations/:id", authorize("admin", "hr_manager"), updateAllocation);

// Requests
router.post("/requests", createRequest); // employee can raise own request
router.get("/requests", getRequests);
router.put("/requests/:id/decide", authorize("admin", "hr_manager"), decideRequest);

module.exports = router;