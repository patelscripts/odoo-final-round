const Employee = require("../models/Employee");
const Payslip = require("../models/Payslip");
const Attendance = require("../models/Attendance");
const TimeOffRequest = require("../models/TimeOffRequest");
const Payrun = require("../models/Payrun");

exports.getDashboard = async (req, res) => {
  try {
    const { periodStart, periodEnd, department } = req.query;

    const dateFilter = {};
    if (periodStart && periodEnd) {
      dateFilter.periodStart = { $gte: new Date(periodStart) };
      dateFilter.periodEnd = { $lte: new Date(periodEnd) };
    }

    // ---- Payroll KPIs ----
    const payslipFilter = { ...dateFilter, status: "paid" };
    const payslips = await Payslip.find(payslipFilter).populate("employee", "name department");

    const filteredPayslips = department
      ? payslips.filter((p) => p.employee?.department === department)
      : payslips;

    const totalNetSalaryPaid = filteredPayslips.reduce((sum, p) => sum + p.netSalary, 0);
    const payslipsGenerated = filteredPayslips.length;
    const averageSalary = payslipsGenerated
      ? +(totalNetSalaryPaid / payslipsGenerated).toFixed(2)
      : 0;

    // ---- Salary Cost by Department ----
    const deptCostMap = {};
    filteredPayslips.forEach((p) => {
      const dept = p.employee?.department || "Unknown";
      deptCostMap[dept] = (deptCostMap[dept] || 0) + p.netSalary;
    });
    const salaryCostByDepartment = Object.entries(deptCostMap).map(([department, total]) => ({
      department,
      total: +total.toFixed(2),
    }));

    // ---- Monthly Net Salary Trend ----
    const trendMap = {};
    filteredPayslips.forEach((p) => {
      const month = new Date(p.periodStart).toISOString().slice(0, 7); // YYYY-MM
      trendMap[month] = (trendMap[month] || 0) + p.netSalary;
    });
    const monthlyTrend = Object.entries(trendMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({ month, total: +total.toFixed(2) }));

    // ---- Time Off ----
    const approvedTimeOff = await TimeOffRequest.countDocuments({ status: "approved" });
    const pendingTimeOff = await TimeOffRequest.countDocuments({ status: "pending" });

    // ---- Attendance Overview ----
    const attendanceFilter = {};
    if (periodStart && periodEnd) {
      attendanceFilter.date = { $gte: new Date(periodStart), $lte: new Date(periodEnd) };
    }
    const attendanceRecords = await Attendance.find(attendanceFilter);

    const attendanceOverview = {
      present: attendanceRecords.filter((a) => a.status === "present").length,
      late: attendanceRecords.filter((a) => a.status === "late").length,
      absent: attendanceRecords.filter((a) => a.status === "absent").length,
      overtime: attendanceRecords.filter((a) => a.status === "overtime").length,
      missingCheckouts: attendanceRecords.filter((a) => a.status === "missing_checkout").length,
      manualEdits: attendanceRecords.filter((a) => a.isManualCorrection).length,
    };

    // ---- Payroll Warnings/Alerts ----
    const payrunsWithWarnings = await Payrun.find({ warnings: { $exists: true, $ne: [] } })
      .select("name warnings status")
      .sort("-createdAt")
      .limit(5);

    // ---- Headcount by Department ----
    const employees = await Employee.find(department ? { department } : {});
    const headcountMap = {};
    employees.forEach((e) => {
      headcountMap[e.department] = (headcountMap[e.department] || 0) + 1;
    });
    const headcountByDepartment = Object.entries(headcountMap).map(([department, count]) => ({
      department,
      count,
    }));

    res.json({
      kpis: {
        totalNetSalaryPaid: +totalNetSalaryPaid.toFixed(2),
        payslipsGenerated,
        averageSalary,
        approvedTimeOff,
        pendingTimeOff,
      },
      charts: {
        salaryCostByDepartment,
        monthlyTrend,
      },
      attendanceOverview,
      headcountByDepartment,
      alerts: payrunsWithWarnings,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};