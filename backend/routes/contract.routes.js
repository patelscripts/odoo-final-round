const express = require("express");
const router = express.Router();
const {
  createContract,
  getContracts,
  getContractById,
  updateContract,
  deleteContract,
} = require("../controllers/contract.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");

router.use(protect);

router.post("/", authorize("admin", "hr_manager"), createContract);
router.get("/", getContracts);
router.get("/:id", getContractById);
router.put("/:id", authorize("admin", "hr_manager"), updateContract);
router.delete("/:id", authorize("admin", "hr_manager"), deleteContract);

module.exports = router;
