require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const ADMIN_EMAIL = "admin@peoplepay360.test";
const ADMIN_PASSWORD = "Admin@123";

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log("Admin already exists — skipping.");
    await mongoose.disconnect();
    return;
  }

  await User.create({
    name: "System Admin",
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "admin",
    isApproved: true
  });

  console.log(`Admin created — email: ${ADMIN_EMAIL}, password: ${ADMIN_PASSWORD}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});