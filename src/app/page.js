import DashboardFeatureCard from "@/components/dashboard/DashboardFeatureCard";
import {
  FileText,
  Banknote,
  Briefcase,
  PenTool,
  StickyNote,
  Users,
  CreditCard,
  User as UserIcon,
} from "lucide-react";
import { auth } from "@/auth";
import connectDB from "@/lib/mongoose";
import Project from "@/models/Project";
import Invoice from "@/models/Invoice";
import User from "@/models/User";
import Note from "@/models/Note";
import { redirect } from "next/navigation";
import ActiveNotes from "@/components/notes/ActiveNotes";
import { getUserPermissions } from "@/lib/permissions";
import Spotlight from "@/components/ui/Spotlight";
import AttendanceHomeCard from "./attendance/AttendanceHomeCard";

export default async function LandingPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  await connectDB();

  // Fetch counts dynamically
  const [
    activeProjectsCount,
    pendingInvoicesCount,
    teamMembersCount,
    activeNotes,
  ] = await Promise.all([
    Project.countDocuments({ status: { $ne: "Completed" } }),
    Invoice.countDocuments({
      status: { $in: ["Pending", "Partial", "Overdue"] },
    }),
    User.countDocuments(),
    // Fetch active public notes
    Note.find({
      share: "public",
      status: "Pending",
      startDateTime: { $lte: new Date() },
      endDateTime: { $gte: new Date() },
    })
      .populate("createdBy", "name")
      .sort({ startDateTime: 1 })
      .lean(),
  ]);

  // Serialize notes for client component
  const serializedNotes = JSON.parse(JSON.stringify(activeNotes));
  // Get actual permissions to hide/show cards
  const userPermissions = getUserPermissions(session.user);

  return (
    <div className="min-h-screen font-sans text-gray-800 dark:text-slate-200">
      {/* Hero Section */}
      <main className="container mx-auto px-4 md:px-6 py-10 md:py-12 lg:py-12 flex flex-col items-center text-center">
        {/* Company Info Section */}
        <div className="w-full max-w-7xl mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-linear-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-900 p-8 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-sm text-left">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Welcome to AA SoftLabs Employee Dashboard
            </h2>
            <p className="text-gray-600 dark:text-slate-400 mb-6 leading-relaxed">
              We are dedicated to delivering excellence in every project. As
              part of our team, you retain access to all the tools you need to
              manage invoices, payroll, and projects efficiently.
            </p>
            <ActiveNotes notes={serializedNotes} />
          </div>

          {session.user.role === "admin" ||
          userPermissions.includes("payroll") ? (
            <Spotlight
              className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm text-left flex flex-col justify-center"
              spotlightColor="rgba(59, 130, 246, 0.15)"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-700">
                  <span className="text-gray-500 dark:text-slate-400 text-sm">
                    Active Projects
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {activeProjectsCount}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-700">
                  <span className="text-gray-500 dark:text-slate-400 text-sm">
                    Pending Invoices
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {pendingInvoicesCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-slate-400 text-sm">
                    Team Members
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {teamMembersCount}
                  </span>
                </div>
              </div>
            </Spotlight>
          ) : (
            <AttendanceHomeCard user={session.user} />
          )}
        </div>
        <div className="mb-12 text-center">
          <p className="text-gray-500 dark:text-slate-400 mt-2">
            Access your workspace
          </p>
        </div>
        {/* Feature Modules Grid */}
        <div
          id="apps"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl text-left"
        >
          {[
            {
              id: "invoices",
              label: "Smart Invoicing",
              desc: "Create GST-compliant invoices, track payments, and manage your clients efficiently.",
              icon: <FileText className="w-6 h-6" />,
              href: "/invoices",
              color: "blue",
            },
            {
              id: "payroll",
              label: "Payroll System",
              desc: "Manage employee salaries, generate automated payslips, and track attendance.",
              icon: <Banknote className="w-6 h-6" />,
              href: "/payroll",
              color: "green",
            },
            {
              id: "project",
              label: "Project Tracker",
              desc: "Monitor project progress, manage tasks, and keep track of daily logs and milestones.",
              icon: <Briefcase className="w-6 h-6" />,
              href: "/project",
              color: "purple",
            },
            {
              id: "letterhead",
              label: "Letterhead Editor",
              desc: "Design, customize, and print official company letterheads instantly.",
              icon: <PenTool className="w-6 h-6" />,
              href: "/letterhead",
              color: "orange",
            },
            {
              id: "notes",
              label: "Notes & Reminders",
              desc: "Keep track of meetings, memos, and tasks with private or public visibility.",
              icon: <StickyNote className="w-6 h-6" />,
              href: "/notes",
              color: "yellow",
            },
            {
              id: "accounts",
              label: "Accounts & Ledger",
              desc: "Manage company accounts, track expenses, and view financial ledgers.",
              icon: <CreditCard className="w-6 h-6" />,
              href: "/accounts",
              color: "cyan",
            },
            {
              id: "users",
              label: "User Management",
              desc: "Control system access, manage roles, and update employee permissions.",
              icon: <Users className="w-6 h-6" />,
              href: "/users",
              color: "rose",
            },
            {
              id: "profile",
              label: "My Profile",
              desc: "Update your personal information, change your password, and manage your account.",
              icon: <UserIcon className="w-6 h-6" />,
              href: "/profile",
              color: "indigo",
            },
          ].map((feature) => (
            <DashboardFeatureCard
              key={feature.id}
              feature={feature}
              hasAccess={userPermissions.includes(feature.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
