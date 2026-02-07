import { auth } from "@/auth";
import { redirect } from "next/navigation";
import GeneratePayroll from "./GeneratePayroll";

export default async function GeneratePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Check permission
  const canGenerate =
    session.user.role === "admin" ||
    session.user.permissions?.includes("payroll");

  if (!canGenerate) {
    redirect("/payroll/my-slips");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <GeneratePayroll />
      </div>
    </div>
  );
}
