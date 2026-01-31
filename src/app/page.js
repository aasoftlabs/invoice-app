import Link from "next/link";
import {
  FileText,
  Banknote,
  Briefcase,
  PenTool,
  StickyNote,
  Users,
  CreditCard,
  User as UserIcon,
  Lock,
  ShieldAlert,
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
    <div className="min-h-screen bg-white font-sans text-gray-800">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-10 md:py-12 lg:py-12 flex flex-col items-center text-center">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Employee Dashboard
          </h1>
          <p className="text-gray-500 mt-2">Access your business tools</p>
        </div>

        {/* Company Info Section */}
        <div className="w-full max-w-7xl mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-linear-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-100 shadow-sm text-left">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Welcome to AA SoftLabs
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We are dedicated to delivering excellence in every project. As
              part of our team, you retain access to all the tools you need to
              manage invoices, payroll, and projects efficiently.
            </p>
            <ActiveNotes notes={serializedNotes} />
          </div>

          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-left flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Active Projects</span>
                <span className="font-bold text-gray-900">
                  {activeProjectsCount}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-500 text-sm">Pending Invoices</span>
                <span className="font-bold text-gray-900">
                  {pendingInvoicesCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Team Members</span>
                <span className="font-bold text-gray-900">
                  {teamMembersCount}
                </span>
              </div>
            </div>
          </div>
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
          ].map((feature) => {
            const hasAccess = userPermissions.includes(feature.id);
            const CardContent = (
              <div
                className={`h-full p-6 bg-white rounded-2xl border border-gray-200 shadow-xs relative overflow-hidden transition-all duration-300 ${hasAccess ? `hover:border-${feature.color}-300 hover:shadow-lg group` : "opacity-60 grayscale-[0.5]"}`}
              >
                <div
                  className={`absolute top-0 right-0 w-24 h-24 bg-${feature.color}-50 rounded-bl-full -mr-4 -mt-4 transition-transform ${hasAccess ? "group-hover:scale-110" : ""}`}
                ></div>

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div
                    className={`h-12 w-12 bg-${feature.color}-100 rounded-xl flex items-center justify-center text-${feature.color}-600`}
                  >
                    {feature.icon}
                  </div>
                  {!hasAccess && (
                    <div className="bg-gray-100 p-1.5 rounded-lg text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <h3
                  className={`text-xl font-bold text-gray-900 mb-2 relative z-10 transition-colors ${hasAccess ? `group-hover:text-${feature.color}-600` : ""}`}
                >
                  {feature.label}
                </h3>
                <p className="text-gray-600 text-sm relative z-10 leading-relaxed mb-4">
                  {feature.desc}
                </p>

                {!hasAccess && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 mt-auto bg-gray-50 py-1 px-2 rounded-md w-max border border-gray-100">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    ACCESS RESTRICTED
                  </div>
                )}
              </div>
            );

            if (hasAccess) {
              return (
                <Link
                  key={feature.id}
                  href={feature.href}
                  className="block h-full"
                >
                  {CardContent}
                </Link>
              );
            }

            return (
              <div key={feature.id} className="cursor-not-allowed">
                {CardContent}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
