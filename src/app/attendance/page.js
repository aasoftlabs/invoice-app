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
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header moved to Client Component for better layout control */}

        <AttendanceClient user={session.user} />
      </div>
    </div>
  );
}
