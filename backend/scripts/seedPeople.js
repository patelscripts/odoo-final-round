require("dotenv").config();
const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const WorkingSchedule = require("../models/WorkingSchedule");
const Contract = require("../models/Contract");
const SalaryStructure = require("../models/SalaryStructure");

const COUNT = 200;
const EMAIL_DOMAIN = "peoplepay360.test";

const firstNames = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
  "Shaurya", "Atharv", "Advait", "Dhruv", "Kabir", "Ritvik", "Aryan", "Rohan", "Kunal", "Nikhil",
  "Ananya", "Aadhya", "Diya", "Ira", "Kiara", "Anika", "Myra", "Sara", "Navya", "Meera",
  "Isha", "Pooja", "Neha", "Priya", "Kavya", "Sneha", "Riya", "Tanvi", "Aditi", "Nisha",
  "Rahul", "Amit", "Suresh", "Vikram", "Manish", "Deepak", "Sanjay", "Karan", "Harsh", "Yash",
];

const lastNames = [
  "Patel", "Sharma", "Gupta", "Reddy", "Nair", "Iyer", "Khan", "Mehta", "Joshi", "Desai",
  "Singh", "Verma", "Chopra", "Kapoor", "Malhotra", "Bose", "Banerjee", "Das", "Pillai", "Rao",
  "Agarwal", "Jain", "Shah", "Trivedi", "Kulkarni", "Jadhav", "Patil", "Chauhan", "Yadav", "Mishra",
];

const departments = [
  { name: "Engineering", roles: ["Software Engineer", "Senior Engineer", "QA Analyst", "DevOps Engineer", "Engineering Manager"] },
  { name: "Human Resources", roles: ["HR Executive", "Recruiter", "HR Manager", "People Partner"] },
  { name: "Finance", roles: ["Accountant", "Payroll Specialist", "Finance Analyst", "Finance Manager"] },
  { name: "Sales", roles: ["Sales Executive", "Account Manager", "Sales Manager", "Business Development"] },
  { name: "Operations", roles: ["Operations Associate", "Shift Lead", "Operations Manager"] },
  { name: "Marketing", roles: ["Content Specialist", "Marketing Executive", "Brand Manager"] },
  { name: "Support", roles: ["Support Associate", "Support Lead", "Customer Success"] },
  { name: "Legal", roles: ["Legal Associate", "Compliance Officer"] },
];

const banks = ["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak Mahindra"];
const ifscPrefix = ["HDFC0", "ICIC0", "SBIN0", "UTIB0", "KKBK0"];

const weekdayPattern = [
  { day: "Mon", startTime: "09:30", endTime: "18:30", breakMinutes: 60 },
  { day: "Tue", startTime: "09:30", endTime: "18:30", breakMinutes: 60 },
  { day: "Wed", startTime: "09:30", endTime: "18:30", breakMinutes: 60 },
  { day: "Thu", startTime: "09:30", endTime: "18:30", breakMinutes: 60 },
  { day: "Fri", startTime: "09:30", endTime: "18:30", breakMinutes: 60 },
];

const pick = (list, index) => list[index % list.length];

const pad = (n) => String(n).padStart(3, "0");

async function ensureSchedules() {
  const names = [
    { name: "Standard 9.5 hours", type: "full_time", hours: 40 },
    { name: "Part-time mornings", type: "part_time", hours: 20 },
    { name: "Shift rotation", type: "shift", hours: 42 },
  ];
  const ids = [];
  for (const item of names) {
    const existing = await WorkingSchedule.findOneAndUpdate(
      { name: item.name },
      { name: item.name, type: item.type, pattern: weekdayPattern, totalWeeklyHours: item.hours },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    );
    ids.push(existing._id);
  }
  return ids;
}

function buildPeople(scheduleIds) {
  const usedEmails = new Set();
  const people = [];

  for (let i = 1; i <= COUNT; i++) {
    const first = pick(firstNames, i * 7);
    const last = pick(lastNames, i * 13);
    const name = `${first} ${last}`;
    let email = `${first}.${last}.${pad(i)}@${EMAIL_DOMAIN}`.toLowerCase();
    if (usedEmails.has(email)) email = `person.${pad(i)}@${EMAIL_DOMAIN}`;
    usedEmails.add(email);

    const dept = pick(departments, i);
    const role = pick(dept.roles, i * 3);
    const joined = new Date(2018, 0, 1);
    joined.setDate(joined.getDate() + i * 11);
    const bankIndex = i % banks.length;

    people.push({
      name,
      email,
      phone: `9${String(700000000 + i).slice(0, 9)}`,
      department: dept.name,
      jobPosition: role,
      workingSchedule: pick(scheduleIds, i),
      status: i % 21 === 0 ? "inactive" : "active",
      dateOfJoining: joined,
      bankDetails: {
        accountNumber: String(100000000000 + i * 17),
        ifsc: `${ifscPrefix[bankIndex]}${String(100000 + i).slice(-6)}`,
        bankName: banks[bankIndex],
      },
    });
  }

  return people;
}

async function assignManagers(created) {
  const byDept = {};
  for (const person of created) {
    if (!byDept[person.department]) byDept[person.department] = [];
    byDept[person.department].push(person);
  }

  const ops = [];
  for (const [dept, members] of Object.entries(byDept)) {
    const manager =
      members.find((m) => /manager/i.test(m.jobPosition)) || members[0];
    for (const member of members) {
      if (String(member._id) === String(manager._id)) continue;
      ops.push({
        updateOne: {
          filter: { _id: member._id },
          update: { $set: { manager: manager._id } },
        },
      });
    }
    void dept;
  }
  if (ops.length) await Employee.bulkWrite(ops);
}

async function seedContracts(created) {
  const structure = await SalaryStructure.findOne({ isActive: true }) || (await SalaryStructure.findOne());
  const existing = await Contract.countDocuments({
    employee: { $in: created.map((p) => p._id) },
  });
  if (existing >= created.length) {
    console.log("Contracts already exist for seeded people; skipped.");
    return;
  }

  const wages = {
    Engineering: 85000,
    "Human Resources": 62000,
    Finance: 70000,
    Sales: 55000,
    Operations: 48000,
    Marketing: 58000,
    Support: 42000,
    Legal: 90000,
  };

  const docs = created
    .filter((p) => p.status === "active")
    .map((p, index) => ({
      employee: p._id,
      startDate: p.dateOfJoining,
      department: p.department,
      jobPosition: p.jobPosition,
      wage: (wages[p.department] || 50000) + (index % 12) * 1500,
      salaryStructure: structure?._id,
      status: "active",
    }));

  await Contract.deleteMany({ employee: { $in: created.map((p) => p._id) } });
  if (docs.length) await Contract.insertMany(docs);
  console.log(`Created ${docs.length} active contracts.`);
}

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  await Employee.deleteMany({ email: { $regex: `@${EMAIL_DOMAIN}$` } });
  console.log("Removed previous dummy people");

  const scheduleIds = await ensureSchedules();
  const people = buildPeople(scheduleIds);
  const created = await Employee.insertMany(people);
  await assignManagers(created);
  await seedContracts(created);

  console.log(`Seeded ${created.length} people.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
