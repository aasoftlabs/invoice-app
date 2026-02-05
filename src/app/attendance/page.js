import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AttendanceClient from "./AttendanceClient";
import connectDB from "@/lib/mongoose";
import User from "@/models/User";

export const metadata = {
  title: "Attendance | IHS Payroll",
};

export default async function AttendancePage() {
  const session = await auth();
  if (!session) {
    redirect("/api/auth/signin");
  }

  await connectDB();
  const isAdmin =
    session.user.role === "admin" ||
    session.user.permissions?.includes("payroll");

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Employee Attendance
          </h1>
          <p className="text-gray-500 dark:text-slate-400">
            {isAdmin
              ? "Manage and track attendance for all employees"
              : "Track your daily attendance and work activity"}
          </p>
        </div>

        <AttendanceClient user={session.user} />
      </div>
    </div>
  );
}
