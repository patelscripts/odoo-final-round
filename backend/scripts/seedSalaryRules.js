require("dotenv").config();
const mongoose = require("mongoose");
const SalaryRule = require("../models/SalaryRule");

async function run() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing");

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const rules = [
    {
      name: "Basic Salary",
      code: "BASIC",
      category: "basic",
      sequence: 1,
      computationType: "fixed",
      amount: 20000,
    },
    {
      name: "Provident Fund",
      code: "PF",
      category: "deduction",
      sequence: 3,
      computationType: "percentage",
      percentageOf: "BASIC",
      percentageValue: 12,
    },
    {
      name: "Dearness Allowance",
      code: "DA",
      category: "allowance",
      sequence: 4,
      computationType: "percentage",
      percentageOf: "BASIC",
      percentageValue: 10,
    },
  ];

  for (const rule of rules) {
    const exists = await SalaryRule.findOne({ code: rule.code });
    if (exists) {
      console.log(`${rule.code} already exists, skipping`);
      continue;
    }
    await SalaryRule.create(rule);
    console.log(`Created ${rule.code}`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});