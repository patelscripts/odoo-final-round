const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { errorHandler, notFound } = require("./middleware/error.middleware");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }))

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/employees", require("./routes/employee.routes"));
app.use("/api/contracts", require("./routes/contract.routes"));
app.use("/api/schedules", require("./routes/schedule.routes"));
app.use("/api/attendance", require("./routes/attendance.routes"));
app.use("/api/timeoff", require("./routes/timeoff.routes"));
app.use("/api/salary-structures", require("./routes/salaryStructure.routes"));
app.use("/api/salary-rules", require("./routes/salaryRule.routes"));
app.use("/api/payruns", require("./routes/payrun.routes"));
app.use("/api/payslips", require("./routes/payslip.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;