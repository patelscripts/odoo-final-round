const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  getPendingUsers,
  approveUser,
  rejectUser,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

router.get("/pending-users", protect, authorize("admin"), getPendingUsers);
router.put("/approve/:id", protect, authorize("admin"), approveUser);
router.delete("/reject/:id", protect, authorize("admin"), rejectUser);

module.exports = router;