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
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans text-gray-800 dark:text-slate-200">
      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-10 md:py-12 lg:py-12 flex flex-col items-center text-center">
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

          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm text-left flex flex-col justify-center">
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
          </div>
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
          ].map((feature) => {
            const hasAccess = userPermissions.includes(feature.id);

            // Mapping for Tailwind classes to ensure they are detected by the compiler
            const colorStyles = {
              blue: {
                hover: "hover:border-blue-300 dark:hover:border-blue-500/50",
                bg: "bg-blue-50",
                darkBg: "dark:bg-blue-400/10",
                iconBg: "bg-blue-100 dark:bg-blue-900/30",
                text: "text-blue-600 dark:text-blue-400",
                hoverText:
                  "group-hover:text-blue-600 dark:group-hover:text-blue-400",
              },
              green: {
                hover: "hover:border-green-300 dark:hover:border-green-500/50",
                bg: "bg-green-50",
                darkBg: "dark:bg-green-400/10",
                iconBg: "bg-green-100 dark:bg-green-900/30",
                text: "text-green-600 dark:text-green-400",
                hoverText:
                  "group-hover:text-green-600 dark:group-hover:text-green-400",
              },
              purple: {
                hover:
                  "hover:border-purple-300 dark:hover:border-purple-500/50",
                bg: "bg-purple-50",
                darkBg: "dark:bg-purple-400/10",
                iconBg: "bg-purple-100 dark:bg-purple-900/30",
                text: "text-purple-600 dark:text-purple-400",
                hoverText:
                  "group-hover:text-purple-600 dark:group-hover:text-purple-400",
              },
              orange: {
                hover:
                  "hover:border-orange-300 dark:hover:border-orange-500/50",
                bg: "bg-orange-50",
                darkBg: "dark:bg-orange-400/10",
                iconBg: "bg-orange-100 dark:bg-orange-900/30",
                text: "text-orange-600 dark:text-orange-400",
                hoverText:
                  "group-hover:text-orange-600 dark:group-hover:text-orange-400",
              },
              yellow: {
                hover:
                  "hover:border-yellow-300 dark:hover:border-yellow-500/50",
                bg: "bg-yellow-50",
                darkBg: "dark:bg-yellow-400/10",
                iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
                text: "text-yellow-600 dark:text-yellow-400",
                hoverText:
                  "group-hover:text-yellow-600 dark:group-hover:text-yellow-400",
              },
              cyan: {
                hover: "hover:border-cyan-300 dark:hover:border-cyan-500/50",
                bg: "bg-cyan-50",
                darkBg: "dark:bg-cyan-400/10",
                iconBg: "bg-cyan-100 dark:bg-cyan-900/30",
                text: "text-cyan-600 dark:text-cyan-400",
                hoverText:
                  "group-hover:text-cyan-600 dark:group-hover:text-cyan-400",
              },
              rose: {
                hover: "hover:border-rose-300 dark:hover:border-rose-500/50",
                bg: "bg-rose-50",
                darkBg: "dark:bg-rose-400/10",
                iconBg: "bg-rose-100 dark:bg-rose-900/30",
                text: "text-rose-600 dark:text-rose-400",
                hoverText:
                  "group-hover:text-rose-600 dark:group-hover:text-rose-400",
              },
              indigo: {
                hover:
                  "hover:border-indigo-300 dark:hover:border-indigo-500/50",
                bg: "bg-indigo-50",
                darkBg: "dark:bg-indigo-400/10",
                iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
                text: "text-indigo-600 dark:text-indigo-400",
                hoverText:
                  "group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
              },
            };

            const style = colorStyles[feature.color];

            const CardContent = (
              <div
                className={`h-full p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-xs relative overflow-hidden transition-all duration-300 ${hasAccess ? `${style.hover} hover:shadow-lg group` : "opacity-60 grayscale-[0.5]"}`}
              >
                <div
                  className={`absolute top-0 right-0 w-24 h-24 ${style.bg} ${style.darkBg} rounded-bl-full -mr-4 -mt-4 transition-transform ${hasAccess ? "group-hover:scale-110" : ""}`}
                ></div>

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div
                    className={`h-12 w-12 ${style.iconBg} rounded-xl flex items-center justify-center ${style.text}`}
                  >
                    {feature.icon}
                  </div>
                  {!hasAccess && (
                    <div className="bg-gray-100 dark:bg-slate-700 p-1.5 rounded-lg text-gray-400 dark:text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <h3
                  className={`text-xl font-bold text-gray-900 dark:text-white mb-2 relative z-10 transition-colors ${hasAccess ? style.hoverText : ""}`}
                >
                  {feature.label}
                </h3>
                <p className="text-gray-600 dark:text-slate-400 text-sm relative z-10 leading-relaxed mb-4">
                  {feature.desc}
                </p>

                {!hasAccess && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 dark:text-slate-500 mt-auto bg-gray-50 dark:bg-slate-700 py-1 px-2 rounded-md w-max border border-gray-100 dark:border-slate-600 relative z-10">
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
