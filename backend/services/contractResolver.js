const Contract = require("../models/Contract");

// Returns the contract applicable for a given employee + period
exports.resolveActiveContract = async (employeeId, periodStart, periodEnd) => {
  const contract = await Contract.findOne({
    employee: employeeId,
    status: "active",
    startDate: { $lte: periodEnd },
    $or: [{ endDate: null }, { endDate: { $gte: periodStart } }],
  }).sort("-startDate");
  return contract;
};