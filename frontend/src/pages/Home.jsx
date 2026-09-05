import { Link } from "react-router-dom";
import {
  Users,
  Clock,
  CalendarCheck,
  Wallet,
  ArrowRight,
  FileText,
} from "lucide-react";
import Navbar from "../components/common/Navbar";

const modules = [
  {
    icon: Users,
    title: "Employee records",
    desc: "One profile holds contracts, schedule, attendance and leave — nothing lives in a separate spreadsheet.",
  },
  {
    icon: Clock,
    title: "Attendance",
    desc: "Check-ins, check-outs and worked hours, with corrections tracked and visible.",
  },
  {
    icon: CalendarCheck,
    title: "Time off",
    desc: "Leave types, allocations and approvals — balances update the moment a request is approved.",
  },
  {
    icon: Wallet,
    title: "Payroll",
    desc: "Salary rules run in sequence to produce a payslip your team can actually read.",
  },
];

const flow = [
  { step: "Employee is added", detail: "With a department, manager and working schedule." },
  { step: "A contract is signed", detail: "Wage and salary structure attached to a start date." },
  { step: "Attendance & leave accrue", detail: "Daily records and approved time off build up over the period." },
  { step: "A payrun is created", detail: "Pick the period, pick the people, compute." },
  { step: "Payslips are ready", detail: "Reviewed, validated, paid, and sent." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* spacer for fixed navbar height */}
      <div className="h-[68px]" />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-10 sm:pt-16 pb-16 sm:pb-24 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-medium leading-[1.05] tracking-tight text-ink mb-7">
            Payroll that follows the work.
          </h1>
          <p className="text-lg max-w-md mb-9">
            Employee records, attendance, leave and salary rules connected
            end to end — so a payslip is a calculation, not a guess.
          </p>
          <div className="flex items-center gap-5">
            <Link to="/login" className="btn-primary inline-flex items-center gap-2">
              Get started <ArrowRight size={16} />
            </Link>
            <a href="#flow" className="text-sm font-medium text-ink hover:text-primary transition-colors">
              See how it works
            </a>
          </div>
        </div>

        <div className="card shadow-sm border-primary/10">
          <div className="flex items-center justify-between mb-5 pb-5 border-b border-border">
            <div>
              <p className="text-sm text-ink-muted mb-1">Payslip — Aug 2026</p>
              <h3 className="text-xl">Nimesh Pathak</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
              <FileText className="text-primary" size={18} />
            </div>
          </div>
          <div className="space-y-3">
            {[
              ["Basic", "20,000"],
              ["HRA", "8,000"],
              ["PF Deduction", "-2,400"],
            ].map(([label, amount]) => (
              <div key={label} className="flex justify-between text-sm table-row pb-3">
                <span className="text-ink-muted">{label}</span>
                <span className="num text-ink">₹{amount}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3">
              <span className="font-medium text-ink">Net salary</span>
              <span className="num font-semibold text-primary text-2xl">₹25,600</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-20 border-t border-border">
        <h2 className="text-3xl md:text-4xl max-w-lg mb-12">
          Four modules, one record of truth for every employee.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card hover:border-primary/30 transition-colors">
              <div className="w-11 h-11 rounded-lg bg-primary-light flex items-center justify-center mb-5">
                <Icon className="text-primary" size={20} />
              </div>
              <h3 className="mb-2 text-base">{title}</h3>
              <p className="text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Flow */}
      <section id="flow" className="max-w-3xl mx-auto px-4 sm:px-8 py-16 sm:py-20 border-t border-border">
        <h2 className="text-3xl md:text-4xl mb-12">From hire to payslip</h2>
        <div className="space-y-0">
          {flow.map((item, i) => (
            <div key={item.step} className="flex gap-5 pb-8 last:pb-0">
              <div className="flex flex-col items-center">
                <span className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium font-mono shrink-0">
                  {i + 1}
                </span>
                {i < flow.length - 1 && (
                  <span className="w-px flex-1 bg-border mt-2" />
                )}
              </div>
              <div className="pb-2">
                <h3 className="text-lg mb-1">{item.step}</h3>
                <p className="text-sm">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24 border-t border-border text-center">
        <h2 className="text-3xl md:text-4xl mb-7">Ready to run your first payrun?</h2>
        <Link to="/login" className="btn-primary inline-flex items-center gap-2">
          Sign in to continue <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}