import { auth } from "@/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongoose";
import PayrollDashboard from "./PayrollDashboard";

export default async function PayrollPage() {
    const session = await auth();

    if (!session) {
        redirect("/login");
    }

    // Check if user has payroll permission or is admin
    const hasPayrollAccess =
        session.user.role === "admin" ||
        session.user.permissions?.includes("payroll");

    if (!hasPayrollAccess) {
        // Users without payroll permission see only their own slips
        redirect("/payroll/my-slips");
    }

    await connectDB();

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="max-w-7xl mx-auto p-8">
                <PayrollDashboard />
            </div>
        </div>
    );
}
